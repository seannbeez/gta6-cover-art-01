// LEONIDA GOLD — Vice Cover Studio.
// Draws GTA-style multi-panel cover art: a tight collage of panels split by thick
// slanted black gutters, one dominant hero panel, and the title painted straight
// over the art. Every photo first passes through the Vice Paint filter: strong
// smoothing, luminance-only posterization (never per-channel RGB, so skin stays
// clean), a warm sunset blend, and a thin ink outline.

// ---------------------------------------------------------------------------
// Data: the five characters, the grades, the layouts.
// ---------------------------------------------------------------------------

/** The five sample characters. ax/ay is the face anchor (face centre) in the
 * source photo, measured from the generated portraits; fb is the face bottom
 * (chin) fraction — the painter keeps everything above fb clear of the title. */
export const PANELS = [
  { id: 'wheelman', role: 'THE WHEELMAN', place: 'OCEAN DR', file: 'boulevard.jpg', ax: 0.52, ay: 0.35, fb: 0.62 },
  { id: 'lookout', role: 'THE LOOKOUT', place: 'PIER 9', file: 'pier.jpg', ax: 0.50, ay: 0.37, fb: 0.62 },
  { id: 'dealer', role: 'THE DEALER', place: 'DOWNTOWN', file: 'skyline.jpg', ax: 0.50, ay: 0.30, fb: 0.50 },
  { id: 'runner', role: 'THE RUNNER', place: 'NEON ROW', file: 'street.jpg', ax: 0.58, ay: 0.29, fb: 0.48 },
  { id: 'queen', role: 'THE QUEEN', place: 'MARINA', file: 'marina.jpg', ax: 0.50, ay: 0.34, fb: 0.55 },
];

export const PANEL_BY_ID = Object.fromEntries(PANELS.map((p) => [p.id, p]));

/** Colour grades. title is the two stops of the title gradient. */
export const GRADES = {
  sunset: { key: 'sunset', name: 'Vice Sunset', title: ['#ffd76a', '#ff5e8a'], warm: 1.0, sat: 1.12 },
  gold: { key: 'gold', name: 'Palm Gold', title: ['#ffe9a3', '#ff9a3d'], warm: 1.06, sat: 1.10 },
  neon: { key: 'neon', name: 'Neon Nights', title: ['#c9a7ff', '#ff4fd8'], warm: 0.96, sat: 1.18 },
};

/** Unknown grade keys fall back to the default sunset grade (never crash). */
export function gradeOf(key) {
  return GRADES[key] || GRADES.sunset;
}

/**
 * Layouts. Every layout tiles the whole canvas: each point belongs to a panel,
 * so no black void can ever show behind the title. Each panel entry is
 * { id, pts (unit-space polygon), fy (face height fraction in the panel),
 *   zoom (extra zoom), fx (face width fraction, default 0.5) }.
 * titleTop is the unit y where the main title begins.
 */
export const LAYOUTS = {
  poster: {
    key: 'poster', name: 'Poster', titleTop: 0.84,
    panels: [
      { id: 'lookout', pts: [[0, 0], [0.30, 0], [0.27, 0.55], [0, 0.55]], fy: 0.34, zoom: 1.05 },
      { id: 'wheelman', pts: [[0.30, 0], [0.70, 0], [0.66, 0.55], [0.27, 0.55]], fy: 0.30, zoom: 1.12 },
      { id: 'dealer', pts: [[0.70, 0], [1, 0], [1, 0.55], [0.66, 0.55]], fy: 0.34, zoom: 1.05 },
      { id: 'runner', pts: [[0, 0.55], [0.47, 0.55], [0.56, 1], [0, 1]], fy: 0.30, zoom: 1.0 },
      { id: 'queen', pts: [[0.47, 0.55], [1, 0.55], [1, 1], [0.56, 1]], fy: 0.26, zoom: 1.05 },
    ],
  },
  hero: {
    key: 'hero', name: 'Hero', titleTop: 0.84,
    panels: [
      { id: 'wheelman', pts: [[0, 0], [1, 0], [1, 0.50], [0, 0.50]], fy: 0.30, zoom: 1.10 },
      { id: 'lookout', pts: [[0, 0.50], [0.50, 0.50], [0.47, 0.72], [0, 0.72]], fy: 0.32, zoom: 1.0 },
      { id: 'dealer', pts: [[0.50, 0.50], [1, 0.50], [1, 0.72], [0.47, 0.72]], fy: 0.32, zoom: 1.0 },
      { id: 'runner', pts: [[0, 0.72], [0.46, 0.72], [0.55, 1], [0, 1]], fy: 0.14, zoom: 1.2 },
      { id: 'queen', pts: [[0.46, 0.72], [1, 0.72], [1, 1], [0.55, 1]], fy: 0.08, zoom: 1.3 },
    ],
  },
  split: {
    key: 'split', name: 'Split Heist', titleTop: 0.84,
    panels: [
      { id: 'wheelman', pts: [[0, 0], [0.60, 0], [0.46, 0.58], [0, 0.64]], fy: 0.30, zoom: 1.10 },
      { id: 'dealer', pts: [[0.60, 0], [1, 0], [1, 0.34], [0.52, 0.34]], fy: 0.34, zoom: 1.0 },
      { id: 'queen', pts: [[0.52, 0.34], [1, 0.34], [1, 0.58], [0.48, 0.58]], fy: 0.34, zoom: 1.0 },
      { id: 'runner', pts: [[0.48, 0.58], [1, 0.58], [1, 1], [0.56, 1]], fy: 0.28, zoom: 1.0 },
      { id: 'lookout', pts: [[0, 0.64], [0.46, 0.58], [0.48, 0.58], [0.56, 1], [0, 1]], fy: 0.30, zoom: 1.15 },
    ],
  },
  triptych: {
    key: 'triptych', name: 'Triptych', titleTop: 0.84,
    panels: [
      { id: 'lookout', pts: [[0, 0], [0.32, 0], [0.28, 0.55], [0, 0.55]], fy: 0.32, zoom: 1.0 },
      { id: 'wheelman', pts: [[0.32, 0], [0.68, 0], [0.64, 0.55], [0.28, 0.55]], fy: 0.30, zoom: 1.10 },
      { id: 'dealer', pts: [[0.68, 0], [1, 0], [1, 0.55], [0.64, 0.55]], fy: 0.32, zoom: 1.0 },
      { id: 'runner', pts: [[0, 0.55], [0.46, 0.55], [0.55, 1], [0, 1]], fy: 0.32, zoom: 1.0 },
      { id: 'queen', pts: [[0.46, 0.55], [1, 0.55], [1, 1], [0.55, 1]], fy: 0.32, zoom: 1.0 },
    ],
  },
  quad: {
    key: 'quad', name: 'Quad', titleTop: 0.84,
    panels: [
      { id: 'wheelman', pts: [[0, 0], [0.52, 0], [0.48, 0.52], [0, 0.52]], fy: 0.30, zoom: 1.05 },
      { id: 'dealer', pts: [[0.52, 0], [1, 0], [1, 0.52], [0.48, 0.52]], fy: 0.30, zoom: 1.05 },
      { id: 'lookout', pts: [[0, 0.52], [0.46, 0.52], [0.50, 1], [0, 1]], fy: 0.32, zoom: 1.0 },
      { id: 'queen', pts: [[0.46, 0.52], [1, 0.52], [1, 1], [0.50, 1]], fy: 0.32, zoom: 1.0 },
      { id: 'runner', pts: [[0.50, 0.36], [0.67, 0.52], [0.50, 0.68], [0.33, 0.52]], fy: 0.38, zoom: 1.0 },
    ],
  },
  spotlight: {
    key: 'spotlight', name: 'Spotlight', titleTop: 0.86, titleCap: 0.10,
    panels: [
      { id: 'wheelman', pts: [[0, 0], [1, 0], [1, 0.64], [0, 0.60]], fy: 0.30, zoom: 1.0 },
      { id: 'lookout', pts: [[0, 0.60], [0.26, 0.62], [0.24, 1], [0, 1]], fy: 0.34, zoom: 1.0 },
      { id: 'dealer', pts: [[0.26, 0.62], [0.51, 0.63], [0.49, 1], [0.24, 1]], fy: 0.34, zoom: 1.0 },
      { id: 'runner', pts: [[0.51, 0.63], [0.76, 0.64], [0.74, 1], [0.49, 1]], fy: 0.34, zoom: 1.0 },
      { id: 'queen', pts: [[0.76, 0.64], [1, 0.64], [1, 1], [0.74, 1]], fy: 0.34, zoom: 1.0 },
    ],
  },
  strip: {
    key: 'strip', name: 'Strip', titleTop: 0.84,
    panels: [
      { id: 'wheelman', pts: [[0, 0], [0.62, 0], [0.60, 0.55], [0, 0.55]], fy: 0.30, zoom: 1.05 },
      { id: 'lookout', pts: [[0.62, 0], [1, 0], [1, 0.28], [0.60, 0.28]], fy: 0.38, zoom: 1.0 },
      { id: 'dealer', pts: [[0.60, 0.28], [1, 0.28], [1, 0.55], [0.60, 0.55]], fy: 0.38, zoom: 1.0 },
      { id: 'runner', pts: [[0, 0.55], [0.46, 0.55], [0.55, 1], [0, 1]], fy: 0.32, zoom: 1.0 },
      { id: 'queen', pts: [[0.46, 0.55], [1, 0.55], [1, 1], [0.55, 1]], fy: 0.32, zoom: 1.0 },
    ],
  },
  duo: {
    key: 'duo', name: 'Duo Slant', titleTop: 0.84,
    panels: [
      { id: 'wheelman', pts: [[0, 0], [0.56, 0], [0.44, 0.55], [0, 0.55]], fy: 0.30, zoom: 1.10 },
      { id: 'dealer', pts: [[0.56, 0], [1, 0], [1, 0.55], [0.44, 0.55]], fy: 0.30, zoom: 1.10 },
      { id: 'lookout', pts: [[0, 0.55], [0.33, 0.55], [0.36, 1], [0, 1]], fy: 0.32, zoom: 1.0 },
      { id: 'runner', pts: [[0.33, 0.55], [0.66, 0.55], [0.70, 1], [0.36, 1]], fy: 0.32, zoom: 1.0 },
      { id: 'queen', pts: [[0.66, 0.55], [1, 0.55], [1, 1], [0.70, 1]], fy: 0.32, zoom: 1.0 },
    ],
  },
};

export function layoutOf(key) {
  return LAYOUTS[key] || LAYOUTS.poster;
}

// ---------------------------------------------------------------------------
// The Vice Paint filter.
// Smooth painted look with natural skin: multi-pass blur, luminance-only
// posterization, a warm blend with the graded original, thin ink edges.
// ---------------------------------------------------------------------------

const PAINT_CACHE = new Map();
const WORK_LONG = 960; // filter runs at most 960 px on the long side, then scales up
const PAINT_BLEND = 0.60; // painted layer over the warm original (55-65% band)

/** Separable box blur, radius r, in place on an ImageData's RGB channels. */
function boxBlur(data, w, h, r) {
  const tmp = new Uint8ClampedArray(data.length);
  const win = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let sr = 0, sg = 0, sb = 0;
    const row = y * w * 4;
    for (let x = -r; x <= r; x++) {
      const cx = Math.min(w - 1, Math.max(0, x));
      const o = row + cx * 4;
      sr += data[o]; sg += data[o + 1]; sb += data[o + 2];
    }
    for (let x = 0; x < w; x++) {
      const o = row + x * 4;
      tmp[o] = sr / win; tmp[o + 1] = sg / win; tmp[o + 2] = sb / win; tmp[o + 3] = data[o + 3];
      const xa = Math.min(w - 1, Math.max(0, x - r));
      const xb = Math.min(w - 1, Math.max(0, x + r + 1));
      const oa = row + xa * 4, ob = row + xb * 4;
      sr += data[ob] - data[oa]; sg += data[ob + 1] - data[oa + 1]; sb += data[ob + 2] - data[oa + 2];
    }
  }
  for (let x = 0; x < w; x++) {
    let sr = 0, sg = 0, sb = 0;
    for (let y = -r; y <= r; y++) {
      const cy = Math.min(h - 1, Math.max(0, y));
      const o = (cy * w + x) * 4;
      sr += tmp[o]; sg += tmp[o + 1]; sb += tmp[o + 2];
    }
    for (let y = 0; y < h; y++) {
      const o = (y * w + x) * 4;
      data[o] = sr / win; data[o + 1] = sg / win; data[o + 2] = sb / win;
      const ya = Math.min(h - 1, Math.max(0, y - r));
      const yb = Math.min(h - 1, Math.max(0, y + r + 1));
      const oa = (ya * w + x) * 4, ob = (yb * w + x) * 4;
      sr += tmp[ob] - tmp[oa]; sg += tmp[ob + 1] - tmp[oa + 1]; sb += tmp[ob + 2] - tmp[oa + 2];
    }
  }
}

/**
 * Paints an image into a canvas: warm-graded, heavily smoothed, luminance
 * posterized, blended back with the warm original, thin ink outline.
 * Returns a canvas with the same aspect as the source.
 */
export function paintPhoto(img, grade) {
  const g = gradeOf(grade && grade.key ? grade.key : grade);
  const cacheKey = (img.currentSrc || img.src || '') + '|' + g.key;
  const hit = PAINT_CACHE.get(cacheKey);
  if (hit) return hit;

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.min(1, WORK_LONG / Math.max(iw, ih));
  const w = Math.max(2, Math.round(iw * scale));
  const h = Math.max(2, Math.round(ih * scale));
  const work = document.createElement('canvas');
  work.width = w; work.height = h;
  const wctx = work.getContext('2d', { willReadFrequently: true });
  wctx.drawImage(img, 0, 0, w, h);
  const image = wctx.getImageData(0, 0, w, h);
  const d = image.data;
  const n = w * h;

  // 1. Warm sunset grade on the original (the base we blend back in).
  const warmR = 1.05 * g.warm, warmB = 0.96 / Math.sqrt(g.warm);
  const warmBase = new Uint8ClampedArray(d);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    warmBase[o] = Math.min(255, d[o] * warmR);
    warmBase[o + 1] = d[o + 1];
    warmBase[o + 2] = Math.min(255, d[o + 2] * warmB);
  }

  // 2. Strong smoothing: three passes of a radius-4 box blur (near-Gaussian).
  for (let p = 0; p < 3; p++) boxBlur(d, w, h, 4);

  // 3. Luminance-only posterization: quantize brightness into 6 steps and
  // rescale each pixel's RGB by the same factor, so hue never shifts and no
  // green/red channel blotches can form. Keep the blurred luminance for edges.
  const lum = new Float32Array(n);
  const LEVELS = 6;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const l = 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
    lum[i] = l;
    const lq = (Math.floor((l / 255) * LEVELS) + 0.5) / LEVELS * 255;
    const s = Math.min(1.9, Math.max(0.55, lq / Math.max(1, l)));
    d[o] *= s; d[o + 1] *= s; d[o + 2] *= s;
  }

  // 4. Blend the painted layer with the warm original (60 / 40), then a mild
  // saturation lift so the flat colours stay vivid without going muddy.
  const sat = g.sat;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    let r = d[o] * PAINT_BLEND + warmBase[o] * (1 - PAINT_BLEND);
    let gg = d[o + 1] * PAINT_BLEND + warmBase[o + 1] * (1 - PAINT_BLEND);
    let b = d[o + 2] * PAINT_BLEND + warmBase[o + 2] * (1 - PAINT_BLEND);
    const l = 0.299 * r + 0.587 * gg + 0.114 * b;
    d[o] = r + (r - l) * (sat - 1);
    d[o + 1] = gg + (gg - l) * (sat - 1);
    d[o + 2] = b + (b - l) * (sat - 1);
  }

  // 5. Thin ink outline: Sobel on the blurred luminance; strong edges darken.
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1]
        + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1];
      const gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1]
        + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
      const mag = Math.abs(gx) + Math.abs(gy);
      if (mag > 110) {
        const o = i * 4;
        d[o] *= 0.45; d[o + 1] *= 0.45; d[o + 2] *= 0.45;
      }
    }
  }

  wctx.putImageData(image, 0, 0);
  PAINT_CACHE.set(cacheKey, work);
  return work;
}

// ---------------------------------------------------------------------------
// Drawing.
// ---------------------------------------------------------------------------

/** Trace a unit-space polygon onto ctx at canvas size. */
function tracePoly(ctx, pts, w, h) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * w, pts[i][1] * h);
  ctx.closePath();
}

function polyBBox(pts, w, h) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [px, py] of pts) {
    x0 = Math.min(x0, px * w); y0 = Math.min(y0, py * h);
    x1 = Math.max(x1, px * w); y1 = Math.max(y1, py * h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Horizontal span [xLeft, xRight] of a unit-space polygon at a unit y. */
function spanAtY(pts, yFrac, w, h) {
  const y = yFrac * h;
  const xs = [];
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    if ((y1 * h <= y && y < y2 * h) || (y2 * h <= y && y < y1 * h)) {
      const t = (y - y1 * h) / ((y2 - y1) * h);
      xs.push((x1 + t * (x2 - x1)) * w);
    }
  }
  if (xs.length < 2) return null;
  return [Math.min(...xs), Math.max(...xs)];
}

/** Lowest (smallest) bottom y of a unit-space polygon across [x0, x1] in px. */
function polyBottomAt(pts, x0, x1, w, h) {
  let bottom = Infinity;
  for (const x of [x0, (x0 + x1) / 2, x1]) {
    const ys = [];
    for (let i = 0; i < pts.length; i++) {
      const [px1, py1] = pts[i];
      const [px2, py2] = pts[(i + 1) % pts.length];
      if ((px1 * w <= x && x < px2 * w) || (px2 * w <= x && x < px1 * w)) {
        const t = (x - px1 * w) / ((px2 - px1) * w);
        ys.push((py1 + t * (py2 - py1)) * h);
      }
    }
    if (ys.length) bottom = Math.min(bottom, Math.max(...ys));
  }
  return bottom === Infinity ? null : bottom;
}

/** Shrink a font until text fits maxW. Returns the fitted size. */
function fitFont(ctx, text, font, maxW, start) {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxW && size > 10) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

function pill(ctx, x, y, text, font, fg, bg, border) {
  ctx.font = font;
  const padX = 8, padY = 5;
  const tw = ctx.measureText(text).width;
  const m = /(\d+)px/.exec(font);
  const fs = m ? parseInt(m[1], 10) : 14;
  const bw = tw + padX * 2, bh = fs + padY * 2;
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, bw, bh, bh / 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = fg;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + bh / 2 + 0.5);
  return bw;
}

/**
 * Draw one panel: the painted photo, face-aware cropped so the face anchor
 * lands at (fx, fy) of the panel, then the role tag and place pill.
 * crop = { zoom, px, py } user offsets (fractions of the panel).
 */
function drawPanel(ctx, img, panelDef, panel, w, h, grade, crop, titleTop) {
  const pts = panel.pts;
  const bb = polyBBox(pts, w, h);
  const painted = paintPhoto(img, grade);
  const pw = painted.width, ph = painted.height;
  const fy = panel.fy ?? 0.32;
  const fx = panel.fx ?? 0.5;
  const zoom = (panel.zoom ?? 1) * (crop && crop.zoom ? crop.zoom : 1);
  const px = crop && crop.px ? crop.px : 0;
  const py = crop && crop.py ? crop.py : 0;

  ctx.save();
  tracePoly(ctx, pts, w, h);
  ctx.clip();
  // Cover-fit the panel bbox, then place the face anchor at (fx, fy) of it.
  const s = Math.max(bb.w / pw, bb.h / ph) * zoom;
  const dw = pw * s, dh = ph * s;
  let dx = bb.x + fx * bb.w - panelDef.ax * dw + px * bb.w;
  let dy = bb.y + fy * bb.h - panelDef.ay * dh + py * bb.h;
  // Clamp so the photo still covers the whole bbox.
  dx = Math.min(bb.x, Math.max(bb.x + bb.w - dw, dx));
  dy = Math.min(bb.y, Math.max(bb.y + bb.h - dh, dy));
  // Face-safe guard: keep the whole face (anchor down to the chin, fb) clear
  // of the title band, shifting the photo up as far as the cover allows.
  const faceBot = dy + panelDef.fb * dh;
  const limit = titleTop * h - Math.max(8, 0.02 * h);
  if (faceBot > limit && bb.y + bb.h > limit) {
    dy = Math.max(bb.y + bb.h - dh, dy - (faceBot - limit));
  }
  ctx.drawImage(painted, dx, dy, dw, dh);
  ctx.restore();

  // Thick black gutter: stroke the panel outline (shared edges get stroked
  // from both sides, so every divider reads as one solid black line).
  ctx.save();
  tracePoly(ctx, pts, w, h);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(5, w * 0.006);
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Role tag top-left; place pill top-right only when it cannot collide.
  // Tags sit inside the polygon's ACTUAL span at the tag's height, not the
  // bounding box: slanted panels share bbox edges with their neighbours, so
  // bbox placement lets one panel's tag cover the next panel's pill.
  const u = w / 1280; // scale unit: 1 at 1280 px wide
  const tagFont = (px) => `700 ${Math.round(px)}px Arial, sans-serif`;
  const tagSize = Math.max(10, Math.round(13 * u));
  const tagY = bb.y + Math.max(6, 8 * u);
  const tagH = tagSize + 10;
  const span = spanAtY(pts, (tagY + tagH / 2) / h, w, h) || [bb.x, bb.x + bb.w];
  const tagX = span[0] + Math.max(6, 8 * u);
  const roleW = pill(ctx, tagX, tagY, panelDef.role, tagFont(tagSize), '#ffffff', 'rgba(0,0,0,0.88)', '#ffb347');
  const placeFont = tagFont(Math.max(9, Math.round(11 * u)));
  ctx.font = placeFont;
  const placeW = ctx.measureText(panelDef.place).width + 16;
  if (tagX + roleW + 10 + placeW < span[1] - 6) {
    pill(ctx, span[1] - 6 - placeW, tagY, panelDef.place, placeFont, '#ffe9a3', 'rgba(0,0,0,0.88)', '#ffb347');
  }
}

/** The quote bubble, anchored to the hero panel's lower-left, clear of faces. */
function drawQuote(ctx, state, layout, w, h) {
  const quote = (state.quote || '').trim();
  if (!quote) return;
  const hero = layout.panels.find((p) => p.id === (state.hero || 'wheelman')) || layout.panels[0];
  const bb = polyBBox(hero.pts, w, h);
  const u = w / 1280;
  const fs = Math.max(11, Math.round(15 * u));
  ctx.font = `italic ${fs}px Georgia, serif`;
  const lines = [];
  const maxW = w * 0.24;
  const words = quote.split(/\s+/);
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 22;
  const bh = lines.length * fs * 1.35 + 14;
  const bx = bb.x + Math.max(8, 0.02 * w);
  // Anchor to the hero polygon's real bottom edge under the bubble (not the
  // bbox — a slanted bottom edge is higher than the bbox bottom), and never
  // let the bubble cover another panel's tag row below it.
  let by = layout.titleTop * h - bh - 10;
  const heroBottom = polyBottomAt(hero.pts, bx, bx + bw, w, h);
  if (heroBottom !== null) by = Math.min(by, heroBottom - bh - 8);
  for (const p of layout.panels) {
    if (p.id === hero.id) continue;
    const pbb = polyBBox(p.pts, w, h);
    const tagTop = pbb.y + Math.max(6, 8 * (w / 1280));
    if (tagTop > by && pbb.x < bx + bw && pbb.x + pbb.w > bx) {
      by = Math.min(by, tagTop - bh - 6);
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + 18, by + bh - 1); ctx.lineTo(bx + 30, by + bh - 1); ctx.lineTo(bx + 22, by + bh + 9);
  ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.94)'; ctx.fill();
  ctx.fillStyle = '#222';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  lines.forEach((l, i) => ctx.fillText(l, bx + 11, by + 8 + i * fs * 1.35));
}

/** The main title painted over the art, with subtitle and the VICE badge. */
function drawTitle(ctx, state, layout, w, h) {
  const grade = gradeOf(state.grade);
  const title = (state.title || 'LEONIDA GOLD').trim().toUpperCase();
  const top = layout.titleTop * h;
  const maxW = w * 0.94;
  const sizeCap = Math.round(h * (layout.titleCap || 0.16));
  const size = Math.min(
    fitFont(ctx, title, (s) => `${s}px Anton, sans-serif`, maxW, Math.round(h * 0.155)),
    sizeCap,
  );
  const grad = ctx.createLinearGradient(0, top, 0, top + size * 1.05);
  grad.addColorStop(0, grade.title[0]);
  grad.addColorStop(1, grade.title[1]);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  // Hard offset shadow, then a thick black stroke, then the gradient fill.
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.fillText(title, w / 2 + size * 0.045, top + size + size * 0.045);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(6, size * 0.16);
  ctx.strokeText(title, w / 2, top + size);
  ctx.fillStyle = grad;
  ctx.fillText(title, w / 2, top + size);
  // Slanted script sub-title below (clamped so it never runs off the canvas).
  const sub = (state.subtitle || 'chasing the golden hour').trim();
  if (sub) {
    const subSize = Math.max(13, Math.round(size * 0.24));
    ctx.font = `italic ${subSize}px Georgia, serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 6;
    const subY = Math.min(top + size + subSize * 1.5, h - subSize * 0.4);
    ctx.fillText(sub, w / 2, subY);
    ctx.shadowBlur = 0;
  }
  // Small VICE corner badge.
  const u = w / 1280;
  const badgeSize = Math.max(10, Math.round(13 * u));
  pill(ctx, w - Math.max(8, 12 * u) - 76 * u, Math.max(8, 10 * u), '★ VICE ★',
    `700 ${badgeSize}px Arial, sans-serif`, '#ffd76a', 'rgba(0,0,0,0.88)', '#ffb347');
}

/**
 * Draw the whole cover onto canvas. state: { layout, grade, title, subtitle,
 * quote, hero, photos: { panelId: img }, crops: { panelId: { zoom, px, py } } }
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const layout = layoutOf(state.layout);
  const grade = gradeOf(state.grade);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);
  for (const panel of layout.panels) {
    const def = PANEL_BY_ID[panel.id];
    const img = state.photos && state.photos[panel.id];
    if (!img) continue;
    drawPanel(ctx, img, def, panel, w, h, grade,
      state.crops && state.crops[panel.id], layout.titleTop);
  }
  drawQuote(ctx, state, layout, w, h);
  drawTitle(ctx, state, layout, w, h);
  // Clean outer frame.
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(5, w * 0.006);
  ctx.strokeRect(3, 3, w - 6, h - 6);
}

/** Render the cover at export size and return the canvas. */
export function exportCover(state, ew, eh) {
  const canvas = document.createElement('canvas');
  canvas.width = ew; canvas.height = eh;
  drawCover(canvas, state);
  return canvas;
}
