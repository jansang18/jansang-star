import { useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { BirthForm } from './features/profile/BirthForm';
import type { BirthProfile } from './features/profile/types';
import { loadProfile, saveProfile } from './features/profile/profileStore';
import { calculateNatalChart } from './features/astrology/swissEphemeris';
import type { NatalChartData } from './features/astrology/types';
import { calculateDailyTransits, type TransitData } from './features/fortune/transits';
import { generateDailyFortune, type DailyFortune } from './features/fortune/generateFortune';
import { monthSampleDates, summarizePeriodFortune, yearSampleDates, type PeriodFortune } from './features/fortune/periodFortune';
import { ResultsPage } from './features/results/ResultsPage';
import { AppError } from './components/AppError';
import { EphemerisLoader } from './components/EphemerisLoader';
import { LanguageSwitch } from './components/LanguageSwitch';
import { useI18n } from './i18n/I18nProvider';
import { buildDetailedReading } from './features/readings/buildDetailedReading';
import type { DetailedReadingModel } from './features/readings/types';

type ResultState = { profile: BirthProfile; chart: NatalChartData; transits: TransitData; fortune: DailyFortune; monthFortune: PeriodFortune; yearFortune: PeriodFortune; detailedReading: DetailedReadingModel };

async function buildPeriod(chart: NatalChartData, profile: BirthProfile, dates: string[]) {
  const samples: DailyFortune[] = [];
  for (const sampleDate of dates) {
    const sampleTransits = await calculateDailyTransits(chart, profile, sampleDate);
    samples.push(generateDailyFortune(chart, sampleTransits, sampleDate));
  }
  return samples;
}

export default function App() {
  const { t } = useI18n();
  const [started, setStarted] = useState(false);
  const [savedProfile, setSavedProfile] = useState(() => loadProfile());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<null | 'calculation'>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  async function handleSubmit(profile: BirthProfile) {
    setBusy(true); setError(null);
    try {
      saveProfile(profile);
      setSavedProfile(profile);
      const chart = await calculateNatalChart(profile);
      const date = Temporal.Now.plainDateISO(profile.timeZone).toString();
      const transits = await calculateDailyTransits(chart, profile, date);
      const fortune = generateDailyFortune(chart, transits, date);
      const monthSamples = await buildPeriod(chart, profile, monthSampleDates(date));
      const yearSamples = await buildPeriod(chart, profile, yearSampleDates(date));
      const monthFortune = summarizePeriodFortune('month', date, monthSamples);
      const yearFortune = summarizePeriodFortune('year', date, yearSamples);
      const detailedReading = buildDetailedReading(chart, transits);
      setResult({ profile, chart, transits, fortune, monthFortune, yearFortune, detailedReading });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('calculation');
    } finally { setBusy(false); }
  }

  if (result) return <ResultsPage {...result} onEdit={() => { setResult(null); setStarted(true); window.scrollTo({ top: 0 }); }} />;

  return (
    <main className="app-shell">
      <div className="afterimage afterimage-one" aria-hidden="true" />
      <div className="afterimage afterimage-two" aria-hidden="true" />
      <nav className="site-nav" aria-label={t('nav.primary')}>
        <div className="wordmark"><span>{t('brand.name')}</span> ✦</div>
        <span className="nav-chip">{t('nav.system')}</span>
        <LanguageSwitch />
      </nav>
      {!started && <section className="landing-hero">
        <p className="eyebrow">{t('landing.eyebrow')}</p>
        <h1>{t('brand.name')}</h1>
        <p className="hero-copy">{t('landing.copy')}</p>
        <p className="hero-detail">{t('landing.detail')}</p>
        <button className="primary-button" type="button" onClick={() => setStarted(true)}>
          {t('landing.cta')} <span aria-hidden="true">→</span>
        </button>
      </section>}
      {started && <BirthForm onSubmit={handleSubmit} initialProfile={savedProfile} busy={busy} />}
      <AppError error={error} onClose={() => setError(null)} />
      {busy && <EphemerisLoader />}
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
