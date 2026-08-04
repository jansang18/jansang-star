import type { Locale } from './types';

const GENERIC_COPY: Record<Locale, string> = {
  ko: '이 내용을 표시할 수 없습니다.',
  en: 'Content is unavailable.',
};

type AuthoredFunction = (...params: never[]) => string;

export function safeAuthoredCopy(locale: Locale, value: string | null | undefined): string;
export function safeAuthoredCopy<Params extends unknown[]>(
  locale: Locale,
  value: ((...params: Params) => string) | null | undefined,
  ...params: Params
): string;
export function safeAuthoredCopy(
  locale: Locale,
  value: string | AuthoredFunction | null | undefined,
  ...params: unknown[]
): string {
  const rendered = typeof value === 'function'
    ? Reflect.apply(value, undefined, params)
    : value;
  return typeof rendered === 'string' && rendered.trim() !== '' ? rendered : GENERIC_COPY[locale];
}
