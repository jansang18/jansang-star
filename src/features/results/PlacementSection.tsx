import type { NatalChartData, PlanetId } from '../astrology/types';
import { useI18n } from '../../i18n/I18nProvider';
import type { TranslationKey } from '../../i18n/translations';
import { houseLabel, motionName, planetName } from '../../i18n/astrologyTerms';
import { formatZodiacDegree } from '../../i18n/formatters';

const ROLE_KEY: Record<PlanetId, TranslationKey> = {
  sun: 'placements.role.sun', moon: 'placements.role.moon', mercury: 'placements.role.mercury',
  venus: 'placements.role.venus', mars: 'placements.role.mars', jupiter: 'placements.role.jupiter',
  saturn: 'placements.role.saturn', uranus: 'placements.role.uranus', neptune: 'placements.role.neptune',
  pluto: 'placements.role.pluto',
};

export function PlacementSection({ chart }: { chart: NatalChartData }) {
  const { locale, t } = useI18n();
  return <section className="result-section"><div className="section-heading"><div><div className="section-kicker">{t('placements.kicker')}</div><h2>{t('placements.title')}</h2></div><p>{t('placements.intro')}</p></div><div className="placement-grid">{Object.values(chart.planets).map((planet) => <article className="placement-card" key={planet.id}><span className="planet-icon">{planet.glyph}</span><div className="placement-main"><small>{planetName(planet.id, locale)} · {t(ROLE_KEY[planet.id])}</small><h3>{formatZodiacDegree(planet.longitude, locale)}</h3><p>{planet.house ? t('placements.house', { house: houseLabel(planet.house, locale) }) : t('placements.houseUnknown')}</p></div>{planet.retrograde && <span className="status-badge">{motionName('retrograde', locale)}</span>}</article>)}</div></section>;
}
