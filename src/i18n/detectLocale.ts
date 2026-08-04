import type { Locale } from './types';

export const LANGUAGE_STORAGE_KEY = 'jansang-language';

export function detectLocale({ stored, languages }: { stored: string | null; languages: readonly string[] }): Locale {
  if (stored === 'ko' || stored === 'en') return stored;

  return languages.some((language) => language.toLowerCase().split('-')[0] === 'ko') ? 'ko' : 'en';
}
