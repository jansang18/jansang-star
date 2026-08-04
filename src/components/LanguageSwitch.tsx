import { useI18n } from '../i18n/I18nProvider';

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();

  return <div className="language-switch" role="group" aria-label={t('language.label')}>
    <button
      type="button"
      aria-label={t('language.korean')}
      aria-pressed={locale === 'ko'}
      onClick={() => setLocale('ko')}
    >한</button>
    <button
      type="button"
      aria-label={t('language.english')}
      aria-pressed={locale === 'en'}
      onClick={() => setLocale('en')}
    >EN</button>
  </div>;
}
