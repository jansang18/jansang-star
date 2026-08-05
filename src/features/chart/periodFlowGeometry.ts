export type PeriodFlowPoint = { x: number; y: number; score: number };
export type PeriodFlowGeometry = {
  points: PeriodFlowPoint[];
  linePath: string;
  areaPath: string;
  baselineY: number;
  domain: { min: number; max: number };
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function rounded(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}

export function buildPeriodFlowGeometry(
  scores: number[],
  width: number,
  height: number,
  padding: number,
): PeriodFlowGeometry {
  const safePadding = clamp(padding, 0, Math.min(width / 2, height / 2));
  const availableHeight = Math.max(0, height - safePadding * 2);
  const scoreLabelBand = Math.min(28, availableHeight);
  const plotHeight = availableHeight - scoreLabelBand;
  const baselineY = rounded(safePadding + plotHeight);
  const normalizedScores = scores.map((score) => clamp(score, 0, 100));
  const flat = normalizedScores.length < 2 || normalizedScores.every((score) => score === normalizedScores[0]);
  const domain = flat || normalizedScores.length === 0
    ? { min: 40, max: 100 }
    : {
      min: Math.max(0, Math.min(...normalizedScores) - 8),
      max: Math.min(100, Math.max(...normalizedScores) + 8),
    };

  if (scores.length === 0) {
    return { points: [], linePath: '', areaPath: '', baselineY, domain };
  }

  const plotWidth = width - safePadding * 2;
  const points = scores.map((score, index) => {
    const plottedScore = clamp(score, domain.min, domain.max);
    const ratio = (plottedScore - domain.min) / (domain.max - domain.min);
    return {
      x: rounded(scores.length === 1 ? width / 2 : safePadding + (plotWidth * index) / (scores.length - 1)),
      y: rounded(safePadding + (1 - ratio) * plotHeight),
      score,
    };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

  return { points, linePath, areaPath, baselineY, domain };
}
