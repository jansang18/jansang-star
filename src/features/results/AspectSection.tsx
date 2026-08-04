import type { NatalChartData } from '../astrology/types';
import { natalAspects, type Aspect } from '../fortune/aspects';
import type { TransitData } from '../fortune/transits';

const LABEL = { conjunction: '합', sextile: '육분', square: '사각', trine: '삼분', opposition: '충' };
const SYMBOL = { conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍' };
const TONE = { conjunction: '에너지가 강하게 합쳐집니다.', sextile: '기회를 부드럽게 열어줍니다.', square: '성장을 위한 긴장을 만듭니다.', trine: '재능과 흐름을 자연스럽게 돕습니다.', opposition: '두 방향 사이의 균형을 요구합니다.' };

function AspectRow({ aspect, chart, transit }: { aspect: Aspect; chart: NatalChartData; transit?: TransitData }) {
  const from = transit?.chart.planets[aspect.from] ?? chart.planets[aspect.from]; const to = chart.planets[aspect.to];
  return <li><span className={`aspect-symbol ${aspect.type}`}>{SYMBOL[aspect.type]}</span><div><b>{from.nameKo} {LABEL[aspect.type]} {to.nameKo}</b><p>{TONE[aspect.type]}</p></div><small>오브 {aspect.orb.toFixed(1)}°</small></li>;
}

export function AspectSection({ chart, transits }: { chart: NatalChartData; transits: TransitData }) {
  const natal = natalAspects(chart).slice(0, 8); const daily = transits.aspects.slice(0, 8);
  return <><section className="result-section"><div className="section-kicker">NATAL ASPECTS</div><h2>주요 애스펙트</h2><ul className="aspect-list">{natal.map((aspect, index) => <AspectRow aspect={aspect} chart={chart} key={`${aspect.from}-${aspect.to}-${index}`} />)}</ul></section><section className="result-section transit-section"><div className="section-kicker">TRANSITS TO NATAL</div><h2>오늘의 트랜짓</h2><p className="section-lead">오늘 정오의 행성이 출생 차트에 만드는 가장 강한 연결입니다.</p><ul className="aspect-list">{daily.map((aspect, index) => <AspectRow aspect={aspect} chart={chart} transit={transits} key={`${aspect.from}-${aspect.to}-${index}`} />)}</ul></section></>;
}
