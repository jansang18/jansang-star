export type PlanetId = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
export type ZodiacSign = '양자리' | '황소자리' | '쌍둥이자리' | '게자리' | '사자자리' | '처녀자리' | '천칭자리' | '전갈자리' | '사수자리' | '염소자리' | '물병자리' | '물고기자리';

export type ZodiacPosition = { sign: ZodiacSign; signIndex: number; degree: number; minute: number };

export type PlanetPosition = {
  id: PlanetId;
  nameKo: string;
  glyph: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  sign: ZodiacSign;
  signDegree: number;
  house?: number;
};

export type NatalChartData = {
  julianDay: number;
  planets: Record<PlanetId, PlanetPosition>;
  ascendant?: number;
  midheaven?: number;
  houses: number[];
  houseSystem: 'P';
  timeKnown: boolean;
};
