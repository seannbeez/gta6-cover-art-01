// LEONIDA GOLD — Vice Cover Studio: the editor wiring.
// Loads the sample portraits, keeps the editor state (layout, grade,
// lettering, per-panel photo + crop), renders the live preview, handles
// upload / panel picking / drag-pan / wheel-zoom, and exports PNGs in
// 3 sizes. Also drives the ?shot= screenshot mode used for the entry shots.

import { SAMPLES, GRADES, LAYOUTS, drawCover, panelRects, loadImage, exportPNG } from './cover.js';

const state = {
  layout: 'poster',
  grade: 'sunset',
  title: 'LEONIDA GOLD',
  script: 'chasing the golden hour',
  callout: 'We take the city tonight.',
  calloutBy: 'LUCIA',
  photos: SAMPLES.map((s) => ({ src: s.file, zoom: 1, panX: 0, panY: 0 })),
  selected: 0,
};

const images = new Map();
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const shotMode = params.get('shot');

async function ensureImages() {
  for (const ph of state.photos) {
    if (!images.has(ph.src)) images.set(ph.src, await loadImage(ph.src));
  }
}

function draw() {
  const w = canvas.width, h = canvas.height;
  drawCover(ctx, w, h, state, images);
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

async function exportOne(w, h, name) {
  const blob = await exportPNG(w, h, state, images);
  if (blob) download(blob, name);
}

function buildControls() {
  const layouts = document.getElementById('layouts');
  for (const l of LAYOUTS) {
    const b = document.createElement('button');
    b.className = 'btn' + (l.id === state.layout ? ' active' : '');
    b.type = 'button';
    b.textContent = l.name;
    b.onclick = () => { state.layout = l.id; buildControls(); draw(); };
    layouts.appendChild(b);
  }
  const grades = document.getElementById('grades');
  for (const g of GRADES) {
    const b = document.createElement('button');
    b.className = 'swatch' + (g.id === state.grade ? ' sel' : '');
    b.type = 'button';
    b.style.background = g.sw;
    b.textContent = g.name;
    b.onclick = () => { state.grade = g.id; buildControls(); draw(); };
    grades.appendChild(b);
  }
  const samples = document.getElementById('samples');
  samples.innerHTML = '';
  SAMPLES.forEach((s, i) => {
    const img = document.createElement('img');
    img.src = s.file;
    img.alt = s.role;
    img.title = s.role;
    if (state.photos[state.selected] && state.photos[state.selected].src === s.file) img.classList.add('sel');
    img.onclick = () => {
      state.photos[state.selected] = { src: s.file, zoom: 1, panX: 0, panY: 0 };
      ensureImages().then(() => { buildControls(); draw(); });
    };
    samples.appendChild(img);
  });
  const picker = document.getElementById('picker');
  picker.innerHTML = '';
  SAMPLES.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'btn' + (i === state.selected ? ' active' : '');
    b.type = 'button';
    b.textContent = `Panel ${i + 1} · ${s.role}`;
    b.onclick = () => { state.selected = i; buildControls(); draw(); };
    picker.appendChild(b);
  });
}

function wire() {
  document.getElementById('ex-1080').onclick = () => exportOne(1080, 1080, 'leonida-gold-1080x1080.png');
  document.getElementById('ex-1350').onclick = () => exportOne(1080, 1350, 'leonida-gold-1080x1350.png');
  document.getElementById('ex-1920').onclick = () => exportOne(1920, 1080, 'leonida-gold-1920x1080.png');
  document.getElementById('ex-all').onclick = async () => {
    await exportOne(1080, 1080, 'leonida-gold-1080x1080.png');
    await exportOne(1080, 1350, 'leonida-gold-1080x1350.png');
    await exportOne(1920, 1080, 'leonida-gold-1920x1080.png');
  };
  const fileInput = document.getElementById('file-input');
  document.getElementById('upload-btn').onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const files = [...fileInput.files];
    for (let k = 0; k < files.length; k++) {
      const dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(files[k]);
      });
      const idx = k === 0 ? state.selected : (state.selected + k) % 5;
      state.photos[idx] = { src: dataUrl, zoom: 1, panX: 0, panY: 0 };
    }
    await ensureImages();
    buildControls();
    draw();
    fileInput.value = '';
  };
  document.getElementById('use-all-btn').onclick = async () => {
    const src = state.photos[state.selected].src;
    state.photos = state.photos.map(() => ({ src, zoom: 1, panX: 0, panY: 0 }));
    await ensureImages();
    draw();
  };
  document.getElementById('restore-btn').onclick = async () => {
    state.photos = SAMPLES.map((s) => ({ src: s.file, zoom: 1, panX: 0, panY: 0 }));
    await ensureImages();
    buildControls();
    draw();
  };
  document.getElementById('title-input').oninput = (e) => { state.title = e.target.value || 'LEONIDA GOLD'; draw(); };
  document.getElementById('script-input').oninput = (e) => { state.script = e.target.value; draw(); };
  document.getElementById('callout-input').oninput = (e) => { state.callout = e.target.value; draw(); };
  document.getElementById('callout-by-input').oninput = (e) => { state.calloutBy = e.target.value; draw(); };

  // Click a panel to select it; drag to pan its photo, wheel to zoom.
  let drag = null;
  const toCanvas = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  };
  canvas.addEventListener('mousedown', (e) => {
    const p = toCanvas(e);
    const rects = panelRects(state.layout, canvas.width, canvas.height);
    const hit = rects.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
    if (hit) { state.selected = hit.p; buildControls(); }
    drag = { x: p.x, y: p.y, rect: hit || null };
  });
  window.addEventListener('mousemove', (e) => {
    if (!drag || !drag.rect) return;
    const p = toCanvas(e);
    const ph = state.photos[drag.rect.p];
    const img = images.get(ph.src);
    if (!img) return;
    const scale = Math.max(drag.rect.w / img.naturalWidth, drag.rect.h / img.naturalHeight) * (ph.zoom || 1);
    ph.panX = (ph.panX || 0) - (p.x - drag.x) / scale;
    ph.panY = (ph.panY || 0) - (p.y - drag.y) / scale;
    drag.x = p.x;
    drag.y = p.y;
    draw();
  });
  window.addEventListener('mouseup', () => { drag = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = toCanvas(e);
    const rects = panelRects(state.layout, canvas.width, canvas.height);
    const hit = rects.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
    if (!hit) return;
    const ph = state.photos[hit.p];
    ph.zoom = Math.min(3, Math.max(1, (ph.zoom || 1) * (e.deltaY < 0 ? 1.12 : 0.89)));
    state.selected = hit.p;
    buildControls();
    draw();
  }, { passive: false });
}

async function boot() {
  if (params.get('layout')) state.layout = params.get('layout');
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('title')) state.title = params.get('title');
  const w = parseInt(params.get('w') || '', 10);
  const h = parseInt(params.get('h') || '', 10);
  if (w && h) { canvas.width = w; canvas.height = h; }
  try { await document.fonts.load('900 80px Anton'); } catch (e) { /* font falls back */ }
  await document.fonts.ready;
  await ensureImages();
  if (shotMode === 'cover') {
    document.body.classList.add('shot-cover');
    draw();
    return;
  }
  buildControls();
  wire();
  draw();
  // Exposed for the export test page and for debugging.
  window.exportPNG = (ew, eh) => exportPNG(ew, eh, state, images);
}

boot();
