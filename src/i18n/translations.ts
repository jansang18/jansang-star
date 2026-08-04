import type { Locale, TranslationParams } from './types';

const ko = {
  'brand.name': '잔상 별자리',
  'nav.system': 'TROPICAL · PLACIDUS',
  'language.label': '표시 언어',
  'language.korean': '한국어',
  'language.english': 'English',
  'landing.eyebrow': 'THE SKY REMEMBERS YOUR MOMENT',
  'landing.copy': '태어난 순간의 별빛은 오늘도 잔상을 남깁니다.',
  'landing.detail': '출생 차트와 오늘의 천체 흐름을 깊이 읽는 나만의 별자리 만세력',
  'landing.cta': '나의 별자리 만세력 보기',
  'results.reportTitle': '{name}님의 코스믹 리포트',
} as const;

export type TranslationKey = keyof typeof ko;

const en: Record<TranslationKey, string> = {
  'brand.name': 'Jansang Star',
  'nav.system': 'TROPICAL · PLACIDUS',
  'language.label': 'Display language',
  'language.korean': '한국어',
  'language.english': 'English',
  'landing.eyebrow': 'THE SKY REMEMBERS YOUR MOMENT',
  'landing.copy': 'The sky at your first breath still leaves an afterimage.',
  'landing.detail': 'A personal cosmic almanac for your natal chart and the sky in motion today',
  'landing.cta': 'Read my cosmic almanac',
  'results.reportTitle': "{name}'s cosmic report",
};

export const TRANSLATIONS = { ko, en };

export function translate(locale: Locale, key: TranslationKey, params?: TranslationParams): string {
  return TRANSLATIONS[locale][key].replace(/\{([a-zA-Z0-9_]+)\}/g, (token, parameterName: string) => {
    const value = params?.[parameterName];
    if (value !== undefined) return String(value);
    if (import.meta.env.DEV) throw new Error(`Missing translation parameter: ${parameterName}`);
    return token;
  });
}
