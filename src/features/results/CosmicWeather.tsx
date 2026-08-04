import type { DailyFortune } from '../fortune/generateFortune';

export function CosmicWeather({ fortune }: { fortune: DailyFortune }) {
  return <section className="result-section cosmic-section"><div className="cosmic-copy"><div className="section-kicker light">TODAY'S COSMIC WEATHER</div><h2>오늘의 코스믹 웨더</h2><h3>{fortune.headline}</h3><p>{fortune.categories.overall.summary}</p></div><div className="score-orbit" style={{ '--score': fortune.overallScore } as React.CSSProperties}><strong>{fortune.overallScore}</strong><span>FLOW SCORE</span></div></section>;
}
