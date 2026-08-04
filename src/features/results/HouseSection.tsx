import type { NatalChartData } from '../astrology/types';
import { useI18n } from '../../i18n/I18nProvider';
import { houseName } from '../../i18n/astrologyTerms';
import { formatLocaleNumber } from '../../i18n/numberFormat';
import { formatZodiacDegree } from '../../i18n/formatters';

export function HouseSection({ chart }: { chart: NatalChartData }) {
  const { locale, t } = useI18n();
  return <section className="result-section"><div className="section-heading"><div><div className="section-kicker">{t('houses.kicker')}</div><h2>{t('houses.title')}</h2></div><p>{t('houses.intro')}</p></div>{chart.houses.length ? <div className="house-grid">{chart.houses.map((cusp, index) => <article key={index + 1}><span>{formatLocaleNumber(index + 1, locale, 2)}</span><h3>{houseName(index + 1, locale)}</h3><p>{formatZodiacDegree(cusp, locale)}</p></article>)}</div> : <div className="unavailable-card">{t('houses.unavailable')}</div>}</section>;
}
