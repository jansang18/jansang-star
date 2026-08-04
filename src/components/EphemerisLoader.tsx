import { useI18n } from '../i18n/I18nProvider';

export function EphemerisLoader() {
  const { t } = useI18n();
  return <div className="ephemeris-loader" role="status" aria-live="polite"><div className="loader-orbit"><span>✦</span></div><b>{t('loader.title')}</b><p>{t('loader.body')}</p></div>;
}
