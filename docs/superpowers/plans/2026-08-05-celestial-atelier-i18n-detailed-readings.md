# Celestial Atelier 한영 전환·전체 상세 풀이 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 Swiss Ephemeris 계산을 그대로 보존하면서 잔상 별자리를 옵시디언·본 아이보리·샴페인 브라스 기반의 고급 편집 디자인으로 바꾸고, 자동 한국어/영어 전환과 전체 출생 차트·일간·월간·연간의 근거 기반 장문 풀이를 제공해 공개 GitHub Pages에 배포한다.

**Architecture:** 천체 위치·점수·선택된 애스펙트는 언어와 무관한 모델로 한 번만 계산하고, 한국어와 영어 렌더러가 동일한 모델을 각각 자연스러운 문장으로 표현한다. React Context는 locale만 관리하므로 언어를 바꿔도 입력, 계산 결과, 운세 기간, 열린 아코디언과 스크롤 문맥이 유지된다. 시각 체계는 공통 1120px 레일, 의미 기반 색상 토큰, SVG 출생 차트와 기간 흐름 그래프를 사용하며 서버·유료 AI·추가 차트 라이브러리를 도입하지 않는다.

**Tech Stack:** React 19.2.8, TypeScript 7.0.2 strict mode, Vite 8.2.0, Vitest 4.1.10, Testing Library, Temporal polyfill, Swiss Ephemeris WASM, SVG, CSS, vite-plugin-pwa, GitHub Pages

## Global Constraints

- 기본 팔레트는 본 아이보리 `#F3EFE7`, 옵시디언 `#11100E`, 샴페인 브라스 `#B79A62`, 보조 브라스 `#D2C29F`, 본문 `#24211D`, 역상 본문 `#F4F0E8`, 웜 그레이 `#777168`, 조화 코발트 `#385A78`, 긴장 코퍼 레드 `#9C5544`로 고정한다.
- 보라색, 네온 그라데이션, 과도한 글래스 카드 반복은 제거하고 1px 헤어라인, 넓은 여백, 아이보리·옵시디언 장 교차로 위계를 만든다.
- 공통 콘텐츠 레일은 정확히 `1120px`, 모바일 외곽 여백은 최소 `16px`, 모든 대화형 요소의 최소 터치 크기는 `44px`이다.
- 제목은 고대비 시스템 세리프, 본문·숫자·컨트롤은 시스템 산세리프를 사용하며 외부 웹폰트 요청을 추가하지 않는다.
- Apple식 명료성·콘텐츠 우선·일관된 위계·즉각적인 조작 피드백을 적용하되 특정 Apple 제품 화면을 복제하지 않는다.
- 기존 열대황도, 플라시두스, Swiss Ephemeris WASM, 출생정보 로컬 저장, 숫자 8자리 생년월일 입력, PWA 동작은 변경하지 않는다.
- 저장된 `jansang-language`가 있으면 최우선으로 사용하고, 없으면 브라우저 언어가 `ko` 계열일 때 한국어, 그 외에는 영어를 사용한다.
- 상단 `한 / EN` 선택은 즉시 반영하고 로컬에 저장하며 입력값, 계산 결과, 오늘·이번 달·올해 선택, 열린 상세 풀이 장을 초기화하지 않는다.
- 사용자 이름과 사용자가 직접 입력한 값은 번역하거나 변형하지 않는다.
- 천체 위치, 점수, 근거 애스펙트와 시드 선택은 locale과 무관해야 하며 같은 차트·날짜는 한국어와 영어에서 동일한 수치와 근거를 갖는다.
- 전체 출생 리포트는 한국어 기준 약 `4,000~7,000자`이며, 태양·달·상승궁 4~6문장, 10행성 3~5문장, 12하우스 2~4문장, 가장 정확한 주요 애스펙트 6~10개 각 3~5문장, 주요 트랜짓 각 3~5문장을 포함한다.
- 출생시간 미상일 때 상승궁과 12하우스 풀이를 만들어내지 않고 계산할 수 없는 이유를 현재 locale로 명확히 표시한다.
- 오늘 종합운은 6~8문장, 연애·재물·직업·건강은 각각 4~6문장이다.
- 월간은 1일·8일·15일·22일·말일 정오의 다섯 표본을 유지하고 전체 6~8문장, 분야별 전략 3~5문장, 다섯 구간별 2~3문장을 제공한다.
- 연간은 매월 15일 정오의 열두 표본을 유지하고 전체 8~10문장, 네 분기별 3~4문장, 열두 달별 2~3문장을 제공한다.
- 해석은 근거 → 성향/체감 → 강점/기회 → 그림자/주의 → 실천 순서를 따르며 단정적인 운명, 질병, 법률, 투자 판단을 만들지 않는다.
- 모바일 `390×844`와 데스크톱 `1440×1000`에서 한국어·영어를 모두 실제 계산해 확인한다.
- 배포 저장소는 `jansang18/jansang-star`, 공개 주소는 `https://jansang18.github.io/jansang-star/`, Vite Pages base는 `/jansang-star/`이다.
- `.codex-remote-attachments/`와 `.worktrees/visionos-redesign/`는 사용자 소유 범위이므로 수정하거나 커밋하지 않는다.

---

## File Responsibility Map

### 새 모듈

- `src/i18n/types.ts` — `Locale`, 보간 인자와 Context 공개 타입.
- `src/i18n/detectLocale.ts` — 저장값과 브라우저 언어의 우선순위 결정만 담당.
- `src/i18n/translations.ts` — 정적 UI 한국어·영어 사전과 키 동등성의 단일 원천.
- `src/i18n/I18nProvider.tsx` — locale 상태, 로컬 저장, `<html lang>`, `t()` 제공.
- `src/test/renderWithI18n.tsx` — 컴포넌트 테스트를 명시한 locale Provider로 감싸는 공통 helper.
- `src/i18n/astrologyTerms.ts` — 행성·별자리·애스펙트·하우스·운세 분야의 언어별 명칭.
- `src/i18n/formatters.ts` — 날짜, 월/년, 시간, 도수, 오브의 locale 형식화.
- `src/components/LanguageSwitch.tsx` — 재사용 가능한 `한 / EN` 세그먼트 컨트롤.
- `src/features/readings/types.ts` — 언어 중립 상세 풀이 모델, 근거, 문장 토큰 타입.
- `src/features/readings/buildDetailedReading.ts` — 차트와 트랜짓에서 블록·근거·문장 키를 결정.
- `src/features/readings/copy.ko.ts`, `copy.en.ts` — 별도로 집필된 두 언어 상세 풀이 템플릿.
- `src/features/readings/renderDetailedReading.ts` — 중립 문장 토큰을 현재 locale의 완성 문장으로 변환.
- `src/features/results/ReadingChapter.tsx` — 요약을 항상 보이고 본문을 펼치는 접근 가능한 아코디언.
- `src/features/results/DetailedNatalReport.tsx` — Big Three·행성·하우스·애스펙트·트랜짓 장 구성.
- `src/features/fortune/copy.en.ts` — 일간 운세 영어 저작 사전.
- `src/features/fortune/localizeDailyFortune.ts` — 중립 일간 모델을 한국어·영어 표시 모델로 변환.
- `src/features/fortune/periodCopy.ko.ts`, `periodCopy.en.ts` — 월간·연간 상세 문장 사전.
- `src/features/fortune/localizePeriodFortune.ts` — 기간 모델의 개요·분야·구간·분기·월 문장 생성.
- `src/features/chart/periodFlowGeometry.ts` — 점수 배열을 SVG 좌표·선·면적으로 변환하는 순수 함수.
- `src/features/results/PeriodFlowChart.tsx` — 두께가 읽히는 접근 가능한 SVG 기간 그래프.

### 수정되는 기존 모듈

- `src/main.tsx`, `src/App.tsx` — Provider 장착, locale 독립 결과 상태, 두 화면의 언어 전환.
- `src/features/profile/types.ts`, `cities.ts`, `validate.ts`, `BirthForm.tsx`, `CityCombobox.tsx` — 양언어 도시·폼·검증 코드.
- `src/features/fortune/generateFortune.ts`, `periodFortune.ts` — 문자열을 제거한 결정론적 중립 모델.
- `src/features/results/*.tsx` — 현재 locale 표시 모델, 상세 리포트, 상태 보존, 접근성 레이블.
- `src/features/chart/NatalChart.tsx` — 양언어 표·범례와 Celestial Atelier SVG 색·선 계층.
- `src/styles/tokens.css`, `global.css`, `src/features/profile/BirthForm.css`, `src/features/results/results.css`, `src/features/chart/NatalChart.css` — 하나의 편집형 시각 체계로 전면 정리.
- `vite.config.ts` — PWA 색상·이름, 테스트 worktree 제외, 기존 캐시 갱신 설정 유지.
- `README.md` — 한영 전환, 상세 풀이, 공개 주소와 검증 명령 문서화.

---

### Task 1: locale 감지·저장·Context 기반 마련

**Files:**
- Create: `src/i18n/types.ts`
- Create: `src/i18n/detectLocale.ts`
- Create: `src/i18n/detectLocale.test.ts`
- Create: `src/i18n/translations.ts`
- Create: `src/i18n/translations.test.ts`
- Create: `src/i18n/I18nProvider.tsx`
- Create: `src/i18n/I18nProvider.test.tsx`
- Create: `src/test/renderWithI18n.tsx`
- Modify: `src/main.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/App.e2e.test.tsx`

**Interfaces:**
- Consumes: `localStorage.getItem('jansang-language')`, `navigator.languages`, `navigator.language`.
- Produces: `type Locale = 'ko' | 'en'`, `detectLocale(input): Locale`, `<I18nProvider initialLocale?>`, `useI18n(): { locale, setLocale, t }`.

- [ ] **Step 1: locale 우선순위 실패 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';
import { detectLocale } from './detectLocale';

describe('detectLocale', () => {
  it('uses a valid saved choice before browser languages', () => {
    expect(detectLocale({ stored: 'ko', languages: ['en-US'] })).toBe('ko');
    expect(detectLocale({ stored: 'en', languages: ['ko-KR'] })).toBe('en');
  });

  it('uses Korean only for a ko language and English for every other language', () => {
    expect(detectLocale({ stored: null, languages: ['ja-JP', 'ko-KR'] })).toBe('ko');
    expect(detectLocale({ stored: null, languages: ['fr-FR'] })).toBe('en');
    expect(detectLocale({ stored: 'de', languages: ['ko'] })).toBe('ko');
  });
});
```

- [ ] **Step 2: 실패를 확인하고 감지 함수를 구현**

Run: `npm test -- --run src/i18n/detectLocale.test.ts`

Expected: FAIL with module/function not found, then PASS after adding:

```ts
// src/i18n/types.ts
export type Locale = 'ko' | 'en';
export type TranslationParams = Record<string, string | number>;

// src/i18n/detectLocale.ts
import type { Locale } from './types';
export const LANGUAGE_STORAGE_KEY = 'jansang-language';

export function detectLocale({ stored, languages }: { stored: string | null; languages: readonly string[] }): Locale {
  if (stored === 'ko' || stored === 'en') return stored;
  return languages.some((language) => language.toLowerCase().split('-')[0] === 'ko') ? 'ko' : 'en';
}
```

- [ ] **Step 3: 사전 키 동등성과 보간 실패 테스트 작성**

```ts
import { expect, it } from 'vitest';
import { TRANSLATIONS, translate } from './translations';

it('keeps Korean and English UI keys identical', () => {
  expect(Object.keys(TRANSLATIONS.ko).sort()).toEqual(Object.keys(TRANSLATIONS.en).sort());
  expect(translate('en', 'results.reportTitle', { name: 'Mina' })).toBe("Mina's cosmic report");
});
```

- [ ] **Step 4: 첫 UI 사전과 안전한 보간 구현**

`translations.ts`의 첫 키는 아래 값으로 시작하고 이후 작업에서 같은 typed record에 키를 추가한다.

```ts
const ko = {
  'brand.name': '잔상 별자리',
  'nav.system': 'TROPICAL · PLACIDUS',
  'language.label': '표시 언어',
  'language.korean': '한국어',
  'language.english': 'English',
  'landing.eyebrow': 'THE SKY REMEMBERS YOUR MOMENT',
  'landing.copy': '태어난 순간의 별빛은 오늘도 잔상을 남깁니다.',
  'landing.detail': '출생 차트와 오늘의 천체 흐름을 깊이 읽는 나만의 별자리 만세력',
  'landing.cta': '나의 별자리 만세력 보기',
  'results.reportTitle': '{name}님의 코스믹 리포트',
} as const;

export type TranslationKey = keyof typeof ko;
const en: Record<TranslationKey, string> = {
  'brand.name': 'Jansang Star',
  'nav.system': 'TROPICAL · PLACIDUS',
  'language.label': 'Display language',
  'language.korean': '한국어',
  'language.english': 'English',
  'landing.eyebrow': 'THE SKY REMEMBERS YOUR MOMENT',
  'landing.copy': 'The sky at your first breath still leaves an afterimage.',
  'landing.detail': 'A personal cosmic almanac for your natal chart and the sky in motion today',
  'landing.cta': 'Read my cosmic almanac',
  'results.reportTitle': "{name}'s cosmic report",
};
```

`translate(locale, key, params)`는 `/\{([a-zA-Z0-9_]+)\}/g`만 치환하고 값이 없는 토큰은 개발 환경에서 예외를 던진다.

- [ ] **Step 5: Provider 상태·저장·`html lang` 실패 테스트 작성**

```tsx
function Probe() {
  const { locale, setLocale, t } = useI18n();
  return <><span>{locale}:{t('brand.name')}</span><button onClick={() => setLocale('en')}>switch</button></>;
}

it('persists a manual choice and updates the document language', async () => {
  const user = userEvent.setup();
  render(<I18nProvider initialLocale="ko"><Probe /></I18nProvider>);
  await user.click(screen.getByRole('button', { name: 'switch' }));
  expect(screen.getByText('en:Jansang Star')).toBeInTheDocument();
  expect(localStorage.getItem('jansang-language')).toBe('en');
  expect(document.documentElement.lang).toBe('en');
});
```

- [ ] **Step 6: Provider와 진입점 장착 후 테스트 실행**

`I18nProvider`는 `useState(() => initialLocale ?? detectLocale({ stored: localStorage.getItem(LANGUAGE_STORAGE_KEY), languages: [...navigator.languages, navigator.language] }))`, `useEffect`로 저장과 `document.documentElement.lang` 갱신, `useMemo`로 Context 값을 제공한다. `main.tsx`는 `<StrictMode><I18nProvider><App /></I18nProvider></StrictMode>` 순서로 감싼다.

직접 컴포넌트를 렌더링하는 테스트는 아래 helper를 사용한다. Task 1에서 두 App 테스트를 이 helper로 바꿔 이후 폼과 결과가 Context를 사용해도 중간 커밋의 전체 테스트가 깨지지 않게 한다.

```tsx
export function renderWithI18n(ui: ReactElement, locale: Locale = 'ko') {
  return render(<I18nProvider initialLocale={locale}>{ui}</I18nProvider>);
}
```

Run: `npm test -- --run src/i18n`

Expected: locale detection, dictionary parity, Provider tests PASS.

- [ ] **Step 7: 커밋**

```powershell
git add src/i18n src/test/renderWithI18n.tsx src/main.tsx src/App.test.tsx src/App.e2e.test.tsx
git commit -m "feat: add persistent bilingual locale foundation"
```

### Task 2: 양언어 출생 폼·도시·검증 코드

**Files:**
- Modify: `src/i18n/translations.ts`
- Modify: `src/features/profile/types.ts`
- Modify: `src/features/profile/cities.ts`
- Modify: `src/features/profile/validate.ts`
- Modify: `src/features/profile/validate.test.ts`
- Modify: `src/features/profile/BirthForm.tsx`
- Modify: `src/features/profile/BirthForm.test.tsx`
- Modify: `src/features/profile/CityCombobox.tsx`

**Interfaces:**
- Consumes: `useI18n()`, 기존 `BirthProfile`, 기존 15개 도시 좌표와 시간대.
- Produces: `ValidationErrorCode`, 언어 중립 `ValidationErrors`, `cityName(city, locale)`, 양언어 검색과 폼.

- [ ] **Step 1: 검증 문자열을 코드로 바꾸는 실패 테스트 작성**

```ts
it('returns locale-neutral validation codes', () => {
  const errors = validateBirthProfile({ ...validProfile, displayName: '', date: '2999-01-01', cityId: '' });
  expect(errors.displayName).toBe('displayNameRequired');
  expect(errors.date).toBe('dateFuture');
  expect(errors.cityId).toBe('cityRequired');
});
```

- [ ] **Step 2: 프로필 타입과 15개 도시 영문명 구현**

```ts
export type ValidationErrorCode =
  | 'displayNameRequired' | 'dateInvalid' | 'dateFuture' | 'timeInvalid'
  | 'cityRequired' | 'coordinatesInvalid' | 'timeZoneRequired' | 'timeZoneInvalid';

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
```

영문 도시/국가 값은 정확히 `Seoul/South Korea`, `Busan/South Korea`, `Daegu/South Korea`, `Incheon/South Korea`, `Gwangju/South Korea`, `Daejeon/South Korea`, `Ulsan/South Korea`, `Jeju/South Korea`, `Tokyo/Japan`, `Beijing/China`, `New York/United States`, `Los Angeles/United States`, `London/United Kingdom`, `Paris/France`, `Sydney/Australia`를 사용한다. 검색 문자열은 네 필드를 모두 합쳐 한국어와 영어 어느 쪽으로 입력해도 같은 도시를 찾는다.

- [ ] **Step 3: 폼의 상태 보존·영문 렌더링 실패 테스트 작성**

```tsx
function LocaleProbeButton() {
  const { setLocale } = useI18n();
  return <button type="button" onClick={() => setLocale('en')}>English</button>;
}

it('keeps typed values while switching the form to English', async () => {
  const user = userEvent.setup();
  render(<I18nProvider initialLocale="ko"><LocaleProbeButton /><BirthForm onSubmit={() => {}} /></I18nProvider>);
  await user.type(screen.getByLabelText('이름 또는 별칭'), '민아');
  await user.type(screen.getByLabelText('생년월일'), '19900805');
  await user.click(screen.getByRole('button', { name: 'English' }));
  expect(screen.getByLabelText('Name or nickname')).toHaveValue('민아');
  expect(screen.getByLabelText('Date of birth')).toHaveValue('1990-08-05');
});
```

이 테스트를 위해 폼 안에 `LanguageSwitch`를 넣지 않는다. 테스트용 `LocaleProbeButton`으로 Context만 전환하고, 실제 상단 배치는 Task 8에서 수행한다.

- [ ] **Step 4: 폼·도시·검증 번역 키와 컴포넌트 적용**

사전에 다음 그룹을 한국어/영어로 모두 추가한다: `form.eyebrow`, `form.title`, `form.intro`, `form.name`, `form.namePlaceholder`, `form.date`, `form.dateHint`, `form.time`, `form.unknownTime`, `form.city`, `form.cityPlaceholder`, `form.custom`, `form.cityReturn`, `form.latitude`, `form.longitude`, `form.timeZone`, `form.unknownTimeNote`, `form.calculate`, `form.calculating`, `form.privacy`, `form.noCityResult`, `validation.*` 8개. 영어 핵심 문구는 `Tell us the moment you were born`, `Eight digits, for example 19900805`, `I don't know the time`, `Calculate my natal chart`를 사용한다.

`BirthForm`은 검증 코드를 아래 mapping으로 번역 key에 바꿔 `t(VALIDATION_TRANSLATION_KEYS[code])`로 표시하고 숫자 입력 `formatBirthDate()`는 그대로 유지한다. `CityCombobox`는 locale 변경 시 선택된 도시의 표시명만 교체하며 `selectedId`, 좌표, 시간대를 바꾸지 않는다.

strict typing을 위해 문자열 연결을 JSX에서 직접 cast하지 않고 다음 mapping을 `validate.ts`에서 export한다.

```ts
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
```

- [ ] **Step 5: 폼 테스트 실행**

Run: `npm test -- --run src/features/profile src/i18n`

Expected: 숫자 8자리 형식화, 필수 도시, 검증 코드, 한국어/영어 전환 상태 보존 tests PASS.

- [ ] **Step 6: 커밋**

```powershell
git add src/i18n/translations.ts src/features/profile
git commit -m "feat: localize birth profile flow"
```

### Task 3: 점성술 용어와 날짜·도수 표시의 locale 분리

**Files:**
- Create: `src/i18n/astrologyTerms.ts`
- Create: `src/i18n/astrologyTerms.test.ts`
- Create: `src/i18n/formatters.ts`
- Create: `src/i18n/formatters.test.ts`
- Modify: `src/features/chart/NatalChart.tsx`
- Modify: `src/features/chart/NatalChart.test.tsx`
- Modify: `src/features/results/ResultsPage.test.tsx`

**Interfaces:**
- Consumes: 기존 한국어 `ZodiacSign`, `PlanetId`, `AspectType`, longitude, ISO 날짜.
- Produces: `planetName`, `pointName`, `zodiacName`, `zodiacNameByIndex`, `aspectName`, `houseName`, `categoryName`, `formatZodiacDegree`, `formatLocalDate`, `formatPeriodLabel`.

- [ ] **Step 1: 용어·형식 실패 테스트 작성**

```ts
it('localizes one neutral astronomical value without changing it', () => {
  expect(planetName('saturn', 'ko')).toBe('토성');
  expect(planetName('saturn', 'en')).toBe('Saturn');
  expect(zodiacName('사자자리', 'en')).toBe('Leo');
  expect(formatZodiacDegree(132.5, 'ko')).toBe('사자자리 12°30′');
  expect(formatZodiacDegree(132.5, 'en')).toBe('Leo 12°30′');
});

it('formats dates and period labels for the active locale', () => {
  expect(formatLocalDate('2026-08-05', 'ko')).toContain('2026년');
  expect(formatLocalDate('2026-08-05', 'en')).toContain('August');
  expect(formatPeriodLabel('month', '2026-08-05', 'en')).toBe('August 2026');
});
```

- [ ] **Step 2: 완전한 용어 표 구현**

`astrologyTerms.ts`에는 10행성, 태양·달·상승궁 point, 12별자리, 5애스펙트, 12하우스 영역, 5운세 분야, direct/retrograde 상태를 `Record<Locale, ...>`로 모두 넣는다. 영어 별자리는 `Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces`, 애스펙트는 `Conjunction, Sextile, Square, Trine, Opposition`, 하우스 영역은 `Self & approach`부터 `Inner life & restoration`까지 사용한다. 한국어 값은 기존 화면의 용어를 보존한다. 공개 함수는 `pointName(point, locale)`, `zodiacNameByIndex(index, locale)`까지 포함해 Task 5의 렌더러가 내부 한국어 sign 문자열을 직접 조립하지 않게 한다.

`formatters.ts`는 `ko-KR` 또는 `en-US`의 `Intl.DateTimeFormat`을 사용하고 숫자 도수는 직접 반올림해 두 locale에서 같은 값이 되도록 한다.

- [ ] **Step 3: 차트 대체 텍스트·표 영문 실패 테스트 작성**

```tsx
it('renders an English chart title and placement table from the same chart', () => {
  render(<I18nProvider initialLocale="en"><NatalChart chart={chart} /></I18nProvider>);
  expect(screen.getByRole('img', { name: 'Circular natal chart' })).toBeInTheDocument();
  expect(screen.getByRole('table', { name: 'Planetary placements' })).toBeInTheDocument();
  expect(screen.getByText('Aries 0°00′')).toBeInTheDocument();
});
```

- [ ] **Step 4: `NatalChart`의 모든 표시 문자열을 helper로 전환**

SVG `aria-label`, `<title>`, 범례, `<details>` 요약, 표 머리글, 행성명, 별자리 도수, 하우스, 시간 미상, 역행/순행을 현재 locale로 렌더링한다. `chart`, 행성 longitude와 aspect 선택은 절대 수정하지 않는다. `ResultsPage.test.tsx`도 `renderWithI18n`으로 감싸 내부 `NatalChart`가 Context를 받을 수 있게 한다.

- [ ] **Step 5: 테스트와 빌드 실행**

Run: `npm test -- --run src/i18n src/features/chart`

Run: `npm run build`

Expected: term/formatter/chart tests PASS; TypeScript build exits 0.

- [ ] **Step 6: 커밋**

```powershell
git add src/i18n src/features/chart/NatalChart.tsx src/features/chart/NatalChart.test.tsx src/features/results/ResultsPage.test.tsx
git commit -m "feat: localize astrology terminology"
```

### Task 4: 언어 중립 전체 차트 풀이 모델과 근거 선택

**Files:**
- Create: `src/features/readings/types.ts`
- Create: `src/features/readings/buildDetailedReading.ts`
- Create: `src/features/readings/buildDetailedReading.test.ts`

**Interfaces:**
- Consumes: `NatalChartData`, `TransitData`, `natalAspects(chart)`.
- Produces: `buildDetailedReading(chart, transits): DetailedReadingModel` with stable IDs, evidence and sentence tokens.

- [ ] **Step 1: 타입 계약을 먼저 작성**

```ts
export const READING_COPY_KEYS = [
  'bigThree.role', 'bigThree.sign', 'bigThree.house', 'bigThree.houseUnknown', 'bigThree.pattern', 'bigThree.action',
  'planet.role', 'planet.sign', 'planet.house', 'planet.houseUnknown', 'planet.motion', 'planet.action',
  'house.domain', 'house.cusp', 'house.occupied', 'house.empty', 'house.action',
  'aspect.dynamic', 'aspect.experience', 'aspect.strength', 'aspect.caution', 'aspect.integration',
  'transit.dynamic', 'transit.experience', 'transit.opportunity', 'transit.caution', 'transit.action',
  'unavailable.ascendant', 'unavailable.houses',
] as const;

export type ReadingCopyKey = typeof READING_COPY_KEYS[number];
export type ReadingParams = Record<string, string | number | boolean>;
export type ReadingSentence = { key: ReadingCopyKey; params: ReadingParams };
export type ReadingEvidence =
  | { kind: 'placement'; point: PlanetId | 'ascendant'; signIndex: number; house?: number; retrograde: boolean }
  | { kind: 'house'; house: number; cuspSignIndex: number; occupants: PlanetId[] }
  | { kind: 'aspect'; scope: 'natal' | 'transit'; type: AspectType; from: PlanetId; to: PlanetId; orb: number; exactness: number };
export type ReadingBlock = {
  id: string;
  section: 'bigThree' | 'planets' | 'houses' | 'aspects' | 'transits';
  subject: string;
  evidence: ReadingEvidence[];
  sentences: ReadingSentence[];
};
export type DetailedReadingModel = {
  bigThree: ReadingBlock[];
  planets: ReadingBlock[];
  houses: ReadingBlock[];
  aspects: ReadingBlock[];
  transits: ReadingBlock[];
  unavailable: Array<'ascendant' | 'houses'>;
};
```

- [ ] **Step 2: 전체 블록 수·문장 수·정확도 실패 테스트 작성**

```ts
it('builds every supported chapter with deterministic evidence', () => {
  const report = buildDetailedReading(chart, transits);
  expect(report.bigThree).toHaveLength(3);
  expect(report.bigThree.every((block) => block.sentences.length === 5)).toBe(true);
  expect(report.planets).toHaveLength(10);
  expect(report.planets.every((block) => block.sentences.length === 5)).toBe(true);
  expect(report.houses).toHaveLength(12);
  expect(report.houses.every((block) => block.sentences.length === 4)).toBe(true);
  expect(report.aspects.length).toBeGreaterThanOrEqual(6);
  expect(report.aspects.length).toBeLessThanOrEqual(10);
  expect(report.transits.length).toBeGreaterThanOrEqual(6);
  expect(report).toEqual(buildDetailedReading(chart, transits));
});

it('does not invent ascendant or house readings when birth time is unknown', () => {
  const report = buildDetailedReading({ ...chart, timeKnown: false, ascendant: undefined, houses: [] }, transits);
  expect(report.bigThree.map((block) => block.subject)).toEqual(['sun', 'moon']);
  expect(report.houses).toHaveLength(0);
  expect(report.unavailable).toEqual(['ascendant', 'houses']);
});
```

- [ ] **Step 3: 결정론적 애스펙트 선택 함수 구현**

```ts
function exactness(aspect: Aspect): number {
  return Number((1 - aspect.orb / aspect.maxOrb).toFixed(6));
}

function selectStrongest(aspects: Aspect[], scope: 'natal' | 'transit'): ReadingEvidence[] {
  return [...aspects]
    .sort((a, b) => exactness(b) - exactness(a) || `${a.from}:${a.to}:${a.type}`.localeCompare(`${b.from}:${b.to}:${b.type}`))
    .slice(0, 10)
    .map((aspect) => ({ kind: 'aspect', scope, type: aspect.type, from: aspect.from, to: aspect.to, orb: aspect.orb, exactness: exactness(aspect) }));
}
```

실제 정상 차트에서 6개 이상을 선택하되 원본에 6개보다 적으면 존재하지 않는 각을 합성하지 않고 전부 사용한다.

- [ ] **Step 4: 문장 역할 순서를 고정한 빌더 구현**

Big Three는 `role → sign → house 또는 houseUnknown → pattern → action`, 행성은 `role → sign → house 또는 houseUnknown → motion → action`, 하우스는 `domain → cusp → occupied 또는 empty → action`, 애스펙트는 `dynamic → experience → strength → caution → integration`, 트랜짓은 `dynamic → experience → opportunity → caution → action` 순서로 정확한 key와 params를 만든다. params에는 렌더러가 필요한 `planet`, `point`, `signIndex`, `element`, `modality`, `house`, `retrograde`, `from`, `to`, `aspectType`, `orb`, `exactness`, `occupants`를 문자열 또는 숫자로 넣는다. `element`는 `fire|earth|air|water`, `modality`는 `cardinal|fixed|mutable`이며 sign index에서 고정 표로 계산한다. `occupants`는 `PLANETS` 상수 순서의 planet ID를 쉼표로 연결한 문자열이며 렌더러가 locale별 목록으로 바꾼다.

- [ ] **Step 5: 테스트 실행**

Run: `npm test -- --run src/features/readings/buildDetailedReading.test.ts`

Expected: stable block IDs, required counts, time-unknown behavior, deterministic ordering tests PASS.

- [ ] **Step 6: 커밋**

```powershell
git add src/features/readings
git commit -m "feat: build neutral evidence based chart readings"
```

### Task 5: 한국어·영어 전체 차트 문장 저작과 렌더러

**Files:**
- Create: `src/features/readings/copy.ko.ts`
- Create: `src/features/readings/copy.en.ts`
- Create: `src/features/readings/renderDetailedReading.ts`
- Create: `src/features/readings/renderDetailedReading.test.ts`
- Create: `src/features/readings/copyParity.test.ts`

**Interfaces:**
- Consumes: `DetailedReadingModel`, `ReadingCopyKey`, astrology term helpers, `Locale`.
- Produces: `renderDetailedReading(model, locale): LocalizedDetailedReading` and separately authored `READING_COPY_KO/EN` maps.

- [ ] **Step 1: 두 언어의 완전한 key 동등성 실패 테스트 작성**

```ts
it('authors every reading sentence in both languages without fallback', () => {
  expect(Object.keys(READING_COPY_KO).sort()).toEqual([...READING_COPY_KEYS].sort());
  expect(Object.keys(READING_COPY_EN).sort()).toEqual([...READING_COPY_KEYS].sort());
  expect(Object.values(READING_COPY_KO).every((value) => typeof value === 'function')).toBe(true);
  expect(Object.values(READING_COPY_EN).every((value) => typeof value === 'function')).toBe(true);
});
```

- [ ] **Step 2: typed copy contract와 29개 한국어 함수 작성**

```ts
export type ReadingCopy = Record<ReadingCopyKey, (params: ReadingParams) => string>;

export const READING_COPY_KO: ReadingCopy = {
  'bigThree.role': ({ point }) => point === 'sun'
    ? '태양은 스스로 선택하고 삶의 방향을 세우는 중심 의지를 보여줍니다.'
    : point === 'moon'
      ? '달은 감정이 반응하는 속도와 마음이 안정을 찾는 조건을 보여줍니다.'
      : '상승궁은 낯선 환경에 들어갈 때 가장 먼저 드러나는 태도와 외부의 첫인상을 보여줍니다.',
  'bigThree.sign': ({ point, signIndex }) => `${pointName(String(point), 'ko')}이 ${zodiacNameByIndex(Number(signIndex), 'ko')}에 있어 ${signExpression(Number(signIndex), 'ko')} 방식으로 핵심 욕구를 표현합니다.`,
  'bigThree.house': ({ house }) => `${Number(house)}하우스의 주제에서 이 에너지가 반복적으로 활성화되며 실제 선택으로 드러납니다.`,
  'bigThree.houseUnknown': () => '출생시간이 없어 이 핵심 성향이 어느 삶의 영역에서 가장 강하게 드러나는지는 단정하지 않습니다.',
  'bigThree.pattern': ({ point, element, modality }) => `${pointName(String(point), 'ko')}에는 ${elementPattern(String(element), 'ko')}과 ${modalityPattern(String(modality), 'ko')}이 함께 나타납니다.`,
  'bigThree.action': ({ point }) => `오늘부터 ${pointName(String(point), 'ko')}의 욕구를 한 문장으로 적고, 그 욕구를 해치지 않는 가장 작은 행동을 선택해 보세요.`,
  'planet.role': ({ planet }) => `${planetName(String(planet) as PlanetId, 'ko')}은 ${planetRole(String(planet) as PlanetId, 'ko')}을 다루는 방식을 보여줍니다.`,
  'planet.sign': ({ planet, signIndex }) => `${planetName(String(planet) as PlanetId, 'ko')}이 ${zodiacNameByIndex(Number(signIndex), 'ko')}의 ${signExpression(Number(signIndex), 'ko')} 방식으로 욕구와 능력을 표현합니다.`,
  'planet.house': ({ house }) => `${Number(house)}하우스에서는 생각에 머물던 성향이 관계, 일, 선택과 같은 구체적인 사건으로 나타납니다.`,
  'planet.houseUnknown': () => '출생시간이 없으므로 이 행성의 별자리 성향은 읽되 특정 삶의 영역으로 한정하지 않습니다.',
  'planet.motion': ({ planet, retrograde }) => retrograde ? `${planetName(String(planet) as PlanetId, 'ko')} 역행은 이 기능을 먼저 내면에서 검토한 뒤 표현하게 하므로 숙성에는 강하지만 시작이 늦을 수 있습니다.` : `${planetName(String(planet) as PlanetId, 'ko')} 순행은 이 기능을 비교적 직접 표현하게 하며 경험 속에서 빠르게 조정하도록 돕습니다.`,
  'planet.action': ({ planet }) => `${planetName(String(planet) as PlanetId, 'ko')}의 힘을 살리려면 익숙한 자동반응 하나를 관찰하고 더 의식적인 선택 하나로 바꿔 보세요.`,
  'house.domain': ({ house }) => `${Number(house)}하우스는 ${houseName(Number(house), 'ko')}을 삶에서 어떻게 경험하는지 보여주는 영역입니다.`,
  'house.cusp': ({ house, signIndex }) => `시작점이 ${zodiacNameByIndex(Number(signIndex), 'ko')}이므로 ${houseName(Number(house), 'ko')}에는 ${signApproach(Number(signIndex), 'ko')} 태도로 접근합니다.`,
  'house.occupied': ({ occupants }) => `이 영역에 놓인 ${formatPlanetList(String(occupants), 'ko')}이 서로 다른 욕구를 모아 실제 사건과 선택의 밀도를 높입니다.`,
  'house.empty': ({ house }) => `행성이 없더라도 ${Number(house)}하우스가 비어 있다는 뜻은 아니며, 시작점의 별자리와 그 주인 행성을 통해 충분히 작동합니다.`,
  'house.action': ({ house }) => `${houseName(Number(house), 'ko')}에서 반복되는 장면을 기록하면 이 하우스가 요구하는 성장 방향을 더 선명하게 볼 수 있습니다.`,
  'aspect.dynamic': ({ from, to, aspectType }) => `${planetName(String(from) as PlanetId, 'ko')}과 ${planetName(String(to) as PlanetId, 'ko')}의 ${aspectName(String(aspectType) as AspectType, 'ko')}은 두 기능이 함께 작동하는 기본 패턴을 만듭니다.`,
  'aspect.experience': ({ aspectType }) => `${aspectExperience(String(aspectType) as AspectType, 'ko')} 이 패턴은 반복되는 관계와 선택에서 특히 쉽게 체감됩니다.`,
  'aspect.strength': ({ exactness }) => `정확도 ${Math.round(Number(exactness) * 100)}%의 연결은 의식적으로 사용할수록 빠른 집중력과 고유한 문제 해결 방식으로 발전할 수 있습니다.`,
  'aspect.caution': ({ aspectType }) => `${aspectCaution(String(aspectType) as AspectType, 'ko')} 한쪽 기능만 밀어붙이면 다른 욕구가 우회적으로 드러날 수 있습니다.`,
  'aspect.integration': ({ from, to }) => `${planetName(String(from) as PlanetId, 'ko')}의 요구를 인정한 뒤 ${planetName(String(to) as PlanetId, 'ko')}의 속도로 실행하는 순서를 연습하면 두 힘을 함께 쓸 수 있습니다.`,
  'transit.dynamic': ({ from, to, aspectType }) => `현재 ${planetName(String(from) as PlanetId, 'ko')}이 출생 ${planetName(String(to) as PlanetId, 'ko')}과 ${aspectName(String(aspectType) as AspectType, 'ko')}을 이루며 당분간의 체감 리듬을 강조합니다.`,
  'transit.experience': ({ to }) => `${planetName(String(to) as PlanetId, 'ko')}이 상징하는 생활 영역에서 평소보다 반응이 빨라지거나 오래 미룬 주제가 다시 보일 수 있습니다.`,
  'transit.opportunity': ({ exactness }) => `정확도 ${Math.round(Number(exactness) * 100)}%인 지금은 신호가 선명하므로 작은 실험과 솔직한 관찰에서 기회를 찾기 좋습니다.`,
  'transit.caution': ({ aspectType }) => `${aspectCaution(String(aspectType) as AspectType, 'ko')} 즉시 결론을 내리기보다 현실 조건을 한 번 더 확인하세요.`,
  'transit.action': ({ to }) => `오늘은 ${planetName(String(to) as PlanetId, 'ko')}과 관련된 일 하나를 정해 준비, 실행, 기록의 세 단계로 마무리해 보세요.`,
  'unavailable.ascendant': () => '출생시간이 없어 상승궁을 신뢰할 수 있게 계산하지 않았습니다. 시간을 확인하면 첫인상과 외부 대응 방식의 풀이가 추가됩니다.',
  'unavailable.houses': () => '출생시간이 없어 12하우스를 만들지 않았습니다. 행성의 별자리 해석은 유효하지만 구체적인 삶의 영역은 단정하지 않습니다.',
};
```

위 코드가 사용하는 `planetRole`, `signExpression`, `signApproach`, `elementPattern`, `modalityPattern`, `aspectExperience`, `aspectCaution`, `formatPlanetList`는 같은 파일의 locale 고정 helper로 만들고 10행성·12별자리·4원소·3양상·5애스펙트를 모두 다룬다. 각 별자리 helper는 서로 다른 강점과 과잉 패턴을 실제 문장에 포함해야 하며 이름만 바꾼 동일 문장을 반환하지 않는다. 각 한국어 문장은 보간값을 포함해 평균 28~40자로 다듬고, 전체 길이 테스트가 4,000~7,000자를 벗어나면 의미를 삭제하지 말고 중복 수식어만 줄인다.

- [ ] **Step 3: 같은 의미 구조의 영어 29개 함수 작성**

`READING_COPY_EN`은 한국어 문장을 런타임 번역하지 않고 별도로 집필한다. 각 key는 한국어와 같은 params와 사실을 사용한다. 문체는 차분한 편집 문장으로 고정하고 `will definitely`, `destined`, 진단·처방·수익 보장 표현을 쓰지 않는다. 예시 계약은 다음과 같다.

```ts
'aspect.dynamic': ({ from, to, aspectType }) =>
  `The ${aspectName(String(aspectType) as AspectType, 'en')} between ${planetName(String(from) as PlanetId, 'en')} and ${planetName(String(to) as PlanetId, 'en')} describes how these two functions learn to operate together.`,
'transit.action': ({ to }) =>
  `Choose one matter ruled by ${planetName(String(to) as PlanetId, 'en')} and move it through three steps today: prepare, act, and record what changed.`,
'unavailable.houses': () =>
  'Without a recorded birth time, the twelve houses cannot be calculated reliably. The planetary signs remain useful, but this report will not invent specific life areas.',
```

- [ ] **Step 4: 표시 모델과 한국어 길이 실패 테스트 작성**

```ts
it('renders equivalent evidence in Korean and English and a full Korean report', () => {
  const model = buildDetailedReading(chart, transits);
  const ko = renderDetailedReading(model, 'ko');
  const en = renderDetailedReading(model, 'en');
  expect(ko.sections.map((section) => section.blocks.map((block) => block.id)))
    .toEqual(en.sections.map((section) => section.blocks.map((block) => block.id)));
  expect(ko.evidenceIds).toEqual(en.evidenceIds);
  const length = ko.sections.flatMap((section) => section.blocks).flatMap((block) => [block.summary, ...block.paragraphs]).join('').length;
  expect(length).toBeGreaterThanOrEqual(4000);
  expect(length).toBeLessThanOrEqual(7000);
});
```

- [ ] **Step 5: `LocalizedDetailedReading` 렌더러 구현**

```ts
export type LocalizedReadingBlock = {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
  evidenceLabels: string[];
};
export type LocalizedReadingSection = { id: ReadingBlock['section']; title: string; intro: string; blocks: LocalizedReadingBlock[] };
export type LocalizedDetailedReading = { sections: LocalizedReadingSection[]; notices: string[]; evidenceIds: string[] };
```

렌더러는 각 블록 첫 문장을 `summary`, 나머지를 `paragraphs`로 분리한다. evidence label은 행성명·애스펙트·오브 또는 행성·별자리·하우스를 현재 locale로 구성하고, `evidenceIds`는 언어 중립 key만 반환한다.

- [ ] **Step 6: 테스트와 커밋**

Run: `npm test -- --run src/features/readings`

Expected: copy key parity, same block/evidence order, sentence counts, Korean 4,000–7,000 characters tests PASS.

```powershell
git add src/features/readings
git commit -m "feat: author bilingual full chart interpretations"
```

### Task 6: 일간 운세를 중립 모델과 양언어 장문으로 분리

**Files:**
- Modify: `src/features/fortune/generateFortune.ts`
- Modify: `src/features/fortune/generateFortune.test.ts`
- Modify: `src/features/fortune/copy.ko.ts`
- Create: `src/features/fortune/copy.en.ts`
- Create: `src/features/fortune/localizeDailyFortune.ts`
- Create: `src/features/fortune/localizeDailyFortune.test.ts`
- Modify: `src/features/results/ResultsPage.tsx`
- Modify: `src/features/results/ResultsPage.test.tsx`
- Modify: `src/features/results/CosmicWeather.tsx`
- Modify: `src/features/results/DailyFortuneSection.tsx`
- Modify: `src/features/results/LuckyGuide.tsx`

**Interfaces:**
- Consumes: `NatalChartData`, `TransitData`, ISO date, `Locale` only at localization time.
- Produces: neutral `DailyFortune`, `localizeDailyFortune(model, locale): LocalizedDailyFortune`.

- [ ] **Step 1: locale 중립 모델 계약과 동일성 실패 테스트 작성**

```ts
export type FortuneBand = 'high' | 'medium' | 'low';
export type CategoryFortuneModel = { score: number; band: FortuneBand; variant: number; evidence: Aspect[] };
export type DailyFortune = {
  date: string;
  overallScore: number;
  categories: Record<FortuneCategory, CategoryFortuneModel>;
  lucky: { colorIndex: number; number: number; hour: number; adviceBand: FortuneBand };
};

it('keeps the calculated model independent from display language', () => {
  const model = generateDailyFortune(chart, transits, '2026-08-05');
  expect(model).not.toHaveProperty('headline');
  expect(model.categories.overall).not.toHaveProperty('summary');
  expect(localizeDailyFortune(model, 'ko').overallScore).toBe(localizeDailyFortune(model, 'en').overallScore);
  expect(localizeDailyFortune(model, 'ko').evidenceIds).toEqual(localizeDailyFortune(model, 'en').evidenceIds);
});
```

- [ ] **Step 2: 기존 점수·seed 알고리즘을 그대로 둔 채 문자열 제거**

`hashSeed`, `clamp`, `scoreCategory`, `relevantAspects`의 계산식을 바꾸지 않는다. `band`, `variant`, 최대 두 개의 evidence와 lucky index/hour만 저장한다. `generateDailyFortune()`의 인자에는 locale을 추가하지 않는다.

- [ ] **Step 3: 두 언어 copy contract와 문장 수 테스트 작성**

```ts
it('writes seven overall sentences and five sentences for every focused area', () => {
  for (const locale of ['ko', 'en'] as const) {
    const view = localizeDailyFortune(generateDailyFortune(chart, transits, '2026-08-05'), locale);
    expect(view.categories.overall.paragraphs).toHaveLength(7);
    for (const key of ['love', 'money', 'career', 'health'] as const) {
      expect(view.categories[key].paragraphs).toHaveLength(5);
    }
  }
});
```

- [ ] **Step 4: 일간 한국어·영어 사전과 localizer 구현**

`LocalizedCategoryFortune`는 `{ label, score, summary, paragraphs, signals }`, `LocalizedDailyFortune`는 `{ date, overallScore, headline, categories, lucky, evidenceIds }`를 갖는다. 종합운 문장 역할은 `요약, 첫 근거, 체감, 오전 전략, 오후 전략, 주의, 실천`의 7개다. 나머지는 `요약, 근거, 기회, 주의, 실천`의 5개다. 상위 evidence가 없을 때만 “주요 흐름이 비교적 고르다 / major influences are comparatively even”라는 중립 근거를 사용한다.

행운 색 index는 한국어 `본 아이보리, 샴페인 골드, 딥 코발트, 코퍼, 세이지, 스모크 블루, 펄 그레이`, 영어 `Bone ivory, Champagne gold, Deep cobalt, Copper, Sage, Smoke blue, Pearl gray`에 대응시킨다. 신호는 양쪽 모두 같은 행성 ID·aspect type·orb에서 만들고 표시명만 바꾼다.

- [ ] **Step 5: 현재 한국어 결과 UI를 새 표시 모델에 연결**

`ResultsPage`는 `const dailyView = localizeDailyFortune(fortune, 'ko')`를 한 번 계산해 `CosmicWeather`, `DailyFortuneSection`, `LuckyGuide`에 전달한다. 세 하위 컴포넌트의 props는 `LocalizedDailyFortune`으로 바꾸고 기존 한국어 화면 결과는 동일하게 유지한다. Task 8에서 이 고정 `'ko'` 인자를 Context의 `locale`로 교체한다. 이 중간 어댑터 덕분에 neutral model 커밋 자체도 테스트와 production build가 가능하다.

- [ ] **Step 6: 일간 회귀 테스트와 빌드 실행**

Run: `npm test -- --run src/features/fortune/generateFortune.test.ts src/features/fortune/localizeDailyFortune.test.ts`

Run: `npm test -- --run src/features/results/ResultsPage.test.tsx src/App.e2e.test.tsx`

Run: `npm run build`

Expected: same chart/date determinism, score range, evidence equality, 7/5 sentence and existing Korean result flow tests PASS; build exits 0.

- [ ] **Step 7: 커밋**

```powershell
git add src/features/fortune/generateFortune.ts src/features/fortune/generateFortune.test.ts src/features/fortune/copy.ko.ts src/features/fortune/copy.en.ts src/features/fortune/localizeDailyFortune.ts src/features/fortune/localizeDailyFortune.test.ts src/features/results/ResultsPage.tsx src/features/results/ResultsPage.test.tsx src/features/results/CosmicWeather.tsx src/features/results/DailyFortuneSection.tsx src/features/results/LuckyGuide.tsx
git commit -m "feat: expand bilingual daily fortunes"
```

### Task 7: 월간·연간 중립 모델, 상세 문장과 선 그래프

**Files:**
- Modify: `src/features/fortune/periodFortune.ts`
- Modify: `src/features/fortune/periodFortune.test.ts`
- Create: `src/features/fortune/periodCopy.ko.ts`
- Create: `src/features/fortune/periodCopy.en.ts`
- Create: `src/features/fortune/localizePeriodFortune.ts`
- Create: `src/features/fortune/localizePeriodFortune.test.ts`
- Create: `src/features/chart/periodFlowGeometry.ts`
- Create: `src/features/chart/periodFlowGeometry.test.ts`
- Create: `src/features/results/PeriodFlowChart.tsx`
- Create: `src/features/results/PeriodFlowChart.test.tsx`
- Create: `src/features/results/ReadingChapter.tsx`
- Create: `src/features/results/ReadingChapter.test.tsx`
- Modify: `src/features/results/PeriodFortuneSection.tsx`
- Modify: `src/features/results/ResultsPage.tsx`
- Modify: `src/features/results/ResultsPage.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: neutral daily samples, anchor ISO date, `Locale` at rendering time.
- Produces: neutral `PeriodFortune`, detailed `LocalizedPeriodFortune`, `buildPeriodFlowGeometry`, `<PeriodFlowChart points label />`.

- [ ] **Step 1: 기간 모델에서 모든 언어 문자열을 제거하는 실패 테스트 작성**

```ts
it('stores dates, scores and extrema instead of localized prose', () => {
  const result = summarizePeriodFortune('month', '2026-08-05', samples);
  expect(result.timeline.map((point) => point.date)).toEqual(monthSampleDates('2026-08-05'));
  expect(result.strongestIndex).toBe(3);
  expect(result.softestIndex).toBe(2);
  expect(result).not.toHaveProperty('headline');
  expect(result).not.toHaveProperty('narrative');
});
```

`PeriodFortune`은 `period`, `anchorDate`, `overallScore`, `categories`, `timeline: { date, score, tone }[]`, `strongestIndex`, `softestIndex`만 가진다.

- [ ] **Step 2: 기존 5/12 표본과 평균식을 유지해 중립 집계 구현**

Run: `npm test -- --run src/features/fortune/periodFortune.test.ts`

Expected: first FAIL on old string fields, then PASS with exact monthly dates and twelve yearly dates preserved.

- [ ] **Step 3: 장문 표시 모델의 문장 수 실패 테스트 작성**

```ts
it('creates the approved monthly and yearly detail in both languages', () => {
  for (const locale of ['ko', 'en'] as const) {
    const month = localizePeriodFortune(monthModel, locale);
    const year = localizePeriodFortune(yearModel, locale);
    expect(month.overview).toHaveLength(7);
    expect(Object.values(month.categoryStrategies).every((items) => items.length === 4)).toBe(true);
    expect(month.segments).toHaveLength(5);
    expect(month.segments.every((segment) => segment.paragraphs.length === 3)).toBe(true);
    expect(year.overview).toHaveLength(9);
    expect(year.quarters).toHaveLength(4);
    expect(year.quarters.every((quarter) => quarter.paragraphs.length === 4)).toBe(true);
    expect(year.segments).toHaveLength(12);
    expect(year.segments.every((segment) => segment.paragraphs.length === 3)).toBe(true);
  }
});
```

- [ ] **Step 4: 기간 copy와 localizer 구현**

`LocalizedPeriodFortune`는 `label`, `headline`, `overview`, `categoryStrategies`, localized `timeline`, `segments`, `quarters`, `opportunity`, `caution`을 반환한다. 월 개요 역할은 `전체점수, 강한 분야, 약한 분야, 상승구간, 주의구간, 리듬 사용법, 한 문장 실천` 7개다. 연 개요는 여기에 `상반기, 하반기`를 더해 9개다. 각 분야 전략은 `현재 강도, 기회, 주의, 실천` 4개다. 월 다섯 구간은 `체감, 활용, 주의` 3개, 연 분기는 `큰 흐름, 핵심 분야, 전환 신호, 실천` 4개, 연 열두 달은 `주제, 활용, 주의` 3개다.

날짜는 반드시 `formatLocalDate`/`formatPeriodLabel`을 사용한다. copy 파일은 같은 key 집합의 별도 한국어·영어 함수 map이며 런타임 번역이나 영어 fallback을 두지 않는다.

- [ ] **Step 5: 순수 SVG 지오메트리 실패 테스트 작성**

```ts
it('maps the score range to a readable line and closed area', () => {
  const geometry = buildPeriodFlowGeometry([60, 78, 55, 82, 66], 760, 260, 36);
  expect(geometry.points).toHaveLength(5);
  expect(geometry.linePath).toMatch(/^M /);
  expect(geometry.areaPath).toMatch(/ Z$/);
  expect(Math.min(...geometry.points.map((point) => point.y))).toBeGreaterThanOrEqual(36);
  expect(Math.max(...geometry.points.map((point) => point.y))).toBeLessThanOrEqual(224);
});
```

Y축은 고정 0–100 전체가 아니라 가독성을 위해 `minScore - 8`과 `maxScore + 8`을 0–100 안에서 clamp하고, 모든 점수가 같으면 40–100 범위를 사용한다. 선은 3px, 면적은 낮은 불투명도, 최고·주의 점은 10px 외곽 링과 텍스트 아이콘을 함께 사용한다.

- [ ] **Step 6: 재사용 가능한 controlled disclosure 구현**

```tsx
it('keeps the summary visible and exposes expanded content accessibly', async () => {
  const user = userEvent.setup();
  function Harness() {
    const [open, setOpen] = useState(false);
    return <ReadingChapter id="sun" title="Sun in Leo" summary="Visible summary" paragraphs={['Detail one', 'Detail two']} evidenceLabels={['Sun · Leo']} open={open} onToggle={() => setOpen((value) => !value)} />;
  }
  render(<Harness />);
  expect(screen.getByText('Visible summary')).toBeVisible();
  const button = screen.getByRole('button', { name: /Sun in Leo/ });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  await user.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Detail two')).toBeVisible();
});
```

`ReadingChapter`의 공개 props는 `{ id, title, summary, paragraphs, evidenceLabels, open, onToggle }`로 고정하고 button의 `aria-controls`와 content panel의 `id`를 stable `id`에서 만든다.

- [ ] **Step 7: 접근 가능한 `PeriodFlowChart`와 상세 기간 UI 구현**

```tsx
<svg viewBox="0 0 760 260" role="img" aria-label={label}>
  <title>{label}</title>
  <path className="period-area" d={geometry.areaPath} />
  <path className="period-line" d={geometry.linePath} />
  {geometry.points.map((point, index) => <g key={points[index].date} className={`period-node ${points[index].tone}`}>...</g>)}
</svg>
```

`PeriodFortuneSection`의 공개 props는 `{ fortune: LocalizedPeriodFortune }`로 바꾸고, 개요를 먼저 보여준 뒤 분야 전략, 월 구간 또는 분기·월 해설을 `ReadingChapter`과 같은 disclosure 규칙으로 접는다.

- [ ] **Step 8: App과 현재 한국어 결과 화면을 중립 기간 모델에 연결**

`App.tsx`는 `summarizePeriodFortune('month', date, monthSamples)`와 `summarizePeriodFortune('year', date, yearSamples)`를 호출한다. `ResultsPage`는 선택된 neutral 기간 모델을 `localizePeriodFortune(selectedPeriod, 'ko')`로 바꿔 `PeriodFortuneSection`에 전달한다. Task 8에서 고정 `'ko'`를 Context locale로 교체한다.

- [ ] **Step 9: 테스트·빌드·커밋**

Run: `npm test -- --run src/features/fortune src/features/chart/periodFlowGeometry.test.ts src/features/results/PeriodFlowChart.test.tsx src/features/results/ReadingChapter.test.tsx`

Run: `npm test -- --run src/features/results/ResultsPage.test.tsx src/App.e2e.test.tsx`

Run: `npm run build`

Expected: neutral model, detailed sentence counts, geometry, accessible SVG and existing Korean full-flow tests PASS; build exits 0.

```powershell
git add src/App.tsx src/features/fortune src/features/chart/periodFlowGeometry.ts src/features/chart/periodFlowGeometry.test.ts src/features/results/PeriodFlowChart.tsx src/features/results/PeriodFlowChart.test.tsx src/features/results/ReadingChapter.tsx src/features/results/ReadingChapter.test.tsx src/features/results/PeriodFortuneSection.tsx src/features/results/ResultsPage.tsx src/features/results/ResultsPage.test.tsx
git commit -m "feat: add detailed bilingual period flows"
```

### Task 8: 언어 전환·상세 장·결과 화면 통합과 상태 보존

**Files:**
- Create: `src/components/LanguageSwitch.tsx`
- Create: `src/components/LanguageSwitch.test.tsx`
- Create: `src/features/results/DetailedNatalReport.tsx`
- Create: `src/features/results/DetailedNatalReport.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/features/results/ResultsPage.tsx`
- Modify: `src/features/results/ResultsPage.test.tsx`
- Modify: `src/features/results/BigThreeSummary.tsx`
- Modify: `src/features/results/PlacementSection.tsx`
- Modify: `src/features/results/HouseSection.tsx`
- Modify: `src/features/results/AspectSection.tsx`
- Modify: `src/features/results/CosmicWeather.tsx`
- Modify: `src/features/results/DailyFortuneSection.tsx`
- Modify: `src/features/results/LuckyGuide.tsx`
- Modify: `src/components/AppError.tsx`
- Modify: `src/components/EphemerisLoader.tsx`
- Modify: `src/components/LegalNotice.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: all neutral result models, `renderDetailedReading`, daily/period localizers, `useI18n`.
- Produces: complete Korean/English landing, form, loading, error and results UI without result recomputation.

- [ ] **Step 1: 언어 선택기 접근성 테스트와 구현**

```tsx
it('exposes two pressed states and changes locale', async () => {
  const user = userEvent.setup();
  render(<I18nProvider initialLocale="ko"><LanguageSwitch /></I18nProvider>);
  expect(screen.getByRole('button', { name: '한국어' })).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: 'English' }));
  expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
});
```

선택기는 `role="group"`, locale별 `aria-pressed`, 화면 표시는 `한`과 `EN`, 접근성 이름은 `한국어`와 `English`를 사용한다.

- [ ] **Step 2: 상세 리포트 장 구성과 부모 소유 open state 구현**

```tsx
it('renders every detailed section and preserves stable block ids while opening a chapter', async () => {
  const user = userEvent.setup();
  render(<DetailedNatalReport report={localizedReport} />);
  ['bigThree', 'planets', 'houses', 'aspects', 'transits'].forEach((id) =>
    expect(screen.getByTestId(`reading-section-${id}`)).toBeInTheDocument());
  const sun = screen.getByRole('button', { name: /Sun/ });
  await user.click(sun);
  expect(sun).toHaveAttribute('aria-expanded', 'true');
});
```

`DetailedNatalReport`는 `Set<string>`으로 열린 block ID를 소유하고 Task 7의 controlled `ReadingChapter`에 `open`과 `onToggle`을 전달한다. section과 block key에는 locale 문자열이 아닌 model ID만 사용한다.

- [ ] **Step 3: `App` 결과 상태를 neutral model로 고정**

`ResultState`는 `profile`, `chart`, `transits`, neutral `fortune`, neutral `monthFortune`, neutral `yearFortune`, `detailedReading`을 저장한다. `buildPeriod()`는 neutral daily samples를 반환한다. `summarizePeriodFortune()`에는 locale label이 아니라 anchor ISO date를 전달한다. locale effect나 dependency로 `handleSubmit`을 다시 실행하지 않는다. `error` state도 번역된 문자열이 아니라 `null | 'calculation'` 코드로 저장해 오류가 열린 상태에서 언어를 바꿔도 현재 locale 문구가 나온다.

계산 오류는 `AppError`에 원문 예외를 그대로 노출하지 않고 `error.calculationTitle`, `error.calculationBody`, `error.close`의 안전한 현재 locale 문구를 사용한다.

- [ ] **Step 4: 결과 화면 순서와 모든 UI key 적용**

`site-nav`와 `results-nav`의 오른쪽 끝에 같은 `<LanguageSwitch />`를 배치한다. 결과 순서는 `히어로 차트·이름·현재 메시지 → 오늘/이번 달/올해 선택 → Big Three 요약 → 선택 기간 운세 → 전체 출생 차트 상세 풀이 → 행성 배치표 → 12하우스 표 → 출생 애스펙트 → 트랜짓 → 오늘일 때 분야별 운세·행운 → 법적 고지`로 고정한다. `ResultsPage`에서 `useMemo`로 neutral 모델을 현재 locale의 view로 변환한다.

사전에 다음 결과 키 그룹을 양쪽 언어로 모두 추가한다: `results.edit`, `results.natalChart`, `results.reportTitle`, `results.timeUnknown`, `results.todayMessage`, `period.today`, `period.month`, `period.year`, `bigThree.*`, `placements.*`, `houses.*`, `aspects.*`, `transits.*`, `daily.*`, `lucky.*`, `readings.*`, `periodFlow.*`, `loader.*`, `error.*`, `legal.*`, `common.open`, `common.close`. 영어 섹션 제목은 `Sun, Moon & Rising`, `Detailed natal reading`, `Planetary placements`, `The twelve houses`, `Major natal aspects`, `Transits to natal`, `Five areas today`, `Today's lucky guide`를 사용한다.

- [ ] **Step 5: 언어 전환 상태 보존 실패 테스트 작성**

```tsx
it('preserves selected period and expanded chapter when locale changes', async () => {
  const user = userEvent.setup();
  render(<I18nProvider initialLocale="ko"><ResultsPage {...props} /></I18nProvider>);
  await user.click(screen.getByRole('tab', { name: '이번 달' }));
  await user.click(screen.getByRole('button', { name: /태양/ }));
  await user.click(screen.getByRole('button', { name: 'English' }));
  expect(screen.getByRole('tab', { name: 'This month' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('button', { name: /Sun/ })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('김별')).toBeInTheDocument();
});
```

블록 key는 locale 문자열이 아니라 stable `block.id`를 사용한다. `ReadingChapter`의 open state는 `DetailedNatalReport`의 `Set<string>`으로 끌어올려 locale rerender에도 유지한다.

- [ ] **Step 6: 통합 테스트와 빌드 실행**

Run: `npm test -- --run src/App.test.tsx src/features/results src/components src/i18n`

Run: `npm run build`

Expected: complete Korean/English UI, period state, open chapter, user name preservation tests PASS; build exits 0.

- [ ] **Step 7: 커밋**

```powershell
git add src/App.tsx src/App.test.tsx src/components src/features/results src/i18n/translations.ts
git commit -m "feat: integrate bilingual detailed reports"
```

### Task 9: Celestial Atelier 시각 토큰·편집형 레이아웃·차트 깊이

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `src/features/profile/BirthForm.css`
- Modify: `src/features/results/results.css`
- Modify: `src/features/chart/NatalChart.css`
- Modify: `src/features/chart/NatalChart.tsx`
- Create: `src/styles/atelierVisual.test.ts`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: 기존 class names and semantic markup from Task 8.
- Produces: exact Celestial Atelier tokens, shared rail, responsive editorial sections, readable chart and graph.

- [ ] **Step 1: 토큰·구식 색상 제거 실패 테스트 작성**

```ts
import tokens from './tokens.css?raw';
import global from './global.css?raw';
import results from '../features/results/results.css?raw';
import chart from '../features/chart/NatalChart.css?raw';

it('uses only the approved atelier foundation and one content rail', () => {
  const css = [tokens, global, results, chart].join('\n').toLowerCase();
  ['#f3efe7', '#11100e', '#b79a62', '#d2c29f', '#385a78', '#9c5544'].forEach((color) => expect(css).toContain(color));
  ['#a99bff', '#8171ed', '#7b6ce0', '#ef7697'].forEach((color) => expect(css).not.toContain(color));
  expect(tokens).toContain('--content-rail: 1120px');
  expect(tokens).toContain('--page-gutter: clamp(16px, 4vw, 40px)');
});
```

- [ ] **Step 2: 의미 기반 토큰으로 `tokens.css` 교체**

```css
:root {
  --paper: #F3EFE7;
  --paper-elevated: #FBF8F1;
  --obsidian: #11100E;
  --obsidian-soft: #1A1815;
  --brass: #B79A62;
  --brass-soft: #D2C29F;
  --ink: #24211D;
  --ink-inverse: #F4F0E8;
  --muted: #777168;
  --cobalt: #385A78;
  --copper: #9C5544;
  --hairline: rgba(36, 33, 29, .16);
  --hairline-inverse: rgba(244, 240, 232, .18);
  --content-rail: 1120px;
  --page-gutter: clamp(16px, 4vw, 40px);
  --font-display: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif;
  --font-body: Inter, Pretendard, "Noto Sans KR", system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 3: 랜딩·폼·결과를 편집형 장 구조로 재작성**

모든 외곽 영역은 `width: min(var(--content-rail), calc(100% - 2 * var(--page-gutter)))`를 사용한다. 랜딩과 입력은 본 아이보리, 차트 히어로와 핵심 운세는 옵시디언, 장문 리포트는 아이보리 장 사이에 옵시디언 인용 장을 배치한다. 일반 섹션의 radius는 0–18px 안에서만 사용하고, 내부 항목은 별도 글래스 카드 대신 헤어라인과 20–28px 여백으로 나눈다. 본문은 `max-width: 68ch`, `line-height: 1.75`, 작은 메타는 0.72rem 이상으로 고정한다.

버튼·입력·탭·아코디언은 `min-height: 44px`; focus ring은 `2px solid var(--brass)`와 `3px` offset; `:active`는 `transform: scale(.98)`; `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more`를 각각 처리한다.

- [ ] **Step 4: 출생 차트 색·선·행성 노드 계층 교체**

`ASPECT_COLORS`는 합 `#B79A62`, 육분/삼분 `#385A78`, 사각/충 `#9C5544`를 사용한다. 범례도 `결합/Conjunction`, `조화/Harmony`, `긴장/Tension`, `ASC·MC` 네 의미를 현재 locale로 표시한다. 외곽 천문 링 2.25px, 보조 링 1.25px, 하우스 0.9px, ASC·MC 2px, 실제 애스펙트 0.75–1.75px를 유지한다. 장식 glow는 실제 선보다 먼저 별도 `<g aria-hidden="true">`에 그리며 blur를 텍스트와 실제 선에 적용하지 않는다. 행성 노드는 `brass-soft` 외곽 링, `obsidian-soft` 본체, 아이보리 glyph, 1px 상단 반사선의 네 층으로 만든다.

기간 그래프는 브라스 3px 선, 브라스 8% 면적, 최고점 코발트 외곽 링, 주의점 코퍼 외곽 링을 사용하고 점수 숫자의 대비를 4.5:1 이상 확보한다.

- [ ] **Step 5: PWA 메타 색상 갱신**

`vite.config.ts` manifest name은 `잔상 별자리 · Jansang Star`, short name은 `잔상별자리`, description은 `Detailed bilingual natal chart and horoscope · 한영 별자리 만세력`, `theme_color: '#11100E'`, `background_color: '#F3EFE7'`로 바꾼다. `cleanupOutdatedCaches`, `skipWaiting`, `clientsClaim`, WASM/data glob과 `/jansang-star/` base는 그대로 둔다.

- [ ] **Step 6: 스타일 테스트·차트 테스트·빌드 실행**

Run: `npm test -- --run src/styles/atelierVisual.test.ts src/features/chart src/features/results`

Run: `npm run build`

Expected: palette and old-color scan, chart hierarchy, result tests PASS; build exits 0.

- [ ] **Step 7: 커밋**

```powershell
git add src/styles src/features/profile/BirthForm.css src/features/results/results.css src/features/chart vite.config.ts
git commit -m "feat: apply celestial atelier visual system"
```

### Task 10: 번역 완전성·키보드·통합 회귀 검증

**Files:**
- Create: `src/i18n/translationCoverage.test.ts`
- Modify: `src/App.e2e.test.tsx`
- Modify: `src/features/results/ResultsPage.test.tsx`
- Modify: `src/features/profile/BirthForm.test.tsx`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: completed UI and translation maps.
- Produces: automated proof of complete two-language flow, state preservation and single-worktree test discovery.

- [ ] **Step 1: 번역 key·빈 문자열·fallback 방지 테스트 작성**

```ts
it('has a non-empty authored value for every UI key in both languages', () => {
  const keys = Object.keys(TRANSLATIONS.ko) as TranslationKey[];
  expect(keys.sort()).toEqual(Object.keys(TRANSLATIONS.en).sort());
  for (const key of keys) {
    expect(TRANSLATIONS.ko[key].trim(), `ko:${key}`).not.toBe('');
    expect(TRANSLATIONS.en[key].trim(), `en:${key}`).not.toBe('');
  }
});
```

상세 풀이·일간·기간 copy map에도 동일한 parity 테스트를 적용하고 missing key일 때 production에서 다른 언어로 대체하지 않고 현재 locale의 일반 안전 문구를 사용한다.

- [ ] **Step 2: 실제 계산 통합 테스트를 한국어·영어로 확장**

기존 서울 `1990-08-05 14:30` 흐름을 유지한다. 한국어 브라우저에서는 `김별님의 코스믹 리포트`, 영어로 전환하면 `김별's cosmic report`, 같은 `FLOW SCORE`, 같은 strongest/softest 점수, 같은 행성·오브 근거를 확인한다. 숫자 `19900805` 입력도 같은 테스트에서 검증한다.

- [ ] **Step 3: 키보드와 상태 회귀 테스트 작성**

`Tab`으로 LanguageSwitch, 기간 탭, 상세 장 버튼에 접근하고 Enter/Space로 작동하는지 확인한다. `aria-selected`, `aria-pressed`, `aria-expanded`, SVG title, 표 caption/label, loader `aria-live`를 검사한다. 언어 변경 뒤 프로필 입력, 결과 객체, 기간 선택, 펼친 장이 그대로인지 검증한다.

- [ ] **Step 4: 중첩 worktree 테스트 중복 제외**

`vite.config.ts`의 test 설정에 아래를 추가해 현재 저장소의 테스트만 한 번 실행한다.

```ts
exclude: ['**/.worktrees/**', '**/node_modules/**', '**/dist/**'],
```

- [ ] **Step 5: 전체 자동 검증**

Run: `npm test -- --run`

Expected: every test file runs once; all tests PASS.

Run: `npm run build -- --mode pages`

Expected: TypeScript strict check and Pages PWA build exit 0; `dist/wasm/swisseph.wasm` and `dist/wasm/swisseph.data` exist.

- [ ] **Step 6: 커밋**

```powershell
git add src/i18n/translationCoverage.test.ts src/App.e2e.test.tsx src/features/results/ResultsPage.test.tsx src/features/profile/BirthForm.test.tsx vite.config.ts
git commit -m "test: cover bilingual report state and accessibility"
```

### Task 11: 실제 모바일·데스크톱 시각 검수와 문서화

**Files:**
- Modify: `README.md`
- Verify only: `work/qa/atelier-ko-mobile.png`
- Verify only: `work/qa/atelier-en-mobile.png`
- Verify only: `work/qa/atelier-ko-desktop.png`
- Verify only: `work/qa/atelier-en-desktop.png`

**Interfaces:**
- Consumes: production Pages build served locally.
- Produces: four viewport captures, visual checklist result, updated usage/deployment documentation.

- [ ] **Step 1: 실행 시 `playwright` skill을 읽고 production preview 시작**

Run: `npm run build -- --mode pages`

Run in a persistent terminal: `npm run preview -- --host 127.0.0.1 --port 4173`

Open: `http://127.0.0.1:4173/jansang-star/`

- [ ] **Step 2: 한국어·영어 모바일 검수**

390×844에서 한국어 브라우저로 첫 언어가 한국어인지 확인하고 `김별 / 19900805 / 14:30 / 서울`로 계산한다. 차트 링·글리프 겹침, 16px 외곽 여백, 44px 컨트롤, 68ch 이하 본문, sticky 기간 탭, 아코디언, 월간/연간 선 그래프, 가로 스크롤 부재를 확인하고 `work/qa/atelier-ko-mobile.png`를 저장한다. EN으로 바꾸어 이름·점수·기간·열린 장이 유지되는지 확인하고 `work/qa/atelier-en-mobile.png`를 저장한다.

- [ ] **Step 3: 한국어·영어 데스크톱 검수**

1440×1000에서 1120px 레일의 좌우 경계가 히어로·기간 탭·모든 장에서 일치하는지, 아이보리·옵시디언 교차가 장문을 구분하는지, chart/flow 선 두께와 코발트·코퍼 의미가 범례와 맞는지 확인한다. 한국어·영어 전체 페이지를 각각 `work/qa/atelier-ko-desktop.png`, `work/qa/atelier-en-desktop.png`로 저장한다.

- [ ] **Step 4: 브라우저 동작·콘솔·네트워크 검수**

네 화면에서 console error 0건, `swisseph.wasm` 200, `swisseph.data` 200, manifest 200을 확인한다. 한국어/영어 모두 오늘·이번 달·올해를 전환하고 각 기간의 요구 문장 수와 최고/주의 구간을 눈으로 대조한다. 출생시간 미상 프로필도 한 번 계산해 상승궁·하우스가 생성되지 않고 현재 언어의 안내가 표시되는지 확인한다.

- [ ] **Step 5: README를 현재 제품에 맞게 갱신**

README에 `Live`, `Features`, `Local verification`, `Deployment` 네 섹션을 두고 공개 URL, 자동 언어 감지와 수동 `한 / EN`, 전체 상세 풀이 범위, `npm test -- --run`, `npm run build -- --mode pages`, GPL/Swiss Ephemeris 고지를 기록한다. QA 캡처 경로는 로컬 검수 산출물이므로 저장소에 add하지 않는다.

- [ ] **Step 6: 자동 검증과 문서 커밋**

Run: `npm test -- --run`

Run: `npm run build -- --mode pages`

Expected: all tests PASS and Pages build exits 0.

```powershell
git add README.md
git commit -m "docs: describe bilingual celestial atelier release"
```

### Task 12: GitHub Pages 배포·PWA 캐시 교체·공개 URL 검증

**Files:**
- Verify: Git source branch `main`
- Publish: generated `dist/` to remote branch `gh-pages`
- Verify: `https://jansang18.github.io/jansang-star/`

**Interfaces:**
- Consumes: clean committed source and passing Pages build.
- Produces: live bilingual Celestial Atelier release with refreshed service-worker cache.

- [ ] **Step 1: 배포 직전 저장소 범위 확인**

Run: `git status --short`

Expected: tracked files clean; `.codex-remote-attachments/` may remain untracked and must not be staged; `.worktrees/visionos-redesign/` remains untouched.

Run: `git log -8 --oneline`

Expected: Tasks 1–11 commits are present on `main`.

- [ ] **Step 2: 최종 테스트와 Pages build**

Run: `npm test -- --run`

Expected: all tests PASS once.

Run: `npm run build -- --mode pages`

Expected: build exits 0; generated asset URLs use `/jansang-star/`; service worker contains the new hashed JS/CSS precache entries.

- [ ] **Step 3: source와 static Pages branch 게시**

```powershell
git push pages main
npx --yes gh-pages -d dist -b gh-pages -r https://github.com/jansang18/jansang-star.git
gh api --method POST repos/jansang18/jansang-star/pages/builds
```

Expected: source push succeeds, gh-pages reports `Published`, Pages build request returns successfully.

- [ ] **Step 4: Pages build 완료까지 확인**

Run repeatedly with short intervals: `gh api repos/jansang18/jansang-star/pages/builds/latest`

Expected: latest build status becomes `built` and its commit matches the new `gh-pages` tip.

- [ ] **Step 5: 공개 자산과 캐시 갱신 확인**

Open `https://jansang18.github.io/jansang-star/` in a fresh browser context. Confirm document 200, manifest 200, service worker 200, WASM 200 and data 200. Reload once after service-worker activation and confirm the page still references the newest hashed JS/CSS, with no purple legacy palette or stale Korean-only bundle.

- [ ] **Step 6: 공개 제품 최종 사용자 흐름 확인**

한국어 브라우저에서 첫 언어 한국어, 영어 브라우저에서 첫 언어 영어를 확인한다. `한 / EN`을 바꾸고 새로고침해 수동 선택이 유지되는지 확인한다. 숫자 생년월일, 서울 계산, 차트, 상세 리포트, 오늘·이번 달·올해, 최고/주의 그래프, 출생정보 수정 복귀를 모두 실행하고 console error 0건을 확인한다.

- [ ] **Step 7: 배포 증거 기록**

최종 handoff에는 source commit SHA, gh-pages commit SHA, Pages build status, live URL, 테스트 개수, 모바일/데스크톱 및 두 언어 검증 결과, PWA 캐시 교체 결과를 적는다.
