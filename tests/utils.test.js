import { describe, it, expect } from 'vitest';
import { hexToRgb } from '../js/utils.js';

describe('hexToRgb', () => {
  it('parses standard 6-digit hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('parses without hash prefix', () => {
    expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses 3-digit shorthand', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses the default stroke color', () => {
    expect(hexToRgb('#00ff88')).toEqual({ r: 0, g: 255, b: 136 });
  });

  it('parses the default bg color', () => {
    expect(hexToRgb('#1a1a2e')).toEqual({ r: 26, g: 26, b: 46 });
  });

  it('returns null for invalid input', () => {
    expect(hexToRgb('')).toBeNull();
    expect(hexToRgb('#')).toBeNull();
    expect(hexToRgb('#zzzzzz')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
  });

  it('handles black and white', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });
});
