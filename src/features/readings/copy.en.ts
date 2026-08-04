import { aspectName, houseName, planetName, pointName, zodiacNameByIndex } from '../../i18n/astrologyTerms';
import type { PlanetId } from '../astrology/types';
import type { AspectType } from '../fortune/aspects';
import type { ReadingCopy } from './copy.ko';
import type { ReadingParams } from './types';

type PointId = 'sun' | 'moon' | 'ascendant';
type ElementId = 'fire' | 'earth' | 'air' | 'water';
type ModalityId = 'cardinal' | 'fixed' | 'mutable';

const PLANET_ROLES: Record<PlanetId, string> = {
  sun: 'the way you direct your will and form a coherent center',
  moon: 'the way you tend emotions and recover a sense of safety',
  mercury: 'the way you understand information and connect it through language',
  venus: 'the way you recognize affinity, values, pleasure, and reciprocity',
  mars: 'the way you turn desire into action, assertion, and useful boundaries',
  jupiter: 'the way you widen experience and build a larger frame of meaning',
  saturn: 'the way you accept responsibility and give an effort durable form',
  uranus: 'the way you question convention and open an untried alternative',
  neptune: 'the way imagination and empathy soften the edges of experience',
  pluto: 'the way sustained focus reorganizes power and makes deep change possible',
};

const SIGN_EXPRESSIONS = [
  'initiating quickly while learning to temper haste',
  'building steadily without letting constancy harden into refusal',
  'making agile connections while gathering scattered attention',
  'protecting what matters without retreating behind every feeling',
  'creating with confidence without depending on constant recognition',
  'refining what is useful without turning care into perfectionism',
  'coordinating different needs without postponing every decision',
  'committing deeply while loosening the need to control the outcome',
  'exploring broadly while checking enthusiasm against the facts',
  'working toward mastery without measuring worth only by achievement',
  'sharing an original view without turning independence into distance',
  'responding with empathy while keeping practical boundaries visible',
] as const;

const SIGN_APPROACHES = [
  'taking initiative while reducing impulsive collisions',
  'establishing security while remaining open to necessary change',
  'asking several questions while filtering information overload',
  'testing for trust while easing excessive self-protection',
  'bringing warm presence while softening pride when it blocks exchange',
  'organizing details while resisting the urge to fault-find',
  'considering the other person while bringing indecision to a close',
  'looking beneath the surface while refusing to lock every door with suspicion',
  'expanding the horizon while checking optimism against capacity',
  'making a plan while adjusting standards that have become rigid',
  'reframing convention while avoiding unnecessary isolation',
  'following intuition while clarifying promises that remain vague',
] as const;

const ELEMENT_PATTERNS: Record<ElementId, string> = {
  fire: 'fire that supplies momentum, balanced by restraint before it overheats',
  earth: 'earth that supplies realism, balanced by flexibility when conditions change',
  air: 'air that supplies perspective, balanced by focus that connects thought to action',
  water: 'water that supplies empathy, balanced by boundaries when feeling becomes absorbing',
};

const MODALITY_PATTERNS: Record<ModalityId, string> = {
  cardinal: 'cardinal initiative, balanced by consultation before taking over',
  fixed: 'fixed endurance, balanced by a willingness to change direction',
  mutable: 'mutable adaptability, balanced by a standard that gathers dispersed effort',
};

const ASPECT_EXPERIENCES: Record<AspectType, string> = {
  conjunction: 'The two needs gather in one place and are often felt as a concentrated focus.',
  sextile: 'A modest experiment tends to reveal a cooperative route between the two functions.',
  square: 'Friction presses for action and makes the developmental task easier to recognize.',
  trine: 'The two capacities connect readily and can feel like an ability you have always known.',
  opposition: 'Contrasting needs become visible through other people, choices, and negotiation.',
};

const ASPECT_CAUTIONS: Record<AspectType, string> = {
  conjunction: 'Notice when one voice becomes so loud that the other need disappears from view.',
  sextile: 'A promising opening can remain unused if you wait for it to develop on its own.',
  square: 'Do not convert productive pressure into needless haste or self-criticism.',
  trine: 'Familiar talent can stop developing when its ease is taken for granted.',
  opposition: 'Giving the entire decision to another person can repeat the same polarity.',
};

function asPoint(value: ReadingParams[string]): PointId {
  return value === 'sun' || value === 'moon' ? value : 'ascendant';
}

function asPlanet(value: ReadingParams[string]): PlanetId {
  return String(value) as PlanetId;
}

function asAspect(value: ReadingParams[string]): AspectType {
  return String(value) as AspectType;
}

export function planetRole(planet: PlanetId): string {
  return PLANET_ROLES[planet];
}

export function signExpression(signIndex: number): string {
  return SIGN_EXPRESSIONS[((signIndex % 12) + 12) % 12];
}

export function signApproach(signIndex: number): string {
  return SIGN_APPROACHES[((signIndex % 12) + 12) % 12];
}

export function elementPattern(element: string): string {
  return ELEMENT_PATTERNS[element as ElementId];
}

export function modalityPattern(modality: string): string {
  return MODALITY_PATTERNS[modality as ModalityId];
}

export function aspectExperience(aspect: AspectType): string {
  return ASPECT_EXPERIENCES[aspect];
}

export function aspectCaution(aspect: AspectType): string {
  return ASPECT_CAUTIONS[aspect];
}

export function formatPlanetList(occupants: string): string {
  const names = occupants.split(',').filter(Boolean).map((planet) => planetName(planet as PlanetId, 'en'));
  if (names.length < 2) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
}

function occupiedHouseSentence(occupants: string): string {
  const count = occupants.split(',').filter(Boolean).length;
  const names = formatPlanetList(occupants);
  return count === 1
    ? `${names} gathers its needs here, increasing the density of events and choices.`
    : `${names} gather different needs here, increasing the density of events and choices.`;
}

export const READING_COPY_EN: ReadingCopy = {
  'bigThree.role': ({ point }) => point === 'sun'
    ? 'The Sun describes the central will that chooses a direction for your life.'
    : point === 'moon'
      ? 'The Moon describes your emotional response and the conditions that restore ease.'
      : 'The Ascendant describes the attitude that appears first in unfamiliar settings.',
  'bigThree.sign': ({ point, signIndex }) => `${pointName(asPoint(point), 'en')} in ${zodiacNameByIndex(Number(signIndex), 'en')} expresses this need by ${signExpression(Number(signIndex))}.`,
  'bigThree.house': ({ house }) => `House ${Number(house)} is where this quality repeatedly becomes visible through events and choices.`,
  'bigThree.houseUnknown': () => 'Without a birth time, this report does not assign this central quality to one area of life.',
  'bigThree.pattern': ({ element, modality }) => `This placement combines ${elementPattern(String(element))} with ${modalityPattern(String(modality))}.`,
  'bigThree.action': ({ point }) => `Name one need of your ${pointName(asPoint(point), 'en')} and choose the smallest action that respects it.`,
  'planet.role': ({ planet }) => `${planetName(asPlanet(planet), 'en')} describes ${planetRole(asPlanet(planet))}.`,
  'planet.sign': ({ planet, signIndex }) => `In ${zodiacNameByIndex(Number(signIndex), 'en')}, ${planetName(asPlanet(planet), 'en')} works by ${signExpression(Number(signIndex))}.`,
  'planet.house': ({ house }) => `In House ${Number(house)}, this tendency becomes concrete in relationships, work, and recurring choices.`,
  'planet.houseUnknown': () => 'Without a birth time, the planetary sign remains useful but is not confined to one life area.',
  'planet.motion': ({ planet, retrograde }) => retrograde
    ? `When retrograde, ${planetName(asPlanet(planet), 'en')} reviews this function inwardly before expression, favoring depth but sometimes delaying the start.`
    : `When direct, ${planetName(asPlanet(planet), 'en')} tends to express this function openly and adjust it through immediate experience.`,
  'planet.action': ({ planet }) => `Observe one automatic response of ${planetName(asPlanet(planet), 'en')} and replace it with one deliberate choice.`,
  'house.domain': ({ house }) => `House ${Number(house)} describes how you experience ${houseName(Number(house), 'en').toLowerCase()}.`,
  'house.cusp': ({ house, signIndex }) => `Because House ${Number(house)} begins in ${zodiacNameByIndex(Number(signIndex), 'en')}, you enter it by ${signApproach(Number(signIndex))}.`,
  'house.occupied': ({ occupants }) => occupiedHouseSentence(String(occupants)),
  'house.empty': ({ house }) => `An empty House ${Number(house)} still operates through the sign on its cusp and that sign's ruling planet.`,
  'house.action': ({ house }) => `Record a recurring scene involving ${houseName(Number(house), 'en').toLowerCase()} to clarify this house's direction of growth.`,
  'aspect.dynamic': ({ from, to, aspectType }) => `The ${aspectName(asAspect(aspectType), 'en')} between ${planetName(asPlanet(from), 'en')} and ${planetName(asPlanet(to), 'en')} describes how these two functions learn to operate together.`,
  'aspect.experience': ({ aspectType }) => aspectExperience(asAspect(aspectType)),
  'aspect.strength': ({ exactness }) => `At ${Math.round(Number(exactness) * 100)}% exactness, conscious practice can develop this link into focus and an individual problem-solving style.`,
  'aspect.caution': ({ aspectType }) => aspectCaution(asAspect(aspectType)),
  'aspect.integration': ({ from, to }) => `Acknowledge the need of ${planetName(asPlanet(from), 'en')}, then practice acting at the pace of ${planetName(asPlanet(to), 'en')}.`,
  'transit.dynamic': ({ from, to, aspectType }) => `Transiting ${planetName(asPlanet(from), 'en')} now forms a ${aspectName(asAspect(aspectType), 'en')} with natal ${planetName(asPlanet(to), 'en')}, emphasizing a temporary rhythm.`,
  'transit.experience': ({ to }) => `Matters associated with ${planetName(asPlanet(to), 'en')} may draw quicker responses or bring a postponed subject back into view.`,
  'transit.opportunity': ({ exactness }) => `At ${Math.round(Number(exactness) * 100)}% exactness, the signal is clear enough to explore through a small experiment and honest observation.`,
  'transit.caution': ({ aspectType }) => `${aspectCaution(asAspect(aspectType))} Check present conditions before reaching a conclusion.`,
  'transit.action': ({ to }) => `Choose one matter ruled by ${planetName(asPlanet(to), 'en')} and move it through three steps today: prepare, act, and record what changed.`,
  'unavailable.ascendant': () => 'Without a recorded birth time, the Ascendant cannot be calculated reliably. Adding the time would restore the reading of first impressions and outward response.',
  'unavailable.houses': () => 'Without a recorded birth time, the twelve houses cannot be calculated reliably. The planetary signs remain useful, but this report will not invent specific life areas.',
};
