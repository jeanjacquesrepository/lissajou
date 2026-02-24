export const CANVAS_SIZE = { width: 800, height: 800 };

export const DEFAULT_PARAMS = {
  // Mode
  mode: 'lissajous',

  // Curve
  freqX: 3,
  freqY: 2,
  delta: Math.PI / 2,
  ampX: 200,
  ampY: 200,
  numPoints: 1000,

  // Style
  strokeColor: '#00ff88',
  strokeWeight: 2,
  bgColor: '#1a1a2e',
  bgAlpha: 255,

  // Animation
  animate: true,
  speed: 0.005,
  showDot: true,
  dotSize: 8,

  // Face — Head
  faceHeadWidth: 200,
  faceHeadHeight: 250,
  faceHeadRoundness: 2.5,
  // Face — Eyes
  faceEyeSpacing: 70,
  faceEyeY: -30,
  faceEyeSize: 35,
  faceEyeAspect: 0.7,
  faceEyeRoundness: 2,
  facePupilSize: 10,
  facePupilOffX: 0,
  facePupilOffY: 0,
  // Face — Eyebrows
  faceBrowArch: 12,
  faceBrowLength: 40,
  faceBrowGap: 15,
  faceBrowAngle: 0,
  // Face — Nose
  faceNoseLength: 40,
  faceNoseWidth: 20,
  // Face — Mouth
  faceMouthWidth: 55,
  faceMouthCurve: 15,
  faceMouthY: 80,
  faceMouthOpen: 0,
  // Face — Ears
  faceEarSize: 20,
  faceEarHeight: 35,
  faceEarY: -10,
  faceEarPointy: 0.3,
  // Face — Transform & Resolution
  faceDetail: 64,
  faceScale: 1.0,
  faceRotation: 0,
  faceAnimatePupils: true,

  // Wireframe — Shape
  wireShape: 'cube',
  wireScale: 150,
  // Wireframe — Rotation
  wireRotX: 0.4,
  wireRotY: 0.3,
  wireRotZ: 0,
  wireSpeedX: 0.008,
  wireSpeedY: 0.006,
  wireSpeedZ: 0,
  wireAutoRotate: true,
  // Wireframe — Projection
  wirePerspective: 800,
  // Wireframe — Surface Detail
  wireRings: 12,
  wireSegments: 16,
  // Wireframe — Shape-specific
  wireTubeRatio: 0.35,
  wireTopRadius: 1.0,
  wirePrismSides: 5,
  // Wireframe — Depth
  wireDepthShading: true,
  wireDepthMin: 0.3,

  // Oscilloscope
  scopeEnabled: false,
  audioOutput: 'default',
  xyVolume: 0.5,
  xyFreq: 50,
  xyAmp: 1.0,
  xySmooth: 2,
  scopeHue: 120,
  scopePersistence: -1,
  scopeThickness: 0.01,
  scopeIntensity: 0.0,
  scopeGain: 0.1,
};

export const PARAM_RANGES = {
  freqX: { min: 1, max: 20 },
  freqY: { min: 1, max: 20 },
  delta: { min: 0, max: Math.PI * 2 },
  ampX: { min: 10, max: 400 },
  ampY: { min: 10, max: 400 },
  numPoints: { min: 100, max: 5000 },
  strokeWeight: { min: 0.5, max: 10 },
  bgAlpha: { min: 0, max: 255 },
  speed: { min: 0.001, max: 0.05 },
  dotSize: { min: 2, max: 20 },
  // Face params
  faceHeadWidth: { min: 50, max: 350 },
  faceHeadHeight: { min: 50, max: 380 },
  faceHeadRoundness: { min: 1.5, max: 6 },
  faceEyeSpacing: { min: 20, max: 160 },
  faceEyeY: { min: -150, max: 50 },
  faceEyeSize: { min: 8, max: 80 },
  faceEyeAspect: { min: 0.3, max: 1.5 },
  faceEyeRoundness: { min: 1, max: 5 },
  facePupilSize: { min: 2, max: 35 },
  facePupilOffX: { min: -1, max: 1 },
  facePupilOffY: { min: -1, max: 1 },
  faceBrowArch: { min: -20, max: 40 },
  faceBrowLength: { min: 10, max: 90 },
  faceBrowGap: { min: 3, max: 45 },
  faceBrowAngle: { min: -0.5, max: 0.5 },
  faceNoseLength: { min: 5, max: 100 },
  faceNoseWidth: { min: 3, max: 60 },
  faceMouthWidth: { min: 10, max: 160 },
  faceMouthCurve: { min: -50, max: 50 },
  faceMouthY: { min: 20, max: 180 },
  faceMouthOpen: { min: 0, max: 40 },
  faceEarSize: { min: 0, max: 60 },
  faceEarHeight: { min: 10, max: 80 },
  faceEarY: { min: -80, max: 50 },
  faceEarPointy: { min: 0, max: 1 },
  faceDetail: { min: 16, max: 256 },
  faceScale: { min: 0.3, max: 2.0 },
  faceRotation: { min: -0.5, max: 0.5 },
  // Wireframe params
  wireScale: { min: 30, max: 380 },
  wireRotX: { min: 0, max: Math.PI * 2 },
  wireRotY: { min: 0, max: Math.PI * 2 },
  wireRotZ: { min: 0, max: Math.PI * 2 },
  wireSpeedX: { min: 0, max: 0.05 },
  wireSpeedY: { min: 0, max: 0.05 },
  wireSpeedZ: { min: 0, max: 0.05 },
  wirePerspective: { min: 200, max: 2000 },
  wireRings: { min: 3, max: 40 },
  wireSegments: { min: 3, max: 48 },
  wireTubeRatio: { min: 0.05, max: 0.9 },
  wireTopRadius: { min: 0, max: 1 },
  wirePrismSides: { min: 3, max: 12 },
  wireDepthMin: { min: 0.1, max: 1.0 },
  // Oscilloscope params
  xyVolume: { min: 0, max: 1 },
  xyFreq: { min: 20, max: 200 },
  xyAmp: { min: 0, max: 1 },
  xySmooth: { min: 0, max: 10 },
  scopeHue: { min: 0, max: 360 },
  scopePersistence: { min: -2, max: 0 },
  scopeThickness: { min: 0.001, max: 0.1 },
  scopeIntensity: { min: -1, max: 1 },
  scopeGain: { min: 0.01, max: 1 },
};

export const SCOPE_PARAM_KEYS = [
  'scopeEnabled', 'audioOutput', 'xyVolume', 'xyFreq', 'xyAmp',
  'xySmooth', 'scopeHue', 'scopePersistence', 'scopeThickness',
  'scopeIntensity', 'scopeGain',
];

export const FACE_PARAM_KEYS = [
  'faceHeadWidth', 'faceHeadHeight', 'faceHeadRoundness',
  'faceEyeSpacing', 'faceEyeY', 'faceEyeSize', 'faceEyeAspect',
  'faceEyeRoundness', 'facePupilSize', 'facePupilOffX', 'facePupilOffY',
  'faceBrowArch', 'faceBrowLength', 'faceBrowGap', 'faceBrowAngle',
  'faceNoseLength', 'faceNoseWidth',
  'faceMouthWidth', 'faceMouthCurve', 'faceMouthY', 'faceMouthOpen',
  'faceEarSize', 'faceEarHeight', 'faceEarY', 'faceEarPointy',
  'faceDetail', 'faceScale', 'faceRotation', 'faceAnimatePupils',
];

export const WIREFRAME_PARAM_KEYS = [
  'wireShape', 'wireScale',
  'wireRotX', 'wireRotY', 'wireRotZ',
  'wireSpeedX', 'wireSpeedY', 'wireSpeedZ', 'wireAutoRotate',
  'wirePerspective',
  'wireRings', 'wireSegments',
  'wireTubeRatio', 'wireTopRadius', 'wirePrismSides',
  'wireDepthShading', 'wireDepthMin',
];
