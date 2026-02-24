import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm';
import { PARAM_RANGES, SCOPE_PARAM_KEYS } from './config.js';
import { COLLECTION_NAMES, generateFromHash, randomHash } from './generative.js';
import { SHAPE_NAMES } from './wireframe.js';

export function createGUI(params, onChange) {
  const gui = new GUI({ title: 'Lissajous Controls' });

  // --- Mode selector (top level) ---
  const R = PARAM_RANGES;

  function updateFolderVisibility() {
    curve.hide();
    face.hide();
    wire.hide();
    if (params.mode === 'lissajous') {
      curve.show();
    } else if (params.mode === 'face') {
      face.show();
    } else if (params.mode === 'wireframe') {
      wire.show();
    }
  }

  // Map modes to their default collection
  const DEFAULT_COLLECTION_FOR_MODE = {
    lissajous: 'Harmonograph',
    face: 'Face Portrait',
    wireframe: 'Geometric Spin',
  };

  // --- Generative folder ---
  const genState = {
    collection: COLLECTION_NAMES[0],
    hash: randomHash(),
    lockScope: false,
  };

  gui.add(params, 'mode', ['lissajous', 'face', 'wireframe']).name('Mode').onChange(() => {
    // Auto-select a collection matching the new mode
    genState.collection = DEFAULT_COLLECTION_FOR_MODE[params.mode] || COLLECTION_NAMES[0];
    updateFolderVisibility();
    gui.controllersRecursive().forEach(c => c.updateDisplay());
    onChange();
  });

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
    updateFolderVisibility();
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

  // --- Curve folder (lissajous mode) ---
  const curve = gui.addFolder('Curve');
  curve.add(params, 'freqX', R.freqX.min, R.freqX.max, 1).name('Freq X').onChange(onChange);
  curve.add(params, 'freqY', R.freqY.min, R.freqY.max, 1).name('Freq Y').onChange(onChange);
  curve.add(params, 'delta', R.delta.min, R.delta.max, 0.01).name('Delta (δ)').listen().onChange(onChange);
  curve.add(params, 'ampX', R.ampX.min, R.ampX.max, 1).name('Amp X').onChange(onChange);
  curve.add(params, 'ampY', R.ampY.min, R.ampY.max, 1).name('Amp Y').onChange(onChange);
  curve.add(params, 'numPoints', R.numPoints.min, R.numPoints.max, 10).name('Points').onChange(onChange);

  // --- Face folder (face mode) ---
  const face = gui.addFolder('Face');

  const faceHead = face.addFolder('Head');
  faceHead.add(params, 'faceHeadWidth', R.faceHeadWidth.min, R.faceHeadWidth.max, 1).name('Width').onChange(onChange);
  faceHead.add(params, 'faceHeadHeight', R.faceHeadHeight.min, R.faceHeadHeight.max, 1).name('Height').onChange(onChange);
  faceHead.add(params, 'faceHeadRoundness', R.faceHeadRoundness.min, R.faceHeadRoundness.max, 0.1).name('Roundness').onChange(onChange);

  const faceEyes = face.addFolder('Eyes');
  faceEyes.add(params, 'faceEyeSpacing', R.faceEyeSpacing.min, R.faceEyeSpacing.max, 1).name('Spacing').onChange(onChange);
  faceEyes.add(params, 'faceEyeY', R.faceEyeY.min, R.faceEyeY.max, 1).name('Vertical Pos').onChange(onChange);
  faceEyes.add(params, 'faceEyeSize', R.faceEyeSize.min, R.faceEyeSize.max, 1).name('Size').onChange(onChange);
  faceEyes.add(params, 'faceEyeAspect', R.faceEyeAspect.min, R.faceEyeAspect.max, 0.05).name('Aspect').onChange(onChange);
  faceEyes.add(params, 'faceEyeRoundness', R.faceEyeRoundness.min, R.faceEyeRoundness.max, 0.1).name('Roundness').onChange(onChange);
  faceEyes.add(params, 'facePupilSize', R.facePupilSize.min, R.facePupilSize.max, 1).name('Pupil Size').onChange(onChange);
  faceEyes.add(params, 'facePupilOffX', R.facePupilOffX.min, R.facePupilOffX.max, 0.05).name('Pupil X').listen().onChange(onChange);
  faceEyes.add(params, 'facePupilOffY', R.facePupilOffY.min, R.facePupilOffY.max, 0.05).name('Pupil Y').listen().onChange(onChange);

  const faceBrows = face.addFolder('Eyebrows');
  faceBrows.add(params, 'faceBrowArch', R.faceBrowArch.min, R.faceBrowArch.max, 1).name('Arch').onChange(onChange);
  faceBrows.add(params, 'faceBrowLength', R.faceBrowLength.min, R.faceBrowLength.max, 1).name('Length').onChange(onChange);
  faceBrows.add(params, 'faceBrowGap', R.faceBrowGap.min, R.faceBrowGap.max, 1).name('Gap Above Eye').onChange(onChange);
  faceBrows.add(params, 'faceBrowAngle', R.faceBrowAngle.min, R.faceBrowAngle.max, 0.01).name('Angle').onChange(onChange);
  faceBrows.close();

  const faceNose = face.addFolder('Nose');
  faceNose.add(params, 'faceNoseLength', R.faceNoseLength.min, R.faceNoseLength.max, 1).name('Length').onChange(onChange);
  faceNose.add(params, 'faceNoseWidth', R.faceNoseWidth.min, R.faceNoseWidth.max, 1).name('Width').onChange(onChange);
  faceNose.close();

  const faceMouth = face.addFolder('Mouth');
  faceMouth.add(params, 'faceMouthWidth', R.faceMouthWidth.min, R.faceMouthWidth.max, 1).name('Width').onChange(onChange);
  faceMouth.add(params, 'faceMouthCurve', R.faceMouthCurve.min, R.faceMouthCurve.max, 1).name('Curve (smile)').onChange(onChange);
  faceMouth.add(params, 'faceMouthY', R.faceMouthY.min, R.faceMouthY.max, 1).name('Vertical Pos').onChange(onChange);
  faceMouth.add(params, 'faceMouthOpen', R.faceMouthOpen.min, R.faceMouthOpen.max, 1).name('Open').onChange(onChange);
  faceMouth.close();

  const faceEars = face.addFolder('Ears');
  faceEars.add(params, 'faceEarSize', R.faceEarSize.min, R.faceEarSize.max, 1).name('Size').onChange(onChange);
  faceEars.add(params, 'faceEarHeight', R.faceEarHeight.min, R.faceEarHeight.max, 1).name('Height').onChange(onChange);
  faceEars.add(params, 'faceEarY', R.faceEarY.min, R.faceEarY.max, 1).name('Vertical Pos').onChange(onChange);
  faceEars.add(params, 'faceEarPointy', R.faceEarPointy.min, R.faceEarPointy.max, 0.05).name('Pointiness').onChange(onChange);
  faceEars.close();

  const faceTransform = face.addFolder('Transform');
  faceTransform.add(params, 'faceDetail', R.faceDetail.min, R.faceDetail.max, 4).name('Detail').onChange(onChange);
  faceTransform.add(params, 'faceScale', R.faceScale.min, R.faceScale.max, 0.05).name('Scale').onChange(onChange);
  faceTransform.add(params, 'faceRotation', R.faceRotation.min, R.faceRotation.max, 0.01).name('Rotation').onChange(onChange);
  faceTransform.add(params, 'faceAnimatePupils').name('Animate Pupils').onChange(onChange);
  faceTransform.close();

  face.hide();

  // --- Wireframe folder (wireframe mode) ---
  const wire = gui.addFolder('Wireframe');

  const wireShapeFolder = wire.addFolder('Shape');
  wireShapeFolder.add(params, 'wireShape', SHAPE_NAMES).name('Type').onChange(onChange);
  wireShapeFolder.add(params, 'wireScale', R.wireScale.min, R.wireScale.max, 1).name('Scale').onChange(onChange);

  const wireRotFolder = wire.addFolder('Rotation');
  wireRotFolder.add(params, 'wireAutoRotate').name('Auto-Rotate').onChange(onChange);
  wireRotFolder.add(params, 'wireSpeedX', R.wireSpeedX.min, R.wireSpeedX.max, 0.001).name('Speed X').onChange(onChange);
  wireRotFolder.add(params, 'wireSpeedY', R.wireSpeedY.min, R.wireSpeedY.max, 0.001).name('Speed Y').onChange(onChange);
  wireRotFolder.add(params, 'wireSpeedZ', R.wireSpeedZ.min, R.wireSpeedZ.max, 0.001).name('Speed Z').onChange(onChange);
  wireRotFolder.add(params, 'wireRotX', R.wireRotX.min, R.wireRotX.max, 0.01).name('Angle X').listen().onChange(onChange);
  wireRotFolder.add(params, 'wireRotY', R.wireRotY.min, R.wireRotY.max, 0.01).name('Angle Y').listen().onChange(onChange);
  wireRotFolder.add(params, 'wireRotZ', R.wireRotZ.min, R.wireRotZ.max, 0.01).name('Angle Z').listen().onChange(onChange);

  const wireProjFolder = wire.addFolder('Projection');
  wireProjFolder.add(params, 'wirePerspective', R.wirePerspective.min, R.wirePerspective.max, 10).name('Camera Dist').onChange(onChange);
  wireProjFolder.close();

  const wireSurfFolder = wire.addFolder('Surface Detail');
  wireSurfFolder.add(params, 'wireRings', R.wireRings.min, R.wireRings.max, 1).name('Rings').onChange(onChange);
  wireSurfFolder.add(params, 'wireSegments', R.wireSegments.min, R.wireSegments.max, 1).name('Segments').onChange(onChange);
  wireSurfFolder.close();

  const wireParamFolder = wire.addFolder('Shape Params');
  wireParamFolder.add(params, 'wireTubeRatio', R.wireTubeRatio.min, R.wireTubeRatio.max, 0.01).name('Tube Ratio (torus)').onChange(onChange);
  wireParamFolder.add(params, 'wireTopRadius', R.wireTopRadius.min, R.wireTopRadius.max, 0.01).name('Top Radius (cyl)').onChange(onChange);
  wireParamFolder.add(params, 'wirePrismSides', R.wirePrismSides.min, R.wirePrismSides.max, 1).name('Prism Sides').onChange(onChange);
  wireParamFolder.close();

  const wireDepthFolder = wire.addFolder('Depth');
  wireDepthFolder.add(params, 'wireDepthShading').name('Depth Shading').onChange(onChange);
  wireDepthFolder.add(params, 'wireDepthMin', R.wireDepthMin.min, R.wireDepthMin.max, 0.05).name('Min Brightness').onChange(onChange);
  wireDepthFolder.close();

  wire.hide();

  // --- Style folder ---
  const style = gui.addFolder('Style');
  style.addColor(params, 'strokeColor').name('Stroke Color').onChange(onChange);
  style.add(params, 'strokeWeight', R.strokeWeight.min, R.strokeWeight.max, 0.1).name('Stroke Weight').onChange(onChange);
  style.addColor(params, 'bgColor').name('Background').onChange(onChange);
  style.add(params, 'bgAlpha', R.bgAlpha.min, R.bgAlpha.max, 1).name('BG Alpha (trails)').onChange(onChange);

  // --- Animation folder ---
  const anim = gui.addFolder('Animation');
  anim.add(params, 'animate').name('Animate').onChange(onChange);
  anim.add(params, 'speed', R.speed.min, R.speed.max, 0.001).name('Speed').onChange(onChange);
  anim.add(params, 'showDot').name('Show Dot').onChange(onChange);
  anim.add(params, 'dotSize', R.dotSize.min, R.dotSize.max, 1).name('Dot Size').onChange(onChange);

  // --- Oscilloscope folder ---
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

  scope.add(params, 'xyVolume', R.xyVolume.min, R.xyVolume.max, 0.01).name('Volume').onChange(onChange);
  scope.add(params, 'xyFreq', R.xyFreq.min, R.xyFreq.max, 1).name('Frequency (Hz)').onChange(onChange);
  scope.add(params, 'xyAmp', R.xyAmp.min, R.xyAmp.max, 0.01).name('Amplitude').onChange(onChange);
  scope.add(params, 'xySmooth', R.xySmooth.min, R.xySmooth.max, 1).name('Smooth').onChange(onChange);
  scope.add(params, 'scopeHue', R.scopeHue.min, R.scopeHue.max, 1).name('Hue').onChange(onChange);
  scope.add(params, 'scopePersistence', R.scopePersistence.min, R.scopePersistence.max, 0.1).name('Persistence').onChange(onChange);
  scope.add(params, 'scopeThickness', R.scopeThickness.min, R.scopeThickness.max, 0.001).name('Thickness').onChange(onChange);
  scope.add(params, 'scopeIntensity', R.scopeIntensity.min, R.scopeIntensity.max, 0.1).name('Intensity').onChange(onChange);
  scope.add(params, 'scopeGain', R.scopeGain.min, R.scopeGain.max, 0.01).name('Gain').onChange(onChange);
  scope.close();

  return gui;
}
