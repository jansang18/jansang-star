// @vitest-environment node
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Swiss Ephemeris deployment assets', () => {
  it.each([
    ['swisseph.wasm', 500_000],
    ['swisseph.data', 2_000_000],
  ])('ships %s at the runtime wasm path', (file, minimumBytes) => {
    const asset = resolve('public', 'wasm', file);
    expect(existsSync(asset), `${asset} must exist`).toBe(true);
    expect(statSync(asset).size).toBeGreaterThan(minimumBytes);
  });
});
