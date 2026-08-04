import type { DailyFortune } from '../fortune/generateFortune';

const ICONS = { overall: '✦', love: '♡', money: '◇', career: '⌁', health: '☼' };

export function DailyFortuneSection({ fortune }: { fortune: DailyFortune }) {
  return <section className="result-section"><div className="section-kicker">FIVE AREAS</div><h2>분야별 오늘 운세</h2><div className="fortune-grid">{Object.entries(fortune.categories).map(([key, category]) => <article className={`fortune-card ${key}`} key={key}><div className="fortune-top"><span>{ICONS[key as keyof typeof ICONS]}</span><b>{category.label}</b><strong>{category.score}</strong></div><div className="score-bar"><i style={{ width: `${category.score}%` }} /></div><div className="signal-row">{(category.signals ?? []).map((signal) => <span key={signal}>{signal}</span>)}</div><div className="fortune-prose">{(category.paragraphs ?? [category.summary]).map((paragraph, index) => <p key={`${key}-${index}`}>{paragraph}</p>)}</div></article>)}</div></section>;
}
