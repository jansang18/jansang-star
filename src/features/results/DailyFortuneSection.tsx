import type { LocalizedDailyFortune } from '../fortune/localizeDailyFortune';
import { useI18n } from '../../i18n/I18nProvider';

const ICONS = { overall: '✦', love: '♡', money: '◇', career: '⌁', health: '☼' };

export function DailyFortuneSection({ fortune }: { fortune: LocalizedDailyFortune }) {
  const { t } = useI18n();
  return <section className="result-section"><div className="section-kicker">{t('daily.kicker')}</div><h2>{t('daily.title')}</h2><div className="fortune-grid">{Object.entries(fortune.categories).map(([key, category]) => <article className={`fortune-card ${key}`} key={key}><div className="fortune-top"><span>{ICONS[key as keyof typeof ICONS]}</span><b>{category.label}</b><strong>{category.score}</strong></div><div className="score-bar"><i style={{ width: `${category.score}%` }} /></div><div className="signal-row">{(category.signals ?? []).map((signal) => <span key={signal}>{signal}</span>)}</div><div className="fortune-prose">{(category.paragraphs ?? [category.summary]).map((paragraph, index) => <p key={`${key}-${index}`}>{paragraph}</p>)}</div></article>)}</div></section>;
}
