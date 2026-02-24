/**
 * 3D wireframe geometry — pure math, no p5 dependency.
 * Returns arrays of strokes in the same {x, y} format as other modes.
 */

// --- 3D Rotation ---

export function rotateX(p, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

export function rotateY(p, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

export function rotateZ(p, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}

// --- Perspective Projection ---

export function project3D(p, camDist) {
  const d = camDist / (camDist + p.z);
  return { x: p.x * d, y: p.y * d, depth: p.z };
}

// --- Platonic Solids ---

export function cubeGeometry() {
  const s = 1;
  const vertices = [
    { x: -s, y: -s, z: -s }, { x:  s, y: -s, z: -s },
    { x:  s, y:  s, z: -s }, { x: -s, y:  s, z: -s },
    { x: -s, y: -s, z:  s }, { x:  s, y: -s, z:  s },
    { x:  s, y:  s, z:  s }, { x: -s, y:  s, z:  s },
  ];
  const edges = [
    [0,1],[1,2],[2,3],[3,0], // back face
    [4,5],[5,6],[6,7],[7,4], // front face
    [0,4],[1,5],[2,6],[3,7], // connecting
  ];
  return { vertices, edges };
}

export function tetrahedronGeometry() {
  const a = 1;
  const vertices = [
    { x:  a,  y:  a,  z:  a },
    { x:  a,  y: -a,  z: -a },
    { x: -a,  y:  a,  z: -a },
    { x: -a,  y: -a,  z:  a },
  ];
  const edges = [
    [0,1],[0,2],[0,3],[1,2],[1,3],[2,3],
  ];
  return { vertices, edges };
}

export function octahedronGeometry() {
  const a = 1;
  const vertices = [
    { x:  a, y:  0, z:  0 }, { x: -a, y:  0, z:  0 },
    { x:  0, y:  a, z:  0 }, { x:  0, y: -a, z:  0 },
    { x:  0, y:  0, z:  a }, { x:  0, y:  0, z: -a },
  ];
  const edges = [
    [0,2],[0,3],[0,4],[0,5],
    [1,2],[1,3],[1,4],[1,5],
    [2,4],[2,5],[3,4],[3,5],
  ];
  return { vertices, edges };
}

export function dodecahedronGeometry() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const a = 1, b = 1 / phi, c = 2 - phi;
  const vertices = [
    // cube vertices
    { x:  a, y:  a, z:  a }, { x:  a, y:  a, z: -a },
    { x:  a, y: -a, z:  a }, { x:  a, y: -a, z: -a },
    { x: -a, y:  a, z:  a }, { x: -a, y:  a, z: -a },
    { x: -a, y: -a, z:  a }, { x: -a, y: -a, z: -a },
    // rectangles on XY plane
    { x:  0, y:  phi, z:  b }, { x:  0, y:  phi, z: -b },
    { x:  0, y: -phi, z:  b }, { x:  0, y: -phi, z: -b },
    // rectangles on XZ plane
    { x:  b, y:  0, z:  phi }, { x: -b, y:  0, z:  phi },
    { x:  b, y:  0, z: -phi }, { x: -b, y:  0, z: -phi },
    // rectangles on YZ plane
    { x:  phi, y:  b, z:  0 }, { x:  phi, y: -b, z:  0 },
    { x: -phi, y:  b, z:  0 }, { x: -phi, y: -b, z:  0 },
  ];
  const edges = [
    [0,12],[0,16],[0,8], [1,14],[1,16],[1,9],
    [2,12],[2,17],[2,10], [3,14],[3,17],[3,11],
    [4,13],[4,18],[4,8], [5,15],[5,18],[5,9],
    [6,13],[6,19],[6,10], [7,15],[7,19],[7,11],
    [8,9],[10,11],[12,13],[14,15],[16,17],[18,19],
  ];
  return { vertices, edges };
}

export function icosahedronGeometry() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    { x:  0, y:  1, z:  phi }, { x:  0, y:  1, z: -phi },
    { x:  0, y: -1, z:  phi }, { x:  0, y: -1, z: -phi },
    { x:  1, y:  phi, z:  0 }, { x:  1, y: -phi, z:  0 },
    { x: -1, y:  phi, z:  0 }, { x: -1, y: -phi, z:  0 },
    { x:  phi, y:  0, z:  1 }, { x: -phi, y:  0, z:  1 },
    { x:  phi, y:  0, z: -1 }, { x: -phi, y:  0, z: -1 },
  ];
  const edges = [
    [0,2],[0,8],[0,4],[0,6],[0,9],
    [2,8],[2,5],[2,7],[2,9],
    [1,3],[1,10],[1,4],[1,6],[1,11],
    [3,10],[3,5],[3,7],[3,11],
    [4,8],[4,10],[4,6],
    [5,8],[5,10],[5,7],
    [6,9],[6,11],
    [7,9],[7,11],
    [9,11],
  ];
  return { vertices, edges };
}

// --- Parametric Surfaces ---

export function sphereGeometry(rings, segments) {
  const vertices = [];
  const edges = [];

  // Generate vertices
  // Top pole
  vertices.push({ x: 0, y: -1, z: 0 });
  for (let i = 1; i < rings; i++) {
    const phi = (i / rings) * Math.PI;
    const y = -Math.cos(phi);
    const r = Math.sin(phi);
    for (let j = 0; j < segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      vertices.push({ x: r * Math.cos(theta), y, z: r * Math.sin(theta) });
    }
  }
  // Bottom pole
  vertices.push({ x: 0, y: 1, z: 0 });

  const bottomPole = vertices.length - 1;

  // Edges: top pole to first ring
  for (let j = 0; j < segments; j++) {
    edges.push([0, 1 + j]);
  }

  // Edges: ring-to-ring + around rings
  for (let i = 1; i < rings; i++) {
    const ringStart = 1 + (i - 1) * segments;
    // Around ring
    for (let j = 0; j < segments; j++) {
      edges.push([ringStart + j, ringStart + ((j + 1) % segments)]);
    }
    // To next ring
    if (i < rings - 1) {
      const nextRingStart = ringStart + segments;
      for (let j = 0; j < segments; j++) {
        edges.push([ringStart + j, nextRingStart + j]);
      }
    }
  }

  // Edges: last ring to bottom pole
  const lastRingStart = 1 + (rings - 2) * segments;
  for (let j = 0; j < segments; j++) {
    edges.push([lastRingStart + j, bottomPole]);
  }

  return { vertices, edges };
}

export function torusGeometry(rings, segments, tubeRatio) {
  const vertices = [];
  const edges = [];
  const R = 1;       // Major radius (normalized)
  const r = tubeRatio; // Tube radius as fraction of major radius

  for (let i = 0; i < rings; i++) {
    const theta = (i / rings) * Math.PI * 2;
    const cosT = Math.cos(theta), sinT = Math.sin(theta);
    for (let j = 0; j < segments; j++) {
      const phi = (j / segments) * Math.PI * 2;
      const x = (R + r * Math.cos(phi)) * cosT;
      const y = r * Math.sin(phi);
      const z = (R + r * Math.cos(phi)) * sinT;
      vertices.push({ x, y, z });
    }
  }

  for (let i = 0; i < rings; i++) {
    const nextI = (i + 1) % rings;
    for (let j = 0; j < segments; j++) {
      const nextJ = (j + 1) % segments;
      // Around tube
      edges.push([i * segments + j, i * segments + nextJ]);
      // Along ring
      edges.push([i * segments + j, nextI * segments + j]);
    }
  }

  return { vertices, edges };
}

export function cylinderGeometry(segments, topRadius) {
  const vertices = [];
  const edges = [];

  // Bottom ring (y = 1)
  for (let j = 0; j < segments; j++) {
    const theta = (j / segments) * Math.PI * 2;
    vertices.push({ x: Math.cos(theta), y: 1, z: Math.sin(theta) });
  }
  // Top ring (y = -1)
  for (let j = 0; j < segments; j++) {
    const theta = (j / segments) * Math.PI * 2;
    vertices.push({ x: topRadius * Math.cos(theta), y: -1, z: topRadius * Math.sin(theta) });
  }

  // Bottom ring edges
  for (let j = 0; j < segments; j++) {
    edges.push([j, (j + 1) % segments]);
  }
  // Top ring edges
  for (let j = 0; j < segments; j++) {
    edges.push([segments + j, segments + ((j + 1) % segments)]);
  }
  // Vertical edges
  for (let j = 0; j < segments; j++) {
    edges.push([j, segments + j]);
  }

  return { vertices, edges };
}

export function coneGeometry(segments) {
  return cylinderGeometry(segments, 0);
}

export function prismGeometry(sides) {
  const vertices = [];
  const edges = [];

  // Bottom face (y = 1)
  for (let j = 0; j < sides; j++) {
    const theta = (j / sides) * Math.PI * 2;
    vertices.push({ x: Math.cos(theta), y: 1, z: Math.sin(theta) });
  }
  // Top face (y = -1)
  for (let j = 0; j < sides; j++) {
    const theta = (j / sides) * Math.PI * 2;
    vertices.push({ x: Math.cos(theta), y: -1, z: Math.sin(theta) });
  }

  // Bottom face edges
  for (let j = 0; j < sides; j++) {
    edges.push([j, (j + 1) % sides]);
  }
  // Top face edges
  for (let j = 0; j < sides; j++) {
    edges.push([sides + j, sides + ((j + 1) % sides)]);
  }
  // Vertical edges
  for (let j = 0; j < sides; j++) {
    edges.push([j, sides + j]);
  }

  return { vertices, edges };
}

// --- Shape Registry ---

const SHAPES = {
  cube: (params) => cubeGeometry(),
  tetrahedron: (params) => tetrahedronGeometry(),
  octahedron: (params) => octahedronGeometry(),
  dodecahedron: (params) => dodecahedronGeometry(),
  icosahedron: (params) => icosahedronGeometry(),
  sphere: (params) => sphereGeometry(params.wireRings, params.wireSegments),
  torus: (params) => torusGeometry(params.wireRings, params.wireSegments, params.wireTubeRatio),
  cylinder: (params) => cylinderGeometry(params.wireSegments, params.wireTopRadius),
  cone: (params) => coneGeometry(params.wireSegments),
  prism: (params) => prismGeometry(params.wirePrismSides),
};

export const SHAPE_NAMES = Object.keys(SHAPES);

// --- Main Generator ---

export function generateWireframe(params) {
  const shapeFn = SHAPES[params.wireShape];
  if (!shapeFn) return [];

  const { vertices, edges } = shapeFn(params);
  const scale = params.wireScale;
  const camDist = params.wirePerspective;

  // Apply rotation and scale to all vertices
  const projected = vertices.map(v => {
    let p = { x: v.x * scale, y: v.y * scale, z: v.z * scale };
    p = rotateX(p, params.wireRotX);
    p = rotateY(p, params.wireRotY);
    p = rotateZ(p, params.wireRotZ);
    return project3D(p, camDist);
  });

  // Convert edges to strokes
  const strokes = [];
  for (const [i, j] of edges) {
    const a = projected[i];
    const b = projected[j];
    strokes.push({
      points: [{ x: a.x, y: a.y }, { x: b.x, y: b.y }],
      closed: false,
      depth: (a.depth + b.depth) / 2,
    });
  }

  return strokes;
}
