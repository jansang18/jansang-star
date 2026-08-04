import type { PlanetId, ZodiacSign } from './types';

export const ZODIAC_SIGNS: ZodiacSign[] = ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '사수자리', '염소자리', '물병자리', '물고기자리'];
export const ZODIAC_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export const PLANETS: Array<{ id: PlanetId; sweId: number; nameKo: string; glyph: string }> = [
  { id: 'sun', sweId: 0, nameKo: '태양', glyph: '☉' },
  { id: 'moon', sweId: 1, nameKo: '달', glyph: '☽' },
  { id: 'mercury', sweId: 2, nameKo: '수성', glyph: '☿' },
  { id: 'venus', sweId: 3, nameKo: '금성', glyph: '♀' },
  { id: 'mars', sweId: 4, nameKo: '화성', glyph: '♂' },
  { id: 'jupiter', sweId: 5, nameKo: '목성', glyph: '♃' },
  { id: 'saturn', sweId: 6, nameKo: '토성', glyph: '♄' },
  { id: 'uranus', sweId: 7, nameKo: '천왕성', glyph: '♅' },
  { id: 'neptune', sweId: 8, nameKo: '해왕성', glyph: '♆' },
  { id: 'pluto', sweId: 9, nameKo: '명왕성', glyph: '♇' },
];
