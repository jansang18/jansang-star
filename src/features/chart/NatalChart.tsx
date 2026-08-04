import { ZODIAC_GLYPHS, ZODIAC_SIGNS } from '../astrology/constants';
import type { NatalChartData } from '../astrology/types';
import { natalAspects } from '../fortune/aspects';
import { chartText, houseLabel, motionName, planetName } from '../../i18n/astrologyTerms';
import { formatZodiacDegree } from '../../i18n/formatters';
import { useI18n } from '../../i18n/I18nProvider';
import { displayAngle, polarPoint } from './geometry';
import './NatalChart.css';

type Props = { chart: NatalChartData };
const ASPECT_COLORS = {
  conjunction: '#B79A62',
  sextile: '#385A78',
  square: '#9C5544',
  trine: '#385A78',
  opposition: '#9C5544',
};

export function NatalChart({ chart }: Props) {
  const { locale } = useI18n();
  const asc = chart.ascendant ?? 0;
  const planets = Object.values(chart.planets);
  const positions = Object.fromEntries(planets.map((planet, index) => {
    const point = polarPoint(displayAngle(planet.longitude, asc), 109 - (index % 3) * 8);
    return [planet.id, point];
  }));
  const aspects = natalAspects(chart).slice(0, 18);

  return <div className="natal-chart-wrap">
    <svg className="natal-chart" viewBox="0 0 360 360" role="img" aria-label={chartText('chartTitle', locale)}>
      <title>{chartText('chartTitle', locale)}</title>
      <defs>
        <radialGradient id="chartGlow"><stop offset="0" stopColor="#1A1815" /><stop offset="1" stopColor="#11100E" /></radialGradient>
        <filter id="softGlow"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="lineGlow"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id="nodeShadow" x="-80%" y="-80%" width="260%" height="260%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#11100E" floodOpacity=".72" /></filter>
      </defs>
      <circle cx="180" cy="180" r="169" className="chart-outer-ring" />
      <circle cx="180" cy="180" r="154" className="chart-observatory-ring" />
      <circle cx="180" cy="180" r="128" className="chart-secondary-ring" />
      <circle cx="180" cy="180" r="78" className="chart-inner-ring" />
      {ZODIAC_SIGNS.map((sign, index) => {
        const line = polarPoint(displayAngle(index * 30, asc), 154);
        const inner = polarPoint(displayAngle(index * 30, asc), 128);
        const label = polarPoint(displayAngle(index * 30 + 15, asc), 141);
        return <g key={sign}><line x1={180 + inner.x} y1={180 + inner.y} x2={180 + line.x} y2={180 + line.y} className="zodiac-division" /><text x={180 + label.x} y={184 + label.y} className="zodiac-label">{ZODIAC_GLYPHS[index]}</text></g>;
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
      <g className="aspect-underlays" aria-hidden="true">{aspects.map((aspect, index) => {
        const from = positions[aspect.from]; const to = positions[aspect.to];
        const tension = aspect.type === 'square' || aspect.type === 'opposition';
        const width = 0.75 + (1 - aspect.orb / aspect.maxOrb) * 1;
        return <line className="aspect-underlay" key={`underlay-${aspect.from}-${aspect.to}-${index}`} x1={180 + from.x} y1={180 + from.y} x2={180 + to.x} y2={180 + to.y} strokeWidth={width + 2} strokeDasharray={tension ? '4 3' : undefined} />;
      })}</g>
      <g className="aspect-lines">{aspects.map((aspect, index) => {
        const from = positions[aspect.from]; const to = positions[aspect.to];
        const tension = aspect.type === 'square' || aspect.type === 'opposition';
        const width = 0.75 + (1 - aspect.orb / aspect.maxOrb) * 1;
        return <line className="aspect-line-data" key={`${aspect.from}-${aspect.to}-${index}`} x1={180 + from.x} y1={180 + from.y} x2={180 + to.x} y2={180 + to.y} stroke={ASPECT_COLORS[aspect.type]} strokeWidth={width} strokeDasharray={tension ? '4 3' : undefined} opacity="1" />;
      })}</g>
      {planets.map((planet) => {
        const point = positions[planet.id];
        return <g key={planet.id} transform={`translate(${180 + point.x} ${180 + point.y})`}>
          <circle r="16" className="planet-node-outer" />
          <circle r="14" className="planet-node-core" />
          <line x1="-8" y1="-9" x2="8" y2="-9" className="planet-node-reflection" />
          <text y="5" className="planet-glyph">{planet.glyph}</text>
          {planet.retrograde && <text x="10" y="-10" className="retrograde">R</text>}
        </g>;
      })}
      <circle cx="180" cy="180" r="18" fill="#B79A62" opacity=".15" filter="url(#softGlow)" aria-hidden="true" />
      <text x="180" y="188" className="center-star">✦</text>
      {chart.ascendant !== undefined && <text x="20" y="184" className="angle-label">{chartText('ascendantAbbreviation', locale)}</text>}
      {chart.midheaven !== undefined && (() => { const mc = polarPoint(displayAngle(chart.midheaven, asc), 164); return <text x={180 + mc.x} y={184 + mc.y} className="angle-label">{chartText('midheavenAbbreviation', locale)}</text>; })()}
    </svg>
    <div className="chart-legend" aria-label={chartText('legend', locale)}><span><i className="conjunction" />{chartText('conjunction', locale)}</span><span><i className="harmony" />{chartText('harmony', locale)}</span><span><i className="tension" />{chartText('tension', locale)}</span><span><i className="axis" />{chartText('axis', locale)}</span></div>
    <details className="placement-table"><summary>{chartText('placementSummary', locale)}</summary><div className="table-scroll"><table aria-label={chartText('placements', locale)}><thead><tr><th>{chartText('planet', locale)}</th><th>{chartText('zodiacPosition', locale)}</th><th>{chartText('house', locale)}</th><th>{chartText('status', locale)}</th></tr></thead><tbody>{planets.map((planet) => <tr key={planet.id}><th>{planet.glyph} {planetName(planet.id, locale)}</th><td>{formatZodiacDegree(planet.longitude, locale)}</td><td>{planet.house ? houseLabel(planet.house, locale) : chartText('unknownTime', locale)}</td><td>{motionName(planet.retrograde ? 'retrograde' : 'direct', locale)}</td></tr>)}</tbody></table></div></details>
  </div>;
}
