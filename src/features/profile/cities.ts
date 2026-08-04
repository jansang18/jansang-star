import type { Locale } from '../../i18n/types';
import type { City } from './types';

export const CITIES: City[] = [
  { id: 'seoul', nameKo: '서울', nameEn: 'Seoul', countryKo: '대한민국', countryEn: 'South Korea', latitude: 37.5665, longitude: 126.978, timeZone: 'Asia/Seoul' },
  { id: 'busan', nameKo: '부산', nameEn: 'Busan', countryKo: '대한민국', countryEn: 'South Korea', latitude: 35.1796, longitude: 129.0756, timeZone: 'Asia/Seoul' },
  { id: 'daegu', nameKo: '대구', nameEn: 'Daegu', countryKo: '대한민국', countryEn: 'South Korea', latitude: 35.8714, longitude: 128.6014, timeZone: 'Asia/Seoul' },
  { id: 'incheon', nameKo: '인천', nameEn: 'Incheon', countryKo: '대한민국', countryEn: 'South Korea', latitude: 37.4563, longitude: 126.7052, timeZone: 'Asia/Seoul' },
  { id: 'gwangju', nameKo: '광주', nameEn: 'Gwangju', countryKo: '대한민국', countryEn: 'South Korea', latitude: 35.1595, longitude: 126.8526, timeZone: 'Asia/Seoul' },
  { id: 'daejeon', nameKo: '대전', nameEn: 'Daejeon', countryKo: '대한민국', countryEn: 'South Korea', latitude: 36.3504, longitude: 127.3845, timeZone: 'Asia/Seoul' },
  { id: 'ulsan', nameKo: '울산', nameEn: 'Ulsan', countryKo: '대한민국', countryEn: 'South Korea', latitude: 35.5384, longitude: 129.3114, timeZone: 'Asia/Seoul' },
  { id: 'jeju', nameKo: '제주', nameEn: 'Jeju', countryKo: '대한민국', countryEn: 'South Korea', latitude: 33.4996, longitude: 126.5312, timeZone: 'Asia/Seoul' },
  { id: 'tokyo', nameKo: '도쿄', nameEn: 'Tokyo', countryKo: '일본', countryEn: 'Japan', latitude: 35.6762, longitude: 139.6503, timeZone: 'Asia/Tokyo' },
  { id: 'beijing', nameKo: '베이징', nameEn: 'Beijing', countryKo: '중국', countryEn: 'China', latitude: 39.9042, longitude: 116.4074, timeZone: 'Asia/Shanghai' },
  { id: 'new-york', nameKo: '뉴욕', nameEn: 'New York', countryKo: '미국', countryEn: 'United States', latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' },
  { id: 'los-angeles', nameKo: '로스앤젤레스', nameEn: 'Los Angeles', countryKo: '미국', countryEn: 'United States', latitude: 34.0522, longitude: -118.2437, timeZone: 'America/Los_Angeles' },
  { id: 'london', nameKo: '런던', nameEn: 'London', countryKo: '영국', countryEn: 'United Kingdom', latitude: 51.5072, longitude: -0.1276, timeZone: 'Europe/London' },
  { id: 'paris', nameKo: '파리', nameEn: 'Paris', countryKo: '프랑스', countryEn: 'France', latitude: 48.8566, longitude: 2.3522, timeZone: 'Europe/Paris' },
  { id: 'sydney', nameKo: '시드니', nameEn: 'Sydney', countryKo: '호주', countryEn: 'Australia', latitude: -33.8688, longitude: 151.2093, timeZone: 'Australia/Sydney' },
];

export function cityName(city: City, locale: Locale): string {
  return locale === 'ko' ? city.nameKo : city.nameEn;
}

export function searchCities(query: string): City[] {
  const normalized = query.trim().toLocaleLowerCase('ko');
  if (!normalized) return CITIES;
  return CITIES.filter((city) => `${city.nameKo} ${city.nameEn} ${city.countryKo} ${city.countryEn}`.toLocaleLowerCase('ko').includes(normalized));
}
