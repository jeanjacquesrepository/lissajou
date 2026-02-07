import { generateCurve, lissajousPoint } from './lissajous.js';
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

      const points = generateCurve(params);
      p.beginShape();
      for (const pt of points) {
        p.vertex(pt.x, pt.y);
      }
      p.endShape();

      if (params.showDot) {
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

      const points = generateCurve(params);
      const cx = CANVAS_SIZE.width / 2;
      const cy = CANVAS_SIZE.height / 2;

      xy.beginShape();
      for (const pt of points) {
        xy.vertex(pt.x + cx, pt.y + cy);
      }
      xy.endShape();

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
