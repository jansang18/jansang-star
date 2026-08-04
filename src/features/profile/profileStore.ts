import type { BirthProfile } from './types';

const STORAGE_KEY = 'jansang-zodiac.profile.v1';

export function saveProfile(profile: BirthProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadProfile(): BirthProfile | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as BirthProfile : null;
  } catch { return null; }
}

export function clearProfile(): void { localStorage.removeItem(STORAGE_KEY); }
