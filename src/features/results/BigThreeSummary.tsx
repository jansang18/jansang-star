import type { NatalChartData } from '../astrology/types';
import { longitudeToZodiac } from '../astrology/zodiac';
import { ZODIAC_GLYPHS } from '../astrology/constants';

export function BigThreeSummary({ chart }: { chart: NatalChartData }) {
  const items = [
    { label: 'SUN · 자아와 목적', name: chart.planets.sun.sign, glyph: chart.planets.sun.glyph, copy: '당신이 세상에서 빛을 내는 방식' },
    { label: 'MOON · 감정과 본능', name: chart.planets.moon.sign, glyph: chart.planets.moon.glyph, copy: '마음이 안전함을 느끼는 방식' },
    chart.ascendant === undefined ? { label: 'ASC · 첫인상', name: '출생시간 필요', glyph: '↑', copy: '시간을 알면 상승궁을 계산해요' } : (() => { const zodiac = longitudeToZodiac(chart.ascendant); return { label: 'ASC · 첫인상', name: zodiac.sign, glyph: ZODIAC_GLYPHS[zodiac.signIndex], copy: '세상과 처음 만나는 방식' }; })(),
  ];
  return <section className="result-section big-three-section"><div className="section-kicker">THE BIG THREE</div><h2>태양·달·상승궁</h2><div className="big-three-grid">{items.map((item, index) => <article className={`big-three-card tone-${index + 1}`} key={item.label}><span className="astro-glyph">{item.glyph}</span><div><small>{item.label}</small><h3>{item.name}</h3><p>{item.copy}</p></div></article>)}</div></section>;
}
