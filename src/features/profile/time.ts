import { Temporal } from '@js-temporal/polyfill';
import type { BirthProfile } from './types';

export function toUtcBirthInstant(profile: BirthProfile): Temporal.Instant {
  const [year, month, day] = profile.date.split('-').map(Number);
  const [hour = 12, minute = 0] = (profile.timeKnown ? profile.time : '12:00').split(':').map(Number);
  return Temporal.ZonedDateTime.from({
    timeZone: profile.timeZone,
    year,
    month,
    day,
    hour,
    minute,
  }, { disambiguation: profile.disambiguation }).toInstant();
}

export function localNoonInstant(date: string, timeZone: string): Temporal.Instant {
  const [year, month, day] = date.split('-').map(Number);
  return Temporal.ZonedDateTime.from({ timeZone, year, month, day, hour: 12 }).toInstant();
}
