import type { NatalChartData } from '../astrology/types';
import { degreeLabel } from '../astrology/zodiac';

const ROLE: Record<string, string> = { sun: '정체성과 삶의 방향', moon: '감정과 안정 욕구', mercury: '생각과 소통', venus: '사랑과 취향', mars: '행동과 추진력', jupiter: '성장과 기회', saturn: '책임과 성숙', uranus: '변화와 독창성', neptune: '직관과 상상', pluto: '변형과 깊은 힘' };

export function PlacementSection({ chart }: { chart: NatalChartData }) {
  return <section className="result-section"><div className="section-heading"><div><div className="section-kicker">PLANETARY PLACEMENTS</div><h2>행성 배치</h2></div><p>각 행성이 어느 별자리와 삶의 영역에서 힘을 쓰는지 보여줍니다.</p></div><div className="placement-grid">{Object.values(chart.planets).map((planet) => <article className="placement-card" key={planet.id}><span className="planet-icon">{planet.glyph}</span><div className="placement-main"><small>{planet.nameKo} · {ROLE[planet.id]}</small><h3>{degreeLabel(planet.longitude)}</h3><p>{planet.house ? `${planet.house}하우스에서 이 에너지가 구체적으로 드러납니다.` : '출생시간 미상으로 하우스는 계산하지 않았습니다.'}</p></div>{planet.retrograde && <span className="status-badge">역행</span>}</article>)}</div></section>;
}
