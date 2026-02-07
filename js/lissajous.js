/**
 * Pure math functions for Lissajous curves.
 * x(t) = A·sin(a·t + δ), y(t) = B·sin(b·t)
 */

export function lissajousPoint(t, params) {
  const { freqX, freqY, delta, ampX, ampY } = params;
  return {
    x: ampX * Math.sin(freqX * t + delta),
    y: ampY * Math.sin(freqY * t),
  };
}

export function generateCurve(params) {
  const { numPoints } = params;
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * Math.PI * 2;
    points.push(lissajousPoint(t, params));
  }
  return points;
}

export function validateParams(params, ranges) {
  const errors = [];
  for (const [key, range] of Object.entries(ranges)) {
    const value = params[key];
    if (value === undefined || value === null) {
      errors.push(`Missing parameter: ${key}`);
    } else if (typeof value === 'number') {
      if (value < range.min || value > range.max) {
        errors.push(`${key} (${value}) out of range [${range.min}, ${range.max}]`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
