import type { Locale } from '../../i18n/types';
import { CITIES } from './cities';
import type { City } from './types';

export type WorldCityRecord = readonly [
  id: string,
  name: string,
  asciiName: string,
  aliases: readonly string[],
  countryCode: string,
  latitude: number,
  longitude: number,
  timeZone: string,
  population: number,
];

type WorldCityPayload = {
  source: string;
  cities: readonly WorldCityRecord[];
};

const countryNames = new Map<Locale, Intl.DisplayNames>([
  ['ko', new Intl.DisplayNames(['ko'], { type: 'region' })],
  ['en', new Intl.DisplayNames(['en'], { type: 'region' })],
]);

const normalize = (value: string) => value
  .normalize('NFKD')
  .replace(/\p{Mark}/gu, '')
  .toLocaleLowerCase()
  .trim();

const displayCountry = (countryCode: string, locale: Locale) => {
  try {
    return countryNames.get(locale)?.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
};

const toCity = (record: WorldCityRecord): City => {
  const [id, name, asciiName, aliases, countryCode, latitude, longitude, timeZone, population] = record;
  const koreanAlias = aliases.find((alias) => /\p{Script=Hangul}/u.test(alias));
  const recordNames = [name, asciiName, ...aliases].map(normalize);
  const curated = CITIES.find((city) => city.timeZone === timeZone && recordNames.includes(normalize(city.nameEn)));
  if (curated) return { ...curated, countryCode, population };
  return {
    id: `geonames-${id}`,
    nameKo: koreanAlias || name,
    nameEn: asciiName || name,
    countryKo: displayCountry(countryCode, 'ko'),
    countryEn: displayCountry(countryCode, 'en'),
    countryCode,
    latitude,
    longitude,
    timeZone,
    population,
  };
};

export function parseWorldCityPayload(value: unknown): readonly WorldCityRecord[] {
  const payload = value as Partial<WorldCityPayload> | null;
  if (!payload || payload.source !== 'GeoNames cities15000' || !Array.isArray(payload.cities)) {
    throw new Error('Invalid world-city data');
  }
  const valid = payload.cities.every((record) => Array.isArray(record)
    && record.length === 9
    && typeof record[0] === 'string'
    && typeof record[1] === 'string'
    && typeof record[2] === 'string'
    && Array.isArray(record[3])
    && typeof record[4] === 'string'
    && Number.isFinite(record[5])
    && Number.isFinite(record[6])
    && typeof record[7] === 'string'
    && Number.isFinite(record[8]));
  if (!valid) throw new Error('Invalid world-city data');
  return payload.cities as readonly WorldCityRecord[];
}

let cityDataPromise: Promise<readonly WorldCityRecord[]> | undefined;

export function loadWorldCities(): Promise<readonly WorldCityRecord[]> {
  if (!cityDataPromise) {
    const url = new URL('data/world-cities.json', `${window.location.origin}${import.meta.env.BASE_URL}`).href;
    cityDataPromise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`World-city data failed: ${response.status}`);
        return response.json();
      })
      .then(parseWorldCityPayload)
      .catch((error) => {
        cityDataPromise = undefined;
        throw error;
      });
  }
  return cityDataPromise;
}

export function featuredWorldCities(records: readonly WorldCityRecord[], _locale: Locale, limit = 8): City[] {
  const featured: WorldCityRecord[] = [];
  const usedCountries = new Set<string>();
  const byPopulation = [...records].sort((left, right) => right[8] - left[8] || left[0].localeCompare(right[0]));
  for (const record of byPopulation) {
    if (usedCountries.has(record[4])) continue;
    usedCountries.add(record[4]);
    featured.push(record);
    if (featured.length === limit) break;
  }
  return featured.map(toCity);
}

const matchRank = (record: WorldCityRecord, query: string): number | undefined => {
  const countryCode = record[4];
  const fields = [
    record[1],
    record[2],
    ...record[3],
    countryCode,
    displayCountry(countryCode, 'ko'),
    displayCountry(countryCode, 'en'),
    record[7],
  ].map(normalize);
  if (fields.some((field) => field === query)) return 0;
  if (fields.some((field) => field.startsWith(query))) return 1;
  if (fields.some((field) => field.split(/\s+/).some((part) => part.startsWith(query)))) return 2;
  if (fields.some((field) => field.includes(query))) return 3;
  return undefined;
};

export function searchWorldCities(
  records: readonly WorldCityRecord[],
  query: string,
  locale: Locale,
  limit = 20,
): City[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return featuredWorldCities(records, locale, Math.min(limit, 8));
  return records
    .map((record) => ({ record, rank: matchRank(record, normalizedQuery) }))
    .filter((candidate): candidate is { record: WorldCityRecord; rank: number } => candidate.rank !== undefined)
    .sort((left, right) => left.rank - right.rank || right.record[8] - left.record[8] || left.record[0].localeCompare(right.record[0]))
    .slice(0, limit)
    .map(({ record }) => toCity(record));
}
