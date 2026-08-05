import { zodiacNameByIndex } from './astrologyTerms';
import { formatLocaleNumber } from './numberFormat';
import type { Locale } from './types';

type Period = 'month' | 'year';

function dateForFormatting(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

export function formatZodiacDegree(longitude: number, locale: Locale): string {
  const normalizedLongitude = longitude >= 0 && longitude < 360
    ? longitude
    : ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30);
  const withinSignLongitude = normalizedLongitude - signIndex * 30;
  const signMinutes = Math.floor(withinSignLongitude * 60);
  const degree = Math.floor(signMinutes / 60);
  const minute = formatLocaleNumber(signMinutes % 60, locale, 2);
  return `${zodiacNameByIndex(signIndex, locale)} ${formatLocaleNumber(degree, locale)}°${minute}′`;
}

export function formatLocalDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
  }).format(dateForFormatting(isoDate));
}

export function formatPeriodLabel(period: Period, isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    timeZone: 'UTC', year: 'numeric', ...(period === 'month' ? { month: 'long' as const } : {}),
  }).format(dateForFormatting(isoDate));
}

export function formatPeriodTickLabel(period: Period, isoDate: string, locale: Locale): string {
  if (period === 'month') return formatLocalDate(isoDate, locale);

  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    timeZone: 'UTC',
    month: locale === 'ko' ? 'numeric' : 'short',
  }).format(dateForFormatting(isoDate));
}
