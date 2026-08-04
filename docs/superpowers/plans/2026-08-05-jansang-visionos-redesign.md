# 잔상 별자리 visionOS 재디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 점성술 계산을 보존하면서 모든 화면 폭을 통일하고, visionOS 공간 재질과 읽기 쉬운 발광 차트, 근거 기반 장문 운세를 적용한 뒤 `jansang18.github.io/jansang-star/`에 배포한다.

**Architecture:** 계산 엔진과 UI 경계를 유지한다. 운세 엔진은 구조화된 문장 역할 배열을 반환하고 결과 컴포넌트가 이를 문단으로 렌더링한다. 디자인은 공통 레일·재질 토큰을 기반으로 하며 SVG 차트는 실제 중심선과 장식용 발광 복제선을 분리한다.

**Tech Stack:** React 19.2.8, TypeScript 7.0.2, Vite 8.2.0, Vitest 4.1.10, SVG, CSS, GitHub Actions, GitHub Pages

## Global Constraints

- 천체 계산, 열대황도, 플라시두스, 로컬 저장과 PWA 동작은 변경하지 않는다.
- 데스크톱 공통 레일은 정확히 `1120px`, 모바일 공통 여백은 `16px`이다.
- 배경은 visionOS 계열의 깊은 우주 공간이며 실제 본문은 WCAG AA 명암비를 충족한다.
- 텍스트와 실제 차트 중심선에는 blur를 적용하지 않는다.
- 황도 링 2.25px, 보조 링 1.25px, 하우스 0.9px, ASC·MC 2px, 애스펙트 0.75~1.75px 기준을 사용한다.
- 종합운은 5~7문장, 나머지 네 분야는 각각 3~5문장이다.
- 결과 상단에서 `오늘`, `이번 달`, `올해`를 세그먼트 선택기로 전환한다.
- 월간은 5개 날짜 표본과 주차별 흐름, 연간은 12개 월 표본과 분기별 흐름을 사용한다.
- 동일한 차트와 현지 날짜는 동일한 운세를 반환한다.
- 배포 대상은 공개 독립 저장소 `jansang18/jansang-star`, 공개 주소는 `https://jansang18.github.io/jansang-star/`이다.

---

### Task 1: 근거 기반 장문 운세 엔진

**Files:**
- Modify: `src/features/fortune/copy.ko.ts`
- Modify: `src/features/fortune/generateFortune.ts`
- Modify: `src/features/fortune/generateFortune.test.ts`
- Modify: `src/features/results/DailyFortuneSection.tsx`
- Modify: `src/features/results/CosmicWeather.tsx`

**Interfaces:**
- Consumes: `NatalChartData`, `TransitData`, 날짜
- Produces: `CategoryFortune { label, score, summary, paragraphs, signals }`, `generateDailyFortune(...): DailyFortune`

- [ ] **Step 1: 장문 운세 실패 테스트 작성**

```ts
it('builds long deterministic fortunes with evidence and advice', () => {
  const result = generateDailyFortune(chart, transits, '2026-08-05');
  expect(result.categories.overall.paragraphs.join(' ').split(/[.!?요다]\s*/).filter(Boolean).length).toBeGreaterThanOrEqual(5);
  for (const key of ['love', 'money', 'career', 'health'] as const) {
    expect(result.categories[key].paragraphs).toHaveLength(3);
    expect(result.categories[key].signals.length).toBeGreaterThan(0);
  }
  expect(result).toEqual(generateDailyFortune(chart, transits, '2026-08-05'));
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/fortune/generateFortune.test.ts`

Expected: FAIL because `paragraphs` and `signals` do not exist.

- [ ] **Step 3: 문장 역할 템플릿과 조합 구현**

```ts
export type CategoryFortune = {
  label: string;
  score: number;
  summary: string;
  paragraphs: string[];
  signals: string[];
};
```

분야별로 `evidence`, `experience`, `opportunity`, `caution`, `action` 템플릿을 분리한다. 정확한 상위 트랜짓의 행성명·애스펙트명·오브를 `signals`로 만들고, 종합운은 세 문단에 총 5~7문장, 나머지는 세 문단에 총 3~5문장을 배치한다. 신호가 없을 때만 검수된 중립 근거를 사용한다.

- [ ] **Step 4: 결과 컴포넌트에서 근거 칩과 문단 렌더링**

```tsx
<div className="signal-row">{category.signals.map((signal) => <span key={signal}>{signal}</span>)}</div>
{category.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
```

- [ ] **Step 5: 테스트와 빌드 확인**

Run: `npm test -- --run src/features/fortune src/features/results && npm run build`

Expected: fortune and result tests PASS; build exits 0.

- [ ] **Step 6: 커밋**

```bash
git add src/features/fortune src/features/results
git commit -m "feat: expand deterministic daily fortunes"
```

### Task 2: 월간·연간 운세와 기간 선택기

**Files:**
- Modify: `src/features/fortune/transits.ts`
- Create: `src/features/fortune/periodFortune.ts`
- Create: `src/features/fortune/periodFortune.test.ts`
- Create: `src/features/results/PeriodSelector.tsx`
- Create: `src/features/results/PeriodFortuneSection.tsx`
- Modify: `src/features/results/ResultsPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/features/results/ResultsPage.test.tsx`

**Interfaces:**
- Consumes: `NatalChartData`, `BirthProfile`, 현지 연월
- Produces: `calculateMonthlyTransits(...)`, `calculateYearlyTransits(...)`, `generatePeriodFortune(...): PeriodFortune`, `<PeriodSelector value onChange />`

- [ ] **Step 1: 기간 운세 실패 테스트 작성**

```ts
it('creates deterministic monthly and yearly timelines', () => {
  const monthly = generatePeriodFortune(chart, monthlySamples, '2026-08', 'month');
  const yearly = generatePeriodFortune(chart, yearlySamples, '2026', 'year');
  expect(monthly.timeline).toHaveLength(5);
  expect(yearly.timeline).toHaveLength(4);
  expect(monthly).toEqual(generatePeriodFortune(chart, monthlySamples, '2026-08', 'month'));
  expect(yearly.categories.overall.paragraphs.length).toBeGreaterThanOrEqual(3);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/fortune/periodFortune.test.ts`

Expected: FAIL because period fortune functions do not exist.

- [ ] **Step 3: 트랜짓 표본과 기간 집계 구현**

월간은 1일, 8일, 15일, 22일, 말일의 다섯 표본을 계산한다. 연간은 매월 15일의 12표본을 계산한다. `PeriodFortune`은 `kind`, `periodKey`, `headline`, `categories`, `timeline`, `opportunityWindows`, `cautionWindows`를 반환한다. 연간 `timeline`은 3개월씩 네 분기로 집계한다.

- [ ] **Step 4: Apple식 기간 선택기와 결과 화면 구현**

```tsx
<div role="tablist" aria-label="운세 기간">
  {(['today', 'month', 'year'] as const).map((period) =>
    <button role="tab" aria-selected={value === period} onClick={() => onChange(period)}>{labels[period]}</button>
  )}
</div>
```

오늘은 기존 일일 섹션을, 이번 달과 올해는 `PeriodFortuneSection`을 표시한다. 선택기는 결과 히어로 아래에서 전체 레일 폭을 사용하며 키보드 좌우 이동을 지원한다.

- [ ] **Step 5: 기간 테스트와 전체 계산 흐름 확인**

Run: `npm test -- --run src/features/fortune src/features/results src/App.e2e.test.tsx && npm run build`

Expected: period, result, end-to-end tests PASS; build exits 0.

- [ ] **Step 6: 커밋**

```bash
git add src/App.tsx src/features/fortune src/features/results
git commit -m "feat: add monthly and yearly zodiac fortunes"
```

### Task 3: 공통 레일과 visionOS 재질 체계

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `src/features/profile/BirthForm.css`
- Modify: `src/features/results/results.css`
- Create: `src/styles/layout.test.ts`

**Interfaces:**
- Consumes: 기존 클래스명
- Produces: `--content-rail: 1120px`, `--page-gutter: clamp(16px, 4vw, 40px)`, 공통 `.content-rail` 규칙과 공간 재질 토큰

- [ ] **Step 1: 폭 토큰 실패 테스트 작성**

```ts
import tokens from './tokens.css?raw';
import results from '../features/results/results.css?raw';

it('uses one shared rail for hero and result content', () => {
  expect(tokens).toContain('--content-rail: 1120px');
  expect(tokens).toContain('--page-gutter: clamp(16px, 4vw, 40px)');
  expect(results).not.toMatch(/min\(1040px|min\(1120px/);
  expect(results).toContain('var(--content-rail)');
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/styles/layout.test.ts`

Expected: FAIL because shared tokens are missing and result widths differ.

- [ ] **Step 3: 공통 레일과 공간 배경 구현**

`tokens.css`에 우주색, 전경색, 세 단계 재질, 광원, 공통 레일을 정의한다. `global.css`, `BirthForm.css`, `results.css`의 외곽 컨테이너는 `width: min(var(--content-rail), calc(100% - 2 * var(--page-gutter)))`를 사용한다. 결과 히어로와 콘텐츠의 기존 1120px·1040px 개별 값을 제거한다.

- [ ] **Step 4: Apple식 피드백과 접근성 미디어 쿼리 구현**

버튼 `:active`에 즉시 scale 0.97을 적용한다. `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more`에서 각각 이동 제거, 불투명 재질, 강화된 테두리를 적용한다.

- [ ] **Step 5: 테스트와 빌드 확인**

Run: `npm test -- --run src/styles/layout.test.ts src/App.test.tsx && npm run build`

Expected: tests PASS; build exits 0.

- [ ] **Step 6: 커밋**

```bash
git add src/styles src/features/profile/BirthForm.css src/features/results/results.css
git commit -m "feat: apply visionos spatial material system"
```

### Task 4: 두께와 깊이가 읽히는 SVG 출생 차트

**Files:**
- Modify: `src/features/chart/NatalChart.tsx`
- Modify: `src/features/chart/NatalChart.css`
- Modify: `src/features/chart/NatalChart.test.tsx`

**Interfaces:**
- Consumes: `NatalChartData`, `Aspect[]`
- Produces: 실제 선 `.chart-core-line`, 장식 복제선 `.chart-glow-line`, 행성 노드 `.planet-node`, 범례 `.aspect-legend`

- [ ] **Step 1: 차트 계층 실패 테스트 작성**

```tsx
it('separates crisp chart lines from decorative glow layers', () => {
  const { container } = render(<NatalChart chart={chart} />);
  expect(container.querySelectorAll('.chart-core-line').length).toBeGreaterThan(12);
  expect(container.querySelectorAll('.chart-glow-line').length).toBeGreaterThan(0);
  expect(container.querySelector('.aspect-legend')).toBeInTheDocument();
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/features/chart`

Expected: FAIL because chart layer classes and legend are missing.

- [ ] **Step 3: SVG 중심선·발광 복제선·행성 노드 구현**

각 주요 경로를 발광 복제선과 실제 중심선 순서로 렌더링한다. 애스펙트 선 굵기는 `0.75 + exactness`로 계산해 최대 1.75px로 제한한다. 조화 애스펙트는 실선, 긴장 애스펙트는 `strokeDasharray="3 2"`를 함께 사용한다. 행성 노드는 외곽 광원 원, 불투명 본체 원, 글리프의 세 레이어로 나눈다.

- [ ] **Step 4: 범례와 모바일 충돌 방지 구현**

SVG 아래 범례에 조화·긴장·ASC/MC 의미를 표시한다. 행성 반지름을 인접 각도 차이에 따라 94, 106, 118px 중 선택하고 CSS에서 모바일 노드 크기 최소 28px를 유지한다.

- [ ] **Step 5: 테스트와 빌드 확인**

Run: `npm test -- --run src/features/chart && npm run build`

Expected: chart tests PASS; build exits 0.

- [ ] **Step 6: 커밋**

```bash
git add src/features/chart
git commit -m "feat: add legible depth to natal chart"
```

### Task 5: 결과 화면 공간 위계와 실제 시각 검증

**Files:**
- Modify: `src/features/results/ResultsPage.tsx`
- Modify: `src/features/results/BigThreeSummary.tsx`
- Modify: `src/features/results/PlacementSection.tsx`
- Modify: `src/features/results/HouseSection.tsx`
- Modify: `src/features/results/AspectSection.tsx`
- Modify: `src/features/results/LuckyGuide.tsx`
- Modify: `src/features/results/results.css`
- Modify: `src/App.e2e.test.tsx`

**Interfaces:**
- Consumes: 장문 `DailyFortune`, 기존 결과 데이터
- Produces: 동일 레일의 visionOS 결과 페이지와 회귀 검증

- [ ] **Step 1: 장문 결과 흐름 테스트 확장**

```tsx
expect(screen.getByText('천체 근거')).toBeInTheDocument();
expect(screen.getAllByTestId('fortune-paragraph').length).toBeGreaterThanOrEqual(15);
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/App.e2e.test.tsx src/features/results`

Expected: FAIL until long-form result markup is present.

- [ ] **Step 3: 결과 재질과 정보 위계 구현**

히어로는 가장 두꺼운 재질, 일반 섹션은 중간 재질, 내부 항목은 단색 반투명 표면을 사용한다. 모든 섹션의 외곽선을 통일하고 작은 카드는 중첩 backdrop blur를 제거한다. 운세 문단은 한 줄 최대 70자로 제한하고 문단 간격을 0.75rem 이상 확보한다.

- [ ] **Step 4: 전체 자동 검증**

Run: `npm test -- --run && npm run build`

Expected: all tests PASS; PWA build exits 0.

- [ ] **Step 5: 실제 브라우저 시각 검증**

390×844와 1440×1000에서 실제 서울 기준 차트를 계산한다. 전체 페이지를 캡처해 공통 외곽 정렬, 선명한 차트 중심선, 글자 잘림, 장문 문단 폭, 콘솔 오류 0건을 확인한다.

- [ ] **Step 6: 커밋**

```bash
git add src
git commit -m "feat: refine spatial zodiac result experience"
```

### Task 6: 독립 GitHub Pages 배포

**Files:**
- Modify: `vite.config.ts`
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`
- Test: `src/deployment.test.ts`

**Interfaces:**
- Consumes: GitHub Actions 환경 변수
- Produces: Actions에서만 `base: '/jansang-star/'`, Pages 배포 워크플로, 공개 저장소

- [ ] **Step 1: 배포 경로 실패 테스트 작성**

```ts
import workflow from '../.github/workflows/deploy-pages.yml?raw';
import viteConfig from '../vite.config.ts?raw';

it('configures the independent Pages path and deployment workflow', () => {
  expect(viteConfig).toContain("'/jansang-star/'");
  expect(workflow).toContain('actions/deploy-pages');
  expect(workflow).toContain('npm test -- --run');
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- --run src/deployment.test.ts`

Expected: FAIL because workflow and Pages base are missing.

- [ ] **Step 3: Vite base와 Pages Actions 구현**

`vite.config.ts`는 `process.env.GITHUB_ACTIONS ? '/jansang-star/' : '/'`를 사용한다. 워크플로는 checkout, Node 24, `npm ci`, `npm test -- --run`, `npm run build`, `upload-pages-artifact`, `deploy-pages` 순서로 실행하며 `pages: write`, `id-token: write` 권한과 `github-pages` environment를 선언한다.

- [ ] **Step 4: 로컬 배포 빌드 검증**

Run: `$env:GITHUB_ACTIONS='true'; npm run build; Remove-Item Env:GITHUB_ACTIONS`

Expected: `dist/index.html` asset URLs begin with `/jansang-star/`; build exits 0.

- [ ] **Step 5: 전체 커밋과 공개 저장소 생성**

```bash
git add vite.config.ts .github README.md src/deployment.test.ts
git commit -m "ci: deploy jansang star to github pages"
gh repo create jansang18/jansang-star --public --description "잔상 별자리 - visionOS 스타일 별자리 만세력" --source . --remote pages --push
```

- [ ] **Step 6: Pages workflow 활성화와 배포 대기**

Pages가 없으면 `gh api --method POST repos/jansang18/jansang-star/pages -f build_type=workflow`을 호출하고, 이미 있으면 `gh api --method PUT repos/jansang18/jansang-star/pages -f build_type=workflow`을 호출한다. Actions 실행 ID를 조회해 완료될 때까지 기다린다.

- [ ] **Step 7: 공개 URL 실제 검증**

`https://jansang18.github.io/jansang-star/`에서 HTTP 200, manifest, WASM, 서울 출생정보 계산, 직접 새로고침, 모바일·데스크톱 화면과 콘솔 오류 0건을 확인한다.
