import type { DailyFortune } from '../fortune/generateFortune';

export function LuckyGuide({ fortune }: { fortune: DailyFortune }) {
  const items = [{ icon: '◉', label: '행운의 색', value: fortune.lucky.color }, { icon: '#', label: '행운의 숫자', value: fortune.lucky.number }, { icon: '◷', label: '행운의 시간', value: fortune.lucky.time }];
  return <section className="result-section lucky-section"><div className="section-kicker light">LUCKY GUIDE</div><h2>오늘의 행운</h2><div className="lucky-grid">{items.map((item) => <article key={item.label}><span>{item.icon}</span><small>{item.label}</small><strong>{item.value}</strong></article>)}</div><blockquote>“{fortune.lucky.advice}”</blockquote></section>;
}
