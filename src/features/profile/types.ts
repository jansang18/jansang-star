export type TimeDisambiguation = 'compatible' | 'earlier' | 'later' | 'reject';

export type BirthProfile = {
  displayName: string;
  date: string;
  time: string;
  timeKnown: boolean;
  cityId: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  disambiguation: TimeDisambiguation;
};

export type City = {
  id: string;
  nameKo: string;
  nameEn: string;
  countryKo: string;
  countryEn: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

export type ValidationErrorCode =
  | 'displayNameRequired' | 'dateInvalid' | 'dateFuture' | 'timeInvalid'
  | 'cityRequired' | 'coordinatesInvalid' | 'timeZoneRequired' | 'timeZoneInvalid';

export type ValidationErrors = Partial<Record<'displayName' | 'date' | 'time' | 'cityId' | 'coordinates' | 'timeZone', ValidationErrorCode>>;
