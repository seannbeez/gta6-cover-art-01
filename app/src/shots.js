// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos
// loaded; ?shot=cover shows the cover alone. `layout`, `grade` and `title`
// pick the scene; `w` and `h` size the cover canvas. window.__shotReady is set
// once the cover is painted with the Anton font loaded.
import { PANELS, layoutOf, gradeOf } from './cover.js';
import { buildLayoutButtons, buildGradeButtons, buildPanelChips, buildSampleThumbs, selectPanel } from './main.js';

export async function runShot(shot, query, state, api) {
  const layout = layoutOf(query.get('layout') || 'poster');
  const grade = gradeOf(query.get('grade') || 'sunset');
  state.layout = layout.key;
  state.grade = grade.key;
  if (query.get('title')) state.title = query.get('title');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');

  const w = parseInt(query.get('w') || '1280', 10);
  const h = parseInt(query.get('h') || '720', 10);
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    api.canvas.width = w;
    api.canvas.height = h;
  } else {
    document.body.classList.add('shot-editor');
    api.canvas.width = 1280;
    api.canvas.height = 720;
  }

  for (const p of PANELS) {
    state.photos[p.id] = await api.loadImage(`samples/${p.file}`);
  }
  // Build the same editor UI as the live page (layout/grade buttons, panel
  // chips, sample thumbs) so the editor screenshot shows the full controls.
  buildLayoutButtons();
  buildGradeButtons();
  buildPanelChips();
  selectPanel('wheelman');
  buildSampleThumbs();
  // Wait for Anton so the title never renders in a fallback font.
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.ready;
  } catch (err) {
    // Anton missing: the canvas still draws with the fallback face.
  }
  api.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
