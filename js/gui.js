import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm';
import { PARAM_RANGES, SCOPE_PARAM_KEYS } from './config.js';
import { COLLECTION_NAMES, generateFromHash, randomHash } from './generative.js';

export function createGUI(params, onChange) {
  const gui = new GUI({ title: 'Lissajous Controls' });

  // --- Generative folder (first) ---
  const genState = {
    collection: COLLECTION_NAMES[0],
    hash: randomHash(),
    lockScope: false,
  };

  function applyGenerated() {
    const generated = generateFromHash(genState.hash, genState.collection);
    const scopeSnapshot = {};
    if (genState.lockScope) {
      for (const key of SCOPE_PARAM_KEYS) {
        scopeSnapshot[key] = params[key];
      }
    }
    Object.assign(params, generated);
    if (genState.lockScope) {
      Object.assign(params, scopeSnapshot);
    }
    gui.controllersRecursive().forEach(c => c.updateDisplay());
    onChange();
  }

  const gen = gui.addFolder('Generative');
  gen.add(genState, 'collection', COLLECTION_NAMES).name('Collection');
  gen.add(genState, 'hash').name('Hash');
  gen.add({ generate: () => applyGenerated() }, 'generate').name('Generate');
  gen.add({
    newSeed: () => {
      genState.hash = randomHash();
      gui.controllersRecursive().forEach(c => c.updateDisplay());
      applyGenerated();
    },
  }, 'newSeed').name('New Seed');
  gen.add(genState, 'lockScope').name('Lock Scope Settings');

  // Curve folder
  const curve = gui.addFolder('Curve');
  curve.add(params, 'freqX', PARAM_RANGES.freqX.min, PARAM_RANGES.freqX.max, 1).name('Freq X').onChange(onChange);
  curve.add(params, 'freqY', PARAM_RANGES.freqY.min, PARAM_RANGES.freqY.max, 1).name('Freq Y').onChange(onChange);
  curve.add(params, 'delta', PARAM_RANGES.delta.min, PARAM_RANGES.delta.max, 0.01).name('Delta (δ)').listen().onChange(onChange);
  curve.add(params, 'ampX', PARAM_RANGES.ampX.min, PARAM_RANGES.ampX.max, 1).name('Amp X').onChange(onChange);
  curve.add(params, 'ampY', PARAM_RANGES.ampY.min, PARAM_RANGES.ampY.max, 1).name('Amp Y').onChange(onChange);
  curve.add(params, 'numPoints', PARAM_RANGES.numPoints.min, PARAM_RANGES.numPoints.max, 10).name('Points').onChange(onChange);

  // Style folder
  const style = gui.addFolder('Style');
  style.addColor(params, 'strokeColor').name('Stroke Color').onChange(onChange);
  style.add(params, 'strokeWeight', PARAM_RANGES.strokeWeight.min, PARAM_RANGES.strokeWeight.max, 0.1).name('Stroke Weight').onChange(onChange);
  style.addColor(params, 'bgColor').name('Background').onChange(onChange);
  style.add(params, 'bgAlpha', PARAM_RANGES.bgAlpha.min, PARAM_RANGES.bgAlpha.max, 1).name('BG Alpha (trails)').onChange(onChange);

  // Animation folder
  const anim = gui.addFolder('Animation');
  anim.add(params, 'animate').name('Animate').onChange(onChange);
  anim.add(params, 'speed', PARAM_RANGES.speed.min, PARAM_RANGES.speed.max, 0.001).name('Speed').onChange(onChange);
  anim.add(params, 'showDot').name('Show Dot').onChange(onChange);
  anim.add(params, 'dotSize', PARAM_RANGES.dotSize.min, PARAM_RANGES.dotSize.max, 1).name('Dot Size').onChange(onChange);

  // Oscilloscope folder
  const scope = gui.addFolder('Oscilloscope');
  scope.add(params, 'scopeEnabled').name('Scope Enabled').onChange(onChange);

  // Audio output device selector
  const outputDevices = { 'Default': 'default' };
  const outputController = scope.add(params, 'audioOutput', outputDevices).name('Audio Output').onChange(onChange);

  // Enumerate audio output devices and populate the dropdown.
  // A brief getUserMedia call is needed to unlock device labels.
  async function refreshAudioOutputs() {
    if (!navigator.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch (e) {
      // Permission denied — fall back to unlabelled devices
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = { 'Default': 'default' };
      for (const device of devices) {
        if (device.kind === 'audiooutput') {
          const label = device.label || `Output ${device.deviceId.slice(0, 8)}`;
          outputs[label] = device.deviceId;
        }
      }
      outputController.options(outputs);
    } catch (e) {
      // enumerateDevices not supported
    }
  }
  refreshAudioOutputs();

  scope.add(params, 'xyVolume', PARAM_RANGES.xyVolume.min, PARAM_RANGES.xyVolume.max, 0.01).name('Volume').onChange(onChange);
  scope.add(params, 'xyFreq', PARAM_RANGES.xyFreq.min, PARAM_RANGES.xyFreq.max, 1).name('Frequency (Hz)').onChange(onChange);
  scope.add(params, 'xyAmp', PARAM_RANGES.xyAmp.min, PARAM_RANGES.xyAmp.max, 0.01).name('Amplitude').onChange(onChange);
  scope.add(params, 'xySmooth', PARAM_RANGES.xySmooth.min, PARAM_RANGES.xySmooth.max, 1).name('Smooth').onChange(onChange);
  scope.add(params, 'scopeHue', PARAM_RANGES.scopeHue.min, PARAM_RANGES.scopeHue.max, 1).name('Hue').onChange(onChange);
  scope.add(params, 'scopePersistence', PARAM_RANGES.scopePersistence.min, PARAM_RANGES.scopePersistence.max, 0.1).name('Persistence').onChange(onChange);
  scope.add(params, 'scopeThickness', PARAM_RANGES.scopeThickness.min, PARAM_RANGES.scopeThickness.max, 0.001).name('Thickness').onChange(onChange);
  scope.add(params, 'scopeIntensity', PARAM_RANGES.scopeIntensity.min, PARAM_RANGES.scopeIntensity.max, 0.1).name('Intensity').onChange(onChange);
  scope.add(params, 'scopeGain', PARAM_RANGES.scopeGain.min, PARAM_RANGES.scopeGain.max, 0.01).name('Gain').onChange(onChange);
  scope.close();

  return gui;
}
