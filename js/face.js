/**
 * Face geometry generation — pure math, no p5 dependency.
 * Returns arrays of strokes in the same {x, y} point format as lissajous.js.
 * Coordinate system: origin at (0,0), Y-down (matching p5 after translate to center).
 */

// --- Helpers ---

function superellipsePoints(cx, cy, rx, ry, n, numPoints) {
  const pts = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * Math.PI * 2;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    const exp = 2 / n;
    const x = cx + rx * Math.sign(cosT) * Math.pow(Math.abs(cosT), exp);
    const y = cy + ry * Math.sign(sinT) * Math.pow(Math.abs(sinT), exp);
    pts.push({ x, y });
  }
  return pts;
}

function arcPoints(cx, cy, rx, ry, startAngle, endAngle, numPoints) {
  const pts = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = startAngle + (i / numPoints) * (endAngle - startAngle);
    pts.push({ x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) });
  }
  return pts;
}

function rotatePoints(pts, angle, cx, cy) {
  if (angle === 0) return pts;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return pts.map(p => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
  });
}

function scalePoints(pts, scale) {
  if (scale === 1) return pts;
  return pts.map(p => ({ x: p.x * scale, y: p.y * scale }));
}

// --- Feature generators ---

export function generateHead(params) {
  const { faceHeadWidth, faceHeadHeight, faceHeadRoundness, faceDetail } = params;
  return superellipsePoints(0, 0, faceHeadWidth / 2, faceHeadHeight / 2, faceHeadRoundness, faceDetail);
}

export function generateEye(params, side) {
  const { faceEyeSpacing, faceEyeY, faceEyeSize, faceEyeAspect, faceEyeRoundness, faceDetail } = params;
  const sign = side === 'left' ? -1 : 1;
  const cx = sign * faceEyeSpacing;
  const cy = faceEyeY;
  const rx = faceEyeSize;
  const ry = faceEyeSize * faceEyeAspect;
  return superellipsePoints(cx, cy, rx, ry, faceEyeRoundness, Math.max(16, Math.floor(faceDetail / 2)));
}

export function generatePupil(params, side) {
  const { faceEyeSpacing, faceEyeY, faceEyeSize, faceEyeAspect, facePupilSize, facePupilOffX, facePupilOffY, faceDetail } = params;
  const sign = side === 'left' ? -1 : 1;
  const eyeCx = sign * faceEyeSpacing;
  const eyeCy = faceEyeY;
  const rx = faceEyeSize;
  const ry = faceEyeSize * faceEyeAspect;
  const cx = eyeCx + facePupilOffX * (rx - facePupilSize);
  const cy = eyeCy + facePupilOffY * (ry - facePupilSize);
  return superellipsePoints(cx, cy, facePupilSize, facePupilSize, 2, Math.max(12, Math.floor(faceDetail / 3)));
}

export function generateEyebrow(params, side) {
  const { faceEyeSpacing, faceEyeY, faceEyeSize, faceEyeAspect, faceBrowArch, faceBrowLength, faceBrowGap, faceBrowAngle, faceDetail } = params;
  const sign = side === 'left' ? -1 : 1;
  const eyeCx = sign * faceEyeSpacing;
  const eyeTop = faceEyeY - faceEyeSize * faceEyeAspect;
  const browCy = eyeTop - faceBrowGap;
  const numPts = Math.max(8, Math.floor(faceDetail / 4));
  const pts = [];
  for (let i = 0; i <= numPts; i++) {
    const frac = i / numPts;
    const x = eyeCx + (frac - 0.5) * faceBrowLength * 2;
    // Parabolic arch: highest at center
    const arch = faceBrowArch * (1 - (frac - 0.5) * (frac - 0.5) * 4);
    const y = browCy - arch;
    pts.push({ x, y });
  }
  // Apply tilt
  const tiltAngle = sign * faceBrowAngle;
  return rotatePoints(pts, tiltAngle, eyeCx, browCy);
}

export function generateNose(params) {
  const { faceNoseLength, faceNoseWidth, faceDetail } = params;
  const numPts = Math.max(8, Math.floor(faceDetail / 4));
  const pts = [];
  // Bridge: vertical line from top to bottom
  const topY = -faceNoseLength / 2;
  const bottomY = faceNoseLength / 2;
  // Draw bridge down, then nostril curve
  const halfPts = Math.floor(numPts / 2);
  // Left side of nose bottom
  for (let i = 0; i <= halfPts; i++) {
    const frac = i / halfPts;
    const x = -faceNoseWidth / 2 * Math.sin(frac * Math.PI);
    const y = topY + frac * (bottomY - topY);
    pts.push({ x, y });
  }
  // Nostril curve at bottom (semicircle from left to right)
  const nostrilPts = Math.max(6, Math.floor(numPts / 3));
  for (let i = 0; i <= nostrilPts; i++) {
    const t = Math.PI + (i / nostrilPts) * Math.PI;
    pts.push({
      x: (faceNoseWidth / 2) * Math.cos(t),
      y: bottomY - (faceNoseWidth / 6) * Math.sin(t),
    });
  }
  return pts;
}

export function generateMouth(params) {
  const { faceMouthWidth, faceMouthCurve, faceMouthY, faceMouthOpen, faceDetail } = params;
  const strokes = [];
  const numPts = Math.max(12, Math.floor(faceDetail / 2));

  // Upper lip
  const upper = [];
  for (let i = 0; i <= numPts; i++) {
    const frac = i / numPts;
    const x = (frac - 0.5) * faceMouthWidth * 2;
    // Quadratic curve: deepest at center
    const curve = faceMouthCurve * (1 - (frac - 0.5) * (frac - 0.5) * 4);
    const y = faceMouthY - curve;
    upper.push({ x, y });
  }
  strokes.push({ points: upper, closed: false });

  // Lower lip (only if mouth is open)
  if (faceMouthOpen > 0) {
    const lower = [];
    for (let i = 0; i <= numPts; i++) {
      const frac = i / numPts;
      const x = (frac - 0.5) * faceMouthWidth * 2;
      const curve = faceMouthCurve * (1 - (frac - 0.5) * (frac - 0.5) * 4);
      const y = faceMouthY - curve + faceMouthOpen;
      lower.push({ x, y });
    }
    strokes.push({ points: lower, closed: false });
  }

  return strokes;
}

export function generateEar(params, side) {
  const { faceEarSize, faceEarHeight, faceEarY, faceEarPointy, faceHeadWidth, faceDetail } = params;
  if (faceEarSize <= 0) return [];

  const sign = side === 'left' ? -1 : 1;
  const attachX = sign * faceHeadWidth / 2;
  const numPts = Math.max(10, Math.floor(faceDetail / 3));
  const pts = [];

  for (let i = 0; i <= numPts; i++) {
    const frac = i / numPts;
    // Ear shape: elongated teardrop
    const t = frac * Math.PI * 2;
    // Base shape is an ellipse offset outward from the head
    let ex = Math.cos(t) * faceEarSize;
    let ey = Math.sin(t) * faceEarHeight / 2;
    // Pointy modifier: push the top outward
    if (Math.sin(t) < 0) {
      ex += sign * faceEarPointy * faceEarSize * Math.pow(Math.abs(Math.sin(t)), 0.5);
    }
    pts.push({ x: attachX + sign * ex, y: faceEarY + ey });
  }

  return pts;
}

// --- Main generator ---

export function generateFace(params) {
  const scale = params.faceScale;
  const rotation = params.faceRotation;
  const strokes = [];

  // Ears (drawn first so they appear behind the head in layered rendering)
  const leftEar = generateEar(params, 'left');
  if (leftEar.length > 0) strokes.push({ points: leftEar, closed: true });
  const rightEar = generateEar(params, 'right');
  if (rightEar.length > 0) strokes.push({ points: rightEar, closed: true });

  // Head
  strokes.push({ points: generateHead(params), closed: true });

  // Eyebrows
  strokes.push({ points: generateEyebrow(params, 'left'), closed: false });
  strokes.push({ points: generateEyebrow(params, 'right'), closed: false });

  // Eyes
  strokes.push({ points: generateEye(params, 'left'), closed: true });
  strokes.push({ points: generateEye(params, 'right'), closed: true });

  // Pupils
  strokes.push({ points: generatePupil(params, 'left'), closed: true });
  strokes.push({ points: generatePupil(params, 'right'), closed: true });

  // Nose
  strokes.push({ points: generateNose(params), closed: false });

  // Mouth (may return 1 or 2 strokes)
  const mouthStrokes = generateMouth(params);
  for (const s of mouthStrokes) strokes.push(s);

  // Apply global scale, base orientation (90° CCW), and user rotation
  const baseRotation = -Math.PI / 2;
  const totalRotation = baseRotation + rotation;
  for (const stroke of strokes) {
    if (scale !== 1) stroke.points = scalePoints(stroke.points, scale);
    stroke.points = rotatePoints(stroke.points, totalRotation, 0, 0);
  }

  return strokes;
}
