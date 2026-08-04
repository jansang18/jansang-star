import type { NatalChartData } from '../astrology/types';
import { degreeLabel } from '../astrology/zodiac';

const HOUSE_MEANINGS = ['자아·첫인상', '재물·가치', '소통·학습', '가정·뿌리', '창조·연애', '일상·건강', '관계·파트너', '공유·변화', '신념·여행', '직업·명예', '친구·미래', '내면·회복'];

export function HouseSection({ chart }: { chart: NatalChartData }) {
  return <section className="result-section"><div className="section-heading"><div><div className="section-kicker">TWELVE HOUSES</div><h2>12하우스</h2></div><p>삶의 열두 영역에 어떤 별자리의 색이 입혀지는지 읽습니다.</p></div>{chart.houses.length ? <div className="house-grid">{chart.houses.map((cusp, index) => <article key={index}><span>{String(index + 1).padStart(2, '0')}</span><h3>{HOUSE_MEANINGS[index]}</h3><p>{degreeLabel(cusp)}</p></article>)}</div> : <div className="unavailable-card">출생시간을 입력하면 상승궁부터 시작되는 12하우스를 정확히 계산할 수 있어요.</div>}</section>;
}
