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
