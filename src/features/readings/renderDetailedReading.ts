import {
  aspectName,
  houseLabel,
  houseName,
  motionName,
  planetName,
  pointName,
  zodiacNameByIndex,
} from '../../i18n/astrologyTerms';
import { formatLocaleNumber } from '../../i18n/numberFormat';
import type { Locale } from '../../i18n/types';
import { safeAuthoredCopy } from '../../i18n/authoredCopy';
import type { PlanetId } from '../astrology/types';
import type { AspectType } from '../fortune/aspects';
import { READING_COPY_EN } from './copy.en';
import { READING_COPY_KO } from './copy.ko';
import type { DetailedReadingModel, ReadingBlock, ReadingEvidence } from './types';

export type LocalizedReadingBlock = {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
  evidenceLabels: string[];
};

export type LocalizedReadingSection = {
  id: ReadingBlock['section'];
  title: string;
  intro: string;
  blocks: LocalizedReadingBlock[];
};

export type LocalizedDetailedReading = {
  sections: LocalizedReadingSection[];
  notices: string[];
  evidenceIds: string[];
};

const SECTION_COPY: Record<Locale, Record<ReadingBlock['section'], { title: string; intro: string }>> = {
  ko: {
    bigThree: { title: '핵심 세 축', intro: '태양·달·상승궁은 의지, 감정, 첫 반응이 만나는 기본 구조입니다.' },
    planets: { title: '열 행성의 기능', intro: '각 행성은 삶에서 반복해 사용하는 서로 다른 심리 기능을 나타냅니다.' },
    houses: { title: '열두 삶의 영역', intro: '하우스는 성향이 관계와 사건 속에서 구체적으로 드러나는 무대입니다.' },
    aspects: { title: '출생 차트의 연결', intro: '애스펙트는 두 행성 기능이 협력하거나 긴장을 만드는 방식을 보여줍니다.' },
    transits: { title: '현재의 흐름', intro: '트랜싯은 현재 행성이 출생 차트의 주제를 잠시 강조하는 리듬입니다.' },
  },
  en: {
    bigThree: { title: 'The three anchors', intro: 'The Sun, Moon, and Ascendant show how will, feeling, and first response meet.' },
    planets: { title: 'The ten planetary functions', intro: 'Each planet represents a distinct psychological function used throughout daily life.' },
    houses: { title: 'The twelve life areas', intro: 'The houses locate where a tendency becomes concrete through events and relationships.' },
    aspects: { title: 'Natal connections', intro: 'Aspects describe how two planetary functions cooperate, amplify, or challenge one another.' },
    transits: { title: 'Current rhythms', intro: 'Transits show how present planetary motion temporarily emphasizes themes in the natal chart.' },
  },
};

function blockTitle(block: ReadingBlock, locale: Locale): string {
  if (block.section === 'bigThree') {
    return pointName(block.subject as 'sun' | 'moon' | 'ascendant', locale);
  }
  if (block.section === 'planets') {
    return planetName(block.subject as PlanetId, locale);
  }
  if (block.section === 'houses') {
    const house = Number(block.subject);
    return `${houseLabel(house, locale)} · ${houseName(house, locale)}`;
  }

  const [from, to, type] = block.subject.split(':') as [PlanetId, PlanetId, AspectType];
  return `${planetName(from, locale)} · ${aspectName(type, locale)} · ${planetName(to, locale)}`;
}

function placementPointName(point: PlanetId | 'ascendant', locale: Locale): string {
  return point === 'ascendant' ? pointName(point, locale) : planetName(point, locale);
}

function evidenceLabel(evidence: ReadingEvidence, locale: Locale): string {
  if (evidence.kind === 'placement') {
    return [
      placementPointName(evidence.point, locale),
      zodiacNameByIndex(evidence.signIndex, locale),
      ...(evidence.house === undefined ? [] : [houseLabel(evidence.house, locale)]),
      ...(evidence.point === 'ascendant' ? [] : [motionName(evidence.retrograde ? 'retrograde' : 'direct', locale)]),
    ].join(' · ');
  }

  if (evidence.kind === 'house') {
    const occupants = evidence.occupants.length > 0
      ? evidence.occupants.map((planet) => planetName(planet, locale)).join('·')
      : locale === 'ko' ? '행성 없음' : 'No planets';
    return [houseLabel(evidence.house, locale), zodiacNameByIndex(evidence.cuspSignIndex, locale), occupants].join(' · ');
  }

  const orb = formatLocaleNumber(evidence.orb, locale);
  const orbLabel = locale === 'ko' ? `오브 ${orb}°` : `orb ${orb}°`;
  return `${planetName(evidence.from, locale)}–${planetName(evidence.to, locale)} · ${aspectName(evidence.type, locale)} · ${orbLabel}`;
}

function evidenceId(evidence: ReadingEvidence): string {
  if (evidence.kind === 'placement') {
    return `placement:${evidence.point}:${evidence.signIndex}:${evidence.house ?? 'unknown'}:${evidence.retrograde ? 'retrograde' : 'direct'}`;
  }
  if (evidence.kind === 'house') {
    return `house:${evidence.house}:${evidence.cuspSignIndex}:${evidence.occupants.join(',') || 'empty'}`;
  }
  return `aspect:${evidence.scope}:${evidence.from}:${evidence.to}:${evidence.type}:${evidence.orb}:${evidence.exactness}`;
}

function renderBlock(block: ReadingBlock, locale: Locale): LocalizedReadingBlock {
  const copy = locale === 'ko' ? READING_COPY_KO : READING_COPY_EN;
  const sentences = block.sentences.map(({ key, params }) => safeAuthoredCopy(locale, copy[key], params));
  return {
    id: block.id,
    title: blockTitle(block, locale),
    summary: sentences[0] ?? '',
    paragraphs: sentences.slice(1),
    evidenceLabels: block.evidence.map((evidence) => evidenceLabel(evidence, locale)),
  };
}

export function renderDetailedReading(model: DetailedReadingModel, locale: Locale): LocalizedDetailedReading {
  const chapters: Array<{ id: ReadingBlock['section']; blocks: ReadingBlock[] }> = [
    { id: 'bigThree', blocks: model.bigThree },
    { id: 'planets', blocks: model.planets },
    { id: 'houses', blocks: model.houses },
    { id: 'aspects', blocks: model.aspects },
    { id: 'transits', blocks: model.transits },
  ];
  const visibleChapters = chapters.filter(({ blocks }) => blocks.length > 0);

  return {
    sections: visibleChapters.map(({ id, blocks }) => ({
      id,
      ...SECTION_COPY[locale][id],
      blocks: blocks.map((block) => renderBlock(block, locale)),
    })),
    notices: model.unavailable.map((subject) => {
      const copy = locale === 'ko' ? READING_COPY_KO : READING_COPY_EN;
      return safeAuthoredCopy(locale, copy[`unavailable.${subject}`], {});
    }),
    evidenceIds: visibleChapters.flatMap(({ blocks }) => blocks.flatMap((block) => block.evidence.map(evidenceId))),
  };
}
