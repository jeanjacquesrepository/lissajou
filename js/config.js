export const CANVAS_SIZE = { width: 800, height: 800 };

export const DEFAULT_PARAMS = {
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
