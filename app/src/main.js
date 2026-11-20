// LEONIDA GOLD — Vice Cover Studio (v3.2): editor wiring.
// Upload a photo per panel, pick layout + grade, edit the caption, export PNG
// in three sizes. `?shot=` mode renders one shot for the screenshot pipeline.
import { renderCover, exportPNG, SCENES, LAYOUTS, GRADES, CHARACTERS, TITLE_FONT } from './cover.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

const state = {
  layout: params.get('layout') || 'poster',
  grade: params.get('grade') || 'sunset',
  title: params.get('title') || 'LEONIDA GOLD',
  caption: 'chasing the golden hour',
  quote: 'SUNSET HEIST OF THE YEAR — THE LEONIDA LEDGER',
  photos: [null, null, null, null, null],
  crops: [{}, {}, {}, {}, {}],
  selected: 0,
};

const sampleImgs = [];
async function loadSamples() {
  for (const s of SCENES) {
    const img = new Image();
    img.src = `./samples/${s.id}.jpg`;
    await new Promise((res) => { img.onload = res; img.onerror = res; });
    sampleImgs.push(img);
    state.photos[SCENES.indexOf(s)] = img;
  }
}

function draw() {
  const canvas = $('cover');
  const ctx = canvas.getContext('2d');
  renderCover(ctx, { ...state, W: canvas.width, H: canvas.height });
  // panel picker labels
  document.querySelectorAll('.panel-pick').forEach((b, i) => {
    b.classList.toggle('on', i === state.selected);
    b.textContent = `Panel ${i + 1} · ${CHARACTERS[i].tag}`;
  });
}

function renderEditor() {
  const canvas = $('cover');
  const shot = params.get('shot');
  if (shot === 'cover') {
    // cover-only mode for the screenshot pipeline: no editor chrome
    document.body.classList.add('shot-cover');
    canvas.width = parseInt(params.get('w') || '1280', 10);
    canvas.height = parseInt(params.get('h') || '720', 10);
  } else {
    canvas.width = 1280;
    canvas.height = 720;
  }
  draw();
}

function buildControls() {
  const lay = $('layouts');
  for (const l of LAYOUTS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (l.id === state.layout ? ' on' : '');
    b.textContent = l.name;
    b.onclick = () => {
      state.layout = l.id;
      document.querySelectorAll('#layouts .chip').forEach((c) => c.classList.remove('on'));
      b.classList.add('on');
      draw();
    };
    lay.appendChild(b);
  }
  const gr = $('grades');
  for (const g of GRADES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (g.id === state.grade ? ' on' : '');
    b.style.background = `linear-gradient(135deg, ${g.sky[0]}, ${g.sky[1]} 55%, ${g.sky[2]})`;
    b.title = g.name;
    b.setAttribute('aria-label', g.name);
    b.onclick = () => {
      state.grade = g.id;
      document.querySelectorAll('#grades .swatch').forEach((c) => c.classList.remove('on'));
      b.classList.add('on');
      draw();
    };
    gr.appendChild(b);
  }
  const picks = $('panels');
  for (let i = 0; i < 5; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'panel-pick';
    b.onclick = () => { state.selected = i; draw(); };
    picks.appendChild(b);
  }
  const thumbs = $('thumbs');
  SCENES.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = `${s.name} — ${CHARACTERS[i].tag}`;
    const img = document.createElement('img');
    img.src = `./samples/${s.id}.jpg`;
    img.alt = s.name;
    b.appendChild(img);
    b.onclick = () => { state.selected = i; state.photos[i] = sampleImgs[i]; state.crops[i] = {}; draw(); };
    thumbs.appendChild(b);
  });
}

function wire() {
  $('titleInput').addEventListener('input', (e) => { state.title = e.target.value.toUpperCase() || 'LEONIDA GOLD'; draw(); });
  $('captionInput').addEventListener('input', (e) => { state.caption = e.target.value || 'chasing the golden hour'; draw(); });
  $('upload').addEventListener('click', () => $('file').click());
  $('file').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => { state.photos[state.selected] = img; state.crops[state.selected] = {}; draw(); };
    img.src = URL.createObjectURL(f);
  });
  $('useAll').addEventListener('click', () => {
    const img = state.photos[state.selected];
    if (!img) return;
    for (let i = 0; i < 5; i++) { state.photos[i] = img; state.crops[i] = {}; }
    draw();
  });
  $('resetSamples').addEventListener('click', () => {
    SCENES.forEach((s, i) => { state.photos[i] = sampleImgs[i]; state.crops[i] = {}; });
    draw();
  });
  const canvas = $('cover');
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    drag = { x: e.clientX - r.left, y: e.clientY - r.top, panel: state.selected };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = canvas.getBoundingClientRect();
    const dx = (e.clientX - r.left - drag.x) / r.width;
    const dy = (e.clientY - r.top - drag.y) / r.height;
    const c = state.crops[drag.panel] || {};
    c.ox = (c.ox || 0) + dx * 2;
    c.oy = (c.oy || 0) + dy * 2;
    state.crops[drag.panel] = c;
    drag.x = e.clientX - r.left;
    drag.y = e.clientY - r.top;
    draw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const c = state.crops[state.selected] || {};
    c.zoom = Math.min(3, Math.max(1, (c.zoom || 1) * (e.deltaY < 0 ? 1.1 : 0.9)));
    state.crops[state.selected] = c;
    draw();
  }, { passive: false });
  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', async () => {
      const [w, h] = b.dataset.export.split('x').map(Number);
      const blob = await exportPNG(state, w, h);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leonida-gold-${w}x${h}.png`;
      a.click();
      $('status').textContent = `Exported ${w}×${h} PNG.`;
    });
  });
  $('exportAll').addEventListener('click', async () => {
    for (const [w, h] of [[1080, 1080], [1080, 1350], [1920, 1080]]) {
      const blob = await exportPNG(state, w, h);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leonida-gold-${w}x${h}.png`;
      a.click();
      await new Promise((r) => setTimeout(r, 250));
    }
    $('status').textContent = 'Exported all 3 sizes.';
  });
}

// test hook for the screenshot/benchmark pages
window.exportPNG = (w, h) => exportPNG(state, w, h);
window.__state = state;

(async () => {
  try { await document.fonts.load('16px Anton'); await document.fonts.ready; } catch (e) { /* fall back */ }
  await loadSamples();
  buildControls();
  wire();
  renderEditor();
  document.title = 'shot-ready';
})();
