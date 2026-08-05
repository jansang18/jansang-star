# Android APK Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the verified offline Jansang Star web app as an installable Android APK with app ID `com.jansang.star`.

**Architecture:** Capacitor 8.5.0 embeds the root-mode Vite `dist` inside a maintained Android Gradle project. Pages deployment remains a separate mode, while native build/sync scripts guarantee the APK never embeds `/jansang-star/` asset paths.

**Tech Stack:** Capacitor 8.5.0, Android Gradle, Android SDK 35+, Android Studio JBR 21, Vite 8.

## Global Constraints

- App name is `잔상 별자리`; app ID is `com.jansang.star`.
- APK embeds local assets and works without opening the public website.
- Add no camera, contacts, location, or storage permissions.
- Build a debug-signed installable APK; do not create or expose a private release keystore.
- Copy the deliverable to `outputs/jansang-star-android-debug.apk`.

---

### Task 1: Add Capacitor and root-mode native build scripts

**Files:**
- Create: `capacitor.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/deploymentPreview.test.ts`

**Interfaces:**
- Produces: `npm run build:android:web`, `npm run cap:sync:android`, and `npm run apk:debug`.

- [ ] **Step 1: Write failing config/script assertions**

Require app ID/name/webDir, exact Capacitor 8.5.0 packages, and scripts that build root mode before syncing Android.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/deploymentPreview.test.ts`

- [ ] **Step 3: Install and configure Capacitor**

Install exact `@capacitor/core@8.5.0`, `@capacitor/android@8.5.0`, and `@capacitor/cli@8.5.0`; create the typed config with `webDir: 'dist'` and `androidScheme: 'https'`.

- [ ] **Step 4: Verify root and Pages builds remain distinct**

Run both `npm run build:android:web` and `npm run build -- --mode pages`; inspect `dist/index.html` paths after each.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json capacitor.config.ts src/deploymentPreview.test.ts
git commit -m "build: configure Capacitor Android"
```

### Task 2: Generate and brand the Android project

**Files:**
- Create: `android/**`
- Modify: `README.md`

**Interfaces:**
- Consumes: root-mode `dist` and `capacitor.config.ts`.
- Produces: Gradle project with app label `잔상 별자리` and no unnecessary permissions.

- [ ] **Step 1: Add Android platform and sync assets**

Run `npx cap add android`, then `npm run cap:sync:android` with `JAVA_HOME` set to Android Studio JBR and Android SDK variables set to the installed SDK.

- [ ] **Step 2: Brand app resources**

Set the app label, cream launch background, obsidian theme color, and launcher resources derived from the existing Jansang Star icon. Do not add runtime permissions.

- [ ] **Step 3: Add build instructions and verify manifest**

Document exact PowerShell commands. Inspect merged/main manifest to confirm package/app label and absence of sensitive permissions.

- [ ] **Step 4: Commit**

```bash
git add android README.md
git commit -m "feat: add branded Jansang Star Android shell"
```

### Task 3: Build, inspect, and deliver the APK

**Files:**
- Create: `outputs/jansang-star-android-debug.apk` (deliverable, not committed unless repository policy requires it)

**Interfaces:**
- Produces: installable debug APK for `com.jansang.star`.

- [ ] **Step 1: Run full web verification**

Run: `npm test -- --run && npm run build`

Expected: all tests pass and root-mode build succeeds.

- [ ] **Step 2: Sync and assemble**

Set Android Studio JBR/SDK environment, run `npx cap sync android`, then `android\gradlew.bat assembleDebug`.

- [ ] **Step 3: Inspect the APK**

Use Android build-tools `aapt dump badging` to verify package `com.jansang.star`, label `잔상 별자리`, debug signing, and no unwanted permissions. Run ZIP integrity verification and record SHA-256 and size.

- [ ] **Step 4: Install and smoke-test when an emulator/device is available**

Use `adb devices`; if available, install with `adb install -r`, launch the main activity, and verify the birth form, world-city search, calculation, and offline relaunch. If no device exists, report that runtime installation is unverified while retaining build/package evidence.

- [ ] **Step 5: Copy deliverable**

Copy the exact assembled APK to `outputs/jansang-star-android-debug.apk` and verify its hash matches the Gradle output.

### Task 4: Publish source and Pages release

**Files:**
- No new product files; deployment only.

**Interfaces:**
- Produces: remote `main`, `gh-pages`, and live URL updated to the verified release.

- [ ] **Step 1: Run final tests and Pages build**

Run: `npm test -- --run` and `npm run build -- --mode pages`.

- [ ] **Step 2: Push source without force**

Push the exact feature HEAD to remote `main` using a fast-forward-only push.

- [ ] **Step 3: Deploy Pages with `.nojekyll`**

Run: `npm run deploy:pages`; record source SHA, gh-pages SHA, and Pages build ID.

- [ ] **Step 4: Verify live release**

Confirm current hashed JS/CSS, world-city JSON, WASM/data, service worker and manifest all return 200; then smoke-test Korean mobile and English desktop city search, pastel focus, calculation, console, and cache freshness.

