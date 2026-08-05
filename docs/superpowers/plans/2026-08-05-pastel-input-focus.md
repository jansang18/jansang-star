# Pastel Input Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the black birth-input focus box with a rounded pastel blue-gray selected state while keeping every field vertically aligned and keyboard-visible.

**Architecture:** Keep focus ownership on `.input-wrap:focus-within`; introduce input-only palette tokens so button and period-tab focus indicators remain unchanged. Lock the computed CSS behavior with the existing visual regression suite.

**Tech Stack:** CSS custom properties, Vitest, jsdom computed-style checks.

## Global Constraints

- Input containers use a 14px radius and 52px minimum height.
- Focused input containers use a pale blue-gray background, medium gray border, and translucent gray ring; no obsidian box shadow.
- Icons and values remain vertically centered.
- CTA, calculate button, and period-tab focus rules are unchanged.
- Reduced-motion mode removes the focus color transition.

---

### Task 1: Lock and implement the pastel input state

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/features/profile/BirthForm.css`
- Modify: `src/styles/atelierVisual.test.ts`

**Interfaces:**
- Consumes: existing `.input-wrap` and `.input-wrap:focus-within` selectors.
- Produces: `--input-focus-bg`, `--input-focus-border`, and `--input-focus-ring` tokens.

- [ ] **Step 1: Write the failing visual regression test**

Update the input-specific assertions to require `border-radius: 14px`, `min-height: 52px`, `align-items: center`, pastel background, gray border/ring, and absence of `var(--obsidian)` inside `.input-wrap:focus-within`. Preserve the existing dark/light ring assertions for buttons and tabs.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --run src/styles/atelierVisual.test.ts`

Expected: FAIL because the current input wrapper uses 10px/48px and an obsidian ring.

- [ ] **Step 3: Implement the minimal CSS**

Add exact tokens in `tokens.css`, then update `.input-wrap` and `.input-wrap:focus-within`. Apply a 140ms background/border/box-shadow transition and disable it in the existing reduced-motion media query.

- [ ] **Step 4: Run focused and form tests**

Run: `npm test -- --run src/styles/atelierVisual.test.ts src/features/profile/BirthForm.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css src/features/profile/BirthForm.css src/styles/atelierVisual.test.ts
git commit -m "style: soften selected birth inputs"
```

