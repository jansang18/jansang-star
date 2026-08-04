import type { NatalChartData } from '../astrology/types';
import { natalAspects, type Aspect } from '../fortune/aspects';
import type { TransitData } from '../fortune/transits';
import { useI18n } from '../../i18n/I18nProvider';
import { aspectName, planetName } from '../../i18n/astrologyTerms';
import { formatLocaleNumber } from '../../i18n/numberFormat';
import type { TranslationKey } from '../../i18n/translations';

const SYMBOL = { conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍' };
const TONE_KEY: Record<Aspect['type'], TranslationKey> = {
  conjunction: 'aspects.tone.conjunction', sextile: 'aspects.tone.sextile', square: 'aspects.tone.square',
  trine: 'aspects.tone.trine', opposition: 'aspects.tone.opposition',
};

function AspectRow({ aspect, chart, transit }: { aspect: Aspect; chart: NatalChartData; transit?: TransitData }) {
  const { locale, t } = useI18n();
  const from = transit?.chart.planets[aspect.from] ?? chart.planets[aspect.from]; const to = chart.planets[aspect.to];
  return <li><span className={`aspect-symbol ${aspect.type}`}>{SYMBOL[aspect.type]}</span><div><b>{planetName(from.id, locale)} · {aspectName(aspect.type, locale)} · {planetName(to.id, locale)}</b><p>{t(TONE_KEY[aspect.type])}</p></div><small>{t('aspects.orb', { orb: formatLocaleNumber(Number(aspect.orb.toFixed(1)), locale) })}</small></li>;
}

export function AspectSection({ chart, transits }: { chart: NatalChartData; transits: TransitData }) {
  const { t } = useI18n();
  const natal = natalAspects(chart).slice(0, 8); const daily = transits.aspects.slice(0, 8);
  return <><section className="result-section"><div className="section-kicker">{t('aspects.kicker')}</div><h2>{t('aspects.title')}</h2><ul className="aspect-list">{natal.map((aspect, index) => <AspectRow aspect={aspect} chart={chart} key={`${aspect.from}-${aspect.to}-${index}`} />)}</ul></section><section className="result-section transit-section"><div className="section-kicker">{t('transits.kicker')}</div><h2>{t('transits.title')}</h2><p className="section-lead">{t('transits.intro')}</p><ul className="aspect-list">{daily.map((aspect, index) => <AspectRow aspect={aspect} chart={chart} transit={transits} key={`${aspect.from}-${aspect.to}-${index}`} />)}</ul></section></>;
}
