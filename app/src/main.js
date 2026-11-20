// LEONIDA GOLD — Vice Cover Studio: wires the editor. Pick photos per panel,
// choose a layout and a grade, edit the title, export PNGs in the three post
// sizes. A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover, exportCover, PANELS, PANEL_BY_ID, GRADES, LAYOUTS, layoutOf, gradeOf } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

const state = {
  layout: 'poster',
  grade: 'sunset',
  title: 'LEONIDA GOLD',
  subtitle: 'chasing the golden hour',
  quote: 'We take the city tonight. — LUCIA',
  hero: 'wheelman',
  photos: {},
  crops: {},
  selected: 'wheelman',
};

function redraw() {
  drawCover(canvas, state);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSamples() {
  for (const p of PANELS) {
    if (!state.photos[p.id]) state.photos[p.id] = await loadImage(`samples/${p.file}`);
  }
  buildSampleThumbs();
  redraw();
}

function buildSampleThumbs() {
  const box = document.getElementById('samples');
  box.innerHTML = '';
  for (const p of PANELS) {
    const img = document.createElement('img');
    img.src = `samples/${p.file}`;
    img.alt = p.role;
    img.title = p.role;
    img.className = state.photos[state.selected] && state.photos[state.selected].src
      && state.photos[state.selected].src.endsWith(p.file) ? 'sel' : '';
    img.addEventListener('click', () => {
      state.photos[state.selected] = state.photos[p.id];
      buildSampleThumbs();
      redraw();
    });
    box.appendChild(img);
  }
}

function buildLayoutButtons() {
  const box = document.getElementById('layouts');
  box.innerHTML = '';
  for (const key of Object.keys(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = LAYOUTS[key].name;
    b.className = state.layout === key ? 'active' : '';
    b.addEventListener('click', () => {
      state.layout = key;
      buildLayoutButtons();
      redraw();
    });
    box.appendChild(b);
  }
}

function buildGradeButtons() {
  const box = document.getElementById('grades');
  box.innerHTML = '';
  for (const key of Object.keys(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = GRADES[key].name;
    b.className = state.grade === key ? 'active' : '';
    b.addEventListener('click', () => {
      state.grade = key;
      buildGradeButtons();
      redraw();
    });
    box.appendChild(b);
  }
}

function buildPanelChips() {
  const box = document.getElementById('panel-chips');
  box.innerHTML = '';
  PANELS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1} · ${p.role}`;
    b.className = state.selected === p.id ? 'active' : '';
    b.addEventListener('click', () => selectPanel(p.id));
    box.appendChild(b);
  });
}

function selectPanel(id) {
  state.selected = id;
  const def = PANEL_BY_ID[id];
  document.getElementById('selected-name').textContent = `Panel ${PANELS.indexOf(def) + 1} · ${def.role}`;
  const crop = state.crops[id] || { zoom: 1, px: 0, py: 0 };
  document.getElementById('zoom').value = crop.zoom;
  document.getElementById('panx').value = crop.px;
  document.getElementById('pany').value = crop.py;
  buildPanelChips();
  buildSampleThumbs();
}

function cropOf(id) {
  if (!state.crops[id]) state.crops[id] = { zoom: 1, px: 0, py: 0 };
  return state.crops[id];
}

function download(canvasEl, name) {
  canvasEl.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

function exportSize(w, h, name) {
  const t0 = performance.now();
  const out = exportCover(state, w, h);
  download(out, name);
  status.textContent = `Saved ${name} in ${Math.round(performance.now() - t0)} ms`;
}

document.getElementById('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  for (let i = 0; i < files.length; i++) {
    const img = await loadImage(URL.createObjectURL(files[i]));
    const target = files.length === 1 ? state.selected : PANELS[i % PANELS.length].id;
    state.photos[target] = img;
  }
  buildSampleThumbs();
  redraw();
});

document.getElementById('use-all').addEventListener('click', () => {
  const img = state.photos[state.selected];
  if (!img) return;
  for (const p of PANELS) state.photos[p.id] = img;
  redraw();
});

document.getElementById('restore').addEventListener('click', async () => {
  state.photos = {};
  state.crops = {};
  await loadSamples();
});

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
document.getElementById('quote').addEventListener('input', (e) => { state.quote = e.target.value; redraw(); });
document.getElementById('zoom').addEventListener('input', (e) => { cropOf(state.selected).zoom = parseFloat(e.target.value); redraw(); });
document.getElementById('panx').addEventListener('input', (e) => { cropOf(state.selected).px = parseFloat(e.target.value); redraw(); });
document.getElementById('pany').addEventListener('input', (e) => { cropOf(state.selected).py = parseFloat(e.target.value); redraw(); });

document.getElementById('export-1080').addEventListener('click', () => exportSize(1080, 1080, 'leonida-gold-1080x1080.png'));
document.getElementById('export-1350').addEventListener('click', () => exportSize(1080, 1350, 'leonida-gold-1080x1350.png'));
document.getElementById('export-1920').addEventListener('click', () => exportSize(1920, 1080, 'leonida-gold-1920x1080.png'));
document.getElementById('export-all').addEventListener('click', () => {
  exportSize(1080, 1080, 'leonida-gold-1080x1080.png');
  setTimeout(() => exportSize(1080, 1350, 'leonida-gold-1080x1350.png'), 400);
  setTimeout(() => exportSize(1920, 1080, 'leonida-gold-1920x1080.png'), 800);
});

// Click a panel in the preview to select it.
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  const layout = layoutOf(state.layout);
  for (const panel of layout.panels) {
    const xs = panel.pts.map((p) => p[0]);
    const ys = panel.pts.map((p) => p[1]);
    if (x >= Math.min(...xs) && x <= Math.max(...xs) && y >= Math.min(...ys) && y <= Math.max(...ys)) {
      selectPanel(panel.id);
      break;
    }
  }
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, { loadImage, loadSamples, redraw, canvas });
} else {
  buildLayoutButtons();
  buildGradeButtons();
  buildPanelChips();
  selectPanel('wheelman');
  loadSamples();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redraw());
}

// Exported for shots.js: the fixed screenshot scenes build the same editor UI
// (layout/grade buttons, panel chips, sample thumbs) as the live editor.
export { buildLayoutButtons, buildGradeButtons, buildPanelChips, buildSampleThumbs, selectPanel, loadSamples };
