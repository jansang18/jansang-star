import { describe, expect, it } from 'vitest';
import { detectLocale } from './detectLocale';

describe('detectLocale', () => {
  it('uses a valid saved choice before browser languages', () => {
    expect(detectLocale({ stored: 'ko', languages: ['en-US'] })).toBe('ko');
    expect(detectLocale({ stored: 'en', languages: ['ko-KR'] })).toBe('en');
  });

  it('uses Korean only for a ko language and English for every other language', () => {
    expect(detectLocale({ stored: null, languages: ['ja-JP', 'ko-KR'] })).toBe('ko');
    expect(detectLocale({ stored: null, languages: ['fr-FR'] })).toBe('en');
    expect(detectLocale({ stored: 'de', languages: ['ko'] })).toBe('ko');
  });
});
