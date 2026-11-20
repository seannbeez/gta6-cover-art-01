// LEONIDA GOLD — Vice Cover Studio: editor wiring + screenshot mode.
// Loads samples, drives the controls, renders the live preview, exports PNGs.
// Shot mode (used for screenshots): ?shot=cover|editor&layout=&grade=&photo=&
// title=&tagline=&callout=&calloutBy= ; ?scene=boulevard|pier|skyline renders
// one clean procedural scene (used to make the sample photos). Sets
// window.__shotReady once painted.

import { LAYOUTS, GRADES, panelsFor, renderCover, exportPNG, drawScene, gradeById } from './cover.js';

const $ = (id) => document.getElementById(id);
const query = new URLSearchParams(location.search);
const SAMPLE_NAMES = ['boulevard', 'pier', 'skyline'];

const state = {
  layout: query.get('layout') || 'poster',
  grade: query.get('grade') || 'sunset',
  title: query.get('title') || 'LEONIDA GOLD',
  tagline: query.get('tagline') || 'EVERY SUNSET HAS A PRICE',
  callout: query.get('callout') || 'We take the city tonight.',
  calloutBy: query.get('calloutBy') || 'LUCIA',
  roles: [query.get('role1') || 'THE DRIVER', query.get('role2') || 'THE FIXER'],
  scenes: SAMPLE_NAMES,
};

let photos = []; // parallel to panelsFor(state.layout, W, H): { img, zoom, panX, panY } | null
let selected = 0;
let lastPhoto = null;

function status(text) {
  const el = $('status');
  if (el) el.textContent = text;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${src}`));
    img.src = src;
  });
}

function normalizePhotos() {
  const canvas = $('cover');
  const n = panelsFor(state.layout, canvas.width, canvas.height).length;
  while (photos.length < n) photos.push(null);
  photos.length = n;
  if (selected >= n) selected = 0;
}

function sizeCanvas() {
  const canvas = $('cover');
  if (query.get('shot') === 'cover' || query.has('scene')) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    canvas.width = 1080;
    canvas.height = 1080;
  }
}

function draw() {
  normalizePhotos();
  renderCover($('cover'), state, photos);
  syncPills();
}

function syncPills() {
  const pills = $('panel-pills');
  if (!pills) return;
  const n = photos.length;
  pills.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1}`;
    if (i === selected) b.classList.add('active');
    b.addEventListener('click', () => {
      selected = i;
      $('zoom').value = photos[i] ? photos[i].zoom : 1;
      draw();
    });
    pills.appendChild(b);
  }
}

function buildControls() {
  const layouts = $('layouts');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (l.id === state.layout ? ' active' : '');
    b.textContent = l.name;
    b.addEventListener('click', () => {
      state.layout = l.id;
      layouts.querySelectorAll('.pick').forEach((el) => el.classList.remove('active'));
      b.classList.add('active');
      draw();
    });
    layouts.appendChild(b);
  });

  const grades = $('grades');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (g.id === state.grade ? ' active' : '');
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = `linear-gradient(90deg, ${g.sky.join(', ')})`;
    b.appendChild(sw);
    b.appendChild(document.createTextNode(g.name));
    b.addEventListener('click', () => {
      state.grade = g.id;
      grades.querySelectorAll('.pick').forEach((el) => el.classList.remove('active'));
      b.classList.add('active');
      draw();
    });
    grades.appendChild(b);
  });

  const samples = $('samples');
  SAMPLE_NAMES.forEach((name) => {
    const img = document.createElement('img');
    img.src = `samples/${name}.jpg`;
    img.alt = `${name} sample`;
    img.addEventListener('click', async () => {
      try {
        const loaded = await loadImage(`samples/${name}.jpg`);
        lastPhoto = { img: loaded, zoom: 1, panX: 0, panY: 0 };
        photos[selected] = lastPhoto;
        samples.querySelectorAll('img').forEach((el) => el.classList.remove('active'));
        img.classList.add('active');
        draw();
      } catch (e) {
        status('Could not load that sample.');
      }
    });
    samples.appendChild(img);
  });

  const bindText = (id, key) => {
    const el = $(id);
    if (!el) return;
    el.value = state[key];
    el.addEventListener('input', () => {
      state[key] = el.value;
      draw();
    });
  };
  bindText('title', 'title');
  bindText('tagline', 'tagline');
  bindText('callout', 'callout');
  bindText('calloutBy', 'calloutBy');
  const role1 = $('role1');
  const role2 = $('role2');
  if (role1) {
    role1.value = state.roles[0];
    role1.addEventListener('input', () => { state.roles[0] = role1.value; draw(); });
  }
  if (role2) {
    role2.value = state.roles[1];
    role2.addEventListener('input', () => { state.roles[1] = role2.value; draw(); });
  }

  $('zoom').addEventListener('input', () => {
    const p = photos[selected];
    if (p) {
      p.zoom = parseFloat($('zoom').value);
      draw();
    }
  });

  $('photo').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      try {
        const url = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        const img = await loadImage(url);
        lastPhoto = { img, zoom: 1, panX: 0, panY: 0 };
        photos[selected] = lastPhoto;
      } catch (err) {
        status('Could not read that file.');
      }
    }
    $('zoom').value = 1;
    draw();
  });

  $('use-all').addEventListener('click', () => {
    if (!lastPhoto) {
      status('Pick or upload a photo first.');
      return;
    }
    photos = photos.map(() => ({ ...lastPhoto }));
    draw();
    status('Photo applied to all panels.');
  });

  const canvas = $('cover');
  let dragging = null;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const panels = panelsFor(state.layout, canvas.width, canvas.height);
    const hit = panels.findIndex((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
    if (hit >= 0) {
      selected = hit;
      $('zoom').value = photos[hit] ? photos[hit].zoom : 1;
      dragging = { x: e.clientX, y: e.clientY };
      draw();
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const p = photos[selected];
    if (!p) return;
    const rect = canvas.getBoundingClientRect();
    p.panX += (e.clientX - dragging.x) / rect.width;
    p.panY += (e.clientY - dragging.y) / rect.height;
    dragging = { x: e.clientX, y: e.clientY };
    draw();
  });
  canvas.addEventListener('pointerup', () => { dragging = null; });
  canvas.addEventListener('pointerleave', () => { dragging = null; });

  const doExport = async (w, h) => {
    status(`Rendering PNG ${w} × ${h}…`);
    try {
      const blob = await exportPNG(state, photos, w, h);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leonida-gold-${w}x${h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      status(`Exported PNG ${w} × ${h}.`);
    } catch (e) {
      status('Export failed — try again.');
    }
  };
  $('export-1080').addEventListener('click', () => doExport(1080, 1080));
  $('export-1350').addEventListener('click', () => doExport(1080, 1350));
  $('export-1920').addEventListener('click', () => doExport(1920, 1080));
  $('export-all').addEventListener('click', async () => {
    await doExport(1080, 1080);
    await doExport(1080, 1350);
    await doExport(1920, 1080);
  });
}

function markReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

async function init() {
  buildControls();
  try {
    await document.fonts.load('400 100px Anton');
    await document.fonts.ready;
  } catch (e) {
    // Fall back to the system font if Anton fails to load.
  }

  // Clean procedural scene (used to render the sample photos).
  if (query.has('scene')) {
    const scene = query.get('scene') || 'boulevard';
    const canvas = $('cover');
    document.body.classList.add('shot-cover');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    drawScene(ctx, 0, 0, canvas.width, canvas.height, gradeById(query.get('grade') || 'sunset'), scene, 42);
    markReady();
    return;
  }

  if (query.get('shot') === 'cover') document.body.classList.add('shot-cover');
  sizeCanvas();

  const photoName = query.get('photo') || 'pier';
  try {
    // Different sample per panel so multi-panel layouts never repeat a photo.
    const order = [photoName, ...SAMPLE_NAMES.filter((n) => n !== photoName)];
    const n = panelsFor(state.layout, $('cover').width, $('cover').height).length;
    photos = [];
    for (let i = 0; i < n; i++) {
      const img = await loadImage(`samples/${order[i % order.length]}.jpg`);
      photos.push({ img, zoom: 1, panX: 0, panY: 0 });
    }
    lastPhoto = photos[0];
  } catch (e) {
    photos = [];
    status('Sample photo missing — upload one to begin.');
  }
  draw();
  markReady();
}

init();
