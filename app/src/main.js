// LEONIDA GOLD — the studio wiring.
//
// Connects the controls to the renderer: photos go into panels, sliders crop
// them, layout and grade buttons restyle the cover, the word fields rewrite
// the title, and the export buttons save PNGs. A `?shot=` query instead sets
// up one fixed scene for a screenshot and raises window.__shotReady.

import { LAYOUTS, GRADES, EXPORT_SIZES, defaultState, blankPanel, drawCoverArt, renderCover } from './cover.js';

const SAMPLES = [
  { file: 'boulevard.jpg', name: 'Boulevard' },
  { file: 'pier.jpg', name: 'Pier' },
  { file: 'skyline.jpg', name: 'Skyline' },
];

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const state = defaultState();
let selectedPanel = 0;
let drawnOnce = false;

function say(message) {
  statusEl.textContent = message;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function panelCount() {
  return (LAYOUTS[state.layout] ?? LAYOUTS.poster).panels(100, 100).length;
}

function syncPanels() {
  while (state.panels.length < panelCount()) state.panels.push(blankPanel());
  if (selectedPanel >= panelCount()) selectedPanel = 0;
}

function draw() {
  syncPanels();
  drawCoverArt(canvas, state);
  drawnOnce = true;
  refreshTabs();
}

function refreshTabs() {
  const tabs = document.getElementById('panel-tabs');
  tabs.innerHTML = '';
  for (let i = 0; i < panelCount(); i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1}`;
    b.setAttribute('aria-pressed', String(i === selectedPanel));
    b.addEventListener('click', () => {
      selectedPanel = i;
      syncSliders();
      draw();
    });
    tabs.appendChild(b);
  }
}

function syncSliders() {
  const slot = state.panels[selectedPanel] ?? blankPanel();
  const set = (id, val, fmt) => {
    const el = document.getElementById(id);
    el.value = String(val);
    document.getElementById(`${id}-val`).textContent = fmt(val);
  };
  set('zoom', slot.zoom, (v) => `${Number(v).toFixed(2)}×`);
  set('panx', slot.ox, (v) => Number(v).toFixed(2));
  set('pany', slot.oy, (v) => Number(v).toFixed(2));
}

function givePhotoTo(slotIndex, img) {
  if (state.fillOne) {
    for (let i = 0; i < panelCount(); i++) {
      state.panels[i].photo = img;
      state.panels[i].zoom = 1;
      // Nudge each panel's crop so the same photo does not repeat identically.
      state.panels[i].ox = ((i % 3) - 1) * 0.1;
      state.panels[i].oy = i % 2 ? 0.06 : -0.06;
    }
  } else {
    const slot = state.panels[slotIndex];
    slot.photo = img;
    slot.zoom = 1;
    slot.ox = 0;
    slot.oy = 0;
  }
  syncSliders();
  draw();
}

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const polys = (LAYOUTS[state.layout] ?? LAYOUTS.poster).panels(canvas.width, canvas.height);
  for (let i = 0; i < polys.length; i++) {
    if (pointInPoly(x, y, polys[i])) {
      selectedPanel = i;
      syncSliders();
      draw();
      say(`Editing panel ${i + 1}.`);
      return;
    }
  }
});

// --- controls ---------------------------------------------------------------

document.getElementById('upload').addEventListener('change', async (event) => {
  const files = [...event.target.files];
  if (!files.length) return;
  for (const [i, file] of files.entries()) {
    try {
      const img = await loadImage(URL.createObjectURL(file));
      givePhotoTo((selectedPanel + i) % panelCount(), img);
    } catch {
      say(`Could not read ${file.name}.`);
    }
  }
  say(`${files.length} photo${files.length > 1 ? 's' : ''} loaded.`);
});

document.getElementById('fill-all').addEventListener('click', () => {
  state.fillOne = !state.fillOne;
  document.getElementById('fill-all').setAttribute('aria-pressed', String(state.fillOne));
  say(state.fillOne ? 'New photos fill every panel.' : 'New photos fill only the selected panel.');
});
document.getElementById('fill-all').setAttribute('aria-pressed', 'true');

const samplesEl = document.getElementById('samples');
for (const sample of SAMPLES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.title = sample.name;
  b.setAttribute('aria-pressed', 'false');
  const img = document.createElement('img');
  img.src = `./samples/${sample.file}`;
  img.alt = `${sample.name} sample photo`;
  b.appendChild(img);
  b.addEventListener('click', async () => {
    try {
      const photo = await loadImage(`./samples/${sample.file}`);
      givePhotoTo(selectedPanel, photo);
      [...samplesEl.children].forEach((c) => c.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      say(`${sample.name} photo loaded.`);
    } catch {
      say(`Could not load the ${sample.name} sample.`);
    }
  });
  samplesEl.appendChild(b);
}

const layoutsEl = document.getElementById('layouts');
for (const [key, layout] of Object.entries(LAYOUTS)) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'layout-btn';
  b.dataset.layout = key;
  b.setAttribute('aria-pressed', String(key === state.layout));
  b.innerHTML = `<span class="glyph"></span>${layout.name}`;
  b.title = layout.hint;
  b.addEventListener('click', () => {
    state.layout = key;
    selectedPanel = 0;
    syncPanels();
    [...layoutsEl.children].forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    syncSliders();
    draw();
    say(`${layout.name} layout — ${panelCount()} panels.`);
  });
  layoutsEl.appendChild(b);
}

const gradesEl = document.getElementById('grades');
for (const [key, grade] of Object.entries(GRADES)) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'grade-btn';
  b.style.background = grade.swatch;
  b.textContent = grade.name;
  b.title = grade.name;
  b.setAttribute('aria-pressed', String(key === state.grade));
  b.addEventListener('click', () => {
    state.grade = key;
    [...gradesEl.children].forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    draw();
    say(`${grade.name} grade applied.`);
  });
  gradesEl.appendChild(b);
}

function bindText(id, key, transform) {
  document.getElementById(id).addEventListener('input', (event) => {
    state[key] = transform ? transform(event.target.value) : event.target.value;
    draw();
  });
}
bindText('title', 'title');
bindText('kicker', 'kicker');
bindText('tagline', 'tagline');
bindText('callout', 'callout');
bindText('callout-by', 'calloutBy');
bindText('tag1', 'tags', (v) => [v, state.tags[1] ?? '']);
bindText('tag2', 'tags', (v) => [state.tags[0] ?? '', v]);
document.getElementById('callout-on').addEventListener('change', (e) => { state.calloutOn = e.target.checked; draw(); });
document.getElementById('seal-on').addEventListener('change', (e) => { state.sealOn = e.target.checked; draw(); });
document.getElementById('billing-on').addEventListener('change', (e) => { state.billingOn = e.target.checked; draw(); });

function bindSlider(id, key) {
  document.getElementById(id).addEventListener('input', (event) => {
    const slot = state.panels[selectedPanel];
    slot[key] = Number(event.target.value);
    const fmt = key === 'zoom' ? (v) => `${v.toFixed(2)}×` : (v) => v.toFixed(2);
    document.getElementById(`${id}-val`).textContent = fmt(slot[key]);
    draw();
  });
}
bindSlider('zoom', 'zoom');
bindSlider('panx', 'ox');
bindSlider('pany', 'oy');

// --- export -----------------------------------------------------------------

function downloadPNG(canvasEl, filename) {
  return new Promise((resolve) => {
    canvasEl.toBlob((blob) => {
      if (!blob) { resolve(false); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(true);
    }, 'image/png');
  });
}

async function exportSize(sizeKey) {
  const size = EXPORT_SIZES[sizeKey];
  const art = renderCover(state, sizeKey);
  const ok = await downloadPNG(art, `leonida-gold-${size.w}x${size.h}.png`);
  if (ok) say(`Exported ${size.label} PNG.`);
  return ok;
}

const exportsEl = document.getElementById('exports');
for (const [key, size] of Object.entries(EXPORT_SIZES)) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = size.label;
  b.addEventListener('click', () => { exportSize(key); });
  exportsEl.appendChild(b);
}
document.getElementById('export-all').addEventListener('click', async () => {
  for (const key of Object.keys(EXPORT_SIZES)) {
    await exportSize(key);
    await new Promise((r) => setTimeout(r, 250));
  }
  say('All 3 sizes exported.');
});

function syncButtons() {
  [...document.getElementById('layouts').children].forEach((c) => {
    c.setAttribute('aria-pressed', String(c.dataset.layout === state.layout));
  });
  [...document.getElementById('grades').children].forEach((c, i) => {
    c.setAttribute('aria-pressed', String(Object.keys(GRADES)[i] === state.grade));
  });
}

// --- fixed scenes for screenshots -------------------------------------------

async function runShot() {
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (!shot) return false;
  try { await document.fonts.load('40px Anton'); } catch { /* fall back to system font */ }
  await document.fonts.ready;
  const photoName = query.get('photo') ?? 'boulevard';
  const caption = query.get('caption') ?? 'LEONIDA GOLD';
  state.title = caption;
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('size')) state.size = query.get('size');
  if (query.get('kicker')) state.kicker = query.get('kicker');
  if (query.get('tagline')) state.tagline = query.get('tagline');
  syncButtons();
  try {
    const photo = await loadImage(`./samples/${photoName}.jpg`);
    givePhotoTo(0, photo);
  } catch {
    draw();
  }
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    draw();
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
  return true;
}

// --- boot -------------------------------------------------------------------

window.__leonida = {
  state,
  draw,
  renderCover,
  exportSize,
  shotDone: () => drawnOnce,
};

draw();
syncSliders();
runShot();
