import { zodiacNameByIndex } from './astrologyTerms';
import type { Locale } from './types';

type Period = 'month' | 'year';

function dateForFormatting(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

export function formatZodiacDegree(longitude: number, locale: Locale): string {
  const totalMinutes = Math.round((((longitude % 360) + 360) % 360) * 60);
  const normalizedMinutes = totalMinutes % (360 * 60);
  const signIndex = Math.floor(normalizedMinutes / (30 * 60));
  const signMinutes = normalizedMinutes % (30 * 60);
  const degree = Math.floor(signMinutes / 60);
  const minute = String(signMinutes % 60).padStart(2, '0');
  return `${zodiacNameByIndex(signIndex, locale)} ${degree}°${minute}′`;
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
