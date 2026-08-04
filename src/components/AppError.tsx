import { useI18n } from '../i18n/I18nProvider';

export function AppError({ error, onClose }: { error: null | 'calculation'; onClose: () => void }) {
  const { t } = useI18n();
  if (!error) return null;
  return <div className="app-error" role="alert"><b>{t('error.calculationTitle')}</b><span>{t('error.calculationBody')}</span><button type="button" onClick={onClose}>{t('error.close')}</button></div>;
}
