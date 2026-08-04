import { expect, it } from 'vitest';
import { TRANSLATIONS, translate } from './translations';

it('keeps Korean and English UI keys identical', () => {
  expect(Object.keys(TRANSLATIONS.ko).sort()).toEqual(Object.keys(TRANSLATIONS.en).sort());
  expect(translate('en', 'results.reportTitle', { name: 'Mina' })).toBe("Mina's cosmic report");
});

it('rejects missing interpolation values during development', () => {
  expect(() => translate('en', 'results.reportTitle')).toThrow('Missing translation parameter: name');
});
