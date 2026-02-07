import { DEFAULT_PARAMS } from './config.js';
import { createSketch } from './sketch.js';
import { createGUI } from './gui.js';

const params = { ...DEFAULT_PARAMS };

// Create p5 instance
new p5(createSketch(params), document.getElementById('canvas-container'));

// Create GUI
createGUI(params, () => {
  // params object is mutated directly by lil-gui, so no extra wiring needed
});
