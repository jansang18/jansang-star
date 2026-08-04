import type { DailyFortune } from '../fortune/generateFortune';

export function CosmicWeather({ fortune }: { fortune: DailyFortune }) {
  const overall = fortune.categories.overall;
  return <section className="result-section cosmic-section"><div className="cosmic-copy"><div className="section-kicker light">TODAY'S COSMIC WEATHER</div><h2>오늘의 코스믹 웨더</h2><h3>{fortune.headline}</h3><div className="signal-row light">{(overall.signals ?? []).map((signal) => <span key={signal}>{signal}</span>)}</div>{(overall.paragraphs ?? [overall.summary]).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="score-orbit" style={{ '--score': fortune.overallScore } as React.CSSProperties}><strong>{fortune.overallScore}</strong><span>FLOW SCORE</span></div></section>;
}
