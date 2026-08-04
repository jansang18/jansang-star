import { useI18n } from '../i18n/I18nProvider';

export function LegalNotice() {
  const { t } = useI18n();
  return <div className="legal-notice"><p>{t('legal.purpose')}</p><p>{t('legal.calculation')} · <a href="https://www.astro.com/swisseph/" target="_blank" rel="noreferrer">{t('legal.license')}</a> · {t('legal.prototype')}</p></div>;
}
