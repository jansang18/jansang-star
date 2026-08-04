# 잔상 별자리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 생년월일·출생시간·출생지역으로 열대황도·플라시두스 출생 차트를 계산하고 오늘의 트랜짓 운세를 세로형 결과표로 보여주는 고품질 PWA를 만든다.

**Architecture:** React UI와 순수 TypeScript 점성술 도메인을 분리한다. `swisseph-wasm` 어댑터가 천체·하우스 계산을 담당하고, 애스펙트·트랜짓·문장 조합은 독립된 결정론적 엔진으로 처리한다. 모든 입력과 결과는 브라우저 안에서 계산하고 저장한다.

**Tech Stack:** React 19.2.8, TypeScript 6.0.5, Vite 8.2.0, Vitest 4.1.10, Testing Library 16.3.2, `swisseph-wasm` 0.1.0, `@js-temporal/polyfill` 0.5.1, `vite-plugin-pwa` 1.3.0, SVG, CSS

## Global Constraints

- 브랜드명은 `잔상 별자리`, 문구는 `태어난 순간의 별빛은 오늘도 잔상을 남깁니다.`를 사용한다.
- 계산 체계는 열대황도와 플라시두스 하우스로 고정한다.
- 출생시간 미상일 때 ASC, MC, 하우스를 임의 생성하지 않는다.
- 동일한 차트와 현지 날짜에는 동일한 점수와 문장을 반환한다.
- 유료 AI, 계정, 서버 데이터베이스, 결제, 궁합, 월간·연간 운세는 포함하지 않는다.
- 원시 출생정보는 외부 서버로 전송하지 않고 브라우저 저장소에만 보관한다.
- 장식 모션은 `prefers-reduced-motion`에서 정지한다.
- `swisseph-wasm`과 Swiss Ephemeris의 라이선스 고지를 포함한다. 상업 배포 전에는 Astrodienst 라이선스를 별도 검토한다.

---

### Task 1: 프로젝트 기반과 브랜드 셸

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: 없음
- Produces: `App(): JSX.Element`, 전역 디자인 토큰, `npm test`, `npm run build`

- [ ] **Step 1: 브랜드 셸 실패 테스트 작성**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows the approved brand and birth chart call to action', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '잔상 별자리' })).toBeInTheDocument();
    expect(screen.getByText('태어난 순간의 별빛은 오늘도 잔상을 남깁니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '나의 별자리 만세력 보기' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 환경 설치 후 실패 확인**

Run: `npm install && npm test -- --run src/App.test.tsx`

Expected: FAIL because `src/App.tsx` does not exist.

- [ ] **Step 3: 최소 브랜드 셸과 디자인 토큰 구현**

`App.tsx`는 `<main>`, 브랜드 제목, 승인 문구, CTA 버튼을 렌더링한다. `tokens.css`에는 `--sky`, `--lavender`, `--peach`, `--violet`, `--ink`, `--muted`, `--glass`를 정의하고 `global.css`에는 모바일 우선 레이아웃, 포커스 링, 기본 타이포그래피를 둔다.

- [ ] **Step 4: 테스트와 빌드 통과 확인**

Run: `npm test -- --run src/App.test.tsx && npm run build`

Expected: 1 test PASS and Vite build exits 0.

- [ ] **Step 5: 커밋**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json index.html src
git commit -m "feat: scaffold jansang zodiac web app"
```

### Task 2: 출생 프로필과 시간대 변환

**Files:**
- Create: `src/features/profile/types.ts`
- Create: `src/features/profile/cities.ts`
- Create: `src/features/profile/time.ts`
- Create: `src/features/profile/validate.ts`
- Test: `src/features/profile/time.test.ts`
- Test: `src/features/profile/validate.test.ts`

**Interfaces:**
- Consumes: `Temporal` from `@js-temporal/polyfill`
- Produces: `BirthProfile`, `City`, `toUtcBirthInstant(profile): Temporal.Instant`, `validateBirthProfile(profile): ValidationErrors`

- [ ] **Step 1: 시간대와 검증 실패 테스트 작성**

```ts
it('converts a Seoul birth time to UTC', () => {
  expect(toUtcBirthInstant(profile('1990-08-05', '14:30', 'Asia/Seoul')).toString())
    .toBe('1990-08-05T05:30:00Z');
});

it('rejects a future birth date and missing city selection', () => {
  const errors = validateBirthProfile({ ...validProfile, date: '2999-01-01', cityId: '' });
  expect(errors.date).toBeDefined();
  expect(errors.cityId).toBeDefined();
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/profile/time.test.ts src/features/profile/validate.test.ts`

Expected: FAIL with missing modules.

- [ ] **Step 3: 타입, 도시 목록, 변환과 검증 구현**

```ts
export type BirthProfile = {
  displayName: string;
  date: string;
  time: string;
  timeKnown: boolean;
  cityId: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

export type City = {
  id: string;
  nameKo: string;
  countryKo: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};
```

도시 목록에는 서울, 부산, 대구, 인천, 광주, 대전, 울산, 제주와 도쿄, 베이징, 뉴욕, 로스앤젤레스, 런던, 파리, 시드니를 포함한다. 목록에 없는 장소는 위도·경도·IANA 시간대를 직접 입력하는 `custom` 도시 모드를 제공한다. `Temporal.ZonedDateTime.from`으로 역사적 UTC 오프셋을 적용하고, 일광절약시간 중복 시각은 `earlier` 또는 `later` 선택값으로 구분한다.

- [ ] **Step 4: 경계 테스트 통과 확인**

Run: `npm test -- --run src/features/profile`

Expected: profile tests PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/features/profile
git commit -m "feat: add birth profile and timezone conversion"
```

### Task 3: Swiss Ephemeris 계산 어댑터

**Files:**
- Create: `src/features/astrology/types.ts`
- Create: `src/features/astrology/constants.ts`
- Create: `src/features/astrology/swissEphemeris.ts`
- Create: `src/features/astrology/zodiac.ts`
- Test: `src/features/astrology/zodiac.test.ts`
- Test: `src/features/astrology/swissEphemeris.test.ts`

**Interfaces:**
- Consumes: `BirthProfile`, `toUtcBirthInstant`
- Produces: `initializeEphemeris(): Promise<void>`, `calculateNatalChart(profile): Promise<NatalChartData>`, `longitudeToZodiac(longitude): ZodiacPosition`

- [ ] **Step 1: 황도 변환과 기준 차트 실패 테스트 작성**

```ts
it('maps exact zodiac boundaries without wrapping errors', () => {
  expect(longitudeToZodiac(0)).toMatchObject({ sign: '양자리', degree: 0 });
  expect(longitudeToZodiac(359.9)).toMatchObject({ sign: '물고기자리' });
});

it('calculates the Sun in Leo for the reference birth', async () => {
  const chart = await calculateNatalChart(seoulReferenceProfile);
  expect(chart.planets.sun.sign).toBe('사자자리');
  expect(chart.houseSystem).toBe('P');
  expect(chart.houses).toHaveLength(12);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/astrology/zodiac.test.ts src/features/astrology/swissEphemeris.test.ts`

Expected: FAIL with missing calculator.

- [ ] **Step 3: 구조화 타입과 계산 구현**

```ts
export type PlanetPosition = {
  id: PlanetId;
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
};
```

`swisseph-wasm`을 한 번만 비동기 초기화하고, `calc_ut`로 10개 행성 황경을 계산한다. 출생시간을 아는 경우 `houses` 계열 API에 위도·경도와 `P`를 전달해 12 커스프, ASC, MC를 계산한다. 모듈 초기화 실패는 `EphemerisInitializationError`로 변환한다.

- [ ] **Step 4: 단위 테스트와 WASM 번들 확인**

Run: `npm test -- --run src/features/astrology && npm run build`

Expected: astrology tests PASS and build includes the WASM asset.

- [ ] **Step 5: 커밋**

```bash
git add src/features/astrology vite.config.ts
git commit -m "feat: calculate tropical placidus natal charts"
```

### Task 4: 애스펙트, 트랜짓, 결정론적 운세

**Files:**
- Create: `src/features/fortune/aspects.ts`
- Create: `src/features/fortune/transits.ts`
- Create: `src/features/fortune/rules.ts`
- Create: `src/features/fortune/copy.ko.ts`
- Create: `src/features/fortune/generateFortune.ts`
- Test: `src/features/fortune/aspects.test.ts`
- Test: `src/features/fortune/generateFortune.test.ts`

**Interfaces:**
- Consumes: `NatalChartData`, 현지 날짜, 트랜짓 행성 위치
- Produces: `findAspects(a, b): Aspect[]`, `calculateDailyTransits(chart, date, timeZone): Promise<TransitData>`, `generateDailyFortune(chart, transits, date): DailyFortune`

- [ ] **Step 1: 오브와 결정성 실패 테스트 작성**

```ts
it('detects conjunction across the zero degree boundary', () => {
  expect(findAspect(359, 1, { conjunction: 4 })?.type).toBe('conjunction');
});

it('returns identical fortune for identical chart and date', () => {
  expect(generateDailyFortune(chart, transits, '2026-08-05'))
    .toEqual(generateDailyFortune(chart, transits, '2026-08-05'));
});

it('keeps all category scores between 0 and 100', () => {
  const result = generateDailyFortune(chart, transits, '2026-08-05');
  Object.values(result.categories).forEach((category) => {
    expect(category.score).toBeGreaterThanOrEqual(0);
    expect(category.score).toBeLessThanOrEqual(100);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/fortune`

Expected: FAIL with missing aspect and fortune functions.

- [ ] **Step 3: 애스펙트와 규칙 엔진 구현**

합 8°, 충 8°, 삼분 7°, 사각 7°, 육분 5°를 기본 오브로 사용한다. 빠른 행성의 적용 여부, 행성 가중치, 영향을 받는 출생 행성의 분야 매핑으로 `overall`, `love`, `money`, `career`, `health` 점수를 만든다. 날짜와 차트 황경을 해시해 같은 점수대 안에서 문장, 행운색, 숫자, 시간을 결정한다.

- [ ] **Step 4: 결정성과 경계 테스트 통과 확인**

Run: `npm test -- --run src/features/fortune`

Expected: fortune tests PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/features/fortune
git commit -m "feat: generate deterministic transit fortunes"
```

### Task 5: 입력 경험과 기기 내 저장

**Files:**
- Create: `src/features/profile/BirthForm.tsx`
- Create: `src/features/profile/CityCombobox.tsx`
- Create: `src/features/profile/profileStore.ts`
- Create: `src/features/profile/BirthForm.css`
- Test: `src/features/profile/BirthForm.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `BirthProfile`, `City[]`, `validateBirthProfile`
- Produces: `<BirthForm onSubmit={(profile) => void} />`, `saveProfile`, `loadProfile`, `clearProfile`

- [ ] **Step 1: 폼 동작 실패 테스트 작성**

```tsx
it('requires a selected city before calculation', async () => {
  render(<BirthForm onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: '별자리 만세력 계산하기' }));
  expect(screen.getByText('출생지역을 선택해 주세요.')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/profile/BirthForm.test.tsx`

Expected: FAIL because the form is missing.

- [ ] **Step 3: 접근 가능한 폼과 저장 구현**

모든 필드에 영구 라벨을 제공한다. 도시 자동완성은 키보드 위·아래·Enter·Escape를 지원하고 국가명을 함께 표시한다. ‘목록에 없는 장소’를 선택하면 위도·경도·IANA 시간대 고급 입력을 펼친다. `timeKnown=false`이면 시간 입력을 비활성화하고 제한 결과 설명을 노출한다. 저장 키는 `jansang-zodiac.profile.v1`로 고정한다.

- [ ] **Step 4: 폼 테스트 통과 확인**

Run: `npm test -- --run src/features/profile`

Expected: profile tests PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/App.tsx src/features/profile
git commit -m "feat: add accessible birth profile flow"
```

### Task 6: SVG 출생 차트

**Files:**
- Create: `src/features/chart/NatalChart.tsx`
- Create: `src/features/chart/geometry.ts`
- Create: `src/features/chart/NatalChart.css`
- Test: `src/features/chart/geometry.test.ts`
- Test: `src/features/chart/NatalChart.test.tsx`

**Interfaces:**
- Consumes: `NatalChartData`
- Produces: `<NatalChart chart={chart} />`, `polarPoint(angle, radius): Point`, `housePath(start, end): string`

- [ ] **Step 1: SVG 기하와 접근성 실패 테스트 작성**

```ts
it('places zero degrees at the top of the wheel', () => {
  expect(polarPoint(0, 100)).toEqual({ x: 0, y: -100 });
});
```

```tsx
it('has an accessible chart title and alternative placement table', () => {
  render(<NatalChart chart={chartFixture} />);
  expect(screen.getByRole('img', { name: '출생 차트 원형 도표' })).toBeInTheDocument();
  expect(screen.getByRole('table', { name: '행성 배치표' })).toBeInTheDocument();
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/chart`

Expected: FAIL with missing SVG component.

- [ ] **Step 3: 원형 차트와 대체 표 구현**

12별자리 링, 하우스 커스프, ASC·MC 축, 행성 글리프, 애스펙트 선을 SVG 그룹으로 나눈다. 겹치는 행성은 반지름을 교대로 배치하고 모든 색상 선에는 애스펙트 약어를 함께 제공한다.

- [ ] **Step 4: 차트 테스트와 시각 스냅샷 확인**

Run: `npm test -- --run src/features/chart && npm run build`

Expected: chart tests PASS and build exits 0.

- [ ] **Step 5: 커밋**

```bash
git add src/features/chart
git commit -m "feat: render accessible svg natal chart"
```

### Task 7: 세로형 별자리 만세력 결과 화면

**Files:**
- Create: `src/features/results/ResultsPage.tsx`
- Create: `src/features/results/BigThreeSummary.tsx`
- Create: `src/features/results/CosmicWeather.tsx`
- Create: `src/features/results/PlacementSection.tsx`
- Create: `src/features/results/HouseSection.tsx`
- Create: `src/features/results/AspectSection.tsx`
- Create: `src/features/results/DailyFortuneSection.tsx`
- Create: `src/features/results/LuckyGuide.tsx`
- Create: `src/features/results/results.css`
- Test: `src/features/results/ResultsPage.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `BirthProfile`, `NatalChartData`, `DailyFortune`, `NatalChart`
- Produces: `<ResultsPage profile={profile} chart={chart} fortune={fortune} onEdit={fn} />`

- [ ] **Step 1: 결과 섹션 실패 테스트 작성**

```tsx
it('shows the full approved vertical result order', () => {
  render(<ResultsPage profile={profile} chart={chart} fortune={fortune} onEdit={() => {}} />);
  ['태양·달·상승궁', '오늘의 코스믹 웨더', '행성 배치', '12하우스',
   '주요 애스펙트', '오늘의 트랜짓', '분야별 오늘 운세', '오늘의 행운']
    .forEach((title) => expect(screen.getByRole('heading', { name: title })).toBeInTheDocument());
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/results`

Expected: FAIL with missing result components.

- [ ] **Step 3: 결과 컴포넌트와 잔상 비주얼 구현**

상단은 파스텔 그라데이션, SVG 잔상 궤적, 유리 카드로 구성한다. 결과 섹션은 승인된 순서를 지키고 점수에는 숫자·텍스트 등급·막대를 함께 표시한다. 작은 화면은 1열, 768px 이상은 차트와 요약을 2열로 배치한다.

- [ ] **Step 4: 결과 테스트와 반응형 빌드 확인**

Run: `npm test -- --run src/features/results && npm run build`

Expected: result tests PASS and production build exits 0.

- [ ] **Step 5: 커밋**

```bash
git add src/App.tsx src/features/results
git commit -m "feat: build vertical zodiac almanac results"
```

### Task 8: PWA, 오류 상태, 라이선스와 전체 검증

**Files:**
- Create: `public/icons/icon.svg`
- Create: `src/components/AppError.tsx`
- Create: `src/components/EphemerisLoader.tsx`
- Create: `src/components/LegalNotice.tsx`
- Create: `src/App.e2e.test.tsx`
- Modify: `vite.config.ts`
- Modify: `src/App.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: 전체 앱 흐름
- Produces: 설치 가능한 PWA, 명확한 로딩·오류·라이선스 화면, 검증 명령

- [ ] **Step 1: 전체 흐름 실패 테스트 작성**

```tsx
it('calculates a saved profile and returns to edit mode', async () => {
  render(<App />);
  await fillReferenceBirth(user);
  await user.click(screen.getByRole('button', { name: '별자리 만세력 계산하기' }));
  expect(await screen.findByRole('heading', { name: /코스믹 리포트/ })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '출생정보 수정' }));
  expect(screen.getByLabelText('생년월일')).toHaveValue('1990-08-05');
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/App.e2e.test.tsx`

Expected: FAIL until loading and screen transitions are connected.

- [ ] **Step 3: PWA와 제품 상태 구현**

`vite-plugin-pwa`에 이름 `잔상 별자리`, 테마색 `#6f62d4`, 시작 URL `/`, SVG 아이콘을 설정한다. WASM 초기화 중에는 진행 상태를, 실패 시 재시도 버튼과 원인을 표시한다. 하단에 열대황도·플라시두스, 자기이해·오락 목적, GPL 및 Swiss Ephemeris 라이선스 링크를 표시한다.

- [ ] **Step 4: 전체 자동 검증 실행**

Run: `npm test -- --run && npm run build`

Expected: all tests PASS and production build exits 0.

- [ ] **Step 5: 실제 브라우저 검증**

Run: `npm run dev -- --host 127.0.0.1`

Verify at mobile and desktop widths: input, city keyboard selection, chart calculation, all result sections, edit, refresh persistence, reduced motion, install manifest, and no console errors.

- [ ] **Step 6: 문서와 최종 커밋**

```bash
git add public src vite.config.ts README.md
git commit -m "feat: finish installable jansang zodiac pwa"
```
