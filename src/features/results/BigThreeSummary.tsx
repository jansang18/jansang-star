import type { NatalChartData } from '../astrology/types';
import { longitudeToZodiac } from '../astrology/zodiac';
import { ZODIAC_GLYPHS } from '../astrology/constants';
import { useI18n } from '../../i18n/I18nProvider';
import { zodiacName } from '../../i18n/astrologyTerms';

export function BigThreeSummary({ chart }: { chart: NatalChartData }) {
  const { locale, t } = useI18n();
  const items = [
    { id: 'sun', label: t('bigThree.sunLabel'), name: zodiacName(chart.planets.sun.sign, locale), glyph: chart.planets.sun.glyph, copy: t('bigThree.sunCopy') },
    { id: 'moon', label: t('bigThree.moonLabel'), name: zodiacName(chart.planets.moon.sign, locale), glyph: chart.planets.moon.glyph, copy: t('bigThree.moonCopy') },
    chart.ascendant === undefined
      ? { id: 'ascendant', label: t('bigThree.risingLabel'), name: t('bigThree.timeRequired'), glyph: '↑', copy: t('bigThree.timeRequiredCopy') }
      : (() => { const zodiac = longitudeToZodiac(chart.ascendant); return { id: 'ascendant', label: t('bigThree.risingLabel'), name: zodiacName(zodiac.sign, locale), glyph: ZODIAC_GLYPHS[zodiac.signIndex], copy: t('bigThree.risingCopy') }; })(),
  ];
  return <section className="result-section big-three-section"><div className="section-kicker">{t('bigThree.kicker')}</div><h2>{t('bigThree.title')}</h2><div className="big-three-grid">{items.map((item, index) => <article className={`big-three-card tone-${index + 1}`} key={item.id}><span className="astro-glyph">{item.glyph}</span><div><small>{item.label}</small><h3>{item.name}</h3><p>{item.copy}</p></div></article>)}</div></section>;
}
