import type { LocalizedDailyFortune } from '../fortune/localizeDailyFortune';
import { useI18n } from '../../i18n/I18nProvider';

export function LuckyGuide({ fortune }: { fortune: LocalizedDailyFortune }) {
  const { t } = useI18n();
  const items = [{ id: 'color', icon: '◉', label: t('lucky.color'), value: fortune.lucky.color }, { id: 'number', icon: '#', label: t('lucky.number'), value: fortune.lucky.number }, { id: 'time', icon: '◷', label: t('lucky.time'), value: fortune.lucky.time }];
  return <section className="result-section lucky-section"><div className="section-kicker light">{t('lucky.kicker')}</div><h2>{t('lucky.title')}</h2><div className="lucky-grid">{items.map((item) => <article key={item.id}><span>{item.icon}</span><small>{item.label}</small><strong>{item.value}</strong></article>)}</div><blockquote>“{fortune.lucky.advice}”</blockquote></section>;
}
