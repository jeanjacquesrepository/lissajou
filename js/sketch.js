import { generateCurve, lissajousPoint } from './lissajous.js';
import { generateFace } from './face.js';
import { generateWireframe } from './wireframe.js';
import { hexToRgb } from './utils.js';
import { CANVAS_SIZE } from './config.js';

export function createSketch(params) {
  return function (p) {
    let animationT = 0;
    let xy;
    let currentOutputId = 'default';
    let audioResumed = false;

    p.setup = function () {
      const canvas = p.createCanvas(CANVAS_SIZE.width, CANVAS_SIZE.height);
      canvas.parent('canvas-container');
      p.frameRate(24);

      xy = new XYscope(p);
      xy.volume(0);

      // Resume AudioContext on any click anywhere on the page
      document.addEventListener('click', resumeAudio);
    };

    function resumeAudio() {
      if (audioResumed) return;
      if (xy && xy.ac) {
        xy.ac.resume().then(() => {
          console.log('XYscope AudioContext resumed, state:', xy.ac.state);
          audioResumed = true;
        });
      }
      const overlay = document.getElementById('start-overlay');
      if (overlay) overlay.style.display = 'none';
    }

    p.draw = function () {
      // Switch audio output device if changed
      if (params.audioOutput !== currentOutputId && xy && xy.ac) {
        if (typeof xy.ac.setSinkId === 'function') {
          xy.ac.setSinkId(params.audioOutput).then(() => {
            currentOutputId = params.audioOutput;
            console.log('Audio output set to:', params.audioOutput);
          }).catch(err => {
            console.warn('Could not set audio output:', err);
          });
        }
        currentOutputId = params.audioOutput;
      }

      if (params.scopeEnabled) {
        // Ensure audio is resumed when scope is enabled
        if (!audioResumed) resumeAudio();
        drawScopeMode(p, params, xy);
      } else {
        drawNormalMode(p, params);
        xy.volume(0);
      }

      // Animate delta
      if (params.animate) {
        params.delta += params.speed;
        if (params.delta > Math.PI * 2) {
          params.delta -= Math.PI * 2;
        }
        animationT += params.speed * 10;
      }
    };

    function getGeometry(params) {
      if (params.mode === 'face') {
        // Animate pupils from delta if enabled
        if (params.faceAnimatePupils && params.animate) {
          params.facePupilOffX = Math.cos(params.delta) * 0.5;
          params.facePupilOffY = Math.sin(params.delta) * 0.3;
        }
        return generateFace(params);
      }
      if (params.mode === 'wireframe') {
        // Auto-rotate 3D solid
        if (params.wireAutoRotate && params.animate) {
          params.wireRotX += params.wireSpeedX;
          params.wireRotY += params.wireSpeedY;
          params.wireRotZ += params.wireSpeedZ;
          if (params.wireRotX > Math.PI * 2) params.wireRotX -= Math.PI * 2;
          if (params.wireRotY > Math.PI * 2) params.wireRotY -= Math.PI * 2;
          if (params.wireRotZ > Math.PI * 2) params.wireRotZ -= Math.PI * 2;
        }
        return generateWireframe(params);
      }
      return [{ points: generateCurve(params), closed: false }];
    }

    function drawNormalMode(p, params) {
      const bg = hexToRgb(params.bgColor);
      if (bg) {
        p.background(bg.r, bg.g, bg.b, params.bgAlpha);
      }

      p.translate(CANVAS_SIZE.width / 2, CANVAS_SIZE.height / 2);

      const sc = hexToRgb(params.strokeColor);
      if (sc) {
        p.stroke(sc.r, sc.g, sc.b);
      }
      p.strokeWeight(params.strokeWeight);
      p.noFill();

      const strokes = getGeometry(params);
      const useDepthShading = params.mode === 'wireframe' && params.wireDepthShading && sc;

      // Pre-compute depth range for shading
      let depthMin = Infinity, depthMax = -Infinity;
      if (useDepthShading) {
        for (const stroke of strokes) {
          if (stroke.depth !== undefined) {
            if (stroke.depth < depthMin) depthMin = stroke.depth;
            if (stroke.depth > depthMax) depthMax = stroke.depth;
          }
        }
      }

      for (const stroke of strokes) {
        if (useDepthShading && stroke.depth !== undefined && depthMax > depthMin) {
          const t = (stroke.depth - depthMin) / (depthMax - depthMin);
          const brightness = 1 - t * (1 - params.wireDepthMin);
          p.stroke(sc.r * brightness, sc.g * brightness, sc.b * brightness);
        }
        p.beginShape();
        for (const pt of stroke.points) {
          p.vertex(pt.x, pt.y);
        }
        if (stroke.closed) {
          p.endShape(p.CLOSE);
        } else {
          p.endShape();
        }
      }

      // Reset stroke color after depth shading
      if (useDepthShading && sc) {
        p.stroke(sc.r, sc.g, sc.b);
      }

      if (params.showDot && params.mode === 'lissajous') {
        const dotPos = lissajousPoint(animationT, params);
        p.noStroke();
        if (sc) {
          p.fill(sc.r, sc.g, sc.b);
        }
        p.ellipse(dotPos.x, dotPos.y, params.dotSize, params.dotSize);
      }
    }

    function drawScopeMode(p, params, xy) {
      p.background(0);

      xy.clearWaves();

      const strokes = getGeometry(params);
      const cx = CANVAS_SIZE.width / 2;
      const cy = CANVAS_SIZE.height / 2;

      for (const stroke of strokes) {
        xy.beginShape();
        for (const pt of stroke.points) {
          xy.vertex(pt.x + cx, pt.y + cy);
        }
        xy.endShape();
      }

      xy.buildWaves();

      xy.drawXY({
        hue: params.scopeHue,
        persistence: params.scopePersistence,
        thickness: params.scopeThickness,
        intensity: params.scopeIntensity,
        gain: params.scopeGain,
      });

      xy.freq(params.xyFreq);
      xy.amp(params.xyAmp);
      xy.volume(params.xyVolume);

      if (params.xySmooth > 0) {
        xy.smooth(params.xySmooth);
      } else {
        xy.noSmooth();
      }
    }
  };
}
