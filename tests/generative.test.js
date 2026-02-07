import { describe, it, expect } from 'vitest';
import { PARAM_RANGES } from '../js/config.js';
import {
  hashToSeed,
  randomHash,
  createRng,
  generateFromHash,
  COLLECTION_NAMES,
} from '../js/generative.js';

// --- PRNG determinism ---

describe('mulberry32 PRNG via createRng', () => {
  it('same hash produces same sequence', () => {
    const hash = '0xaabbccdd11223344';
    const rng1 = createRng(hash);
    const rng2 = createRng(hash);
    const seq1 = Array.from({ length: 20 }, () => rng1.random());
    const seq2 = Array.from({ length: 20 }, () => rng2.random());
    expect(seq1).toEqual(seq2);
  });

  it('different hashes produce different sequences', () => {
    const rng1 = createRng('0x0000000000000001');
    const rng2 = createRng('0x0000000000000002');
    const v1 = rng1.random();
    const v2 = rng2.random();
    expect(v1).not.toEqual(v2);
  });

  it('produces values in [0, 1)', () => {
    const rng = createRng('0xdeadbeef12345678');
    for (let i = 0; i < 1000; i++) {
      const v = rng.random();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('range() returns values within bounds', () => {
    const rng = createRng('0xfeedface');
    for (let i = 0; i < 100; i++) {
      const v = rng.range(10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });

  it('int() returns integers within bounds', () => {
    const rng = createRng('0x12345678abcdef00');
    for (let i = 0; i < 100; i++) {
      const v = rng.int(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('pick() returns elements from the array', () => {
    const rng = createRng('0xabcdef');
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });

  it('chance() returns boolean', () => {
    const rng = createRng('0x11111111');
    for (let i = 0; i < 50; i++) {
      expect(typeof rng.chance(0.5)).toBe('boolean');
    }
  });

  it('weighted() returns values from options', () => {
    const rng = createRng('0x22222222');
    const options = [
      { value: 'a', weight: 1 },
      { value: 'b', weight: 2 },
      { value: 'c', weight: 3 },
    ];
    for (let i = 0; i < 50; i++) {
      expect(['a', 'b', 'c']).toContain(rng.weighted(options));
    }
  });
});

// --- Hash utilities ---

describe('hashToSeed', () => {
  it('converts hex to 32-bit integer', () => {
    const seed = hashToSeed('0xdeadbeef');
    expect(typeof seed).toBe('number');
    expect(Number.isInteger(seed)).toBe(true);
  });

  it('same hash gives same seed', () => {
    expect(hashToSeed('0xabc123')).toBe(hashToSeed('0xabc123'));
  });

  it('handles hash without 0x prefix', () => {
    const withPrefix = hashToSeed('0xdeadbeef');
    const withoutPrefix = hashToSeed('deadbeef');
    expect(withPrefix).toBe(withoutPrefix);
  });

  it('handles long hashes by XOR folding', () => {
    const seed = hashToSeed('0x' + 'ab'.repeat(32));
    expect(typeof seed).toBe('number');
    expect(Number.isInteger(seed)).toBe(true);
  });

  it('different hashes give different seeds', () => {
    expect(hashToSeed('0x00000001')).not.toBe(hashToSeed('0x00000002'));
  });
});

describe('randomHash', () => {
  it('returns a 66-char string (0x + 64 hex chars)', () => {
    const hash = randomHash();
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('generates different hashes each call', () => {
    const h1 = randomHash();
    const h2 = randomHash();
    expect(h1).not.toBe(h2);
  });
});

// --- Collections ---

describe('COLLECTION_NAMES', () => {
  it('has 6 collections', () => {
    expect(COLLECTION_NAMES).toHaveLength(6);
  });

  it('contains all expected names', () => {
    expect(COLLECTION_NAMES).toContain('Harmonograph');
    expect(COLLECTION_NAMES).toContain('Phosphor Dream');
    expect(COLLECTION_NAMES).toContain('Rational Rose');
    expect(COLLECTION_NAMES).toContain('Glitch Matrix');
    expect(COLLECTION_NAMES).toContain('Minimal Wave');
    expect(COLLECTION_NAMES).toContain('Cosmic Spiral');
  });
});

// --- generateFromHash ---

describe('generateFromHash', () => {
  const testHash = '0x' + '42'.repeat(32);

  it('throws for unknown collection', () => {
    expect(() => generateFromHash(testHash, 'Nonexistent')).toThrow('Unknown collection');
  });

  it('returns an object with parameter keys', () => {
    const result = generateFromHash(testHash, 'Harmonograph');
    expect(result).toHaveProperty('freqX');
    expect(result).toHaveProperty('freqY');
    expect(result).toHaveProperty('delta');
  });

  it('all numeric values are within PARAM_RANGES', () => {
    for (const name of COLLECTION_NAMES) {
      for (let i = 0; i < 10; i++) {
        const hash = '0x' + i.toString(16).padStart(64, '0');
        const result = generateFromHash(hash, name);
        for (const [key, value] of Object.entries(result)) {
          if (typeof value === 'number' && PARAM_RANGES[key]) {
            const { min, max } = PARAM_RANGES[key];
            expect(value).toBeGreaterThanOrEqual(min);
            expect(value).toBeLessThanOrEqual(max);
          }
        }
      }
    }
  });

  it('same hash + collection = same output (determinism)', () => {
    for (const name of COLLECTION_NAMES) {
      const r1 = generateFromHash(testHash, name);
      const r2 = generateFromHash(testHash, name);
      expect(r1).toEqual(r2);
    }
  });

  it('different hashes produce different outputs', () => {
    const h1 = '0xaabbccdd11223344aabbccdd11223344aabbccdd11223344aabbccdd11223344';
    const h2 = '0x11223344aabbccdd11223344aabbccdd11223344aabbccdd11223344aabbccdd';
    const r1 = generateFromHash(h1, 'Cosmic Spiral');
    const r2 = generateFromHash(h2, 'Cosmic Spiral');
    expect(r1).not.toEqual(r2);
  });

  it('different collections produce different outputs for same hash', () => {
    const r1 = generateFromHash(testHash, 'Harmonograph');
    const r2 = generateFromHash(testHash, 'Glitch Matrix');
    // At minimum, the frequency ranges differ significantly
    expect(r1).not.toEqual(r2);
  });

  it('Harmonograph uses integer frequency ratios', () => {
    for (let i = 0; i < 20; i++) {
      const hash = '0x' + i.toString(16).padStart(64, 'a');
      const result = generateFromHash(hash, 'Harmonograph');
      expect(Number.isInteger(result.freqX)).toBe(true);
      expect(Number.isInteger(result.freqY)).toBe(true);
    }
  });

  it('Minimal Wave uses only 1:1, 1:2, or 2:1 ratios', () => {
    const validPairs = [[1,1],[1,2],[2,1]];
    for (let i = 0; i < 20; i++) {
      const hash = '0x' + i.toString(16).padStart(64, 'b');
      const result = generateFromHash(hash, 'Minimal Wave');
      const pair = [result.freqX, result.freqY];
      const isValid = validPairs.some(([a, b]) => a === pair[0] && b === pair[1]);
      expect(isValid).toBe(true);
    }
  });

  it('Rational Rose uses high frequencies (5-17)', () => {
    for (let i = 0; i < 20; i++) {
      const hash = '0x' + i.toString(16).padStart(64, 'c');
      const result = generateFromHash(hash, 'Rational Rose');
      expect(result.freqX).toBeGreaterThanOrEqual(5);
      expect(result.freqX).toBeLessThanOrEqual(17);
      expect(result.freqY).toBeGreaterThanOrEqual(5);
      expect(result.freqY).toBeLessThanOrEqual(17);
    }
  });

  it('Phosphor Dream always animates', () => {
    for (let i = 0; i < 10; i++) {
      const hash = '0x' + i.toString(16).padStart(64, 'd');
      const result = generateFromHash(hash, 'Phosphor Dream');
      expect(result.animate).toBe(true);
    }
  });

  it('Cosmic Spiral always animates', () => {
    for (let i = 0; i < 10; i++) {
      const hash = '0x' + i.toString(16).padStart(64, 'e');
      const result = generateFromHash(hash, 'Cosmic Spiral');
      expect(result.animate).toBe(true);
    }
  });
});
