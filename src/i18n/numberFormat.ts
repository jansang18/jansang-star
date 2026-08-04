import type { Locale } from './types';

export function formatLocaleNumber(value: number, locale: Locale, minimumIntegerDigits = 1): string {
  const options = minimumIntegerDigits === 1
    ? { useGrouping: false }
    : { useGrouping: false, minimumIntegerDigits };
  return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', options).format(value);
}
