import { PARAM_RANGES, SCOPE_PARAM_KEYS } from './config.js';

// --- PRNG (mulberry32) ---

function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Hash utilities ---

export function hashToSeed(hex) {
  const clean = hex.replace(/^0x/i, '');
  let seed = 0;
  for (let i = 0; i < clean.length; i += 8) {
    const chunk = parseInt(clean.slice(i, i + 8), 16) | 0;
    // Rotate left by 5 before XOR to make result position-dependent
    seed = ((seed << 5) | (seed >>> 27)) ^ chunk;
    seed = seed | 0;
  }
  return seed;
}

export function randomHash() {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = (Math.random() * 256) | 0;
  }
  return '0x' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function createRng(hash) {
  const seed = hashToSeed(hash);
  const next = mulberry32(seed);
  return {
    random: next,
    range(min, max) { return min + next() * (max - min); },
    int(min, max) { return Math.floor(min + next() * (max - min + 1)); },
    pick(arr) { return arr[Math.floor(next() * arr.length)]; },
    chance(p) { return next() < p; },
    weighted(options) {
      const total = options.reduce((s, o) => s + o.weight, 0);
      let r = next() * total;
      for (const opt of options) {
        r -= opt.weight;
        if (r <= 0) return opt.value;
      }
      return options[options.length - 1].value;
    },
  };
}

// --- Collections ---

const COLLECTIONS = {
  'Harmonograph': (rng) => {
    const ratios = [[1,2],[2,3],[3,4],[3,2],[4,3],[5,4],[1,3],[2,5]];
    const [fx, fy] = rng.pick(ratios);
    return {
      mode: 'lissajous',
      freqX: fx,
      freqY: fy,
      delta: rng.range(0, Math.PI * 2),
      ampX: rng.int(150, 300),
      ampY: rng.int(150, 300),
      numPoints: rng.int(800, 2000),
      strokeWeight: rng.range(1, 3),
      bgAlpha: rng.int(200, 255),
      animate: rng.chance(0.7),
      speed: rng.range(0.002, 0.01),
      showDot: rng.chance(0.5),
      dotSize: rng.int(4, 10),
      scopeHue: rng.pick([120, 45, 30]),
    };
  },

  'Phosphor Dream': (rng) => {
    const fx = rng.int(1, 5);
    const fy = rng.int(1, 5);
    return {
      mode: 'lissajous',
      freqX: fx,
      freqY: fy,
      delta: rng.range(0, Math.PI * 2),
      ampX: rng.int(180, 350),
      ampY: rng.int(180, 350),
      numPoints: rng.int(1500, 4000),
      strokeWeight: rng.range(0.5, 2),
      bgAlpha: rng.int(0, 30),
      animate: true,
      speed: rng.range(0.001, 0.004),
      showDot: false,
      dotSize: 4,
      scopeHue: rng.pick([180, 200, 220, 160]),
      scopePersistence: rng.range(-0.5, 0),
    };
  },

  'Rational Rose': (rng) => {
    const fx = rng.int(5, 17);
    const fy = rng.int(5, 17);
    return {
      mode: 'lissajous',
      freqX: fx,
      freqY: fy,
      delta: rng.range(0, Math.PI * 2),
      ampX: rng.int(200, 350),
      ampY: rng.int(200, 350),
      numPoints: rng.int(2000, 5000),
      strokeWeight: rng.range(0.5, 1.5),
      bgAlpha: rng.int(220, 255),
      animate: rng.chance(0.4),
      speed: rng.range(0.001, 0.005),
      showDot: false,
      dotSize: 4,
      scopeHue: rng.pick([300, 320, 340, 280]),
    };
  },

  'Glitch Matrix': (rng) => {
    const base = rng.int(2, 8);
    const offset = rng.pick([0.01, 0.02, 0.05, 0.1, -0.01, -0.02, -0.05]);
    return {
      mode: 'lissajous',
      freqX: base + offset,
      freqY: base + rng.pick([1, -1, 2, -2]) + rng.pick([0, 0.01, -0.01]),
      delta: rng.range(0, Math.PI * 2),
      ampX: rng.int(150, 350),
      ampY: rng.int(150, 350),
      numPoints: rng.int(1000, 3000),
      strokeWeight: rng.range(1, 3),
      bgAlpha: rng.int(0, 20),
      animate: true,
      speed: rng.range(0.01, 0.05),
      showDot: rng.chance(0.3),
      dotSize: rng.int(3, 8),
      scopeHue: rng.pick([0, 60, 120, 180, 240, 300]),
      scopePersistence: rng.range(-1.5, -0.3),
    };
  },

  'Minimal Wave': (rng) => {
    const [fx, fy] = rng.pick([[1,1],[1,2],[2,1]]);
    return {
      mode: 'lissajous',
      freqX: fx,
      freqY: fy,
      delta: rng.range(0, Math.PI * 2),
      ampX: rng.int(200, 350),
      ampY: rng.int(200, 350),
      numPoints: rng.int(500, 1500),
      strokeWeight: rng.range(0.5, 1.5),
      bgAlpha: 255,
      animate: rng.chance(0.3),
      speed: rng.range(0.001, 0.005),
      showDot: false,
      dotSize: 4,
      scopeHue: rng.int(0, 360),
    };
  },

  'Cosmic Spiral': (rng) => {
    const fx = rng.int(1, 7);
    const fy = rng.int(1, 7);
    return {
      mode: 'lissajous',
      freqX: fx,
      freqY: fy,
      delta: rng.range(0, Math.PI * 2),
      ampX: rng.int(100, 200),
      ampY: rng.int(250, 400),
      numPoints: rng.int(1000, 3500),
      strokeWeight: rng.range(1, 2.5),
      bgAlpha: rng.int(10, 80),
      animate: true,
      speed: rng.range(0.003, 0.015),
      showDot: rng.chance(0.4),
      dotSize: rng.int(4, 12),
      scopeHue: rng.pick([240, 260, 280, 200, 180]),
      scopePersistence: rng.range(-1.2, -0.2),
    };
  },

  'Face Portrait': (rng) => {
    const headW = rng.int(150, 300);
    const headH = rng.int(180, 340);
    const eyeSize = rng.int(18, 60);
    return {
      mode: 'face',
      faceHeadWidth: headW,
      faceHeadHeight: headH,
      faceHeadRoundness: rng.range(2.0, 4.5),
      faceEyeSpacing: rng.int(35, Math.min(120, headW / 2 - eyeSize)),
      faceEyeY: rng.int(-80, -10),
      faceEyeSize: eyeSize,
      faceEyeAspect: rng.range(0.4, 1.2),
      faceEyeRoundness: rng.range(1.5, 4),
      facePupilSize: rng.int(4, Math.max(5, Math.floor(eyeSize * 0.6))),
      facePupilOffX: 0,
      facePupilOffY: 0,
      faceBrowArch: rng.int(-10, 30),
      faceBrowLength: rng.int(15, 70),
      faceBrowGap: rng.int(5, 30),
      faceBrowAngle: rng.range(-0.2, 0.2),
      faceNoseLength: rng.int(15, 70),
      faceNoseWidth: rng.int(8, 45),
      faceMouthWidth: rng.int(25, 110),
      faceMouthCurve: rng.int(-30, 40),
      faceMouthY: rng.int(40, 140),
      faceMouthOpen: rng.chance(0.3) ? rng.int(5, 25) : 0,
      faceEarSize: rng.chance(0.7) ? rng.int(10, 45) : 0,
      faceEarHeight: rng.int(15, 65),
      faceEarY: rng.int(-50, 20),
      faceEarPointy: rng.range(0, 0.8),
      faceDetail: rng.pick([48, 64, 96, 128]),
      faceScale: rng.range(0.8, 1.4),
      faceRotation: rng.range(-0.12, 0.12),
      faceAnimatePupils: rng.chance(0.7),
      strokeWeight: rng.range(1.5, 3.5),
      bgAlpha: 255,
      animate: rng.chance(0.6),
      speed: rng.range(0.002, 0.01),
      showDot: false,
      scopeHue: rng.int(0, 360),
    };
  },

  'Geometric Spin': (rng) => {
    const shapes = ['cube', 'tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron', 'sphere', 'torus', 'cylinder', 'cone', 'prism'];
    const shape = rng.pick(shapes);
    return {
      mode: 'wireframe',
      wireShape: shape,
      wireScale: rng.int(100, 280),
      wireRotX: rng.range(0, Math.PI * 2),
      wireRotY: rng.range(0, Math.PI * 2),
      wireRotZ: rng.range(0, Math.PI * 2),
      wireSpeedX: rng.range(0.001, 0.02),
      wireSpeedY: rng.range(0.001, 0.02),
      wireSpeedZ: rng.chance(0.4) ? rng.range(0.001, 0.01) : 0,
      wireAutoRotate: true,
      wirePerspective: rng.int(400, 1500),
      wireRings: rng.int(6, 24),
      wireSegments: rng.int(8, 32),
      wireTubeRatio: rng.range(0.1, 0.6),
      wireTopRadius: rng.chance(0.5) ? 1.0 : rng.range(0, 0.8),
      wirePrismSides: rng.int(3, 10),
      wireDepthShading: rng.chance(0.7),
      wireDepthMin: rng.range(0.2, 0.6),
      strokeWeight: rng.range(1, 2.5),
      bgAlpha: 255,
      animate: true,
      speed: rng.range(0.003, 0.01),
      showDot: false,
      scopeHue: rng.int(0, 360),
    };
  },
};

export const COLLECTION_NAMES = Object.keys(COLLECTIONS);

// --- Generation ---

export function generateFromHash(hash, collectionName) {
  const gen = COLLECTIONS[collectionName];
  if (!gen) throw new Error(`Unknown collection: ${collectionName}`);
  const rng = createRng(hash);
  const generated = gen(rng);

  // Clamp numeric values to PARAM_RANGES
  for (const [key, value] of Object.entries(generated)) {
    if (typeof value === 'number' && PARAM_RANGES[key]) {
      const { min, max } = PARAM_RANGES[key];
      generated[key] = Math.max(min, Math.min(max, value));
    }
  }

  return generated;
}
