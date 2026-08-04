import { describe, expect, it } from 'vitest';
import { findAspect } from './aspects';

describe('findAspect', () => {
  it('detects conjunction across the zero degree boundary', () => {
    expect(findAspect(359, 1)?.type).toBe('conjunction');
  });

  it('detects a trine inside its orb', () => {
    expect(findAspect(10, 128)?.type).toBe('trine');
  });

  it('returns undefined when no major aspect is present', () => {
    expect(findAspect(0, 42)).toBeUndefined();
  });
});
