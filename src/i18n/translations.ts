import type { Locale, TranslationParams } from './types';

const ko = {
  'brand.name': '잔상 별자리',
  'nav.system': 'TROPICAL · PLACIDUS',
  'language.label': '표시 언어',
  'language.korean': '한국어',
  'language.english': 'English',
  'landing.eyebrow': 'THE SKY REMEMBERS YOUR MOMENT',
  'landing.copy': '태어난 순간의 별빛은 오늘도 잔상을 남깁니다.',
  'landing.detail': '출생 차트와 오늘의 천체 흐름을 깊이 읽는 나만의 별자리 만세력',
  'landing.cta': '나의 별자리 만세력 보기',
  'results.reportTitle': '{name}님의 코스믹 리포트',
  'form.eyebrow': 'YOUR MOMENT IN THE SKY',
  'form.title': '태어난 순간을 알려주세요',
  'form.intro': '정확한 시간과 장소가 상승궁과 12하우스를 결정합니다.',
  'form.name': '이름 또는 별칭',
  'form.namePlaceholder': '결과에 표시할 이름',
  'form.date': '생년월일',
  'form.dateHint': '숫자 8자리 입력 · 예: 19900805',
  'form.time': '출생시간',
  'form.unknownTime': '시간을 몰라요',
  'form.city': '출생지역',
  'form.cityPlaceholder': '도시 이름을 검색하세요',
  'form.custom': '목록에 없는 장소 직접 입력',
  'form.cityReturn': '도시 검색으로 돌아가기',
  'form.latitude': '위도',
  'form.longitude': '경도',
  'form.timeZone': 'IANA 시간대',
  'form.unknownTimeNote': '출생시간이 없으면 태양·달·행성 별자리는 계산하지만 상승궁과 12하우스는 표시하지 않아요.',
  'form.calculate': '별자리 만세력 계산하기',
  'form.calculating': '별의 위치를 계산하는 중…',
  'form.privacy': '입력한 정보는 이 기기에만 저장되며 외부 서버로 전송되지 않습니다.',
  'form.noCityResult': '검색 결과가 없어요. 고급 입력을 이용해 주세요.',
  'validation.displayNameRequired': '이름이나 별칭을 입력해 주세요.',
  'validation.dateInvalid': '올바른 생년월일을 입력해 주세요.',
  'validation.dateFuture': '미래 날짜는 입력할 수 없어요.',
  'validation.timeInvalid': '정확한 출생시간을 입력해 주세요.',
  'validation.cityRequired': '출생지역을 선택해 주세요.',
  'validation.coordinatesInvalid': '위도와 경도 범위를 확인해 주세요.',
  'validation.timeZoneRequired': '시간대를 선택해 주세요.',
  'validation.timeZoneInvalid': '올바른 IANA 시간대를 입력해 주세요.',
} as const;

export type TranslationKey = keyof typeof ko;

const en: Record<TranslationKey, string> = {
  'brand.name': 'Jansang Star',
  'nav.system': 'TROPICAL · PLACIDUS',
  'language.label': 'Display language',
  'language.korean': '한국어',
  'language.english': 'English',
  'landing.eyebrow': 'THE SKY REMEMBERS YOUR MOMENT',
  'landing.copy': 'The sky at your first breath still leaves an afterimage.',
  'landing.detail': 'A personal cosmic almanac for your natal chart and the sky in motion today',
  'landing.cta': 'Read my cosmic almanac',
  'results.reportTitle': "{name}'s cosmic report",
  'form.eyebrow': 'YOUR MOMENT IN THE SKY',
  'form.title': 'Tell us the moment you were born',
  'form.intro': 'Your exact time and place determine your rising sign and twelve houses.',
  'form.name': 'Name or nickname',
  'form.namePlaceholder': 'The name to show with your results',
  'form.date': 'Date of birth',
  'form.dateHint': 'Eight digits, for example 19900805',
  'form.time': 'Time of birth',
  'form.unknownTime': "I don't know the time",
  'form.city': 'Birth city',
  'form.cityPlaceholder': 'Search for a city',
  'form.custom': 'Enter a place not in the list',
  'form.cityReturn': 'Return to city search',
  'form.latitude': 'Latitude',
  'form.longitude': 'Longitude',
  'form.timeZone': 'IANA time zone',
  'form.unknownTimeNote': 'Without a birth time, we calculate the Sun, Moon, and planets but do not show the rising sign or twelve houses.',
  'form.calculate': 'Calculate my natal chart',
  'form.calculating': 'Calculating the positions of the stars…',
  'form.privacy': 'Your information stays on this device and is never sent to an external server.',
  'form.noCityResult': 'No cities found. Please use advanced entry.',
  'validation.displayNameRequired': 'Please enter a name or nickname.',
  'validation.dateInvalid': 'Please enter a valid date of birth.',
  'validation.dateFuture': 'A future date is not allowed.',
  'validation.timeInvalid': 'Please enter a valid birth time.',
  'validation.cityRequired': 'Please select a birth city.',
  'validation.coordinatesInvalid': 'Please check the latitude and longitude range.',
  'validation.timeZoneRequired': 'Please select a time zone.',
  'validation.timeZoneInvalid': 'Please enter a valid IANA time zone.',
};

export const TRANSLATIONS = { ko, en };

export function translate(locale: Locale, key: TranslationKey, params?: TranslationParams): string {
  return TRANSLATIONS[locale][key].replace(/\{([a-zA-Z0-9_]+)\}/g, (token, parameterName: string) => {
    const value = params?.[parameterName];
    if (value !== undefined) return String(value);
    if (import.meta.env.DEV) throw new Error(`Missing translation parameter: ${parameterName}`);
    return token;
  });
}
