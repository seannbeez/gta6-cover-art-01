// LEONIDA GOLD — Vice Cover Studio: editor wiring (v2, written fresh).
// Binds the sidebar controls to the cover renderer, handles photo upload,
// per-panel crop, PNG export in 3 sizes, and the ?shot= screenshot mode.

import { GRADES, LAYOUTS, SAMPLE_ORDER, drawCover, renderCover } from './cover.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const SAMPLE_URLS = {
  skyline: 'samples/skyline.jpg',
  boulevard: 'samples/boulevard.jpg',
  pier: 'samples/pier.jpg',
};

const EXPORT_SIZES = [
  { label: '1080 × 1080', w: 1080, h: 1080 },
  { label: '1080 × 1350', w: 1080, h: 1350 },
  { label: '1920 × 1080', w: 1920, h: 1080 },
];

const DEFAULT_STATE = {
  layout: 'poster',
  grade: 'vice-sunset',
  title: 'LEONIDA GOLD',
  kicker: 'VICE CITY STORIES',
  tagline: 'EVERY SUNSET HAS A PRICE',
  caption: 'We take the city tonight.',
  calloutBy: 'LUCIA',
  tags: ['THE DRIVER', 'THE FIXER'],
  panels: [],
};

let state = structuredClone(DEFAULT_STATE);
let images = {}; // key -> HTMLImageElement (sample or uploaded data URL)
let activePanel = 0;
let canvas = null;

function panelCount() {
  const layout = LAYOUTS[state.layout] || LAYOUTS.poster;
  const w = canvas ? canvas.width : 100;
  const h = canvas ? canvas.height : 100;
  return layout.panels(w, h).length;
}

function ensurePanels() {
  const n = panelCount();
  while (state.panels.length < n) {
    // Prefer a photo no earlier panel uses, so multi-panel covers never
    // repeat the same scene twice.
    const used = new Set(state.panels.map((p) => p.photo));
    const photo = SAMPLE_ORDER.find((k) => !used.has(k))
      || SAMPLE_ORDER[state.panels.length % SAMPLE_ORDER.length];
    state.panels.push({ photo, zoom: 1.05, px: 0, py: 0 });
  }
  state.panels.length = n;
  if (activePanel >= n) activePanel = 0;
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
  for (const key of Object.keys(SAMPLE_URLS)) {
    if (!images[key]) images[key] = await loadImage(SAMPLE_URLS[key]);
  }
}

function render() {
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(320, Math.round(rect.width * dpr));
  const h = Math.max(320, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ensurePanels();
  const ctx = canvas.getContext('2d');
  drawCover(ctx, canvas.width, canvas.height, state, images);
  syncChips();
}

function syncChips() {
  const chips = $('#panel-chips');
  if (!chips) return;
  chips.innerHTML = '';
  state.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (i === activePanel ? ' active' : '');
    b.textContent = 'Panel ' + (i + 1);
    b.addEventListener('click', () => {
      activePanel = i;
      syncCrop();
      render();
    });
    chips.appendChild(b);
  });
}

function syncCrop() {
  const p = state.panels[activePanel];
  if (!p) return;
  const zoom = $('#crop-zoom');
  const px = $('#crop-x');
  const py = $('#crop-y');
  if (zoom) { zoom.value = p.zoom; $('#crop-zoom-val').textContent = p.zoom.toFixed(2) + '×'; }
  if (px) { px.value = p.px; $('#crop-x-val').textContent = (+p.px).toFixed(2); }
  if (py) { py.value = p.py; $('#crop-y-val').textContent = (+p.py).toFixed(2); }
}

function download(canvasEl, name) {
  canvasEl.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

function exportSize(size, silent) {
  const c = renderCover(state, images, size.w, size.h);
  const safe = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cover';
  download(c, `leonida-gold-${safe}-${size.w}x${size.h}.png`);
  if (!silent) flash(`Exported ${size.w} × ${size.h} PNG`);
}

function flash(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function buildLayoutButtons() {
  const wrap = $('#layout-grid');
  wrap.innerHTML = '';
  Object.entries(LAYOUTS).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout-btn' + (key === state.layout ? ' active' : '');
    b.dataset.layout = key;
    b.innerHTML = `<span class="mini mini-${key}"></span><span>${def.name}</span>`;
    b.title = def.desc;
    b.addEventListener('click', () => {
      state.layout = key;
      $$('.layout-btn').forEach((x) => x.classList.toggle('active', x === b));
      ensurePanels();
      render();
    });
    wrap.appendChild(b);
  });
}

function buildGradeButtons() {
  const wrap = $('#grade-grid');
  wrap.innerHTML = '';
  Object.entries(GRADES).forEach(([key, g]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade-btn' + (key === state.grade ? ' active' : '');
    b.dataset.grade = key;
    b.title = g.name;
    b.style.background = `linear-gradient(135deg, ${g.sky[1]}, ${g.sky[3]}, ${g.sun})`;
    b.innerHTML = `<span>${g.name}</span>`;
    b.addEventListener('click', () => {
      state.grade = key;
      $$('.grade-btn').forEach((x) => x.classList.toggle('active', x === b));
      render();
    });
    wrap.appendChild(b);
  });
}

function buildSampleThumbs() {
  const wrap = $('#sample-thumbs');
  wrap.innerHTML = '';
  Object.keys(SAMPLE_URLS).forEach((key) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = key;
    const img = document.createElement('img');
    img.src = SAMPLE_URLS[key];
    img.alt = key + ' sample photo';
    b.appendChild(img);
    b.addEventListener('click', () => {
      state.panels[activePanel].photo = key;
      render();
    });
    wrap.appendChild(b);
  });
}

function buildExportButtons() {
  const wrap = $('#export-bar');
  if (!wrap) return;
  wrap.innerHTML = '';
  EXPORT_SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'export-btn';
    b.textContent = 'PNG ' + s.label;
    b.addEventListener('click', () => exportSize(s));
    wrap.appendChild(b);
  });
  const all = document.createElement('button');
  all.type = 'button';
  all.className = 'export-btn primary';
  all.textContent = 'Export all 3 sizes';
  all.addEventListener('click', () => {
    EXPORT_SIZES.forEach((s, i) => setTimeout(() => exportSize(s, true), i * 350));
    flash('Exported all 3 sizes');
  });
  wrap.appendChild(all);
}

function bindTextInputs() {
  const map = {
    'in-title': 'title', 'in-kicker': 'kicker', 'in-tagline': 'tagline',
    'in-caption': 'caption', 'in-callout-by': 'calloutBy',
  };
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = state[key];
    el.addEventListener('input', () => { state[key] = el.value; render(); });
  });
  const tag1 = $('#in-tag-1');
  const tag2 = $('#in-tag-2');
  if (tag1) { tag1.value = state.tags[0] || ''; tag1.addEventListener('input', () => { state.tags[0] = tag1.value.toUpperCase(); render(); }); }
  if (tag2) { tag2.value = state.tags[1] || ''; tag2.addEventListener('input', () => { state.tags[1] = tag2.value.toUpperCase(); render(); }); }
}

function bindCrop() {
  const zoom = $('#crop-zoom');
  const px = $('#crop-x');
  const py = $('#crop-y');
  if (zoom) zoom.addEventListener('input', () => { state.panels[activePanel].zoom = +zoom.value; syncCrop(); render(); });
  if (px) px.addEventListener('input', () => { state.panels[activePanel].px = +px.value; syncCrop(); render(); });
  if (py) py.addEventListener('input', () => { state.panels[activePanel].py = +py.value; syncCrop(); render(); });
}

function bindUpload() {
  const input = $('#upload');
  const btn = $('#upload-btn');
  if (btn && input) btn.addEventListener('click', () => input.click());
  if (!input) return;
  input.addEventListener('change', async () => {
    const files = [...input.files].slice(0, 4);
    for (const f of files) {
      const dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(f);
      });
      const key = 'up-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      const img = await loadImage(dataUrl);
      if (img) {
        images[key] = img;
        state.panels[activePanel].photo = key;
      }
    }
    input.value = '';
    render();
  });
  const allBtn = $('#use-all-btn');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      const key = state.panels[activePanel].photo;
      state.panels.forEach((p) => { p.photo = key; });
      render();
      flash('Same photo in all panels');
    });
  }
}

function applyShotParams(params) {
  if (params.get('layout') && LAYOUTS[params.get('layout')]) state.layout = params.get('layout');
  if (params.get('grade') && GRADES[params.get('grade')]) state.grade = params.get('grade');
  if (params.get('title')) state.title = params.get('title');
  if (params.get('kicker')) state.kicker = params.get('kicker');
  if (params.get('tagline')) state.tagline = params.get('tagline');
  if (params.get('caption')) state.caption = params.get('caption');
  if (params.get('photo') && SAMPLE_URLS[params.get('photo')]) {
    state.panels = [{ photo: params.get('photo'), zoom: 1.05, px: 0, py: 0 }];
  }
  if (params.get('tags')) state.tags = params.get('tags').split(',').slice(0, 3);
}

async function init() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  applyShotParams(params);
  await loadSamples();
  if (document.fonts && document.fonts.load) {
    try { await document.fonts.load('100px Anton'); } catch (e) { /* fallback font */ }
  }
  canvas = $('#cover');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    // Size the canvas to the exact viewport for the screenshot.
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    render();
    return;
  }
  // Editor mode.
  buildLayoutButtons();
  buildGradeButtons();
  buildSampleThumbs();
  buildExportButtons();
  bindTextInputs();
  bindCrop();
  bindUpload();
  ensurePanels();
  syncCrop();
  render();
  window.addEventListener('resize', render);
  canvas.addEventListener('click', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const cx = (ev.clientX - rect.left) / rect.width;
    const cy = (ev.clientY - rect.top) / rect.height;
    const layout = LAYOUTS[state.layout] || LAYOUTS.poster;
    const panels = layout.panels(canvas.width, canvas.height);
    const hit = panels.findIndex((p) => cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h);
    if (hit >= 0) {
      activePanel = hit;
      syncCrop();
      render();
    }
  });
}

init();
