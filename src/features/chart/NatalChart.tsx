import { ZODIAC_GLYPHS, ZODIAC_SIGNS } from '../astrology/constants';
import type { NatalChartData } from '../astrology/types';
import { degreeLabel } from '../astrology/zodiac';
import { natalAspects } from '../fortune/aspects';
import { displayAngle, polarPoint } from './geometry';
import './NatalChart.css';

type Props = { chart: NatalChartData };
const ASPECT_COLORS = { conjunction: '#7b6ce0', sextile: '#4bb5b2', square: '#ef7697', trine: '#7390e8', opposition: '#e4836c' };

export function NatalChart({ chart }: Props) {
  const asc = chart.ascendant ?? 0;
  const planets = Object.values(chart.planets);
  const positions = Object.fromEntries(planets.map((planet, index) => {
    const point = polarPoint(displayAngle(planet.longitude, asc), 109 - (index % 3) * 8);
    return [planet.id, point];
  }));
  const aspects = natalAspects(chart).slice(0, 18);

  return <div className="natal-chart-wrap">
    <svg className="natal-chart" viewBox="0 0 360 360" role="img" aria-label="출생 차트 원형 도표">
      <title>출생 차트 원형 도표</title>
      <defs>
        <radialGradient id="chartGlow"><stop offset="0" stopColor="#17182e" /><stop offset=".65" stopColor="#101124" /><stop offset="1" stopColor="#0b0c1a" /></radialGradient>
        <filter id="softGlow"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="lineGlow"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id="nodeShadow" x="-80%" y="-80%" width="260%" height="260%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#03040d" floodOpacity=".7" /></filter>
      </defs>
      <circle cx="180" cy="180" r="169" fill="rgba(255,255,255,.025)" stroke="rgba(183,173,255,.3)" strokeWidth="1.25" />
      <circle cx="180" cy="180" r="154" fill="url(#chartGlow)" stroke="#a99bff" strokeWidth="2.25" />
      <circle cx="180" cy="180" r="128" fill="none" stroke="#4f4c78" strokeWidth="1.25" />
      <circle cx="180" cy="180" r="78" fill="rgba(255,255,255,.025)" stroke="#45436a" strokeWidth="1.1" />
      {ZODIAC_SIGNS.map((sign, index) => {
        const line = polarPoint(displayAngle(index * 30, asc), 154);
        const inner = polarPoint(displayAngle(index * 30, asc), 128);
        const label = polarPoint(displayAngle(index * 30 + 15, asc), 141);
        return <g key={sign}><line x1={180 + inner.x} y1={180 + inner.y} x2={180 + line.x} y2={180 + line.y} stroke="#77719e" strokeWidth="1.25" /><text x={180 + label.x} y={184 + label.y} className="zodiac-label">{ZODIAC_GLYPHS[index]}</text></g>;
      })}
      {chart.houses.map((cusp, index) => {
        const edge = polarPoint(displayAngle(cusp, asc), 128);
        const number = polarPoint(displayAngle(cusp + 11, asc), 87);
        return <g key={`house-${index}`}><line x1="180" y1="180" x2={180 + edge.x} y2={180 + edge.y} className={index === 0 || index === 9 ? 'angle-line' : 'house-line'} /><text x={180 + number.x} y={183 + number.y} className="house-number">{index + 1}</text></g>;
      })}
      <g className="aspect-glows" aria-hidden="true">{aspects.map((aspect, index) => {
        const from = positions[aspect.from]; const to = positions[aspect.to];
        const width = 0.75 + (1 - aspect.orb / aspect.maxOrb) * 1;
        return <line key={`glow-${aspect.from}-${aspect.to}-${index}`} x1={180 + from.x} y1={180 + from.y} x2={180 + to.x} y2={180 + to.y} stroke={ASPECT_COLORS[aspect.type]} strokeWidth={width + 3} opacity=".28" filter="url(#lineGlow)" />;
      })}</g>
      <g className="aspect-lines">{aspects.map((aspect, index) => {
        const from = positions[aspect.from]; const to = positions[aspect.to];
        const tension = aspect.type === 'square' || aspect.type === 'opposition';
        const width = 0.75 + (1 - aspect.orb / aspect.maxOrb) * 1;
        return <line key={`${aspect.from}-${aspect.to}-${index}`} x1={180 + from.x} y1={180 + from.y} x2={180 + to.x} y2={180 + to.y} stroke={ASPECT_COLORS[aspect.type]} strokeWidth={width} strokeDasharray={tension ? '4 3' : undefined} opacity={Math.max(.55, .94 - aspect.orb / 15)} />;
      })}</g>
      {planets.map((planet, index) => {
        const point = positions[planet.id];
        return <g key={planet.id} transform={`translate(${180 + point.x} ${180 + point.y})`} filter="url(#nodeShadow)"><circle r="17" fill={index < 2 ? 'rgba(142,123,255,.22)' : 'rgba(107,192,255,.12)'} stroke="none" /><circle r="14" fill="#17182c" stroke={index < 2 ? '#b1a5ff' : '#77739e'} strokeWidth="1.6" /><circle r="10.5" fill="none" stroke="rgba(255,255,255,.08)" /><text y="5" className="planet-glyph">{planet.glyph}</text>{planet.retrograde && <text x="10" y="-10" className="retrograde">R</text>}</g>;
      })}
      <circle cx="180" cy="180" r="18" fill="#7365d5" opacity=".16" filter="url(#softGlow)" />
      <text x="180" y="188" className="center-star">✦</text>
      {chart.ascendant !== undefined && <text x="20" y="184" className="angle-label">ASC</text>}
      {chart.midheaven !== undefined && (() => { const mc = polarPoint(displayAngle(chart.midheaven, asc), 164); return <text x={180 + mc.x} y={184 + mc.y} className="angle-label">MC</text>; })()}
    </svg>
    <div className="chart-legend" aria-label="차트 선 범례"><span><i className="harmony" />조화 흐름</span><span><i className="tension" />긴장 흐름</span><span><i className="axis" />ASC · MC 축</span></div>
    <details className="placement-table"><summary>행성 배치표 열기</summary><div className="table-scroll"><table aria-label="행성 배치표"><thead><tr><th>행성</th><th>별자리 위치</th><th>하우스</th><th>상태</th></tr></thead><tbody>{planets.map((planet) => <tr key={planet.id}><th>{planet.glyph} {planet.nameKo}</th><td>{degreeLabel(planet.longitude)}</td><td>{planet.house ? `${planet.house}하우스` : '시간 미상'}</td><td>{planet.retrograde ? '역행' : '순행'}</td></tr>)}</tbody></table></div></details>
  </div>;
}
