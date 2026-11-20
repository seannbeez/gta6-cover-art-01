// LEONIDA GOLD v3.4 — wires the studio page: pick photos, layout, grade,
// hero and words; the cover redraws live. `?shot=` sets up a fixed scene
// for a screenshot instead (cover alone, or the editor with a photo
// loaded); window.__shotReady is set once painted.
import { SAMPLES, GRADES, LAYOUTS, drawCover, exportCover } from './cover.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const query = new URLSearchParams(location.search);
const shot = query.get('shot');

const state = {
  layout: query.get('layout') || 'poster',
  grade: query.get('grade') || 'sunset',
  title: 'LEONIDA GOLD',
  script: 'chasing the golden hour',
  photos: [],
  selected: 0,
};

function samplePhoto(i) {
  const s = SAMPLES[i];
  return { src: `samples/${s.file}`, img: null, tag: s.tag, place: s.place, ax: s.ax, ay: s.ay, zoom: 1.25, panX: 0, sample: i };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSamples() {
  for (let i = 0; i < 5; i++) {
    const p = samplePhoto(i);
    p.img = await loadImage(p.src);
    state.photos.push(p);
  }
}

let drawToken = 0;
function redraw() {
  const t = ++drawToken;
  requestAnimationFrame(() => {
    if (t !== drawToken) return;
    drawCover(canvas, state);
  });
}

// ---- controls ----
function buildButtons(el, items, current, onPick) {
  el.innerHTML = '';
  items.forEach(([key, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (key === current) b.classList.add('active');
    b.addEventListener('click', () => { onPick(key); buildButtons(el, items, key, onPick); redraw(); });
    el.appendChild(b);
  });
}

function buildControls() {
  buildButtons(
    document.getElementById('layouts'),
    Object.entries(LAYOUTS).map(([k, v]) => [k, v.name]),
    state.layout,
    (k) => { state.layout = k; },
  );
  buildButtons(
    document.getElementById('grades'),
    Object.entries(GRADES).map(([k, v]) => [k, v.name]),
    state.grade,
    (k) => { state.grade = k; },
  );
  buildButtons(
    document.getElementById('hero-pick'),
    SAMPLES.map((s, i) => [String(i), s.tag]),
    String(heroIndex()),
    (k) => setHero(Number(k)),
  );
  const bar = document.getElementById('panel-bar');
  bar.innerHTML = '';
  state.photos.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1} · ${p.tag}`;
    if (i === state.selected) b.classList.add('active');
    b.addEventListener('click', () => { state.selected = i; syncCrop(); buildControls(); redraw(); });
    bar.appendChild(b);
  });
  const pick = document.getElementById('panel-pick');
  pick.innerHTML = '';
  state.photos.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `P${i + 1}`;
    if (i === state.selected) b.classList.add('active');
    b.addEventListener('click', () => { state.selected = i; syncCrop(); buildControls(); redraw(); });
    pick.appendChild(b);
  });
  const thumbs = document.getElementById('thumbs');
  thumbs.innerHTML = '';
  SAMPLES.forEach((s, i) => {
    const img = document.createElement('img');
    img.src = `samples/${s.file}`;
    img.alt = s.tag;
    img.title = s.tag;
    if (state.photos[state.selected]?.sample === i) img.classList.add('sel');
    img.addEventListener('click', async () => {
      const p = samplePhoto(i);
      p.img = await loadImage(p.src);
      state.photos[state.selected] = p;
      syncCrop(); buildControls(); redraw();
    });
    thumbs.appendChild(img);
  });
}

function heroIndex() {
  const layout = LAYOUTS[state.layout];
  const heroPanel = layout.panels.find((p) => p.hero);
  return state.photos[heroPanel.p]?.sample ?? 0;
}

function setHero(sampleIdx) {
  const layout = LAYOUTS[state.layout];
  const heroPanel = layout.panels.find((p) => p.hero);
  const cur = state.photos.findIndex((p) => p.sample === sampleIdx);
  if (cur < 0 || cur === heroPanel.p) return;
  const tmp = state.photos[heroPanel.p];
  state.photos[heroPanel.p] = state.photos[cur];
  state.photos[cur] = tmp;
}

function syncCrop() {
  const p = state.photos[state.selected];
  if (!p) return;
  document.getElementById('zoom').value = p.zoom;
  document.getElementById('pan').value = p.panX;
}

document.getElementById('zoom').addEventListener('input', (e) => {
  state.photos[state.selected].zoom = Number(e.target.value);
  redraw();
});
document.getElementById('pan').addEventListener('input', (e) => {
  state.photos[state.selected].panX = Number(e.target.value);
  redraw();
});
document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('script').addEventListener('input', (e) => { state.script = e.target.value; redraw(); });

document.getElementById('upload').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (let k = 0; k < files.length && k < 5; k++) {
    const url = URL.createObjectURL(files[k]);
    const img = await loadImage(url);
    const slot = (state.selected + k) % 5;
    state.photos[slot] = { src: url, img, tag: 'YOU', place: 'YOUR PHOTO', ax: 0.5, ay: 0.3, zoom: 1.25, panX: 0, sample: -1 };
  }
  buildControls(); redraw();
});
document.getElementById('use-all').addEventListener('click', () => {
  const p = state.photos[state.selected];
  if (!p) return;
  state.photos = state.photos.map(() => ({ ...p, img: p.img }));
  buildControls(); redraw();
});
document.getElementById('restore').addEventListener('click', async () => {
  state.photos = [];
  await loadSamples();
  buildControls(); redraw();
});

// click a panel in the preview to select it
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  const layout = LAYOUTS[state.layout];
  for (const panel of layout.panels) {
    const xs = panel.poly.map((pt) => pt[0]), ys = panel.poly.map((pt) => pt[1]);
    if (x >= Math.min(...xs) && x <= Math.max(...xs) && y >= Math.min(...ys) && y <= Math.max(...ys)) {
      state.selected = panel.p;
      syncCrop(); buildControls(); redraw();
      break;
    }
  }
});

// ---- export ----
async function doExport(w, h, label) {
  const { blob, ms } = await exportCover(w, h, state);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `leonida-gold-${w}x${h}.png`;
  a.click();
  status.textContent = `Saved ${label} (${(blob.size / 1024).toFixed(0)} KiB, ${ms} ms)`;
  return { bytes: blob.size, ms };
}
document.getElementById('export-1080').addEventListener('click', () => doExport(1080, 1080, '1080x1080'));
document.getElementById('export-1350').addEventListener('click', () => doExport(1080, 1350, '1080x1350'));
document.getElementById('export-1920').addEventListener('click', () => doExport(1920, 1080, '1920x1080'));
document.getElementById('export-all').addEventListener('click', async () => {
  const r1 = await doExport(1080, 1080, '1080x1080');
  const r2 = await doExport(1080, 1350, '1080x1350');
  const r3 = await doExport(1920, 1080, '1920x1080');
  status.textContent = `Saved all 3 sizes — 1080² ${r1.ms} ms, 1080×1350 ${r2.ms} ms, 1920×1080 ${r3.ms} ms`;
});

// ---- boot ----
async function boot() {
  await document.fonts.load('16px Anton');
  await loadSamples();
  if (query.get('title')) { state.title = query.get('title'); document.getElementById('title').value = state.title; }
  if (query.get('script')) { state.script = query.get('script'); document.getElementById('script').value = state.script; }
  const w = Number(query.get('w') || 0), h = Number(query.get('h') || 0);
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    if (w > 0 && h > 0) { canvas.width = w; canvas.height = h; }
  } else if (w > 0 && h > 0) {
    canvas.width = w; canvas.height = h;
  }
  buildControls();
  syncCrop();
  redraw();
  await document.fonts.ready;
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
boot();
