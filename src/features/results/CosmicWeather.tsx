import type { LocalizedDailyFortune } from '../fortune/localizeDailyFortune';
import { useI18n } from '../../i18n/I18nProvider';

export function CosmicWeather({ fortune }: { fortune: LocalizedDailyFortune }) {
  const { t } = useI18n();
  const overall = fortune.categories.overall;
  return <section className="result-section cosmic-section"><div className="cosmic-copy"><div className="section-kicker light">{t('daily.cosmicKicker')}</div><h2>{t('daily.cosmicTitle')}</h2><h3>{fortune.headline}</h3><div className="signal-row light">{(overall.signals ?? []).map((signal) => <span key={signal}>{signal}</span>)}</div>{(overall.paragraphs ?? [overall.summary]).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="score-orbit" style={{ '--score': fortune.overallScore } as React.CSSProperties}><strong>{fortune.overallScore}</strong><span>{t('daily.flowScore')}</span></div></section>;
}
