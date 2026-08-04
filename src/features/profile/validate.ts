import { Temporal } from '@js-temporal/polyfill';
import type { TranslationKey } from '../../i18n/translations';
import type { BirthProfile, ValidationErrorCode, ValidationErrors } from './types';

export const VALIDATION_TRANSLATION_KEYS: Record<ValidationErrorCode, TranslationKey> = {
  displayNameRequired: 'validation.displayNameRequired',
  dateInvalid: 'validation.dateInvalid',
  dateFuture: 'validation.dateFuture',
  timeInvalid: 'validation.timeInvalid',
  cityRequired: 'validation.cityRequired',
  coordinatesInvalid: 'validation.coordinatesInvalid',
  timeZoneRequired: 'validation.timeZoneRequired',
  timeZoneInvalid: 'validation.timeZoneInvalid',
};

export function validateBirthProfile(profile: BirthProfile): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!profile.displayName.trim()) errors.displayName = 'displayNameRequired';
  try {
    const birthDate = Temporal.PlainDate.from(profile.date);
    if (Temporal.PlainDate.compare(birthDate, Temporal.Now.plainDateISO(profile.timeZone || 'UTC')) > 0) {
      errors.date = 'dateFuture';
    }
  } catch {
    errors.date = 'dateInvalid';
  }
  if (profile.timeKnown && !/^([01]\d|2[0-3]):[0-5]\d$/.test(profile.time)) {
    errors.time = 'timeInvalid';
  }
  if (!profile.cityId) errors.cityId = 'cityRequired';
  if (profile.latitude < -90 || profile.latitude > 90 || profile.longitude < -180 || profile.longitude > 180) {
    errors.coordinates = 'coordinatesInvalid';
  }
  try {
    if (profile.timeZone) new Intl.DateTimeFormat('ko', { timeZone: profile.timeZone }).format();
    else errors.timeZone = 'timeZoneRequired';
  } catch {
    errors.timeZone = 'timeZoneInvalid';
  }
  return errors;
}
