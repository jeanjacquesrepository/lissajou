import { describe, it, expect } from 'vitest';
import { DEFAULT_PARAMS } from '../js/config.js';
import {
  generateFace,
  generateHead,
  generateEye,
  generatePupil,
  generateEyebrow,
  generateNose,
  generateMouth,
  generateEar,
} from '../js/face.js';

const baseParams = { ...DEFAULT_PARAMS };

describe('generateHead', () => {
  it('returns an array of points forming a closed loop', () => {
    const pts = generateHead(baseParams);
    expect(pts.length).toBeGreaterThan(0);
    expect(pts[0].x).toBeCloseTo(pts[pts.length - 1].x, 3);
    expect(pts[0].y).toBeCloseTo(pts[pts.length - 1].y, 3);
  });

  it('all points have x and y', () => {
    for (const pt of generateHead(baseParams)) {
      expect(typeof pt.x).toBe('number');
      expect(typeof pt.y).toBe('number');
      expect(isNaN(pt.x)).toBe(false);
      expect(isNaN(pt.y)).toBe(false);
    }
  });

  it('points stay within head dimensions', () => {
    const pts = generateHead(baseParams);
    const hw = baseParams.faceHeadWidth / 2;
    const hh = baseParams.faceHeadHeight / 2;
    for (const pt of pts) {
      expect(Math.abs(pt.x)).toBeLessThanOrEqual(hw + 1);
      expect(Math.abs(pt.y)).toBeLessThanOrEqual(hh + 1);
    }
  });

  it('roundness=2 produces near-ellipse', () => {
    const params = { ...baseParams, faceHeadRoundness: 2 };
    const pts = generateHead(params);
    const hw = params.faceHeadWidth / 2;
    const hh = params.faceHeadHeight / 2;
    // Check a known point: t=0 should be (hw, 0)
    expect(pts[0].x).toBeCloseTo(hw, 1);
    expect(pts[0].y).toBeCloseTo(0, 1);
  });
});

describe('generateEye', () => {
  it('returns points for left and right eyes', () => {
    const left = generateEye(baseParams, 'left');
    const right = generateEye(baseParams, 'right');
    expect(left.length).toBeGreaterThan(0);
    expect(right.length).toBeGreaterThan(0);
  });

  it('left eye is on the left, right eye on the right', () => {
    const left = generateEye(baseParams, 'left');
    const right = generateEye(baseParams, 'right');
    const leftAvgX = left.reduce((s, p) => s + p.x, 0) / left.length;
    const rightAvgX = right.reduce((s, p) => s + p.x, 0) / right.length;
    expect(leftAvgX).toBeLessThan(0);
    expect(rightAvgX).toBeGreaterThan(0);
  });
});

describe('generatePupil', () => {
  it('pupils are centered inside their respective eyes', () => {
    const params = { ...baseParams, facePupilOffX: 0, facePupilOffY: 0 };
    const leftPupil = generatePupil(params, 'left');
    const leftEye = generateEye(params, 'left');
    const pupilCx = leftPupil.reduce((s, p) => s + p.x, 0) / leftPupil.length;
    const eyeCx = leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length;
    expect(Math.abs(pupilCx - eyeCx)).toBeLessThan(2);
  });

  it('pupil offset shifts the pupil position', () => {
    const centered = generatePupil({ ...baseParams, facePupilOffX: 0 }, 'left');
    const shifted = generatePupil({ ...baseParams, facePupilOffX: 0.5 }, 'left');
    const cx1 = centered.reduce((s, p) => s + p.x, 0) / centered.length;
    const cx2 = shifted.reduce((s, p) => s + p.x, 0) / shifted.length;
    expect(cx2).toBeGreaterThan(cx1);
  });
});

describe('generateEyebrow', () => {
  it('returns non-empty point array', () => {
    const left = generateEyebrow(baseParams, 'left');
    const right = generateEyebrow(baseParams, 'right');
    expect(left.length).toBeGreaterThan(0);
    expect(right.length).toBeGreaterThan(0);
  });

  it('eyebrows are above their respective eyes', () => {
    const leftBrow = generateEyebrow(baseParams, 'left');
    const leftEye = generateEye(baseParams, 'left');
    const browMinY = Math.min(...leftBrow.map(p => p.y));
    const eyeMinY = Math.min(...leftEye.map(p => p.y));
    expect(browMinY).toBeLessThan(eyeMinY);
  });
});

describe('generateNose', () => {
  it('returns non-empty point array', () => {
    const pts = generateNose(baseParams);
    expect(pts.length).toBeGreaterThan(0);
  });

  it('nose is centered horizontally', () => {
    const pts = generateNose(baseParams);
    const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    expect(Math.abs(avgX)).toBeLessThan(baseParams.faceNoseWidth);
  });
});

describe('generateMouth', () => {
  it('returns at least 1 stroke when closed', () => {
    const strokes = generateMouth({ ...baseParams, faceMouthOpen: 0 });
    expect(strokes.length).toBe(1);
  });

  it('returns 2 strokes when open', () => {
    const strokes = generateMouth({ ...baseParams, faceMouthOpen: 10 });
    expect(strokes.length).toBe(2);
  });

  it('mouth strokes have valid points', () => {
    const strokes = generateMouth(baseParams);
    for (const s of strokes) {
      expect(s.points.length).toBeGreaterThan(0);
      for (const pt of s.points) {
        expect(typeof pt.x).toBe('number');
        expect(typeof pt.y).toBe('number');
      }
    }
  });
});

describe('generateEar', () => {
  it('returns empty array when faceEarSize is 0', () => {
    const pts = generateEar({ ...baseParams, faceEarSize: 0 }, 'left');
    expect(pts).toHaveLength(0);
  });

  it('returns points when faceEarSize > 0', () => {
    const pts = generateEar({ ...baseParams, faceEarSize: 20 }, 'left');
    expect(pts.length).toBeGreaterThan(0);
  });

  it('left ear is on the left side of the head', () => {
    const pts = generateEar(baseParams, 'left');
    const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    expect(avgX).toBeLessThan(0);
  });

  it('right ear is on the right side of the head', () => {
    const pts = generateEar(baseParams, 'right');
    const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    expect(avgX).toBeGreaterThan(0);
  });
});

describe('generateFace', () => {
  it('returns an array of strokes', () => {
    const strokes = generateFace(baseParams);
    expect(Array.isArray(strokes)).toBe(true);
    expect(strokes.length).toBeGreaterThan(0);
  });

  it('each stroke has points array and closed boolean', () => {
    const strokes = generateFace(baseParams);
    for (const s of strokes) {
      expect(Array.isArray(s.points)).toBe(true);
      expect(typeof s.closed).toBe('boolean');
      expect(s.points.length).toBeGreaterThan(0);
    }
  });

  it('all points are finite numbers', () => {
    const strokes = generateFace(baseParams);
    for (const s of strokes) {
      for (const pt of s.points) {
        expect(isFinite(pt.x)).toBe(true);
        expect(isFinite(pt.y)).toBe(true);
      }
    }
  });

  it('faceDetail controls point count', () => {
    const lo = generateFace({ ...baseParams, faceDetail: 16 });
    const hi = generateFace({ ...baseParams, faceDetail: 128 });
    const totalLo = lo.reduce((s, stroke) => s + stroke.points.length, 0);
    const totalHi = hi.reduce((s, stroke) => s + stroke.points.length, 0);
    expect(totalHi).toBeGreaterThan(totalLo);
  });

  it('faceScale scales all points', () => {
    const normal = generateFace({ ...baseParams, faceScale: 1.0, faceRotation: 0 });
    const scaled = generateFace({ ...baseParams, faceScale: 2.0, faceRotation: 0 });
    // Compare the first point of the head (3rd stroke: ears + head)
    const headIdx = baseParams.faceEarSize > 0 ? 2 : 0;
    const npt = normal[headIdx].points[0];
    const spt = scaled[headIdx].points[0];
    expect(spt.x).toBeCloseTo(npt.x * 2, 1);
    expect(spt.y).toBeCloseTo(npt.y * 2, 1);
  });

  it('omits ears when faceEarSize is 0', () => {
    const withEars = generateFace({ ...baseParams, faceEarSize: 20 });
    const withoutEars = generateFace({ ...baseParams, faceEarSize: 0 });
    expect(withoutEars.length).toBeLessThan(withEars.length);
  });
});
