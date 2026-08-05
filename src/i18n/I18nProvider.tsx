import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { detectLocale, LANGUAGE_STORAGE_KEY } from './detectLocale';
import { translate, type TranslationKey } from './translations';
import type { Locale, TranslationParams } from './types';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function detectInitialLocale(): Locale {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    // Storage may be disabled; browser-language detection remains available.
  }
  return detectLocale({
    stored,
    languages: [...navigator.languages, navigator.language],
  });
}

export function I18nProvider({ children, initialLocale }: PropsWithChildren<{ initialLocale?: Locale }>) {
  const [locale, setLocale] = useState<Locale>(() => initialLocale ?? detectInitialLocale());

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch {
      // Keep the in-memory locale usable when persistence is unavailable.
    }
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t: (key: TranslationKey, params?: TranslationParams) => translate(locale, key, params),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
}
