import { describe, expect, it } from 'vitest';
import { polarPoint } from './geometry';

describe('polarPoint', () => {
  it('places zero degrees at the top of the wheel', () => {
    expect(polarPoint(0, 100)).toEqual({ x: 0, y: -100 });
  });
});
