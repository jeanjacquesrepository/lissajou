import { describe, it, expect } from 'vitest';
import { lissajousPoint, generateCurve, validateParams } from '../js/lissajous.js';
import { PARAM_RANGES } from '../js/config.js';

describe('lissajousPoint', () => {
  const baseParams = {
    freqX: 3, freqY: 2, delta: 0, ampX: 200, ampY: 200, numPoints: 1000,
  };

  it('returns origin at t=0 when delta=0', () => {
    const pt = lissajousPoint(0, baseParams);
    expect(pt.x).toBeCloseTo(0, 10);
    expect(pt.y).toBeCloseTo(0, 10);
  });

  it('produces a circle when freqX=freqY=1 and delta=π/2', () => {
    const circleParams = { ...baseParams, freqX: 1, freqY: 1, delta: Math.PI / 2 };
    // At t=0: x = A*sin(π/2) = A, y = 0
    const p0 = lissajousPoint(0, circleParams);
    expect(p0.x).toBeCloseTo(200, 5);
    expect(p0.y).toBeCloseTo(0, 5);

    // At t=π/2: x = A*sin(π/2 + π/2) = A*sin(π) = 0, y = A*sin(π/2) = A
    const p1 = lissajousPoint(Math.PI / 2, circleParams);
    expect(p1.x).toBeCloseTo(0, 5);
    expect(p1.y).toBeCloseTo(200, 5);

    // All points should lie on circle of radius 200
    for (let i = 0; i < 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      const pt = lissajousPoint(t, circleParams);
      const r = Math.sqrt(pt.x ** 2 + pt.y ** 2);
      expect(r).toBeCloseTo(200, 3);
    }
  });

  it('respects amplitude scaling', () => {
    const pt = lissajousPoint(Math.PI / 6, { ...baseParams, freqX: 1, delta: 0, ampX: 100 });
    // x = 100 * sin(π/6) = 100 * 0.5 = 50
    expect(pt.x).toBeCloseTo(50, 5);
  });

  it('handles zero amplitude', () => {
    const pt = lissajousPoint(1, { ...baseParams, ampX: 0, ampY: 0 });
    expect(pt.x).toBeCloseTo(0, 10);
    expect(pt.y).toBeCloseTo(0, 10);
  });

  it('handles large frequencies', () => {
    const pt = lissajousPoint(0.5, { ...baseParams, freqX: 20, freqY: 20 });
    expect(Math.abs(pt.x)).toBeLessThanOrEqual(200);
    expect(Math.abs(pt.y)).toBeLessThanOrEqual(200);
  });
});

describe('generateCurve', () => {
  const baseParams = {
    freqX: 3, freqY: 2, delta: Math.PI / 2, ampX: 200, ampY: 200, numPoints: 1000,
  };

  it('returns numPoints+1 elements', () => {
    const points = generateCurve(baseParams);
    expect(points).toHaveLength(1001);
  });

  it('returns numPoints+1 for small numPoints', () => {
    const points = generateCurve({ ...baseParams, numPoints: 1 });
    expect(points).toHaveLength(2);
  });

  it('all points are within amplitude bounds', () => {
    const points = generateCurve(baseParams);
    for (const pt of points) {
      expect(Math.abs(pt.x)).toBeLessThanOrEqual(200 + 1e-10);
      expect(Math.abs(pt.y)).toBeLessThanOrEqual(200 + 1e-10);
    }
  });

  it('first and last points are the same (closed curve over 2π)', () => {
    const points = generateCurve({ ...baseParams, numPoints: 1000 });
    expect(points[0].x).toBeCloseTo(points[points.length - 1].x, 5);
    expect(points[0].y).toBeCloseTo(points[points.length - 1].y, 5);
  });

  it('each point has x and y properties', () => {
    const points = generateCurve(baseParams);
    for (const pt of points) {
      expect(pt).toHaveProperty('x');
      expect(pt).toHaveProperty('y');
      expect(typeof pt.x).toBe('number');
      expect(typeof pt.y).toBe('number');
    }
  });
});

describe('validateParams', () => {
  const validParams = {
    freqX: 3, freqY: 2, delta: Math.PI / 2, ampX: 200, ampY: 200,
    numPoints: 1000, strokeWeight: 2, bgAlpha: 255, speed: 0.005, dotSize: 8,
    // Face params
    faceHeadWidth: 200, faceHeadHeight: 250, faceHeadRoundness: 2.5,
    faceEyeSpacing: 70, faceEyeY: -30, faceEyeSize: 35, faceEyeAspect: 0.7,
    faceEyeRoundness: 2, facePupilSize: 10, facePupilOffX: 0, facePupilOffY: 0,
    faceBrowArch: 12, faceBrowLength: 40, faceBrowGap: 15, faceBrowAngle: 0,
    faceNoseLength: 40, faceNoseWidth: 20,
    faceMouthWidth: 55, faceMouthCurve: 15, faceMouthY: 80, faceMouthOpen: 0,
    faceEarSize: 20, faceEarHeight: 35, faceEarY: -10, faceEarPointy: 0.3,
    faceDetail: 64, faceScale: 1.0, faceRotation: 0,
    // Wireframe params
    wireScale: 150, wireRotX: 0.4, wireRotY: 0.3, wireRotZ: 0,
    wireSpeedX: 0.008, wireSpeedY: 0.006, wireSpeedZ: 0,
    wirePerspective: 800, wireRings: 12, wireSegments: 16,
    wireTubeRatio: 0.35, wireTopRadius: 1.0, wirePrismSides: 5,
    wireDepthMin: 0.3,
    // Oscilloscope params
    xyVolume: 0.5, xyFreq: 50, xyAmp: 1.0, xySmooth: 2,
    scopeHue: 120, scopePersistence: -1, scopeThickness: 0.01,
    scopeIntensity: 0.0, scopeGain: 0.1,
  };

  it('accepts valid params', () => {
    const result = validateParams(validParams, PARAM_RANGES);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects out-of-range values', () => {
    const result = validateParams({ ...validParams, freqX: 100 }, PARAM_RANGES);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('freqX');
  });

  it('rejects missing parameters', () => {
    const { freqX, ...incomplete } = validParams;
    const result = validateParams(incomplete, PARAM_RANGES);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('freqX');
  });

  it('rejects values below minimum', () => {
    const result = validateParams({ ...validParams, ampX: 0 }, PARAM_RANGES);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('ampX');
  });
});
