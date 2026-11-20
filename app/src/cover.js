// LEONIDA GOLD — Vice Cover Studio: the cover renderer.
// Draws GTA-style multi-panel cover art from photos + caption onto a canvas:
// photo panels with role tags, layered typography (stars + quote strip, giant
// chrome 3D title with glow, script line, ribbon, callout, VOL. 1 badge,
// seal, barcode, billing), 8 layouts and 6 grades, PNG export in 3 sizes.
// Faces are kept clear of the title by design: every panel crops its photo
// so the face focal point lands on a layout-chosen anchor away from the
// title band. No network, no Rockstar assets — all art is original.

export const SAMPLES = [
  { file: 'samples/boulevard.jpg', role: 'THE WHEELMAN', place: 'OCEAN DR', fx: 0.50, fy: 0.38 },
  { file: 'samples/pier.jpg', role: 'THE LOOKOUT', place: 'PIER 9', fx: 0.50, fy: 0.42 },
  { file: 'samples/skyline.jpg', role: 'THE DEALER', place: 'DOWNTOWN', fx: 0.50, fy: 0.38 },
  { file: 'samples/street.jpg', role: 'THE RUNNER', place: 'NEON ROW', fx: 0.52, fy: 0.35 },
  { file: 'samples/marina.jpg', role: 'THE QUEEN', place: 'MARINA', fx: 0.52, fy: 0.40 },
];

export const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', tint: 'rgba(255,110,40,0.15)', wash: 'rgba(255,60,120,0.10)',
    title: ['#fff3b0', '#ffb03a', '#ff5e3a', '#ff2e88'], glow: 'rgba(255,140,60,0.85)',
    sw: 'linear-gradient(135deg,#ff9a3d,#ff2e88)' },
  { id: 'neon', name: 'Neon Nights', tint: 'rgba(90,40,255,0.17)', wash: 'rgba(0,220,255,0.10)',
    title: ['#d8fbff', '#7ee7ff', '#4d7cff', '#b04dff'], glow: 'rgba(120,90,255,0.85)',
    sw: 'linear-gradient(135deg,#4d7cff,#b04dff)' },
  { id: 'palm', name: 'Palm Gold', tint: 'rgba(255,190,40,0.15)', wash: 'rgba(255,140,0,0.10)',
    title: ['#fffbe0', '#ffe066', '#ffb03a', '#ff8c1a'], glow: 'rgba(255,190,60,0.85)',
    sw: 'linear-gradient(135deg,#ffe066,#ff8c1a)' },
  { id: 'ocean', name: 'Ocean Drive', tint: 'rgba(0,180,220,0.15)', wash: 'rgba(0,90,180,0.12)',
    title: ['#e0fbff', '#7ee7ff', '#2fa8ff', '#1a5cff'], glow: 'rgba(60,180,255,0.85)',
    sw: 'linear-gradient(135deg,#7ee7ff,#1a5cff)' },
  { id: 'dark', name: 'After Dark', tint: 'rgba(40,10,80,0.20)', wash: 'rgba(120,20,120,0.12)',
    title: ['#ffe9f5', '#ff9ad5', '#c05cff', '#6a2cff'], glow: 'rgba(190,90,255,0.85)',
    sw: 'linear-gradient(135deg,#ff9ad5,#6a2cff)' },
  { id: 'noir', name: 'B&W Noir', tint: 'rgba(0,0,0,0.08)', wash: 'rgba(255,255,255,0.05)',
    title: ['#ffffff', '#e8e8e8', '#bdbdbd', '#7a7a7a'], glow: 'rgba(255,255,255,0.5)',
    sw: 'linear-gradient(135deg,#ffffff,#777777)', gray: true },
];

export const LAYOUTS = [
  { id: 'poster', name: 'Poster' },
  { id: 'hero', name: 'Hero' },
  { id: 'split', name: 'Split Heist' },
  { id: 'triptych', name: 'Triptych' },
  { id: 'quad', name: 'Quad' },
  { id: 'spotlight', name: 'Spotlight' },
  { id: 'strip', name: 'Strip' },
  { id: 'duo', name: 'Duo Slant' },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Panel rects are fractions of the canvas. Each panel carries the photo index
// and the anchor (ax, ay) where its face focal point should land inside the
// panel — chosen per layout so no face sits under the title.
// Row layouts (poster, hero, split, quad, duo) use a dedicated title STRIP:
// a solid dark band between the panel rows that holds the title, script and
// ribbon, so the giant title can never cover a face, a tag or a place label.
// Column layouts (triptych, spotlight, strip) keep the title over the art:
// their faces are anchored high, clear of the title band.
// The callout bubble sits at the bottom-left of one named panel, on torso /
// background, never over a face (its width is fitted to its text).
function panelsFor(layout, W, H) {
  const T = 0.085, B = 0.905;
  switch (layout) {
    case 'poster': return {
      strip: { y0: 0.40, y1: 0.64 }, titleCy: 0.49, scriptY: 0.545, ribbonY: 0.585,
      titleSize: 0.135, script: true, ribbon: true, diagonal: null,
      callout: { panel: 0, corner: 'bl' },
      rects: [
        { p: 0, x: 0.000, y: T, w: 0.333, h: 0.315, ax: 0.50, ay: 0.30 },
        { p: 1, x: 0.333, y: T, w: 0.334, h: 0.315, ax: 0.50, ay: 0.30 },
        { p: 2, x: 0.667, y: T, w: 0.333, h: 0.315, ax: 0.50, ay: 0.30 },
        { p: 3, x: 0.000, y: 0.64, w: 0.500, h: 0.265, ax: 0.50, ay: 0.72 },
        { p: 4, x: 0.500, y: 0.64, w: 0.500, h: 0.265, ax: 0.50, ay: 0.72 },
      ] };
    case 'hero': return {
      strip: { y0: 0.30, y1: 0.48 }, titleCy: 0.36, scriptY: 0.415, ribbonY: 0.44,
      titleSize: 0.155, script: true, ribbon: true, diagonal: null,
      callout: { panel: 0, corner: 'bl' },
      rects: [
        { p: 0, x: 0.000, y: T, w: 1.000, h: 0.215, ax: 0.50, ay: 0.32 },
        { p: 1, x: 0.000, y: 0.48, w: 0.500, h: 0.210, ax: 0.50, ay: 0.80 },
        { p: 2, x: 0.500, y: 0.48, w: 0.500, h: 0.210, ax: 0.50, ay: 0.80 },
        { p: 3, x: 0.000, y: 0.70, w: 0.500, h: 0.205, ax: 0.50, ay: 0.30 },
        { p: 4, x: 0.500, y: 0.70, w: 0.500, h: 0.205, ax: 0.50, ay: 0.30 },
      ] };
    case 'split': return {
      strip: { y0: 0.36, y1: 0.56 }, titleCy: 0.435, scriptY: 0.485, ribbonY: 0.525,
      titleSize: 0.130, script: true, ribbon: true,
      diagonal: { x1: 0.62, y1: T, x2: 0.38, y2: B },
      callout: { panel: 3, corner: 'bl' },
      rects: [
        { p: 0, x: 0.000, y: T, w: 0.500, h: 0.275, ax: 0.32, ay: 0.30 },
        { p: 1, x: 0.500, y: T, w: 0.500, h: 0.275, ax: 0.68, ay: 0.30 },
        { p: 2, x: 0.000, y: 0.56, w: 0.500, h: 0.180, ax: 0.32, ay: 0.72 },
        { p: 4, x: 0.500, y: 0.56, w: 0.500, h: 0.180, ax: 0.68, ay: 0.72 },
        { p: 3, x: 0.000, y: 0.74, w: 1.000, h: 0.165, ax: 0.62, ay: 0.45 },
      ] };
    case 'triptych': return {
      strip: null, titleY: 0.50, titleSize: 0.130, script: true, ribbon: true, diagonal: null,
      callout: { panel: 0, corner: 'bl' },
      rects: [
        { p: 0, x: 0.000, y: T, w: 0.333, h: 0.820, ax: 0.50, ay: 0.28 },
        { p: 2, x: 0.333, y: T, w: 0.334, h: 0.820, ax: 0.50, ay: 0.28 },
        { p: 4, x: 0.667, y: T, w: 0.333, h: 0.820, ax: 0.50, ay: 0.28 },
      ] };
    case 'quad': return {
      strip: { y0: 0.33, y1: 0.54 }, titleCy: 0.41, scriptY: 0.47, ribbonY: 0.495,
      titleSize: 0.120, script: true, ribbon: true, diagonal: null,
      callout: { panel: 3, corner: 'bl' },
      rects: [
        { p: 0, x: 0.000, y: T, w: 0.500, h: 0.245, ax: 0.50, ay: 0.30 },
        { p: 1, x: 0.500, y: T, w: 0.500, h: 0.245, ax: 0.50, ay: 0.30 },
        { p: 2, x: 0.000, y: 0.54, w: 0.500, h: 0.170, ax: 0.50, ay: 0.85 },
        { p: 4, x: 0.500, y: 0.54, w: 0.500, h: 0.170, ax: 0.50, ay: 0.85 },
        { p: 3, x: 0.000, y: 0.72, w: 1.000, h: 0.185, ax: 0.50, ay: 0.45 },
      ] };
    case 'spotlight': return {
      strip: null, titleY: 0.50, titleSize: 0.120, script: false, ribbon: true, diagonal: null,
      callout: { panel: 2, corner: 'bl' },
      rects: [
        { p: 2, x: 0.200, y: T, w: 0.600, h: 0.820, ax: 0.50, ay: 0.25 },
        { p: 0, x: 0.000, y: T, w: 0.190, h: 0.215, ax: 0.50, ay: 0.50 },
        { p: 1, x: 0.810, y: T, w: 0.190, h: 0.215, ax: 0.50, ay: 0.50 },
        { p: 3, x: 0.000, y: 0.690, w: 0.190, h: 0.215, ax: 0.50, ay: 0.50 },
        { p: 4, x: 0.810, y: 0.690, w: 0.190, h: 0.215, ax: 0.50, ay: 0.50 },
      ] };
    case 'strip': return {
      strip: null, titleY: 0.50, titleSize: 0.120, script: true, ribbon: true, diagonal: null,
      callout: { panel: 0, corner: 'bl' },
      rects: SAMPLES.map((_, i) => (
        { p: i, x: i * 0.20, y: T, w: 0.20, h: 0.820, ax: 0.50, ay: 0.28 }
      )) };
    default: return duoPanels();
  }
}

// Duo Slant lives in the default branch so the switch above stays total.
function duoPanels() {
  const T = 0.085;
  return {
    strip: { y0: 0.40, y1: 0.59 }, titleCy: 0.47, scriptY: 0.525, ribbonY: 0.545,
    titleSize: 0.130, script: true, ribbon: true,
    diagonal: { x1: 0.52, y1: T, x2: 0.44, y2: 0.40 },
    callout: { panel: 1, corner: 'bl' },
    rects: [
      { p: 0, x: 0.000, y: T, w: 0.500, h: 0.315, ax: 0.50, ay: 0.30 },
      { p: 4, x: 0.500, y: T, w: 0.500, h: 0.315, ax: 0.50, ay: 0.30 },
      { p: 1, x: 0.000, y: 0.59, w: 0.333, h: 0.315, ax: 0.50, ay: 0.35 },
      { p: 2, x: 0.333, y: 0.59, w: 0.334, h: 0.315, ax: 0.50, ay: 0.35 },
      { p: 3, x: 0.667, y: 0.59, w: 0.333, h: 0.315, ax: 0.50, ay: 0.35 },
    ] };
}

function layoutFor(id) {
  if (id === 'duo') return duoPanels();
  return panelsFor(id);
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawPhoto(ctx, img, rect, focal, anchor, zoom, panX, panY, gray) {
  const pw = img.naturalWidth, ph = img.naturalHeight;
  // Cover-fit, then zoom in (up to 1.8x the editor zoom) until the focal
  // point can actually sit on its anchor: a plain cover-fit clamps the
  // window to the photo edge and strands the face wherever the photo puts
  // it — that is what hid the middle-band faces under the title in the
  // first render pass.
  let z = zoom || 1;
  const zCap = z * 1.8;
  let vw = pw, vh = ph, sx = 0, sy = 0;
  for (let iter = 0; iter < 5; iter++) {
    const scale = Math.max(rect.w / pw, rect.h / ph) * z;
    vw = rect.w / scale; vh = rect.h / scale;
    sx = focal.fx * pw - anchor.ax * vw + (panX || 0);
    sy = focal.fy * ph - anchor.ay * vh + (panY || 0);
    const inX = sx >= -1 && sx + vw <= pw + 1;
    const inY = sy >= -1 && sy + vh <= ph + 1;
    if ((inX && inY) || z >= zCap) break;
    z = Math.min(zCap, z * 1.25);
  }
  sx = clamp(sx, 0, Math.max(0, pw - vw));
  sy = clamp(sy, 0, Math.max(0, ph - vh));
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (gray) ctx.filter = 'grayscale(1) contrast(1.05)';
  ctx.drawImage(img, sx, sy, vw, vh, rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function pill(ctx, x, y, w, h, text, font, fg, bg, border) {
  ctx.save();
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  if (border) { ctx.lineWidth = Math.max(1.5, h * 0.08); ctx.strokeStyle = border; ctx.stroke(); }
  ctx.fillStyle = fg;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + h * 0.04);
  ctx.restore();
}

function chromeTitle(ctx, text, cx, cy, size, grade, maxW) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let s = size;
  ctx.font = `900 ${s}px Anton, "Arial Black", sans-serif`;
  try { ctx.letterSpacing = `${Math.round(s * 0.02)}px`; } catch (e) { /* older canvas */ }
  while (ctx.measureText(text).width > maxW && s > 24) {
    s *= 0.94;
    ctx.font = `900 ${s}px Anton, "Arial Black", sans-serif`;
  }
  const g = ctx.createLinearGradient(0, cy - s * 0.55, 0, cy + s * 0.55);
  grade.title.forEach((c, i) => g.addColorStop(i / (grade.title.length - 1), c));
  // 3D depth: dark copies stacked below, then the glowing gradient face.
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = s * 0.28;
  ctx.fillStyle = '#1a0a12';
  for (let i = 6; i >= 1; i--) ctx.fillText(text, cx, cy + i * s * 0.045);
  ctx.shadowBlur = s * 0.28;
  ctx.fillStyle = g;
  ctx.fillText(text, cx, cy);
  // top sheen
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillText(text, cx, cy - s * 0.03);
  ctx.restore();
  return s;
}

function drawBarcode(ctx, x, y, w, h, number) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  const bars = [3, 1, 2, 1, 1, 3, 2, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1];
  let bx = x + w * 0.08;
  const bw = w * 0.84;
  const unit = bw / bars.reduce((a, b) => a + b, 0);
  ctx.fillStyle = '#111111';
  for (const b of bars) { ctx.fillRect(bx, y + h * 0.08, b * unit, h * 0.58); bx += b * unit; }
  ctx.fillStyle = '#111111';
  // The number must fit the barcode's own width: at the default size it
  // overflowed both sides on narrow canvases and was cut at the frame edge.
  let nSize = Math.round(h * 0.16);
  ctx.font = `700 ${nSize}px "Courier New", monospace`;
  while (nSize > 6 && ctx.measureText(number).width > w * 0.92) {
    nSize -= 1;
    ctx.font = `700 ${nSize}px "Courier New", monospace`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number, x + w / 2, y + h * 0.82);
  ctx.restore();
}

function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#f5b942';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.08);
  ctx.strokeStyle = '#7a4a00';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
  ctx.setLineDash([r * 0.12, r * 0.08]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#2a0e00';
  ctx.font = `900 ${Math.round(r * 0.34)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 0, -r * 0.28);
  ctx.font = `800 ${Math.round(r * 0.20)}px "Trebuchet MS", sans-serif`;
  ctx.fillText('ORIGINAL', 0, r * 0.14);
  ctx.fillText('COVER ART', 0, r * 0.38);
  ctx.restore();
}

export function panelRects(layout, W, H) {
  const lay = layoutFor(layout);
  return lay.rects.map((r) => ({
    p: r.p, x: r.x * W, y: r.y * H, w: r.w * W, h: r.h * H,
  }));
}

export function drawCover(ctx, W, H, state, images) {
  const grade = GRADES.find((g) => g.id === state.grade) || GRADES[0];
  const lay = layoutFor(state.layout);
  const u = W / 1280; // scale unit
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#12081c';
  ctx.fillRect(0, 0, W, H);

  // Photo panels.
  const rects = lay.rects.map((r) => ({
    ...r, x: r.x * W, y: r.y * H, w: r.w * W, h: r.h * H,
  }));
  for (const r of rects) {
    const s = SAMPLES[r.p];
    const img = images.get(s.file);
    const ph = state.photos[r.p] || {};
    if (img) drawPhoto(ctx, img, r, { fx: s.fx, fy: s.fy }, { ax: r.ax, ay: r.ay },
      ph.zoom || 1, ph.panX || 0, ph.panY || 0, grade.gray);
  }

  // Grade wash + vignette over the photo area.
  ctx.save();
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, H * 0.085, W, H * 0.82);
  const wash = ctx.createLinearGradient(0, H * 0.085, 0, H * 0.905);
  wash.addColorStop(0, 'rgba(0,0,0,0)');
  wash.addColorStop(1, grade.wash);
  ctx.fillStyle = wash;
  ctx.fillRect(0, H * 0.085, W, H * 0.82);
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, H * 0.085, W, H * 0.82);
  ctx.restore();

  // Dedicated title strip (row layouts only): a solid dark band between the
  // panel rows that holds the title, script and ribbon, so the giant title
  // can never cover a face, a tag or a place label.
  if (lay.strip) {
    const sy0 = lay.strip.y0 * H, sy1 = lay.strip.y1 * H;
    const sg = ctx.createLinearGradient(0, sy0, 0, sy1);
    sg.addColorStop(0, '#160a20');
    sg.addColorStop(1, '#0d0514');
    ctx.fillStyle = sg;
    ctx.fillRect(0, sy0, W, sy1 - sy0);
    ctx.fillStyle = '#f5b942';
    ctx.fillRect(0, sy0, W, Math.max(2, 3 * u));
    ctx.fillRect(0, sy1 - Math.max(2, 3 * u), W, Math.max(2, 3 * u));
  }

  // Gold panel dividers.
  ctx.save();
  ctx.strokeStyle = 'rgba(245,185,66,0.85)';
  ctx.lineWidth = Math.max(2, 3 * u);
  for (const r of rects) {
    ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  }
  if (lay.diagonal) {
    ctx.beginPath();
    ctx.moveTo(lay.diagonal.x1 * W, lay.diagonal.y1 * H);
    ctx.lineTo(lay.diagonal.x2 * W, lay.diagonal.y2 * H);
    ctx.lineWidth = Math.max(3, 5 * u);
    ctx.strokeStyle = '#f5b942';
    ctx.stroke();
  }
  ctx.restore();

  // Role tags (top-left of each panel — the old bottom-left spot sat under
  // the title and was half-covered) and place labels (top-right).
  for (const r of rects) {
    const s = SAMPLES[r.p];
    const tagH = Math.max(18, H * 0.032);
    const tagFont = `800 ${Math.round(tagH * 0.52)}px "Trebuchet MS", sans-serif`;
    ctx.font = tagFont;
    const tw = ctx.measureText(s.role).width + tagH * 1.1;
    pill(ctx, r.x + 10 * u, r.y + 8 * u, tw, tagH, s.role, tagFont, '#fff6ea', 'rgba(10,5,15,0.88)', '#f5b942');
    const plH = Math.max(14, H * 0.024);
    const plFont = `800 ${Math.round(plH * 0.55)}px "Trebuchet MS", sans-serif`;
    ctx.font = plFont;
    const pw2 = ctx.measureText(s.place).width + plH * 1.2;
    pill(ctx, r.x + r.w - pw2 - 8 * u, r.y + 8 * u, pw2, plH, s.place, plFont, '#ffe9b0', 'rgba(10,5,15,0.72)', null);
  }

  // Top strip: stars + quote, VOL. 1 badge (fully inside the frame).
  const stripH = H * 0.085;
  ctx.save();
  ctx.fillStyle = '#0d0514';
  ctx.fillRect(0, 0, W, stripH);
  ctx.fillStyle = '#f5b942';
  ctx.font = `900 ${Math.round(stripH * 0.42)}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const stars = '★★★★★';
  const qx = 16 * u;
  ctx.fillText(stars, qx, stripH / 2);
  const starW = ctx.measureText(stars).width;
  const volH = stripH * 0.62;
  const volFont = `900 ${Math.round(volH * 0.5)}px Anton, sans-serif`;
  ctx.font = volFont;
  const volW = ctx.measureText('VOL. 1').width + volH * 1.1;
  const margin = Math.max(14, 18 * u);
  // Fit the quote between the stars and the VOL. 1 badge: shrink the font,
  // then truncate the text — the first pass drew it at a fixed size and it
  // ran off the right edge on narrow canvases.
  let quote = 'SUNSET HEIST OF THE YEAR — THE LEONIDA LEDGER';
  let qSize = Math.round(stripH * 0.34);
  const qAvail = W - margin - volW - 10 * u - (qx + starW + 14 * u);
  ctx.font = `800 ${qSize}px Anton, sans-serif`;
  while (ctx.measureText(quote).width > qAvail && qSize > Math.round(stripH * 0.18)) {
    qSize -= 1;
    ctx.font = `800 ${qSize}px Anton, sans-serif`;
  }
  while (ctx.measureText(quote).width > qAvail && quote.length > 12) {
    const next = quote.replace(/ ?[^ ]+$/, '…');
    if (next === quote) break;
    quote = next;
  }
  ctx.fillStyle = '#fff6ea';
  ctx.font = `800 ${qSize}px Anton, sans-serif`;
  ctx.fillText(quote, qx + starW + 14 * u, stripH / 2 + 1);
  pill(ctx, W - margin - volW, (stripH - volH) / 2, volW, volH, 'VOL. 1', volFont, '#2a0e00', '#f5b942', null);
  ctx.restore();

  // Giant chrome title + script + ribbon. Row layouts put them inside the
  // dedicated title strip (absolute fractions, size capped by the strip
  // height); column layouts centre them over the art as before.
  const titleSize = lay.strip
    ? Math.min(lay.titleSize * W, (lay.strip.y1 - lay.strip.y0) * H * 0.52)
    : lay.titleSize * W;
  const titleCy = lay.strip ? lay.titleCy * H : lay.titleY * H;
  chromeTitle(ctx, state.title, W / 2, titleCy, titleSize, grade, W * 0.92);
  if (lay.script) {
    const scriptY = lay.strip ? lay.scriptY * H : titleCy + titleSize * 0.62;
    const ribbonY = lay.strip ? lay.ribbonY * H : titleCy + titleSize * 0.80;
    ctx.save();
    ctx.fillStyle = '#ffe9b0';
    ctx.font = `italic 700 ${Math.round(titleSize * 0.34)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = Math.round(titleSize * 0.12);
    ctx.fillText(state.script, W / 2, scriptY);
    ctx.restore();
    const ribH = Math.max(20, H * 0.034);
    const ribFont = `800 ${Math.round(ribH * 0.52)}px "Trebuchet MS", sans-serif`;
    ctx.font = ribFont;
    const ribText = 'ONE CREW · ONE COAST · NO WAY HOME';
    const ribW = ctx.measureText(ribText).width + ribH * 1.6;
    pill(ctx, (W - ribW) / 2, ribbonY, ribW, ribH, ribText, ribFont, '#ffe9b0', 'rgba(10,5,15,0.88)', '#f5b942');
  }

  // Callout bubble: fitted to its text (the first pass drew a fixed-width
  // bubble whose text ran off the right edge and across the wheelman's
  // face) and parked at the bottom-left of the layout's named panel, on
  // torso or background, never over a face.
  const callout = state.callout || '';
  if (callout) {
    const host = rects.find((r) => r.p === (lay.callout ? lay.callout.panel : 0)) || rects[0];
    const bh = H * 0.09;
    let cFont = Math.round(bh * 0.26);
    ctx.font = `${cFont}px Georgia, serif`;
    const textW = ctx.measureText(callout).width;
    const bw = Math.min(W * 0.34, Math.max(W * 0.20, textW + 28 * u));
    if (textW + 28 * u > bw) {
      cFont = Math.max(10, Math.floor(cFont * (bw - 28 * u) / textW));
      ctx.font = `${cFont}px Georgia, serif`;
    }
    const bx = host.x + 12 * u, by = host.y + host.h - bh - 12 * u;
    ctx.save();
    roundRect(ctx, bx, by, bw, bh, 12 * u);
    ctx.fillStyle = 'rgba(255,246,234,0.96)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.22, by + bh);
    ctx.lineTo(bx + bw * 0.30, by + bh + 12 * u);
    ctx.lineTo(bx + bw * 0.38, by + bh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#241233';
    ctx.font = `${cFont}px Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(callout, bx + 14 * u, by + bh * 0.36);
    ctx.fillStyle = '#e83e6b';
    ctx.font = `800 ${cFont}px "Trebuchet MS", sans-serif`;
    ctx.fillText('— ' + (state.calloutBy || 'LUCIA'), bx + 14 * u, by + bh * 0.70);
    ctx.restore();
  }

  // Bottom strip: COMING SOON, billing, seal, barcode — all fully inside.
  // The first pass centred the billing on the whole canvas, so on narrow
  // canvases it ran under COMING SOON and the seal and off the right edge.
  // Now the billing lives in the measured middle space between them and its
  // fonts shrink until the longest line fits.
  const botH = H * 0.095;
  const botY = H - botH;
  ctx.save();
  ctx.fillStyle = '#0d0514';
  ctx.fillRect(0, botY, W, botH);
  const bcW = Math.max(64, W * 0.085), bcH = botH * 0.86;
  const bcX = W - margin - bcW, bcY = botY + (botH - bcH) / 2;
  const sealR = Math.min(bcH * 0.46, (bcX - W * 0.62) / 2 - 10 * u);
  const rightX = bcX - 12 * u - 2 * Math.max(10, sealR) - 10 * u;
  ctx.fillStyle = '#fff6ea';
  ctx.font = `900 ${Math.round(botH * 0.34)}px Anton, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('COMING SOON', margin, botY + botH / 2);
  const csW = ctx.measureText('COMING SOON').width;
  const billL = margin + csW + 16 * u, billR = rightX - 8 * u;
  const billCx = (billL + billR) / 2, billW = Math.max(60, billR - billL);
  const line1 = 'LEONIDA GOLD PICTURES · A LEONIDA GOLD PRODUCTION';
  const line2 = 'ALL CHARACTERS AND EVENTS ARE FICTIONAL · NO SUNSETS WERE HARMED';
  const line3 = 'LEONIDAGOLD.PICTURES';
  const fits = (text, size) => {
    ctx.font = `800 ${size}px "Trebuchet MS", sans-serif`;
    return ctx.measureText(text).width <= billW;
  };
  let b1 = Math.round(botH * 0.26);
  while (b1 > 8 && !(fits(line1, b1) && fits(line2, Math.round(b1 * 0.78)) && fits(line3, Math.round(b1 * 0.85)))) b1 -= 1;
  const b2 = Math.round(b1 * 0.78), b3 = Math.round(b1 * 0.85);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5b942';
  ctx.font = `800 ${b1}px "Trebuchet MS", sans-serif`;
  ctx.fillText(line1, billCx, botY + botH * 0.28);
  ctx.fillStyle = '#c9a8d8';
  ctx.font = `${b2}px "Trebuchet MS", sans-serif`;
  ctx.fillText(line2, billCx, botY + botH * 0.56);
  ctx.fillStyle = '#fff6ea';
  ctx.font = `800 ${b3}px "Trebuchet MS", sans-serif`;
  ctx.fillText(line3, billCx, botY + botH * 0.82);
  drawSeal(ctx, bcX - 12 * u - Math.max(10, sealR), botY + botH / 2, Math.max(10, sealR));
  drawBarcode(ctx, bcX, bcY, bcW, bcH, '8 0413 2026 11');
  ctx.restore();

  ctx.restore();
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + src));
    img.src = src;
  });
}

export async function exportPNG(w, h, state, images) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  drawCover(ctx, w, h, state, images);
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
}
