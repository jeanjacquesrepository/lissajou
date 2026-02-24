import { describe, it, expect } from 'vitest';
import { DEFAULT_PARAMS } from '../js/config.js';
import {
  rotateX, rotateY, rotateZ, project3D,
  cubeGeometry, tetrahedronGeometry, octahedronGeometry,
  dodecahedronGeometry, icosahedronGeometry,
  sphereGeometry, torusGeometry, cylinderGeometry, coneGeometry, prismGeometry,
  generateWireframe, SHAPE_NAMES,
} from '../js/wireframe.js';

const baseParams = { ...DEFAULT_PARAMS, mode: 'wireframe' };

// --- Rotation ---

describe('rotation functions', () => {
  const p = { x: 1, y: 0, z: 0 };

  it('rotateX preserves distance from origin', () => {
    const r = rotateX(p, 1.0);
    const dist = Math.sqrt(r.x ** 2 + r.y ** 2 + r.z ** 2);
    expect(dist).toBeCloseTo(1, 10);
  });

  it('rotateY preserves distance from origin', () => {
    const r = rotateY(p, 1.0);
    const dist = Math.sqrt(r.x ** 2 + r.y ** 2 + r.z ** 2);
    expect(dist).toBeCloseTo(1, 10);
  });

  it('rotateZ preserves distance from origin', () => {
    const r = rotateZ(p, 1.0);
    const dist = Math.sqrt(r.x ** 2 + r.y ** 2 + r.z ** 2);
    expect(dist).toBeCloseTo(1, 10);
  });

  it('rotateZ by π/2 maps (1,0,0) to (0,1,0)', () => {
    const r = rotateZ({ x: 1, y: 0, z: 0 }, Math.PI / 2);
    expect(r.x).toBeCloseTo(0, 10);
    expect(r.y).toBeCloseTo(1, 10);
    expect(r.z).toBeCloseTo(0, 10);
  });

  it('rotation by 0 is identity', () => {
    const r = rotateX(p, 0);
    expect(r.x).toBeCloseTo(p.x, 10);
    expect(r.y).toBeCloseTo(p.y, 10);
    expect(r.z).toBeCloseTo(p.z, 10);
  });
});

// --- Projection ---

describe('project3D', () => {
  it('projects point at origin to origin', () => {
    const p = project3D({ x: 0, y: 0, z: 0 }, 800);
    expect(p.x).toBeCloseTo(0, 10);
    expect(p.y).toBeCloseTo(0, 10);
  });

  it('produces finite 2D coordinates', () => {
    const p = project3D({ x: 100, y: 50, z: -200 }, 800);
    expect(isFinite(p.x)).toBe(true);
    expect(isFinite(p.y)).toBe(true);
  });

  it('farther points appear smaller', () => {
    const near = project3D({ x: 100, y: 0, z: 0 }, 800);
    const far = project3D({ x: 100, y: 0, z: 200 }, 800);
    expect(Math.abs(near.x)).toBeGreaterThan(Math.abs(far.x));
  });

  it('returns depth value', () => {
    const p = project3D({ x: 0, y: 0, z: 42 }, 800);
    expect(p.depth).toBe(42);
  });
});

// --- Shape Generators ---

function validateGeometry(geo, name) {
  describe(name, () => {
    it('has vertices and edges arrays', () => {
      expect(Array.isArray(geo.vertices)).toBe(true);
      expect(Array.isArray(geo.edges)).toBe(true);
      expect(geo.vertices.length).toBeGreaterThan(0);
      expect(geo.edges.length).toBeGreaterThan(0);
    });

    it('all vertices have x, y, z', () => {
      for (const v of geo.vertices) {
        expect(typeof v.x).toBe('number');
        expect(typeof v.y).toBe('number');
        expect(typeof v.z).toBe('number');
      }
    });

    it('all edge indices reference valid vertices', () => {
      for (const [i, j] of geo.edges) {
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(geo.vertices.length);
        expect(j).toBeGreaterThanOrEqual(0);
        expect(j).toBeLessThan(geo.vertices.length);
      }
    });

    it('no self-loops in edges', () => {
      for (const [i, j] of geo.edges) {
        expect(i).not.toBe(j);
      }
    });
  });
}

// Platonic solids
validateGeometry(cubeGeometry(), 'cubeGeometry');
validateGeometry(tetrahedronGeometry(), 'tetrahedronGeometry');
validateGeometry(octahedronGeometry(), 'octahedronGeometry');
validateGeometry(dodecahedronGeometry(), 'dodecahedronGeometry');
validateGeometry(icosahedronGeometry(), 'icosahedronGeometry');

// Parametric surfaces
validateGeometry(sphereGeometry(8, 12), 'sphereGeometry');
validateGeometry(torusGeometry(8, 12, 0.35), 'torusGeometry');
validateGeometry(cylinderGeometry(12, 1.0), 'cylinderGeometry');
validateGeometry(coneGeometry(12), 'coneGeometry');
validateGeometry(prismGeometry(5), 'prismGeometry');

describe('cubeGeometry specifics', () => {
  it('has 8 vertices and 12 edges', () => {
    const geo = cubeGeometry();
    expect(geo.vertices).toHaveLength(8);
    expect(geo.edges).toHaveLength(12);
  });
});

describe('tetrahedronGeometry specifics', () => {
  it('has 4 vertices and 6 edges', () => {
    const geo = tetrahedronGeometry();
    expect(geo.vertices).toHaveLength(4);
    expect(geo.edges).toHaveLength(6);
  });
});

describe('sphereGeometry detail', () => {
  it('more rings/segments = more geometry', () => {
    const lo = sphereGeometry(4, 6);
    const hi = sphereGeometry(12, 16);
    expect(hi.vertices.length).toBeGreaterThan(lo.vertices.length);
    expect(hi.edges.length).toBeGreaterThan(lo.edges.length);
  });
});

describe('prismGeometry sides', () => {
  it('vertex count scales with sides', () => {
    const tri = prismGeometry(3);
    const hex = prismGeometry(6);
    expect(tri.vertices).toHaveLength(6);  // 3 top + 3 bottom
    expect(hex.vertices).toHaveLength(12); // 6 top + 6 bottom
  });
});

// --- SHAPE_NAMES ---

describe('SHAPE_NAMES', () => {
  it('has 10 shapes', () => {
    expect(SHAPE_NAMES).toHaveLength(10);
  });

  it('contains all expected shapes', () => {
    for (const name of ['cube', 'tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron', 'sphere', 'torus', 'cylinder', 'cone', 'prism']) {
      expect(SHAPE_NAMES).toContain(name);
    }
  });
});

// --- generateWireframe ---

describe('generateWireframe', () => {
  it('returns an array of strokes', () => {
    const strokes = generateWireframe(baseParams);
    expect(Array.isArray(strokes)).toBe(true);
    expect(strokes.length).toBeGreaterThan(0);
  });

  it('each stroke has points array and closed boolean', () => {
    const strokes = generateWireframe(baseParams);
    for (const s of strokes) {
      expect(Array.isArray(s.points)).toBe(true);
      expect(typeof s.closed).toBe('boolean');
      expect(s.points.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all points are finite 2D coordinates', () => {
    const strokes = generateWireframe(baseParams);
    for (const s of strokes) {
      for (const pt of s.points) {
        expect(isFinite(pt.x)).toBe(true);
        expect(isFinite(pt.y)).toBe(true);
      }
    }
  });

  it('strokes have depth for shading', () => {
    const strokes = generateWireframe(baseParams);
    for (const s of strokes) {
      expect(typeof s.depth).toBe('number');
      expect(isFinite(s.depth)).toBe(true);
    }
  });

  it('works for all shape types', () => {
    for (const shape of SHAPE_NAMES) {
      const strokes = generateWireframe({ ...baseParams, wireShape: shape });
      expect(strokes.length).toBeGreaterThan(0);
    }
  });

  it('returns empty for unknown shape', () => {
    const strokes = generateWireframe({ ...baseParams, wireShape: 'nonexistent' });
    expect(strokes).toHaveLength(0);
  });

  it('scale affects point positions', () => {
    const small = generateWireframe({ ...baseParams, wireScale: 50, wireRotX: 0, wireRotY: 0, wireRotZ: 0 });
    const big = generateWireframe({ ...baseParams, wireScale: 200, wireRotX: 0, wireRotY: 0, wireRotZ: 0 });
    const smallMax = Math.max(...small.flatMap(s => s.points.map(p => Math.abs(p.x))));
    const bigMax = Math.max(...big.flatMap(s => s.points.map(p => Math.abs(p.x))));
    expect(bigMax).toBeGreaterThan(smallMax);
  });
});
