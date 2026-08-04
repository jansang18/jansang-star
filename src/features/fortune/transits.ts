import type { BirthProfile } from '../profile/types';
import { calculateNatalChart } from '../astrology/swissEphemeris';
import type { NatalChartData } from '../astrology/types';
import { findAspect, type Aspect } from './aspects';

export type TransitData = { date: string; chart: NatalChartData; aspects: Aspect[] };

export async function calculateDailyTransits(natal: NatalChartData, profile: BirthProfile, date: string): Promise<TransitData> {
  const transitProfile: BirthProfile = { ...profile, date, time: '12:00', timeKnown: false };
  const chart = await calculateNatalChart(transitProfile);
  const aspects: Aspect[] = [];
  for (const transit of Object.values(chart.planets)) {
    for (const birth of Object.values(natal.planets)) {
      const match = findAspect(transit.longitude, birth.longitude);
      if (match) aspects.push({ ...match, from: transit.id, to: birth.id });
    }
  }
  return { date, chart, aspects: aspects.sort((a, b) => a.orb - b.orb) };
}
