import type { BirthProfile } from '../profile/types';
import type { NatalChartData } from '../astrology/types';
import type { DailyFortune } from '../fortune/generateFortune';
import type { TransitData } from '../fortune/transits';
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

type Props = { profile: BirthProfile; chart: NatalChartData; transits: TransitData; fortune: DailyFortune; onEdit: () => void };

export function ResultsPage({ profile, chart, transits, fortune, onEdit }: Props) {
  const city = CITIES.find((item) => item.id === profile.cityId)?.nameKo ?? `${profile.latitude.toFixed(2)}, ${profile.longitude.toFixed(2)}`;
  return <main className="results-page"><div className="result-trail trail-a" aria-hidden="true" /><div className="result-trail trail-b" aria-hidden="true" /><header className="results-nav"><div className="wordmark"><span>잔상</span> 별자리 ✦</div><button type="button" onClick={onEdit}>출생정보 수정</button></header><section className="result-hero"><div className="hero-chart"><NatalChart chart={chart} /></div><div className="hero-summary"><div className="section-kicker">NATAL CHART · {fortune.date}</div><h1>{profile.displayName}님의<br />코스믹 리포트</h1><p>{profile.date} · {profile.timeKnown ? profile.time : '시간 미상'} · {city}</p><div className="hero-statement"><small>TODAY'S MESSAGE</small><strong>{fortune.headline}</strong><span>{fortune.categories.overall.summary}</span></div></div></section><div className="result-content"><BigThreeSummary chart={chart} /><CosmicWeather fortune={fortune} /><PlacementSection chart={chart} /><HouseSection chart={chart} /><AspectSection chart={chart} transits={transits} /><DailyFortuneSection fortune={fortune} /><LuckyGuide fortune={fortune} /><footer className="result-footer"><p>이 해석은 열대황도·플라시두스 체계를 사용한 자기이해와 오락 목적의 콘텐츠입니다.</p><button type="button" onClick={onEdit}>출생정보 다시 입력하기</button></footer></div></main>;
}
