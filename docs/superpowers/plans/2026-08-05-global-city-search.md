# Global City Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide private, offline search across GeoNames cities15000 data with localized country names, coordinates, and IANA time zones in Korean and English.

**Architecture:** A deterministic build script converts the official GeoNames tab dump into a compact static JSON asset. A lazy loader and pure ranked-search module feed the existing ARIA combobox; selected global-city facts are persisted in `BirthProfile`, so result headings survive reloads and locale changes.

**Tech Stack:** GeoNames cities15000 (CC BY 4.0), TypeScript, React, Intl.DisplayNames, Vitest, Vite PWA/Workbox.

## Global Constraints

- Use GeoNames cities15000: population over 15,000 or capitals, approximately 25,000 records.
- Keep data and search offline; do not transmit queries or birth data.
- Search city/local/ASCII aliases, localized country name, country code, and IANA timezone.
- Rank exact, prefix, substring, then population; return at most 20 results.
- Empty English/Korean lists must show a geographically mixed featured set, never eight Korean-only rows.
- Preserve existing custom latitude/longitude/timezone entry.
- Preserve existing saved curated-city IDs and facts.

---

### Task 1: Build and attribute the world-city asset

**Files:**
- Create: `scripts/build-world-cities.mjs`
- Create: `scripts/build-world-cities.test.ts`
- Create: `public/data/world-cities.json` (generated)
- Create: `THIRD_PARTY_NOTICES.md`
- Modify: `package.json`

**Interfaces:**
- Produces: `{ source, generatedAt, cities }`, where each city tuple is `[id, name, asciiName, aliases, countryCode, latitude, longitude, timeZone, population]`.

- [ ] **Step 1: Write parser tests**

Use a two-line tab-delimited fixture and assert field mapping, Hangul/English alias retention, invalid-row rejection, deterministic population ordering, and compact tuple output.

- [ ] **Step 2: Run parser test and verify RED**

Run: `npm test -- --run scripts/build-world-cities.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the deterministic builder**

Download `https://download.geonames.org/export/dump/cities15000.zip`, extract `cities15000.txt`, parse UTF-8 tab rows, retain useful Korean/English aliases, and write minified JSON. Export parser functions so Vitest exercises real production logic.

- [ ] **Step 4: Generate and validate the asset**

Run: `npm run cities:build`

Assert at least 20,000 records, all coordinates finite, all timezones non-empty, output below 10 MB, and no duplicate IDs.

- [ ] **Step 5: Add attribution**

Document GeoNames and CC BY 4.0 in `THIRD_PARTY_NOTICES.md`, including `https://www.geonames.org/` and `https://creativecommons.org/licenses/by/4.0/`.

- [ ] **Step 6: Run tests and commit**

```bash
npm test -- --run scripts/build-world-cities.test.ts
git add scripts package.json package-lock.json public/data/world-cities.json THIRD_PARTY_NOTICES.md
git commit -m "feat: add offline world city dataset"
```

### Task 2: Add a pure localized search engine

**Files:**
- Create: `src/features/profile/worldCities.ts`
- Create: `src/features/profile/worldCities.test.ts`
- Modify: `src/features/profile/types.ts`
- Modify: `src/features/profile/cities.ts`

**Interfaces:**
- Produces: `loadWorldCities(): Promise<readonly WorldCityRecord[]>`.
- Produces: `searchWorldCities(records, query, locale, limit?): City[]`.
- Produces: `featuredWorldCities(records, locale): City[]`.
- Extends `City` and `BirthProfile` with optional `countryCode`, localized city names, and population facts required for persistence.

- [ ] **Step 1: Write failing search tests**

Cover empty mixed featured results, `London`, `런던`, `United Kingdom`, `GB`, `Europe/London`, accent-insensitive matching, exact/prefix/population ranking, 20-result cap, and country display fallback.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/features/profile/worldCities.test.ts`

Expected: FAIL because loader/search functions do not exist.

- [ ] **Step 3: Implement loader, normalization, localization, and ranking**

Fetch with `new URL('data/world-cities.json', import.meta.env.BASE_URL)`, cache the promise, normalize Unicode diacritics/case, merge curated aliases, and return existing `City`-compatible objects.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm test -- --run src/features/profile/worldCities.test.ts src/features/profile/validate.test.ts
git add src/features/profile/worldCities.ts src/features/profile/worldCities.test.ts src/features/profile/types.ts src/features/profile/cities.ts
git commit -m "feat: rank localized world city searches"
```

### Task 3: Integrate async world search into the ARIA combobox

**Files:**
- Modify: `src/features/profile/CityCombobox.tsx`
- Modify: `src/features/profile/BirthForm.tsx`
- Modify: `src/features/profile/BirthForm.test.tsx`
- Modify: `src/features/results/ResultsPage.tsx`
- Modify: `src/features/results/ResultsPage.test.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: loader/search APIs from Task 2.
- Persists: selected global city ID, localized names, country code, coordinates, and timezone in `BirthProfile`.

- [ ] **Step 1: Write failing integration tests**

Assert mixed countries on empty English focus, loading text, London search/selection, country/timezone rendering, Korean alias selection, load-error fallback, stale-selection invalidation, keyboard navigation, and global-city result heading after locale switch.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/features/profile/BirthForm.test.tsx src/features/results/ResultsPage.test.tsx`

Expected: FAIL with the current synchronous eight-city slice.

- [ ] **Step 3: Implement async combobox states and persisted city facts**

Load on first focus, use the pure search functions, reset active descendant when results change, keep the 20-row cap, and surface translated loading/error/empty messages without changing the custom-entry path.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm test -- --run src/features/profile/BirthForm.test.tsx src/features/results/ResultsPage.test.tsx src/App.e2e.test.tsx
git add src/features/profile/CityCombobox.tsx src/features/profile/BirthForm.tsx src/features/profile/BirthForm.test.tsx src/features/results/ResultsPage.tsx src/features/results/ResultsPage.test.tsx src/i18n/translations.ts
git commit -m "feat: search world cities in birth profiles"
```

### Task 4: Precache and validate the dataset

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/deploymentPreview.test.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: `public/data/world-cities.json`.
- Produces: Pages and root builds that include and precache the JSON asset.

- [ ] **Step 1: Add failing deployment assertions**

Require JSON output, Pages-relative fetch compatibility, Workbox precache inclusion, and a maximum accepted asset size.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/deploymentPreview.test.ts`

- [ ] **Step 3: Add JSON to Workbox and document refresh**

Include `json` in `globPatterns`, set a measured size ceiling above the generated file, and document `npm run cities:build` plus attribution.

- [ ] **Step 4: Verify and commit**

```bash
npm test -- --run src/deploymentPreview.test.ts
npm run build -- --mode pages
git add vite.config.ts src/deploymentPreview.test.ts README.md
git commit -m "build: precache offline world cities"
```

