// LEONIDA GOLD editor wiring: photo upload, sample picking, layout and grade
// controls, per-panel crop (drag to pan, wheel to zoom), caption editing and
// PNG export in the three post sizes. Screenshot mode (?shot=cover|editor)
// renders a fixed scene for the entry's screenshots and sets
// window.__shotReady once painted.

import { LAYOUTS, GRADES, ROLE_TAGS, SAMPLES, drawCover, exportPNG } from './cover.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const canvas = $('cover');
const ctx = canvas.getContext('2d');

const state = {
  title: params.get('title') || 'LEONIDA GOLD',
  script: 'chasing the golden hour',
  quote: 'SUNSET HEIST OF THE YEAR',
  tagline: 'ONE CREW · ONE COAST · NO WAY HOME',
  layout: params.get('layout') || 'poster',
  grade: params.get('grade') || 'sunset',
  callout: 'We take the city tonight.',
  calloutBy: 'LUCIA',
  panels: [],
};

let selectedPanel = 0;
let images = {}; // sample name -> HTMLImageElement
let dragging = null;

function defaultPanels() {
  return SAMPLES.map((name, i) => ({
    img: images[name] || null,
    sample: name,
    tag: ROLE_TAGS[i % ROLE_TAGS.length],
    zoom: 1,
    panX: 0,
    panY: 0,
  }));
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadSamples() {
  const jobs = SAMPLES.map(async (name) => {
    images[name] = await loadImage(`samples/${name}.jpg`);
  });
  await Promise.all(jobs);
}

function canvasSizeForAspect() {
  // keep the preview canvas near the export aspect of the current layout
  const portrait = state.layout === 'hero';
  const square = state.layout === 'split' || state.layout === 'quad';
  if (portrait) return { w: 1024, h: 1280 };
  if (square) return { w: 1080, h: 1080 };
  return { w: 1280, h: 720 };
}

function redraw() {
  const { w, h } = canvasSizeForAspect();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w; canvas.height = h;
  }
  drawCover(ctx, state, w, h);
}

function setStatus(msg) {
  const el = $('status');
  if (el) el.textContent = msg;
}

function buildControls() {
  // samples
  const samplesEl = $('samples');
  samplesEl.innerHTML = '';
  SAMPLES.forEach((name) => {
    const img = document.createElement('img');
    img.src = `samples/${name}.jpg`;
    img.alt = name;
    img.addEventListener('click', () => {
      state.panels[selectedPanel].img = images[name];
      state.panels[selectedPanel].sample = name;
      [...samplesEl.children].forEach((c) => c.classList.remove('sel'));
      img.classList.add('sel');
      redraw();
    });
    samplesEl.appendChild(img);
  });

  // layouts
  const layoutsEl = $('layouts');
  Object.entries(LAYOUTS).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = def.name;
    if (key === state.layout) b.classList.add('sel');
    b.addEventListener('click', () => {
      state.layout = key;
      [...layoutsEl.children].forEach((c) => c.classList.remove('sel'));
      b.classList.add('sel');
      redraw();
    });
    layoutsEl.appendChild(b);
  });

  // grades
  const gradesEl = $('grades');
  Object.entries(GRADES).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    const sw = document.createElement('span');
    sw.className = 'grade-swatch';
    sw.style.background = `linear-gradient(90deg, ${def.title[0]}, ${def.title[2]})`;
    b.appendChild(sw);
    b.appendChild(document.createTextNode(def.name));
    if (key === state.grade) b.classList.add('sel');
    b.addEventListener('click', () => {
      state.grade = key;
      [...gradesEl.children].forEach((c) => c.classList.remove('sel'));
      b.classList.add('sel');
      redraw();
    });
    gradesEl.appendChild(b);
  });

  // panel picker
  const pickEl = $('panel-pick');
  state.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1} · ${p.tag}`;
    if (i === selectedPanel) b.classList.add('sel');
    b.addEventListener('click', () => {
      selectedPanel = i;
      [...pickEl.children].forEach((c) => c.classList.remove('sel'));
      b.classList.add('sel');
      redraw();
    });
    pickEl.appendChild(b);
  });

  // caption fields
  $('title').value = state.title;
  $('script').value = state.script;
  $('callout').value = state.callout;
  $('callout-by').value = state.calloutBy;
  $('title').addEventListener('input', (e) => { state.title = e.target.value || 'LEONIDA GOLD'; redraw(); });
  $('script').addEventListener('input', (e) => { state.script = e.target.value; redraw(); });
  $('callout').addEventListener('input', (e) => { state.callout = e.target.value; redraw(); });
  $('callout-by').addEventListener('input', (e) => { state.calloutBy = e.target.value; redraw(); });

  // upload
  $('upload-btn').addEventListener('click', () => $('photo').click());
  $('photo').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      const img = await loadImage(url);
      if (!img) continue;
      const target = files.length === 1 ? selectedPanel : i % state.panels.length;
      state.panels[target].img = img;
      state.panels[target].sample = null;
    }
    redraw();
    setStatus(`${files.length} photo(s) loaded.`);
  });
  $('use-all').addEventListener('click', () => {
    const img = state.panels[selectedPanel].img;
    if (!img) return;
    state.panels.forEach((p) => { p.img = img; });
    redraw();
    setStatus('Same photo in every panel.');
  });

  // export
  const download = (blob, name) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  $('exp-square').addEventListener('click', async () => {
    download(await exportPNG(state, 1080, 1080), 'leonida-gold-1080x1080.png');
    setStatus('Exported 1080 × 1080 PNG.');
  });
  $('exp-portrait').addEventListener('click', async () => {
    download(await exportPNG(state, 1080, 1350), 'leonida-gold-1080x1350.png');
    setStatus('Exported 1080 × 1350 PNG.');
  });
  $('exp-wide').addEventListener('click', async () => {
    download(await exportPNG(state, 1920, 1080), 'leonida-gold-1920x1080.png');
    setStatus('Exported 1920 × 1080 PNG.');
  });
  $('exp-all').addEventListener('click', async () => {
    download(await exportPNG(state, 1080, 1080), 'leonida-gold-1080x1080.png');
    download(await exportPNG(state, 1080, 1350), 'leonida-gold-1080x1350.png');
    download(await exportPNG(state, 1920, 1080), 'leonida-gold-1920x1080.png');
    setStatus('Exported all 3 sizes.');
  });

  // canvas crop: drag pans the selected panel, wheel zooms it
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    dragging = { x: e.clientX - r.left, y: e.clientY - r.top, px: state.panels[selectedPanel].panX, py: state.panels[selectedPanel].panY, w: r.width, h: r.height };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    const p = state.panels[selectedPanel];
    p.panX = dragging.px + (e.clientX - r.left - dragging.x) / dragging.w;
    p.panY = dragging.py + (e.clientY - r.top - dragging.y) / dragging.h;
    redraw();
  });
  canvas.addEventListener('pointerup', () => { dragging = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = state.panels[selectedPanel];
    p.zoom = Math.min(2.5, Math.max(0.6, p.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    redraw();
  }, { passive: false });
}

async function runShot() {
  const shot = params.get('shot');
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await loadSamples();
  state.panels = defaultPanels();
  buildControls();
  try { await document.fonts.load('100px Anton'); await document.fonts.ready; } catch (e) { /* font fallback */ }
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

runShot();
