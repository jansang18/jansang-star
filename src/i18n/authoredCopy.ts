import type { Locale } from './types';

const GENERIC_COPY: Record<Locale, string> = {
  ko: '이 내용을 표시할 수 없습니다.',
  en: 'Content is unavailable.',
};

export function safeAuthoredCopy(locale: Locale, value: unknown, ...params: unknown[]): string {
  const rendered = typeof value === 'function'
    ? (value as (...args: unknown[]) => unknown)(...params)
    : value;
  return typeof rendered === 'string' && rendered.trim() !== '' ? rendered : GENERIC_COPY[locale];
}
