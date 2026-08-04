import { useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { BirthForm } from './features/profile/BirthForm';
import type { BirthProfile } from './features/profile/types';
import { loadProfile, saveProfile } from './features/profile/profileStore';
import { calculateNatalChart } from './features/astrology/swissEphemeris';
import type { NatalChartData } from './features/astrology/types';
import { calculateDailyTransits, type TransitData } from './features/fortune/transits';
import { generateDailyFortune, type DailyFortune } from './features/fortune/generateFortune';
import { ResultsPage } from './features/results/ResultsPage';

type ResultState = { profile: BirthProfile; chart: NatalChartData; transits: TransitData; fortune: DailyFortune };

export default function App() {
  const [started, setStarted] = useState(false);
  const [initialProfile] = useState(() => loadProfile());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ResultState | null>(null);

  async function handleSubmit(profile: BirthProfile) {
    setBusy(true); setError('');
    try {
      saveProfile(profile);
      const chart = await calculateNatalChart(profile);
      const date = Temporal.Now.plainDateISO(profile.timeZone).toString();
      const transits = await calculateDailyTransits(chart, profile, date);
      const fortune = generateDailyFortune(chart, transits, date);
      setResult({ profile, chart, transits, fortune });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '계산 중 예상하지 못한 문제가 발생했습니다.');
    } finally { setBusy(false); }
  }

  if (result) return <ResultsPage {...result} onEdit={() => { setResult(null); setStarted(true); window.scrollTo({ top: 0 }); }} />;

  return (
    <main className="app-shell">
      <div className="afterimage afterimage-one" aria-hidden="true" />
      <div className="afterimage afterimage-two" aria-hidden="true" />
      <nav className="site-nav" aria-label="주요 메뉴">
        <div className="wordmark"><span>잔상</span> 별자리 ✦</div>
        <span className="nav-chip">TROPICAL · PLACIDUS</span>
      </nav>
      {!started && <section className="landing-hero">
        <p className="eyebrow">THE SKY REMEMBERS YOUR MOMENT</p>
        <h1>잔상 별자리</h1>
        <p className="hero-copy">태어난 순간의 별빛은 오늘도 잔상을 남깁니다.</p>
        <p className="hero-detail">출생 차트와 오늘의 천체 흐름을 한눈에 읽는<br />나만의 별자리 만세력</p>
        <button className="primary-button" type="button" onClick={() => setStarted(true)}>
          나의 별자리 만세력 보기 <span aria-hidden="true">→</span>
        </button>
      </section>}
      {started && <BirthForm onSubmit={handleSubmit} initialProfile={initialProfile} busy={busy} />}
      {error && <div className="app-error" role="alert"><b>별의 위치를 계산하지 못했어요</b><span>{error}</span><button type="button" onClick={() => setError('')}>닫기</button></div>}
      <section className="preview-orbit" aria-hidden="true">
        <div className="orbit-ring orbit-ring-one" />
        <div className="orbit-ring orbit-ring-two" />
        <span className="orbit-star">✦</span>
        <span className="zodiac-glyph glyph-one">♌</span>
        <span className="zodiac-glyph glyph-two">♓</span>
        <span className="zodiac-glyph glyph-three">♏</span>
      </section>
    </main>
  );
}
