import { buildPeriodFlowGeometry } from '../chart/periodFlowGeometry';
import type { LocalizedPeriodPoint } from '../fortune/localizePeriodFortune';

type Props = { points: LocalizedPeriodPoint[]; label: string };

function extremeIndex(points: LocalizedPeriodPoint[], direction: 'strongest' | 'softest'): number {
  return points.reduce((selected, point, index) => {
    const selectedScore = points[selected].score;
    return direction === 'strongest'
      ? point.score > selectedScore ? index : selected
      : point.score < selectedScore ? index : selected;
  }, 0);
}

export function PeriodFlowChart({ points, label }: Props) {
  const width = 760;
  const height = 260;
  const padding = 36;
  const geometry = buildPeriodFlowGeometry(points.map((point) => point.score), width, height, padding);
  const strongestIndex = points.length > 0 ? extremeIndex(points, 'strongest') : -1;
  const softestIndex = points.length > 0 ? extremeIndex(points, 'softest') : -1;

  return <div className="period-flow-scroll"><svg
    className="period-flow-chart"
    viewBox={`0 0 ${width} ${height}`}
    role="img"
    aria-label={label}
    focusable="false"
  >
    <title>{label}</title>
    <path className="period-area" d={geometry.areaPath} fill="currentColor" fillOpacity="0.08" />
    <path
      className="period-line"
      d={geometry.linePath}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
    {geometry.points.map((point, index) => {
      const strongest = index === strongestIndex;
      const softest = index === softestIndex;
      const source = points[index];
      const classes = ['period-node', source.tone, strongest ? 'strongest' : '', softest ? 'softest' : '']
        .filter(Boolean)
        .join(' ');
      return <g key={source.date} className={classes}>
        <title>{source.label} · {source.score}</title>
        {(strongest || softest) && <circle
          className="period-node-ring"
          cx={point.x}
          cy={point.y}
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />}
        <circle className="period-node-dot" cx={point.x} cy={point.y} r="5" fill="currentColor" />
        {(strongest || softest) && <text
          className="period-node-icon"
          x={point.x}
          y={point.y - 16}
          textAnchor="middle"
          aria-hidden="true"
        >{strongest && softest ? '✦!' : strongest ? '✦' : '!'}</text>}
        <text className="period-node-score" x={point.x} y={point.y + 26} textAnchor="middle">{source.score}</text>
        <text className="period-node-label" x={point.x} y={height - 8} textAnchor="middle">{source.label}</text>
      </g>;
    })}
  </svg></div>;
}
