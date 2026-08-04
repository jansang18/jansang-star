import { Temporal } from '@js-temporal/polyfill';
import type { BirthProfile, ValidationErrors } from './types';

export function validateBirthProfile(profile: BirthProfile): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!profile.displayName.trim()) errors.displayName = '이름이나 별칭을 입력해 주세요.';
  try {
    const birthDate = Temporal.PlainDate.from(profile.date);
    if (Temporal.PlainDate.compare(birthDate, Temporal.Now.plainDateISO(profile.timeZone || 'UTC')) > 0) {
      errors.date = '미래 날짜는 입력할 수 없어요.';
    }
  } catch {
    errors.date = '올바른 생년월일을 입력해 주세요.';
  }
  if (profile.timeKnown && !/^([01]\d|2[0-3]):[0-5]\d$/.test(profile.time)) {
    errors.time = '정확한 출생시간을 입력해 주세요.';
  }
  if (!profile.cityId) errors.cityId = '출생지역을 선택해 주세요.';
  if (profile.latitude < -90 || profile.latitude > 90 || profile.longitude < -180 || profile.longitude > 180) {
    errors.coordinates = '위도와 경도 범위를 확인해 주세요.';
  }
  try {
    if (profile.timeZone) new Intl.DateTimeFormat('ko', { timeZone: profile.timeZone }).format();
    else errors.timeZone = '시간대를 선택해 주세요.';
  } catch {
    errors.timeZone = '올바른 IANA 시간대를 입력해 주세요.';
  }
  return errors;
}
