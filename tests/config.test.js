import { describe, it, expect } from 'vitest';
import { DEFAULT_PARAMS, PARAM_RANGES, CANVAS_SIZE } from '../js/config.js';
import { validateParams } from '../js/lissajous.js';

describe('DEFAULT_PARAMS', () => {
  it('passes validation against PARAM_RANGES', () => {
    const result = validateParams(DEFAULT_PARAMS, PARAM_RANGES);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('has expected default values', () => {
    expect(DEFAULT_PARAMS.freqX).toBe(3);
    expect(DEFAULT_PARAMS.freqY).toBe(2);
    expect(DEFAULT_PARAMS.delta).toBeCloseTo(Math.PI / 2, 10);
    expect(DEFAULT_PARAMS.animate).toBe(true);
    expect(DEFAULT_PARAMS.strokeColor).toBe('#00ff88');
    expect(DEFAULT_PARAMS.bgColor).toBe('#1a1a2e');
  });
});

describe('PARAM_RANGES', () => {
  it('all numeric defaults have matching range entries', () => {
    for (const [key, value] of Object.entries(DEFAULT_PARAMS)) {
      if (typeof value === 'number') {
        expect(PARAM_RANGES).toHaveProperty(key);
      }
    }
  });

  it('all ranges have min < max', () => {
    for (const [key, range] of Object.entries(PARAM_RANGES)) {
      expect(range.min).toBeLessThan(range.max);
    }
  });

  it('all ranges have numeric min and max', () => {
    for (const [key, range] of Object.entries(PARAM_RANGES)) {
      expect(typeof range.min).toBe('number');
      expect(typeof range.max).toBe('number');
    }
  });
});

describe('CANVAS_SIZE', () => {
  it('has positive width and height', () => {
    expect(CANVAS_SIZE.width).toBeGreaterThan(0);
    expect(CANVAS_SIZE.height).toBeGreaterThan(0);
  });
});
