import { describe, expect, it } from 'vitest';
import { parseGeoNames } from './build-world-cities.mjs';

const row = ({
  id,
  name,
  ascii,
  aliases,
  country,
  latitude,
  longitude,
  population,
  timeZone,
}: {
  id: string;
  name: string;
  ascii: string;
  aliases: string;
  country: string;
  latitude: string;
  longitude: string;
  population: string;
  timeZone: string;
}) => [
  id, name, ascii, aliases, latitude, longitude, 'P', 'PPLA', country, '', '11', '', '', '',
  population, '', '12', timeZone, '2026-08-05',
].join('\t');

describe('GeoNames world-city builder', () => {
  it('maps valid rows to compact deterministic tuples and retains useful bilingual aliases', () => {
    const input = [
      row({ id: '2643743', name: 'London', ascii: 'London', aliases: 'Londres,런던,London City', country: 'GB', latitude: '51.50853', longitude: '-0.12574', population: '8961989', timeZone: 'Europe/London' }),
      row({ id: '1835848', name: 'Seoul', ascii: 'Seoul', aliases: '서울,Sŏul,ソウル特別市', country: 'KR', latitude: '37.566', longitude: '126.9784', population: '10349312', timeZone: 'Asia/Seoul' }),
    ].join('\n');

    expect(parseGeoNames(input)).toEqual([
      ['1835848', 'Seoul', 'Seoul', ['서울', 'Sŏul'], 'KR', 37.566, 126.9784, 'Asia/Seoul', 10349312],
      ['2643743', 'London', 'London', ['Londres', '런던', 'London City'], 'GB', 51.50853, -0.12574, 'Europe/London', 8961989],
    ]);
  });

  it('rejects malformed coordinates, missing time zones, and duplicate IDs', () => {
    const valid = row({ id: '1', name: 'Valid', ascii: 'Valid', aliases: '', country: 'US', latitude: '40', longitude: '-70', population: '100', timeZone: 'America/New_York' });
    const duplicate = row({ id: '1', name: 'Duplicate', ascii: 'Duplicate', aliases: '', country: 'US', latitude: '41', longitude: '-71', population: '200', timeZone: 'America/New_York' });
    const invalid = row({ id: '2', name: 'Invalid', ascii: 'Invalid', aliases: '', country: 'US', latitude: 'NaN', longitude: '-71', population: '200', timeZone: '' });

    expect(parseGeoNames([valid, duplicate, invalid].join('\n'))).toEqual([
      ['1', 'Valid', 'Valid', [], 'US', 40, -70, 'America/New_York', 100],
    ]);
  });
});
