import type { City } from './types';

export const CITIES: City[] = [
  { id: 'seoul', nameKo: '서울', countryKo: '대한민국', latitude: 37.5665, longitude: 126.978, timeZone: 'Asia/Seoul' },
  { id: 'busan', nameKo: '부산', countryKo: '대한민국', latitude: 35.1796, longitude: 129.0756, timeZone: 'Asia/Seoul' },
  { id: 'daegu', nameKo: '대구', countryKo: '대한민국', latitude: 35.8714, longitude: 128.6014, timeZone: 'Asia/Seoul' },
  { id: 'incheon', nameKo: '인천', countryKo: '대한민국', latitude: 37.4563, longitude: 126.7052, timeZone: 'Asia/Seoul' },
  { id: 'gwangju', nameKo: '광주', countryKo: '대한민국', latitude: 35.1595, longitude: 126.8526, timeZone: 'Asia/Seoul' },
  { id: 'daejeon', nameKo: '대전', countryKo: '대한민국', latitude: 36.3504, longitude: 127.3845, timeZone: 'Asia/Seoul' },
  { id: 'ulsan', nameKo: '울산', countryKo: '대한민국', latitude: 35.5384, longitude: 129.3114, timeZone: 'Asia/Seoul' },
  { id: 'jeju', nameKo: '제주', countryKo: '대한민국', latitude: 33.4996, longitude: 126.5312, timeZone: 'Asia/Seoul' },
  { id: 'tokyo', nameKo: '도쿄', countryKo: '일본', latitude: 35.6762, longitude: 139.6503, timeZone: 'Asia/Tokyo' },
  { id: 'beijing', nameKo: '베이징', countryKo: '중국', latitude: 39.9042, longitude: 116.4074, timeZone: 'Asia/Shanghai' },
  { id: 'new-york', nameKo: '뉴욕', countryKo: '미국', latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' },
  { id: 'los-angeles', nameKo: '로스앤젤레스', countryKo: '미국', latitude: 34.0522, longitude: -118.2437, timeZone: 'America/Los_Angeles' },
  { id: 'london', nameKo: '런던', countryKo: '영국', latitude: 51.5072, longitude: -0.1276, timeZone: 'Europe/London' },
  { id: 'paris', nameKo: '파리', countryKo: '프랑스', latitude: 48.8566, longitude: 2.3522, timeZone: 'Europe/Paris' },
  { id: 'sydney', nameKo: '시드니', countryKo: '호주', latitude: -33.8688, longitude: 151.2093, timeZone: 'Australia/Sydney' },
];

export function searchCities(query: string): City[] {
  const normalized = query.trim().toLocaleLowerCase('ko');
  if (!normalized) return CITIES;
  return CITIES.filter((city) => `${city.nameKo} ${city.countryKo}`.toLocaleLowerCase('ko').includes(normalized));
}
