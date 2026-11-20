// LEONIDA GOLD — Vice Cover Studio editor wiring.
// Pick a photo, pick a layout and grade, edit the caption, export PNGs.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover, LAYOUTS, GRADES, PANELS } from './cover.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const status = document.getElementById('status');
const layoutsEl = document.getElementById('layouts');
const gradesEl = document.getElementById('grades');
const thumbsEl = document.getElementById('thumbs');
const chipsEl = document.getElementById('chips');
const zoomEl = document.getElementById('zoom');

const SAMPLE_KEYS = PANELS.map((p) => p.key);
const PREVIEW_SIZE = {
  poster: [1280, 720],
  hero: [1024, 1280],
  split: [1080, 1080],
  triptych: [1280, 720],
  quad: [1280, 720],
  spotlight: [1280, 720],
  strip: [1280, 720],
  duo: [1280, 720],
};

const state = {
  layout: 'poster',
  grade: 'sunset',
  caption: 'LEONIDA GOLD',
  photos: [null, null, null, null, null],
  selected: 0,
  // Per-panel user framing: { z, px, py } — zoom and pan offsets.
  frame: {},
};

let drawing = Promise.resolve();

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSamples() {
  const loaded = await Promise.all(
    SAMPLE_KEYS.map((k) => loadImage(`samples/${k}.jpg`).catch(() => null)),
  );
  state.photos = loaded;
}

function frameOverrides() {
  const out = {};
  for (const [k, v] of Object.entries(state.frame)) out[k] = v;
  return out;
}

function redraw() {
  drawing = drawing.then(async () => {
    const [pw, ph] = PREVIEW_SIZE[state.layout] || [1280, 720];
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    await document.fonts.ready;
    await drawCover(canvas, state.photos, {
      layout: state.layout,
      grade: state.grade,
      caption: state.caption,
      frameOverrides: frameOverrides(),
    });
  });
  return drawing;
}

function markActive() {
  for (const b of layoutsEl.querySelectorAll('button')) {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  }
  for (const b of gradesEl.querySelectorAll('button')) {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  }
  for (const b of chipsEl.querySelectorAll('button')) {
    b.classList.toggle('active', Number(b.dataset.panel) === state.selected);
  }
  for (const img of thumbsEl.querySelectorAll('img')) {
    img.classList.toggle('active', Number(img.dataset.panel) === state.selected);
  }
  const f = state.frame[state.selected];
  zoomEl.value = f && f.z ? f.z : 1;
}

function buildControls() {
  for (const [key, L] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = L.name;
    b.dataset.layout = key;
    b.addEventListener('click', () => { state.layout = key; markActive(); redraw(); });
    layoutsEl.appendChild(b);
  }
  for (const [key, g] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = g.name;
    b.dataset.grade = key;
    b.addEventListener('click', () => { state.grade = key; markActive(); redraw(); });
    gradesEl.appendChild(b);
  }
  PANELS.forEach((p, i) => {
    const img = document.createElement('img');
    img.src = `samples/${p.key}.jpg`;
    img.alt = p.role;
    img.dataset.panel = i;
    img.addEventListener('click', () => { state.selected = i; markActive(); });
    thumbsEl.appendChild(img);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.textContent = `Panel ${i + 1} · ${p.role}`;
    chip.dataset.panel = i;
    chip.addEventListener('click', () => { state.selected = i; markActive(); });
    chipsEl.appendChild(chip);
  });
}

async function exportPNG(w, h) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  await drawCover(off, state.photos, {
    layout: state.layout,
    grade: state.grade,
    caption: state.caption,
    frameOverrides: frameOverrides(),
  });
  const t0 = performance.now();
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  const ms = Math.round(performance.now() - t0);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cover-${w}x${h}.png`;
  a.click();
  status.textContent = `Saved cover-${w}x${h}.png (${(blob.size / 1048576).toFixed(2)} MB, painted in ${ms} ms)`;
  return blob.size;
}

document.getElementById('export-1080').addEventListener('click', () => exportPNG(1080, 1080));
document.getElementById('export-1350').addEventListener('click', () => exportPNG(1080, 1350));
document.getElementById('export-1920').addEventListener('click', () => exportPNG(1920, 1080));
document.getElementById('export-all').addEventListener('click', async () => {
  await exportPNG(1080, 1080);
  await exportPNG(1080, 1350);
  await exportPNG(1920, 1080);
  status.textContent = 'Saved all 3 sizes: 1080×1080, 1080×1350, 1920×1080.';
});

document.getElementById('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  for (const file of files) {
    const img = await loadImage(URL.createObjectURL(file));
    state.photos[state.selected] = img;
  }
  status.textContent = `Photo loaded into Panel ${state.selected + 1}.`;
  redraw();
});

document.getElementById('use-all').addEventListener('click', () => {
  const img = state.photos[state.selected];
  if (!img) return;
  state.photos = state.photos.map(() => img);
  status.textContent = 'Same photo in all panels.';
  redraw();
});

document.getElementById('restore').addEventListener('click', async () => {
  await loadSamples();
  state.frame = {};
  status.textContent = 'Sample photos restored.';
  markActive();
  redraw();
});

captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  redraw();
});

zoomEl.addEventListener('input', () => {
  const f = state.frame[state.selected] || {};
  f.z = Number(zoomEl.value);
  state.frame[state.selected] = f;
  redraw();
});

// Drag on the preview to pan the selected panel's photo.
function pointInPoly(x, y, poly, w, h) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0] * w, yi = poly[i][1] * h;
    const xj = poly[j][0] * w, yj = poly[j][1] * h;
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  const L = LAYOUTS[state.layout] || LAYOUTS.poster;
  for (let i = 0; i < 5; i++) {
    if (pointInPoly(x, y, L.polys[i], canvas.width, canvas.height)) {
      state.selected = i;
      markActive();
      drag = { x, y, panel: i };
      canvas.setPointerCapture(e.pointerId);
      break;
    }
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  const f = state.frame[drag.panel] || {};
  f.px = (f.px || 0) + (x - drag.x) / canvas.width;
  f.py = (f.py || 0) + (y - drag.y) / canvas.height;
  state.frame[drag.panel] = f;
  drag = { x, y, panel: drag.panel };
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

const shot = new URLSearchParams(location.search).get('shot');
buildControls();
markActive();
if (shot) {
  const { runShot } = await import('./shots.js');
  await loadSamples();
  await runShot(shot, new URLSearchParams(location.search), {
    state,
    redraw,
    markActive,
    loadImage,
  });
} else {
  await loadSamples();
  redraw();
}
