import type { PeriodFortune } from '../fortune/periodFortune';

const LABELS = { overall: '종합', love: '연애', money: '재물', career: '직업', health: '건강' };

export function PeriodFortuneSection({ fortune }: { fortune: PeriodFortune }) {
  return <section className="result-section period-section">
    <div className="section-kicker">{fortune.period === 'month' ? 'MONTHLY FLOW' : 'YEARLY FLOW'} · {fortune.label}</div>
    <div className="period-heading"><div><h2>{fortune.headline}</h2><p>{fortune.label}의 흐름을 실제 천체 표본으로 나눠 읽었습니다.</p></div><strong>{fortune.overallScore}</strong></div>
    <div className="period-chart" aria-label={`${fortune.label} 흐름 그래프`}>{fortune.timeline.map((point) => <div className={`period-point ${point.tone}`} key={point.label}><span>{point.score}</span><i style={{ height: `${Math.max(18, point.score)}%` }} /><small>{point.label}</small></div>)}</div>
    <div className="period-categories">{Object.entries(fortune.categories).map(([key, score]) => <div key={key}><span>{LABELS[key as keyof typeof LABELS]}</span><b>{score}</b><i><em style={{ width: `${score}%` }} /></i></div>)}</div>
    <div className="period-prose">{fortune.narrative.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    <div className="period-windows"><article><small>OPPORTUNITY WINDOW</small><b>{fortune.opportunity}</b></article><article className="care"><small>CAUTION WINDOW</small><b>{fortune.caution}</b></article></div>
  </section>;
}
