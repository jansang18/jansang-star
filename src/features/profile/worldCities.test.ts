import { describe, expect, it } from 'vitest';
import {
  featuredWorldCities,
  parseWorldCityPayload,
  searchWorldCities,
  type WorldCityRecord,
} from './worldCities';

const records: WorldCityRecord[] = [
  ['1835848', 'Seoul', 'Seoul', ['서울', 'Sŏul'], 'KR', 37.566, 126.9784, 'Asia/Seoul', 10349312],
  ['2643743', 'London', 'London', ['Londres', '런던'], 'GB', 51.50853, -0.12574, 'Europe/London', 8961989],
  ['5128581', 'New York City', 'New York City', ['New York', '뉴욕'], 'US', 40.71427, -74.00597, 'America/New_York', 8804190],
  ['2988507', 'Paris', 'Paris', ['파리'], 'FR', 48.85341, 2.3488, 'Europe/Paris', 2138551],
  ['2147714', 'Sydney', 'Sydney', ['시드니'], 'AU', -33.86785, 151.20732, 'Australia/Sydney', 5231147],
  ['1850147', 'Tokyo', 'Tokyo', ['도쿄'], 'JP', 35.6895, 139.69171, 'Asia/Tokyo', 8336599],
  ['3448439', 'São Paulo', 'Sao Paulo', ['상파울루'], 'BR', -23.5475, -46.63611, 'America/Sao_Paulo', 12400232],
  ['2633352', 'York', 'York', [], 'GB', 53.95763, -1.08271, 'Europe/London', 156135],
  ['5085520', 'York Beach', 'York Beach', [], 'US', 43.17148, -70.60894, 'America/New_York', 12854],
];

describe('world city search', () => {
  it('shows a geographically mixed featured list instead of the first Korean rows', () => {
    const featured = featuredWorldCities(records, 'en');
    expect(featured.slice(0, 6).map((city) => city.countryCode)).toEqual(['BR', 'KR', 'GB', 'US', 'JP', 'AU']);
    expect(new Set(featured.slice(0, 6).map((city) => city.countryCode)).size).toBe(6);
  });

  it('searches English, Korean, ASCII, country, country code, and IANA timezone fields', () => {
    expect(searchWorldCities(records, 'London', 'en')[0]?.id).toBe('london');
    expect(searchWorldCities(records, '런던', 'ko')[0]?.nameKo).toBe('런던');
    expect(searchWorldCities(records, 'Sao Paulo', 'en')[0]?.nameEn).toBe('Sao Paulo');
    expect(searchWorldCities(records, 'United Kingdom', 'en')[0]?.countryCode).toBe('GB');
    expect(searchWorldCities(records, 'GB', 'en')[0]?.countryCode).toBe('GB');
    expect(searchWorldCities(records, 'America/New_York', 'en').map((city) => city.countryCode)).toContain('US');
  });

  it('ranks exact matches before prefixes and then population while respecting the limit', () => {
    const york = searchWorldCities(records, 'York', 'en', 2);
    expect(york.map((city) => city.nameEn)).toEqual(['York', 'York Beach']);
    expect(york).toHaveLength(2);
  });

  it('parses only the expected versioned payload shape', () => {
    expect(parseWorldCityPayload({ source: 'GeoNames cities15000', cities: records })).toEqual(records);
    expect(() => parseWorldCityPayload({ cities: [['broken']] })).toThrow('Invalid world-city data');
  });
});
