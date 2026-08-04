import { useState } from 'react';
import type { BirthProfile } from '../profile/types';
import type { NatalChartData } from '../astrology/types';
import type { DailyFortune } from '../fortune/generateFortune';
import type { TransitData } from '../fortune/transits';
import type { PeriodFortune } from '../fortune/periodFortune';
import { CITIES } from '../profile/cities';
import { NatalChart } from '../chart/NatalChart';
import { BigThreeSummary } from './BigThreeSummary';
import { CosmicWeather } from './CosmicWeather';
import { PlacementSection } from './PlacementSection';
import { HouseSection } from './HouseSection';
import { AspectSection } from './AspectSection';
import { DailyFortuneSection } from './DailyFortuneSection';
import { LuckyGuide } from './LuckyGuide';
import './results.css';
import { LegalNotice } from '../../components/LegalNotice';
import { PeriodFortuneSection } from './PeriodFortuneSection';
import { localizeDailyFortune } from '../fortune/localizeDailyFortune';
import { localizePeriodFortune } from '../fortune/localizePeriodFortune';

type Props = { profile: BirthProfile; chart: NatalChartData; transits: TransitData; fortune: DailyFortune; monthFortune?: PeriodFortune; yearFortune?: PeriodFortune; onEdit: () => void };

export function ResultsPage({ profile, chart, transits, fortune, monthFortune, yearFortune, onEdit }: Props) {
  const [period, setPeriod] = useState<'today' | 'month' | 'year'>('today');
  const city = CITIES.find((item) => item.id === profile.cityId)?.nameKo ?? `${profile.latitude.toFixed(2)}, ${profile.longitude.toFixed(2)}`;
  const selectedPeriod = period === 'month' ? monthFortune : period === 'year' ? yearFortune : undefined;
  const dailyView = localizeDailyFortune(fortune, 'ko');
  const selectedPeriodView = selectedPeriod ? localizePeriodFortune(selectedPeriod, 'ko') : undefined;
  return <main className="results-page"><div className="result-trail trail-a" aria-hidden="true" /><div className="result-trail trail-b" aria-hidden="true" /><header className="results-nav"><div className="wordmark"><span>잔상</span> 별자리 ✦</div><button type="button" onClick={onEdit}>출생정보 수정</button></header><section className="result-hero"><div className="hero-chart"><NatalChart chart={chart} /></div><div className="hero-summary"><div className="section-kicker">NATAL CHART · {dailyView.date}</div><h1>{profile.displayName}님의<br />코스믹 리포트</h1><p>{profile.date} · {profile.timeKnown ? profile.time : '시간 미상'} · {city}</p><div className="hero-statement"><small>TODAY'S MESSAGE</small><strong>{dailyView.headline}</strong><span>{dailyView.categories.overall.summary}</span></div></div></section><div className="result-content"><div className="period-selector" role="tablist" aria-label="운세 기간"><button className={period === 'today' ? 'active' : ''} onClick={() => setPeriod('today')} role="tab" aria-selected={period === 'today'}>오늘</button><button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')} role="tab" aria-selected={period === 'month'}>이번 달</button><button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')} role="tab" aria-selected={period === 'year'}>올해</button></div><BigThreeSummary chart={chart} />{period === 'today' ? <CosmicWeather fortune={dailyView} /> : selectedPeriodView ? <PeriodFortuneSection fortune={selectedPeriodView} /> : null}<PlacementSection chart={chart} /><HouseSection chart={chart} /><AspectSection chart={chart} transits={transits} />{period === 'today' && <><DailyFortuneSection fortune={dailyView} /><LuckyGuide fortune={dailyView} /></>}<footer className="result-footer"><LegalNotice /><button type="button" onClick={onEdit}>출생정보 다시 입력하기</button></footer></div></main>;
}
