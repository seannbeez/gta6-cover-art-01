// LEONIDA GOLD v3.4 — GTA box-art cover renderer.
// A tight collage of five cel-shaded panels split by thick black gutters and
// slanted cuts, one dominant hero panel, and the title painted straight over
// the art at the bottom centre. No masthead, no barcode, no separator band:
// the canvas is all box art. Every photo — sample or user upload — runs
// through the GTA paint pipeline (smooth + posterize + ink edges + neon
// saturation) so it reads as a Rockstar-style digital painting, never a
// plain photograph.

export const SAMPLES = [
  { file: 'boulevard.jpg', tag: 'THE WHEELMAN', place: 'OCEAN DR', ax: 0.55, ay: 0.30 },
  { file: 'pier.jpg', tag: 'THE LOOKOUT', place: 'PIER 9', ax: 0.50, ay: 0.32 },
  { file: 'skyline.jpg', tag: 'THE DEALER', place: 'DOWNTOWN', ax: 0.50, ay: 0.28 },
  { file: 'street.jpg', tag: 'THE RUNNER', place: 'NEON ROW', ax: 0.58, ay: 0.30 },
  { file: 'marina.jpg', tag: 'THE QUEEN', place: 'MARINA', ax: 0.48, ay: 0.32 },
];

// grade: title gradient, colour tint multipliers, saturation, posterize
// levels, Sobel edge threshold and ink strength.
export const GRADES = {
  sunset: { name: 'Vice Sunset', title: ['#ffe27a', '#ff9a3d', '#ff2e88'], tint: [1.07, 0.98, 0.92], sat: 1.45, levels: 5, edge: 36, ink: 0.85 },
  neon: { name: 'Neon Nights', title: ['#8ef6ff', '#c86bff', '#ff2e88'], tint: [0.98, 0.94, 1.09], sat: 1.55, levels: 5, edge: 34, ink: 0.90 },
  gold: { name: 'Palm Gold', title: ['#fff3b0', '#ffc93c', '#ff7a1a'], tint: [1.09, 1.00, 0.88], sat: 1.40, levels: 5, edge: 36, ink: 0.85 },
  ocean: { name: 'Ocean Drive', title: ['#a8fff1', '#3ec6ff', '#ff5ea8'], tint: [0.96, 1.02, 1.07], sat: 1.50, levels: 5, edge: 34, ink: 0.90 },
  dark: { name: 'After Dark', title: ['#d9c2ff', '#8a5cff', '#ff2e88'], tint: [0.94, 0.94, 1.11], sat: 1.50, levels: 6, edge: 32, ink: 0.95 },
  noir: { name: 'B&W Noir', title: ['#ffffff', '#cfcfcf', '#8a8a8a'], tint: [1, 1, 1], sat: 0, levels: 6, edge: 32, ink: 0.95 },
};

// Layouts: unit-coordinate polygons that tile the whole canvas. `p` is the
// panel index (0..4); `hero` marks the dominant panel. The title sits over
// the bottom centre, so every layout keeps faces in the upper centre of
// their panels (face-aware framing) and `faceSafe` below pushes any face
// that would fall under the title up and in.
export const LAYOUTS = {
  poster: {
    name: 'Poster',
    titleTop: 0.80,
    panels: [
      { p: 0, hero: true, poly: [[0.26, 0], [0.74, 0], [0.68, 0.54], [0.32, 0.54]] },
      { p: 1, poly: [[0, 0], [0.26, 0], [0.32, 0.54], [0, 0.54]] },
      { p: 2, poly: [[0.74, 0], [1, 0], [1, 0.54], [0.68, 0.54]] },
      { p: 3, poly: [[0, 0.54], [0.32, 0.54], [0.44, 1], [0, 1]] },
      { p: 4, poly: [[0.68, 0.54], [1, 0.54], [1, 1], [0.56, 1]] },
    ],
  },
  hero: {
    name: 'Hero',
    titleTop: 0.80,
    panels: [
      { p: 0, hero: true, poly: [[0.18, 0], [0.82, 0], [0.72, 0.62], [0.28, 0.62]] },
      { p: 1, poly: [[0, 0], [0.18, 0], [0.28, 0.62], [0, 0.62]] },
      { p: 2, poly: [[0.82, 0], [1, 0], [1, 0.62], [0.72, 0.62]] },
      { p: 3, poly: [[0, 0.62], [0.28, 0.62], [0.38, 1], [0, 1]] },
      { p: 4, poly: [[0.72, 0.62], [1, 0.62], [1, 1], [0.62, 1]] },
    ],
  },
  split: {
    name: 'Split Heist',
    titleTop: 0.80,
    panels: [
      { p: 0, hero: true, poly: [[0, 0], [0.58, 0], [0.30, 1], [0, 1]] },
      { p: 2, poly: [[0.58, 0], [1, 0], [1, 0.46], [0.49, 0.46]] },
      { p: 4, poly: [[0.49, 0.46], [1, 0.46], [1, 0.64], [0.40, 0.64]] },
      { p: 3, poly: [[0.40, 0.64], [1, 0.64], [1, 1], [0.30, 1]] },
      // lookout wedge inset at the hero's lower-left (torso, never a face)
      { p: 1, poly: [[0, 0.76], [0.26, 0.76], [0.30, 1], [0, 1]] },
    ],
  },
  triptych: {
    name: 'Triptych',
    titleTop: 0.80,
    panels: [
      { p: 1, poly: [[0, 0], [0.34, 0], [0.30, 0.64], [0, 0.64]] },
      { p: 0, hero: true, poly: [[0.34, 0], [0.66, 0], [0.70, 0.64], [0.30, 0.64]] },
      { p: 2, poly: [[0.66, 0], [1, 0], [1, 0.64], [0.70, 0.64]] },
      { p: 3, poly: [[0, 0.64], [0.30, 0.64], [0.38, 1], [0, 1]] },
      { p: 4, poly: [[0.70, 0.64], [1, 0.64], [1, 1], [0.62, 1]] },    ],
  },
  quad: {
    name: 'Quad',
    titleTop: 0.80,
    panels: [
      { p: 0, hero: true, poly: [[0, 0], [0.56, 0], [0.48, 0.52], [0, 0.52]] },
      { p: 1, poly: [[0.56, 0], [1, 0], [1, 0.52], [0.48, 0.52]] },
      { p: 2, poly: [[0, 0.52], [0.48, 0.52], [0.56, 1], [0, 1]] },
      { p: 4, poly: [[0.48, 0.52], [1, 0.52], [1, 1], [0.56, 1]] },
      // centre diamond inset, drawn last so it sits on top of the four
      { p: 3, diamond: true, poly: [[0.50, 0.34], [0.66, 0.52], [0.50, 0.70], [0.34, 0.52]] },
    ],
  },
  spotlight: {
    name: 'Spotlight',
    titleTop: 0.58,
    panels: [
      { p: 0, hero: true, poly: [[0, 0], [1, 0], [1, 0.74], [0, 0.74]] },
      { p: 1, poly: [[0, 0.74], [0.26, 0.74], [0.22, 1], [0, 1]] },
      { p: 2, poly: [[0.26, 0.74], [0.52, 0.74], [0.48, 1], [0.22, 1]] },
      { p: 3, poly: [[0.52, 0.74], [0.76, 0.74], [0.72, 1], [0.48, 1]] },
      { p: 4, poly: [[0.76, 0.74], [1, 0.74], [1, 1], [0.72, 1]] },
    ],
  },
  strip: {
    name: 'Strip',
    titleTop: 0.80,
    panels: [
      { p: 0, hero: true, poly: [[0, 0], [1, 0], [0.94, 0.38], [0, 0.38]] },
      { p: 1, poly: [[0, 0.38], [0.52, 0.38], [0.46, 0.68], [0, 0.68]] },
      { p: 2, poly: [[0.52, 0.38], [1, 0.38], [1, 0.68], [0.46, 0.68]] },
      { p: 3, poly: [[0, 0.68], [0.46, 0.68], [0.54, 1], [0, 1]] },
      { p: 4, poly: [[0.46, 0.68], [1, 0.68], [1, 1], [0.54, 1]] },
    ],
  },
  duo: {
    name: 'Duo Slant',
    titleTop: 0.80,
    panels: [
      { p: 0, hero: true, poly: [[0, 0], [0.52, 0], [0.30, 1], [0, 1]] },
      { p: 2, poly: [[0.52, 0], [0.78, 0], [0.74, 0.36], [0.46, 0.36]] },
      { p: 1, poly: [[0.46, 0.36], [0.74, 0.36], [0.70, 0.68], [0.40, 0.68]] },
      { p: 3, poly: [[0.40, 0.68], [0.70, 0.68], [0.70, 1], [0.30, 1]] },
      { p: 4, poly: [[0.78, 0], [1, 0], [1, 1], [0.70, 1]] },
    ],
  },
};

const filterCache = new Map();
function cacheKey(src, w, h, grade, crop) {
  return [src, w, h, grade, crop.x.toFixed(2), crop.y.toFixed(2), crop.w.toFixed(2), crop.h.toFixed(2)].join('|');
}

// Box blur (3x3, two passes) on ImageData — the "bilateral-style"
// smoothing: detail softens, edges survive because the ink pass below
// re-draws them.
function blur3(data, w, h) {
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = Math.min(h - 1, Math.max(0, y + dy));
        for (let dx = -1; dx <= 1; dx++) {
          const xx = Math.min(w - 1, Math.max(0, x + dx));
          const i = (yy * w + xx) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
      }
      const i = (y * w + x) * 4;
      out[i] = r / n; out[i + 1] = g / n; out[i + 2] = b / n; out[i + 3] = 255;
    }
  }
  return out;
}

// The GTA paint pipeline: smooth, posterize, saturate, contrast, tint,
// then Sobel ink edges. Operates on a canvas holding the panel's cropped
// photo and returns a new canvas with the painted result.
function paintFilter(srcCanvas, grade) {
  const w = srcCanvas.width, h = srcCanvas.height;
  const sctx = srcCanvas.getContext('2d', { willReadFrequently: true });
  const src = sctx.getImageData(0, 0, w, h).data;
  const smooth = blur3(blur3(src, w, h), w, h);
  const luma = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    luma[i] = 0.299 * smooth[i * 4] + 0.587 * smooth[i * 4 + 1] + 0.114 * smooth[i * 4 + 2];
  }
  const out = new Uint8ClampedArray(w * h * 4);
  const L = grade.levels, step = 255 / (L - 1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Sobel on the smoothed luma
      let gx = 0, gy = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = Math.min(w - 1, Math.max(0, x + dx));
          const yy = Math.min(h - 1, Math.max(0, y + dy));
          const v = luma[yy * w + xx];
          gx += v * dx * (dy === 0 ? 2 : 1);
          gy += v * dy * (dx === 0 ? 2 : 1);
        }
      }
      const mag = Math.sqrt(gx * gx + gy * gy);
      const ink = mag > grade.edge ? Math.min(1, (mag - grade.edge) / 70) * grade.ink : 0;
      let r = smooth[i], g = smooth[i + 1], b = smooth[i + 2];
      // posterize
      r = Math.round(r / step) * step;
      g = Math.round(g / step) * step;
      b = Math.round(b / step) * step;
      // saturate + contrast + tint
      const grey = 0.299 * r + 0.587 * g + 0.114 * b;
      r = grey + (r - grey) * grade.sat;
      g = grey + (g - grey) * grade.sat;
      b = grey + (b - grey) * grade.sat;
      r = ((r / 255 - 0.5) * 1.18 + 0.5) * 255 * grade.tint[0];
      g = ((g / 255 - 0.5) * 1.18 + 0.5) * 255 * grade.tint[1];
      b = ((b / 255 - 0.5) * 1.18 + 0.5) * 255 * grade.tint[2];
      // ink outline
      r = r * (1 - ink) + 14 * ink;
      g = g * (1 - ink) + 10 * ink;
      b = b * (1 - ink) + 18 * ink;
      out[i] = Math.max(0, Math.min(255, r));
      out[i + 1] = Math.max(0, Math.min(255, g));
      out[i + 2] = Math.max(0, Math.min(255, b));
      out[i + 3] = 255;
    }
  }
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').putImageData(new ImageData(out, w, h), 0, 0);
  return c;
}

// Cover-fit crop of `img` into a w x h box, centred on the face anchor
// (ax, ay in unit coords) with zoom and horizontal pan. `frameY` is where
// the face lands inside the panel as a fraction of its height (0.5 =
// centred, lower = higher in the panel). Returns the source rect in image
// pixels.
function coverCrop(img, w, h, ax, ay, zoom, panX, frameY = 0.5) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const base = Math.max(w / iw, h / ih) * zoom;
  const sw = w / base, sh = h / base;
  const cx = Math.min(iw - sw / 2, Math.max(sw / 2, ax * iw + panX * sw * 0.5));
  const cy = Math.min(ih - sh / 2, Math.max(sh / 2, ay * ih - (frameY - 0.5) * sh));
  return { x: cx - sw / 2, y: cy - sh / 2, w: sw, h: sh };
}

// Face geometry for a photo in a bw x bh panel: the crop, the face centre
// in panel px and the face height in panel px (faces are ~0.34 of the
// photo height in our portraits).
function panelFace(img, photo, bw, bh) {
  const crop = coverCrop(img, bw, bh, photo.ax, photo.ay, photo.zoom, photo.panX, photo.frameY ?? 0.5);
  const ih = img.naturalHeight || img.height;
  const faceY = (photo.ay * ih - crop.y) / crop.h * bh;
  const faceH = (0.34 * ih) / crop.h * bh;
  return { crop, faceY, faceH };
}

// Where a tag row can sit inside a polygon: the x-range of the polygon at
// a horizontal line just below its top edge. Returns null when the panel
// is too narrow there for a tag.
function tagSpan(pts, y) {
  let xs = [];
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
      xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
  }
  if (xs.length < 2) return null;
  return { x0: Math.min(...xs), x1: Math.max(...xs) };
}

function polyPath(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

function polyBBox(pts) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

// Draws one panel: the face-aware cropped photo, painted through the GTA
// filter, clipped to the polygon. Returns the face position in canvas px.
function drawPanel(ctx, img, photo, ptsPx, grade, gradeKey, scale, frame) {
  const box = polyBBox(ptsPx);
  const bw = Math.max(2, Math.round(box.w)), bh = Math.max(2, Math.round(box.h));
  const zoom = frame ? frame.zoom : photo.zoom;
  const frameY = frame ? frame.frameY : (photo.frameY ?? 0.5);
  const crop = coverCrop(img, bw, bh, photo.ax, photo.ay, zoom, photo.panX, frameY);
  const key = cacheKey(photo.src, bw, bh, gradeKey, crop);
  let painted = filterCache.get(key);
  if (!painted) {
    const off = document.createElement('canvas');
    off.width = bw; off.height = bh;
    const octx = off.getContext('2d');
    octx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, bw, bh);
    painted = paintFilter(off, grade);
    if (filterCache.size > 24) filterCache.clear();
    filterCache.set(key, painted);
  }
  ctx.save();
  polyPath(ctx, ptsPx);
  ctx.clip();
  ctx.drawImage(painted, box.x, box.y, bw, bh);
  ctx.restore();
}

function fitFont(ctx, text, font, maxW, start) {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxW && size > 10) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

function drawTitle(ctx, w, h, state, layout, scale) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const title = (state.title || 'LEONIDA GOLD').trim().toUpperCase();
  const top = layout.titleTop * h;
  // main title: Anton, sunset/neon gradient, 6-8 px black stroke, hard
  // drop shadow, painted straight over the art — no box, no band.
  const size = fitFont(ctx, title, (s) => `${s}px Anton, sans-serif`, w * 0.94, Math.round(h * 0.12));
  const baseY = top + size * 0.95;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const grad = ctx.createLinearGradient(0, baseY - size, 0, baseY);
  grad.addColorStop(0, grade.title[0]);
  grad.addColorStop(0.55, grade.title[1]);
  grad.addColorStop(1, grade.title[2]);
  const stroke = Math.max(6 * scale, Math.round(size * 0.09));
  ctx.lineJoin = 'round';
  // hard drop shadow
  ctx.fillStyle = '#000';
  ctx.fillText(title, w / 2 + size * 0.05, baseY + size * 0.06);
  // stroke + gradient fill
  ctx.strokeStyle = '#000';
  ctx.lineWidth = stroke;
  ctx.strokeText(title, w / 2, baseY);
  ctx.fillStyle = grad;
  ctx.fillText(title, w / 2, baseY);
  // slanted script sub-title underneath
  const script = (state.script || '').trim();
  if (script) {
    const sSize = Math.max(12, Math.round(size * 0.30));
    ctx.font = `italic 600 ${sSize}px Georgia, serif`;
    ctx.fillStyle = '#ffe9b0';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
    ctx.save();
    ctx.translate(w / 2, baseY + sSize * 1.25);
    ctx.transform(1, 0, -0.12, 1, 0, 0);
    ctx.fillText(script, 0, 0);
    ctx.restore();
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  }
  return { top, bottom: baseY + size * 0.45 };
}

function drawTag(ctx, text, x, y, scale, small) {
  const fs = Math.max(9, Math.round((small ? 10 : 13) * scale));
  ctx.font = `${fs}px Anton, sans-serif`;
  const padX = Math.round(7 * scale), padY = Math.round(4 * scale);
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.strokeStyle = '#ffb13c';
  ctx.lineWidth = Math.max(1.5, 2 * scale);
  const bw = tw + padX * 2, bh = fs + padY * 2;
  ctx.beginPath();
  ctx.roundRect(x, y, bw, bh, Math.round(5 * scale));
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffe9b0';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + bh / 2 + 1);
}

// The callout: one small white speech bubble on the hero panel, over a
// torso — never over a face.
function drawCallout(ctx, heroBox, scale) {
  const fs = Math.max(11, Math.round(15 * scale));
  const lines = ['We take the city tonight.', '— LUCIA'];
  ctx.font = `italic ${fs}px Georgia, serif`;
  const w1 = ctx.measureText(lines[0]).width, w2 = ctx.measureText(lines[1]).width;
  const bw = Math.max(w1, w2) + 28 * scale, bh = fs * 2 + 22 * scale;
  const x = heroBox.x + 14 * scale, y = heroBox.y + heroBox.h - bh - 16 * scale;
  ctx.fillStyle = 'rgba(255,250,240,0.94)';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(1.5, 2 * scale);
  ctx.beginPath();
  ctx.roundRect(x, y, bw, bh, Math.round(8 * scale));
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 24 * scale, y + bh);
  ctx.lineTo(x + 34 * scale, y + bh + 10 * scale);
  ctx.lineTo(x + 44 * scale, y + bh);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,250,240,0.94)';
  ctx.fill();
  ctx.fillStyle = '#241026';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(lines[0], x + 14 * scale, y + bh / 2 - fs * 0.45);
  ctx.fillStyle = '#d6336c';
  ctx.fillText(lines[1], x + 14 * scale, y + bh / 2 + fs * 0.55);
}

/** Draws the whole cover onto `canvas` from `state` (layout, grade, title,
 *  script, photos[]). Photos are { img, src, tag, place, ax, ay, zoom, panX }. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const scale = Math.max(w, h) / 1080;
  const layout = LAYOUTS[state.layout] || LAYOUTS.poster;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  const titleTopPx = layout.titleTop * h;
  const gutter = Math.max(4, Math.round(w * 0.006));

  // face-safe pass: per panel, fit the face inside the panel (zoom out
  // when the face would be taller than 62% of the panel) and lift it above
  // the title zone (frameY) when it would sit under the title. The user's
  // zoom slider is never overwritten: the corrected values live only in
  // this draw, in `frames`.
  const frames = new Map();
  for (const panel of layout.panels) {
    const photo = state.photos[panel.p];
    if (!photo || !photo.img) continue;
    const pts = panel.poly.map(([x, y]) => [x * w, y * h]);
    const box = polyBBox(pts);
    const bw = Math.max(2, Math.round(box.w)), bh = Math.max(2, Math.round(box.h));
    let zoom = photo.zoom, frameY = 0.5;
    let f = panelFace(photo.img, { ...photo, zoom, frameY }, bw, bh);
    if (f.faceH > 0.62 * bh) {
      zoom = Math.max(0.5, zoom * (0.62 * bh) / f.faceH);
      f = panelFace(photo.img, { ...photo, zoom, frameY }, bw, bh);
    }
    const faceBottom = box.y + f.faceY + f.faceH * 0.45;
    if (faceBottom > titleTopPx - 8) {
      frameY = Math.max(0.18, ((titleTopPx - 8 - f.faceH * 0.45) - box.y) / bh);
      f = panelFace(photo.img, { ...photo, zoom, frameY }, bw, bh);
    }
    frames.set(panel.p, { zoom, frameY });
  }

  // panels
  const drawn = [];
  for (const panel of layout.panels) {
    const photo = state.photos[panel.p];
    if (!photo || !photo.img) continue;
    const pts = panel.poly.map(([x, y]) => [x * w, y * h]);
    drawPanel(ctx, photo.img, photo, pts, grade, state.grade, scale, frames.get(panel.p));
    drawn.push({ panel, photo, pts });
  }
  // thick black gutters along every panel edge, plus the outer border
  ctx.lineJoin = 'miter';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = gutter;
  for (const { pts } of drawn) { polyPath(ctx, pts); ctx.stroke(); }
  ctx.strokeRect(0, 0, w, h);

  // role tags + place pills, tucked inside each panel's own top edge
  // (measured from the polygon itself, never the bounding box, so tags on
  // neighbouring slanted panels can never collide; narrow panels get the
  // tag only).
  ctx.textBaseline = 'middle';
  for (const { panel, photo, pts } of drawn) {
    const yTop = Math.min(...pts.map((p) => p[1])) + gutter + Math.round(4 * scale);
    const tagFs = Math.max(9, Math.round(13 * scale));
    const tagH = tagFs + Math.round(8 * scale);
    const span = tagSpan(pts, yTop + tagH / 2);
    if (!span) continue;
    const avail = span.x1 - span.x0 - 8 * scale;
    ctx.font = `${tagFs}px Anton, sans-serif`;
    const tagW = ctx.measureText(photo.tag).width + Math.round(14 * scale);
    ctx.font = `${Math.max(9, Math.round(10 * scale))}px Anton, sans-serif`;
    const placeW = ctx.measureText(photo.place).width + Math.round(14 * scale);
    if (tagW + placeW + 10 * scale <= avail) {
      drawTag(ctx, photo.tag, span.x0 + 4 * scale, yTop, scale, false);
      drawTag(ctx, photo.place, span.x1 - 4 * scale - placeW, yTop, scale, true);
    } else {
      drawTag(ctx, photo.tag, (span.x0 + span.x1) / 2 - tagW / 2, yTop, scale, false);
    }
  }

  // callout on the hero panel
  const heroDrawn = drawn.find((d) => d.panel.hero);
  if (heroDrawn) {
    const box = polyBBox(heroDrawn.pts);
    drawCallout(ctx, box, scale);
  }

  // title straight over the art, bottom centre
  drawTitle(ctx, w, h, state, layout, scale);

  // small VICE corner badge, top right
  const bFs = Math.max(11, Math.round(16 * scale));
  ctx.font = `${bFs}px Anton, sans-serif`;
  const label = '★ VICE ★';
  const bw = ctx.measureText(label).width + 18 * scale, bh = bFs + 12 * scale;
  ctx.fillStyle = 'rgba(0,0,0,0.78)';
  ctx.strokeStyle = '#ffb13c';
  ctx.lineWidth = Math.max(1.5, 2 * scale);
  ctx.beginPath();
  ctx.roundRect(w - bw - 10 * scale, 10 * scale, bw, bh, Math.round(6 * scale));
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w - bw / 2 - 10 * scale, 10 * scale + bh / 2 + 1);
}

/** Renders the cover at w x h into a fresh canvas (used by export). */
export function renderCover(w, h, state) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  drawCover(c, state);
  return c;
}

/** Exports the cover at w x h as a PNG blob. Resolves { blob, ms }. */
export function exportCover(w, h, state) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const c = renderCover(w, h, state);
    c.toBlob((blob) => resolve({ blob, ms: Math.round(performance.now() - t0) }), 'image/png');
  });
}
