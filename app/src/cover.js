// LEONIDA GOLD — Vice Cover Studio: the cover renderer.
//
// Authentic GTA box-art collage: full-canvas panels split by thick black slanted
// gutters, one dominant hero panel, over-art Anton title, role tags per panel.
// Every photo (sample or user-uploaded) runs through the Vice Paint pipeline:
// strong multi-pass smoothing, luminance-only posterization (hue never shifts,
// so skin stays natural), a 60% blend over the warm-graded original, and a thin
// Sobel ink outline. The result reads as a flat Rockstar-style vector painting.

export const GRADES = {
  sunset: {
    name: 'Vice Sunset',
    title: ['#ffd76a', '#ff9a5c', '#ff5e8a'],
    warm: 'rgba(255, 150, 70, 0.34)',
    sub: '#fff3d6',
  },
  gold: {
    name: 'Palm Gold',
    title: ['#ffedb0', '#ffc44d', '#ff9e2c'],
    warm: 'rgba(255, 190, 70, 0.36)',
    sub: '#fff8e0',
  },
  neon: {
    name: 'Neon Nights',
    title: ['#ffc4f2', '#ff7ae0', '#c65cff'],
    warm: 'rgba(210, 90, 255, 0.30)',
    sub: '#ffe9fb',
  },
};

// The five crew members. fx/fy = face centre as a fraction of the photo,
// fb = chin as a fraction of the photo height. Measured from the portraits
// shipped in app/samples/ (all 1920x1280, face large and centred).
export const PANELS = [
  { key: 'boulevard', role: 'THE WHEELMAN', place: 'OCEAN DR', fx: 0.52, fy: 0.36, fb: 0.58 },
  { key: 'pier', role: 'THE LOOKOUT', place: 'PIER 9', fx: 0.52, fy: 0.36, fb: 0.62 },
  { key: 'skyline', role: 'THE DEALER', place: 'DOWNTOWN', fx: 0.52, fy: 0.33, fb: 0.60 },
  { key: 'street', role: 'THE RUNNER', place: 'NEON ROW', fx: 0.55, fy: 0.30, fb: 0.52 },
  { key: 'marina', role: 'THE QUEEN', place: 'MARINA', fx: 0.52, fy: 0.36, fb: 0.60 },
];

// One layout = five polygons (unit coords, indexed by PANELS order) plus the
// hero panel index, where the title sits, and per-panel framing overrides.
// The bottom-row panels always meet at a centre diagonal seam, so no black
// void ever sits behind the title.
export const LAYOUTS = {
  poster: {
    name: 'Poster', hero: 0, titleTop: 0.80, titleSize: 0.17,
    polys: [
      [[0.30, 0], [0.70, 0], [0.66, 0.52], [0.26, 0.52]],
      [[0, 0], [0.30, 0], [0.26, 0.52], [0, 0.52]],
      [[0.70, 0], [1, 0], [1, 0.52], [0.66, 0.52]],
      [[0, 0.52], [0.52, 0.52], [0.38, 1], [0, 1]],
      [[0.52, 0.52], [1, 0.52], [1, 1], [0.38, 1]],
    ],
    frame: { 4: { z: 1.05, ay: 0.26 } },
  },
  hero: {
    name: 'Hero', hero: 0, titleTop: 0.86, titleSize: 0.15,
    polys: [
      [[0, 0], [1, 0], [1, 0.55], [0, 0.55]],
      [[0, 0.55], [0.52, 0.55], [0.46, 0.70], [0, 0.70]],
      [[0.52, 0.55], [1, 0.55], [1, 0.70], [0.46, 0.70]],
      [[0, 0.70], [0.54, 0.70], [0.44, 1], [0, 1]],
      [[0.54, 0.70], [1, 0.70], [1, 1], [0.44, 1]],
    ],
    frame: { 1: { z: 1.0, ay: 0.42 }, 2: { z: 1.1, ay: 0.42 }, 3: { z: 1.3, ay: 0.30 }, 4: { z: 1.3, ay: 0.28 } },
  },
  split: {
    name: 'Split Heist', hero: 0, titleTop: 0.86, titleSize: 0.17,
    polys: [
      [[0, 0], [0.56, 0], [0.50, 0.62], [0, 0.62]],
      [[0, 0.62], [0.50, 0.62], [0.46, 1], [0, 1]],
      [[0.56, 0], [1, 0], [1, 0.34], [0.52, 0.34]],
      [[0.48, 0.64], [1, 0.64], [1, 1], [0.46, 1]],
      [[0.52, 0.34], [1, 0.34], [1, 0.64], [0.48, 0.64]],
    ],
    frame: { 1: { z: 1.15, ay: 0.30, fb: 0.71 }, 3: { z: 1.1, ay: 0.32 } },
  },
  triptych: {
    name: 'Triptych', hero: 0, titleTop: 0.84, titleSize: 0.15,
    polys: [
      [[0.36, 0], [0.62, 0], [0.58, 1], [0.32, 1]],
      [[0, 0], [0.20, 0], [0.16, 1], [0, 1]],
      [[0.62, 0], [0.82, 0], [0.78, 1], [0.58, 1]],
      [[0.20, 0], [0.36, 0], [0.32, 1], [0.16, 1]],
      [[0.82, 0], [1, 0], [1, 1], [0.78, 1]],
    ],
    frame: {},
  },
  quad: {
    name: 'Quad', hero: 0, titleTop: 0.82, titleSize: 0.16,
    polys: [
      [[0, 0], [0.55, 0], [0.50, 0.50], [0, 0.50]],
      [[0, 0.50], [0.50, 0.50], [0.46, 1], [0, 1]],
      [[0.55, 0], [1, 0], [1, 0.50], [0.50, 0.50]],
      [[0.50, 0.50], [0.74, 0.50], [0.70, 1], [0.46, 1]],
      [[0.74, 0.50], [1, 0.50], [1, 1], [0.70, 1]],
    ],
    frame: { 1: { z: 1.1, ay: 0.34 }, 3: { z: 1.1, ay: 0.32 }, 4: { z: 1.1, ay: 0.32 } },
  },
  spotlight: {
    name: 'Spotlight', hero: 0, titleTop: 0.86, titleSize: 0.10,
    polys: [
      [[0, 0], [1, 0], [1, 0.62], [0, 0.62]],
      [[0, 0.62], [0.27, 0.62], [0.24, 1], [0, 1]],
      [[0.27, 0.62], [0.51, 0.62], [0.48, 1], [0.24, 1]],
      [[0.51, 0.62], [0.76, 0.62], [0.73, 1], [0.48, 1]],
      [[0.76, 0.62], [1, 0.62], [1, 1], [0.73, 1]],
    ],
    frame: { 1: { z: 1.15, ay: 0.30 }, 2: { z: 1.15, ay: 0.30 }, 3: { z: 1.15, ay: 0.30 }, 4: { z: 1.15, ay: 0.30 } },
  },
  strip: {
    name: 'Strip', hero: 0, titleTop: 0.84, titleSize: 0.15,
    polys: [
      [[0, 0], [0.34, 0], [0.28, 1], [0, 1]],
      [[0.34, 0], [0.50, 0], [0.46, 1], [0.28, 1]],
      [[0.50, 0], [0.66, 0], [0.62, 1], [0.46, 1]],
      [[0.66, 0], [0.83, 0], [0.79, 1], [0.62, 1]],
      [[0.83, 0], [1, 0], [1, 1], [0.79, 1]],
    ],
    frame: {},
  },
  duo: {
    name: 'Duo Slant', hero: 0, titleTop: 0.82, titleSize: 0.16,
    polys: [
      [[0, 0], [0.56, 0], [0.44, 1], [0, 1]],
      [[0.56, 0], [1, 0], [1, 0.24], [0.54, 0.24]],
      [[0.54, 0.24], [1, 0.24], [1, 0.52], [0.50, 0.52]],
      [[0.50, 0.52], [1, 0.52], [1, 0.78], [0.47, 0.78]],
      [[0.47, 0.78], [1, 0.78], [1, 1], [0.44, 1]],
    ],
    frame: { 3: { z: 1.1, ay: 0.32 }, 4: { z: 1.1, ay: 0.32 } },
  },
};

const paintCache = new Map();

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

// Horizontal span of a polygon at height y (unit coords): [minX, maxX] or null.
function spanAtY(poly, y) {
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
      const t = (y - a[1]) / (b[1] - a[1]);
      const x = a[0] + t * (b[0] - a[0]);
      if (x < min) min = x;
      if (x > max) max = x;
    }
  }
  return min === Infinity ? null : [min, max];
}

// Bottom edge y of a polygon at horizontal position x (unit coords).
function polyBottomAt(poly, x) {
  let best = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if ((a[0] <= x && b[0] > x) || (b[0] <= x && a[0] > x)) {
      const t = (x - a[0]) / (b[0] - a[0]);
      const y = a[1] + t * (b[1] - a[1]);
      if (y > best) best = y;
    }
  }
  return best === -Infinity ? 1 : best;
}

function polyBBox(poly, w, h) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [px, py] of poly) {
    x0 = Math.min(x0, px * w); y0 = Math.min(y0, py * h);
    x1 = Math.max(x1, px * w); y1 = Math.max(y1, py * h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function tracePoly(ctx, poly, w, h) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0] * w, poly[0][1] * h);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0] * w, poly[i][1] * h);
  ctx.closePath();
}

// Separable box blur (radius r) on ImageData, sliding-window O(n) per pass.
function boxBlur(data, w, h, radius) {
  const tmp = new Uint8ClampedArray(data.length);
  const div = 2 * radius + 1;
  for (let y = 0; y < h; y++) {
    let r = 0, g = 0, b = 0;
    const row = y * w * 4;
    for (let x = -radius; x <= radius; x++) {
      const i = row + Math.max(0, Math.min(w - 1, x)) * 4;
      r += data[i]; g += data[i + 1]; b += data[i + 2];
    }
    for (let x = 0; x < w; x++) {
      const i = row + x * 4;
      tmp[i] = r / div; tmp[i + 1] = g / div; tmp[i + 2] = b / div; tmp[i + 3] = 255;
      const o = row + Math.max(0, Math.min(w - 1, x - radius)) * 4;
      const n = row + Math.max(0, Math.min(w - 1, x + radius + 1)) * 4;
      r += data[n] - data[o]; g += data[n + 1] - data[o + 1]; b += data[n + 2] - data[o + 2];
    }
  }
  for (let x = 0; x < w; x++) {
    let r = 0, g = 0, b = 0;
    for (let y = -radius; y <= radius; y++) {
      const i = (Math.max(0, Math.min(h - 1, y)) * w + x) * 4;
      r += tmp[i]; g += tmp[i + 1]; b += tmp[i + 2];
    }
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      data[i] = r / div; data[i + 1] = g / div; data[i + 2] = b / div; data[i + 3] = 255;
      const o = (Math.max(0, Math.min(h - 1, y - radius)) * w + x) * 4;
      const n = (Math.max(0, Math.min(h - 1, y + radius + 1)) * w + x) * 4;
      r += tmp[n] - tmp[o]; g += tmp[n + 1] - tmp[o + 1]; b += tmp[n + 2] - tmp[o + 2];
    }
  }
}

// --- Vice Paint: smooth, luminance-quantized, warm-blended, ink-outlined ---
function paintPhoto(img, w, h, gradeKey) {
  const grade = GRADES[gradeKey] || GRADES.sunset;
  const cacheKey = `${img.currentSrc || img.src}|${w}x${h}|${gradeKey}`;
  const hit = paintCache.get(cacheKey);
  if (hit) return hit;

  // 1. Cover-fit the photo into a working canvas.
  const base = makeCanvas(w, h);
  const bctx = base.getContext('2d');
  const s0 = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const pw = img.naturalWidth * s0, ph = img.naturalHeight * s0;
  bctx.drawImage(img, (w - pw) / 2, (h - ph) / 2, pw, ph);

  // 2. Warm grade: soft-light sunset tint over the original.
  const warm = makeCanvas(w, h);
  const wctx = warm.getContext('2d');
  wctx.drawImage(base, 0, 0);
  wctx.globalCompositeOperation = 'soft-light';
  wctx.fillStyle = grade.warm;
  wctx.fillRect(0, 0, w, h);
  wctx.globalCompositeOperation = 'source-over';

  // 3. Three passes of radius-4 box blur for strong smoothing that keeps
  //    edges crisp enough to survive posterization (a Gaussian blur melts
  //    eyes and mouths; a box blur flattens skin while keeping structure).
  const blurred = makeCanvas(w, h);
  const pctx = blurred.getContext('2d');
  pctx.drawImage(warm, 0, 0);
  const imgData = pctx.getImageData(0, 0, w, h);
  for (let pass = 0; pass < 3; pass++) boxBlur(imgData.data, w, h, 4);
  const d = imgData.data;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    lum[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  }
  const step = 256 / 6;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const l = lum[i];
      const q = (Math.floor(l / step) + 0.5) * step;
      let f = l > 4 ? q / l : 1;
      if (f < 0.5) f = 0.5;
      if (f > 1.6) f = 1.6;
      // Sobel magnitude on luminance for the ink edge.
      let gx = 0, gy = 0;
      if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
        gx = -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1]
          + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1];
        gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1]
          + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
      }
      const mag = Math.sqrt(gx * gx + gy * gy);
      const ink = mag > 110 ? 0.55 : 1;
      d[i * 4] = Math.min(255, d[i * 4] * f * ink);
      d[i * 4 + 1] = Math.min(255, d[i * 4 + 1] * f * ink);
      d[i * 4 + 2] = Math.min(255, d[i * 4 + 2] * f * ink);
    }
  }
  pctx.putImageData(imgData, 0, 0);

  // 5. Blend 60% painted over the warm original.
  const out = makeCanvas(w, h);
  const octx = out.getContext('2d');
  octx.drawImage(warm, 0, 0);
  octx.globalAlpha = 0.6;
  octx.drawImage(blurred, 0, 0);
  octx.globalAlpha = 1;

  if (paintCache.size > 40) paintCache.clear();
  paintCache.set(cacheKey, out);
  return out;
}

// Face-aware draw of one panel: the photo is cover-fit, zoomed, and centred
// on the face anchor, with the chin clamped clear of the title zone.
// The painted layer is rendered at the panel bbox's aspect ratio (scaled to
// fit 720 px on the long side), so drawing it stretched to the bbox is uniform.
function drawPanel(ctx, img, poly, panel, frame, w, h, gradeKey, titleTopY) {
  const bb = polyBBox(poly, w, h);
  if (bb.w < 4 || bb.h < 4) return;
  const z0 = frame.z || 1;
  const ay = frame.ay !== undefined ? frame.ay : 0.38;
  const fy = frame.fy !== undefined ? frame.fy : panel.fy;
  const fb = frame.fb !== undefined ? frame.fb : panel.fb;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const s0 = Math.max(bb.w / iw, bb.h / ih);
  // Cap the zoom so the face never fills more than 62% of the panel height.
  const zCap = (0.62 * bb.h) / (0.28 * ih * s0);
  let z = Math.min(z0, zCap);
  // Face anchor / chin in bbox coords under plain cover-fit.
  const afx = panel.fx * iw * s0 + (bb.w - iw * s0) / 2;
  const afy = fy * ih * s0 + (bb.h - ih * s0) / 2;
  const afb = fb * ih * s0 + (bb.h - ih * s0) / 2;
  let destX = bb.x, destY = bb.y, destW = bb.w, destH = bb.h;
  for (let attempt = 0; attempt < 8; attempt++) {
    destW = bb.w * z;
    destH = bb.h * z;
    destX = bb.x + (0.5 + (frame.px || 0)) * bb.w - afx * z;
    destY = bb.y + (ay + (frame.py || 0)) * bb.h - afy * z;
    destX = Math.max(bb.x + bb.w - destW, Math.min(bb.x, destX));
    destY = Math.max(bb.y + bb.h - destH, Math.min(bb.y, destY));
    const chinY = destY + afb * z;
    const clearLine = titleTopY - Math.max(14, h * 0.014);
    if (bb.y + bb.h <= titleTopY || chinY <= clearLine) break;
    // The chin is under the title line. First try shifting the photo up; if
    // the coverage floor stops the shift from clearing the chin, zoom IN — a
    // larger photo pushes the chin up relative to the panel bottom — up to
    // the face-height cap. Never zoom out here: that only leaves black voids.
    const floor = bb.y + bb.h - destH;
    const shifted = Math.max(floor, clearLine - afb * z);
    if (shifted + afb * z <= clearLine + 0.5) {
      destY = shifted;
      break;
    }
    if (z >= zCap) break; // best effort: chin as high as the cap allows
    z = Math.min(zCap, z * 1.18);
  }
  const k = Math.min(1, 1024 / Math.max(bb.w, bb.h));
  const painted = paintPhoto(img, Math.max(2, Math.round(bb.w * k)), Math.max(2, Math.round(bb.h * k)), gradeKey);
  ctx.save();
  tracePoly(ctx, poly, w, h);
  ctx.clip();
  ctx.drawImage(painted, destX, destY, destW, destH);
  ctx.restore();
}

function pill(ctx, text, cx, cy, fontPx, fg, bg, border) {
  ctx.font = `700 ${fontPx}px system-ui, sans-serif`;
  const tw = ctx.measureText(text).width;
  const padX = fontPx * 0.55, padY = fontPx * 0.32;
  const x = cx - tw / 2 - padX, y = cy - fontPx / 2 - padY;
  const r = (fontPx / 2 + padY) * 0.9;
  ctx.beginPath();
  ctx.roundRect(x, y, tw + padX * 2, fontPx + padY * 2, r);
  ctx.fillStyle = bg;
  ctx.fill();
  if (border) {
    ctx.lineWidth = Math.max(1, fontPx * 0.09);
    ctx.strokeStyle = border;
    ctx.stroke();
  }
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + fontPx * 0.05);
  return tw + padX * 2;
}

function drawTitle(ctx, w, h, text, grade, titleTop, titleSize) {
  const g = GRADES[grade] || GRADES.sunset;
  // The whole title block (title + script sub-title) must fit below titleTop.
  const fitCap = (h * (1 - titleTop) - 4) / 1.18;
  let size = Math.min(h * titleSize, fitCap);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const setFont = () => { ctx.font = `400 ${size}px Anton, 'Arial Narrow', sans-serif`; };
  setFont();
  while (ctx.measureText(text).width > w * 0.94 && size > 24) {
    size -= 4;
    setFont();
  }
  const cx = w / 2;
  const baseline = titleTop * h + size * 0.80;
  // Hard drop shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillText(text, cx + size * 0.03, baseline + size * 0.06);
  // Thick black stroke, then the sunset/neon gradient fill.
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, size * 0.15);
  ctx.strokeStyle = '#0b0b0b';
  ctx.strokeText(text, cx, baseline);
  const grad = ctx.createLinearGradient(0, baseline - size, 0, baseline + size * 0.12);
  grad.addColorStop(0, g.title[0]);
  grad.addColorStop(0.55, g.title[1]);
  grad.addColorStop(1, g.title[2]);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, baseline);
  // Slanted script sub-title.
  const subSize = Math.max(14, size * 0.22);
  ctx.font = `italic 400 ${subSize}px Georgia, serif`;
  ctx.lineWidth = Math.max(2, subSize * 0.10);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.strokeText('chasing the golden hour', cx, baseline + size * 0.30);
  ctx.fillStyle = g.sub;
  ctx.fillText('chasing the golden hour', cx, baseline + size * 0.30);
  return baseline;
}

/** Draws the full cover onto `canvas`.
 *  photos: array of 5 images (or null) in PANELS order.
 *  opts: { layout, grade, caption, quote }.
 */
export async function drawCover(canvas, photos, opts) {
  const { layout = 'poster', grade = 'sunset', caption = 'LEONIDA GOLD', quote = true, frameOverrides = {} } = opts || {};
  const L = LAYOUTS[layout] || LAYOUTS.poster;
  const g = GRADES[grade] || GRADES.sunset;
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, w, h);
  const titleTopY = L.titleTop * h;

  // Panels.
  for (let i = 0; i < 5; i++) {
    const poly = L.polys[i];
    const panel = PANELS[i];
    const frame = { ...((L.frame && L.frame[i]) || {}), ...(frameOverrides[i] || {}) };
    const img = photos[i];
    if (img) {
      drawPanel(ctx, img, poly, panel, frame, w, h, grade, titleTopY);
    } else {
      ctx.save();
      tracePoly(ctx, poly, w, h);
      ctx.fillStyle = '#241a2e';
      ctx.fill();
      ctx.restore();
    }
  }

  // Thick black gutters + outer border.
  const gw = Math.max(5, Math.round(w * 0.006));
  ctx.lineWidth = gw;
  ctx.strokeStyle = '#0b0b0b';
  ctx.lineJoin = 'miter';
  for (const poly of L.polys) {
    tracePoly(ctx, poly, w, h);
    ctx.stroke();
  }
  ctx.strokeRect(gw / 2, gw / 2, w - gw, h - gw);

  // Role tags (inside the polygon's real span at the tag height) + place pills.
  const tagPx = Math.max(13, Math.round(h * 0.016));
  const tagY = 0.022;
  // Measure the VICE badge first: the top-right panel's place pill must end
  // left of it, never under it.
  ctx.font = `700 ${tagPx}px system-ui, sans-serif`;
  const badgeText = '★ VICE ★';
  const badgeW = ctx.measureText(badgeText).width + tagPx * 1.1;
  const badgeCx = w - Math.max(34, w * 0.032) - badgeW / 2;
  const badgeLeft = badgeCx - badgeW / 2;
  for (let i = 0; i < 5; i++) {
    const poly = L.polys[i];
    const span = spanAtY(poly, tagY);
    if (!span) continue;
    const [sx0, sx1] = span;
    const cy = tagY * h + tagPx * 0.7;
    // Role tag, left inside the span.
    ctx.font = `700 ${tagPx}px system-ui, sans-serif`;
    const roleW = ctx.measureText(PANELS[i].role).width + tagPx * 1.1;
    pill(ctx, PANELS[i].role, sx0 * w + roleW / 2 + 8, cy, tagPx, '#ffffff', 'rgba(8, 8, 8, 0.88)', '#f5b942');
    // Place pill, right inside the span (clear of the VICE badge at top-right).
    const isTopRight = sx1 > 0.97 && poly.some(([px, py]) => py === 0 && px === 1);
    const placeW = ctx.measureText(PANELS[i].place).width + tagPx * 1.1;
    const rightEdge = isTopRight ? Math.min(sx1 * w - 8, badgeLeft - 10) : sx1 * w - 8;
    pill(ctx, PANELS[i].place, rightEdge - placeW / 2, cy, tagPx, '#ffd76a', 'rgba(8, 8, 8, 0.88)', '#f5b942');
  }

  // VICE badge, top-right corner.
  pill(ctx, badgeText, badgeCx, tagY * h + tagPx * 0.7, tagPx, '#ffd76a', 'rgba(8, 8, 8, 0.92)', '#f5b942');

  // Quote bubble, anchored to the hero polygon's real bottom edge.
  if (quote && (layout === 'poster' || layout === 'hero' || layout === 'split' || layout === 'spotlight')) {
    const heroPoly = L.polys[L.hero];
    const cx = 0.5;
    const bottomY = polyBottomAt(heroPoly, cx) * h;
    const qPx = Math.max(13, Math.round(h * 0.015));
    ctx.font = `italic 400 ${qPx}px Georgia, serif`;
    const qText = 'We take the city tonight. — LUCIA';
    const qw = ctx.measureText(qText).width + qPx * 1.6;
    const qh = qPx * 2.1;
    let qy = bottomY - qh - 10;
    // Cap the bubble above the next row's tag line.
    const capY = (L.titleTop - 0.06) * h;
    if (qy + qh > capY) qy = capY - qh;
    const qx = cx * w - qw / 2;
    ctx.beginPath();
    ctx.roundRect(qx, qy, qw, qh, qh / 2.4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx * w - 8, qy + qh - 2);
    ctx.lineTo(cx * w + 2, qy + qh + 12);
    ctx.lineTo(cx * w + 12, qy + qh - 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fill();
    ctx.fillStyle = '#1d1b22';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(qText, cx * w, qy + qh / 2 + 1);
  }

  // Over-art title.
  const text = (caption || 'LEONIDA GOLD').trim().toUpperCase();
  if (text) drawTitle(ctx, w, h, text, grade, L.titleTop, L.titleSize);
}
