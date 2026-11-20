// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo and every control populated; ?shot=cover shows the cover alone.
// Query params: layout, grade, caption, photo (hero panel sample key).
// window.__shotReady is set once painted.
import { LAYOUTS, GRADES } from './cover.js';

export async function runShot(shot, query, api) {
  const { state, redraw, markActive } = api;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const layout = query.get('layout');
  if (layout && LAYOUTS[layout]) state.layout = layout;
  const grade = query.get('grade');
  if (grade && GRADES[grade]) state.grade = grade;
  const caption = query.get('caption');
  if (caption) {
    state.caption = caption;
    const input = document.getElementById('caption');
    if (input) input.value = caption;
  }
  const photo = query.get('photo');
  if (photo) {
    const img = await api.loadImage(`samples/${photo}.jpg`).catch(() => null);
    if (img) state.photos[0] = img;
  }
  markActive();
  await redraw();
  // The paint pipeline is synchronous once images are loaded, but give the
  // browser two frames to composite before signalling readiness.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
