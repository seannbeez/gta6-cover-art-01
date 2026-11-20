// LEONIDA GOLD — Vice Cover Studio: the cover renderer (v2, written fresh).
// Draws a multi-panel GTA-style poster cover onto any canvas from a state
// object. No network, no external assets: every scene is either a bundled
// sample photo or procedural canvas art drawn here.

export const GRADES = {
  'vice-sunset': {
    name: 'Vice Sunset',
    sky: ['#2b0f4d', '#7a1e5e', '#c93a5e', '#ff7a3d', '#ffb347'],
    sun: '#ffd98a', glow: 'rgba(255,150,60,0.55)',
    tint: 'rgba(255,110,40,0.10)', accent: '#ff5e7a', scrim: 'rgba(16,4,28,0.62)',
    titleTop: '#ffffff', titleMid: '#ffe9a8', titleBot: '#ff8a3d',
  },
  'neon-nights': {
    name: 'Neon Nights',
    sky: ['#050b26', '#12265e', '#2b3a8f', '#6a3fb5', '#c94b8f'],
    sun: '#dff4ff', glow: 'rgba(90,200,255,0.45)',
    tint: 'rgba(60,140,255,0.10)', accent: '#39d5ff', scrim: 'rgba(4,8,28,0.66)',
    titleTop: '#ffffff', titleMid: '#cfe9ff', titleBot: '#ff7ad9',
  },
  'palm-gold': {
    name: 'Palm Gold',
    sky: ['#3a2f05', '#7a5c10', '#b8860b', '#e0a92e', '#ffd76a'],
    sun: '#fff3c4', glow: 'rgba(255,210,90,0.55)',
    tint: 'rgba(255,200,60,0.10)', accent: '#ffd23d', scrim: 'rgba(28,20,2,0.60)',
    titleTop: '#ffffff', titleMid: '#fff0b0', titleBot: '#ff9d2e',
  },
  'ocean-drive': {
    name: 'Ocean Drive',
    sky: ['#04263b', '#0a4a63', '#0f7a8c', '#2bb3a3', '#8fe3c0'],
    sun: '#fff8d6', glow: 'rgba(120,230,200,0.45)',
    tint: 'rgba(40,200,170,0.10)', accent: '#4de8c2', scrim: 'rgba(2,20,32,0.62)',
    titleTop: '#ffffff', titleMid: '#d6fff2', titleBot: '#ffb347',
  },
  'after-dark': {
    name: 'After Dark',
    sky: ['#0a0418', '#1c0b3d', '#3d1566', '#7a2a7a', '#c93a6e'],
    sun: '#f2e9ff', glow: 'rgba(200,120,255,0.45)',
    tint: 'rgba(170,80,255,0.10)', accent: '#ff5ea8', scrim: 'rgba(8,2,20,0.68)',
    titleTop: '#ffffff', titleMid: '#ecd6ff', titleBot: '#ff5e8a',
  },
  'noir': {
    name: 'B&W Noir',
    sky: ['#0a0a0a', '#232323', '#4a4a4a', '#7d7d7d', '#b5b5b5'],
    sun: '#f5f5f5', glow: 'rgba(255,255,255,0.35)',
    tint: 'rgba(255,255,255,0.06)', accent: '#e8e8e8', scrim: 'rgba(0,0,0,0.66)',
    titleTop: '#ffffff', titleMid: '#e8e8e8', titleBot: '#9a9a9a',
  },
};

// Layouts: each returns panels in unit coordinates (0..1 of the cover).
// A panel is { x, y, w, h, poly? } — poly (unit points) clips diagonal cuts.
export const LAYOUTS = {
  poster: {
    name: 'Poster', desc: 'One full-bleed photo, title over art',
    panels: () => [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  hero: {
    name: 'Hero', desc: 'Big photo, title block, inset strip on portrait',
    panels: (w, h) => {
      if (h > w) {
        return [
          { x: 0, y: 0, w: 1, h: 0.52 },
          { x: 0, y: 0.52, w: 1, h: 0.2 },
        ];
      }
      return [{ x: 0, y: 0, w: 1, h: 1 }];
    },
    portraitTitleZone: true,
  },
  'split-heist': {
    name: 'Split Heist', desc: 'Two panels cut on a diagonal',
    panels: () => [
      { x: 0, y: 0, w: 0.56, h: 1, poly: [[0, 0], [0.56, 0], [0.44, 1], [0, 1]] },
      { x: 0.44, y: 0, w: 0.56, h: 1, poly: [[0.56, 0], [1, 0], [1, 1], [0.44, 1]] },
    ],
  },
  triptych: {
    name: 'Triptych', desc: 'Three vertical panels',
    panels: () => [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ],
  },
  quad: {
    name: 'Quad', desc: 'Four panels, two by two',
    panels: () => [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  spotlight: {
    name: 'Spotlight', desc: 'One hero panel, two small ones',
    panels: () => [
      { x: 0, y: 0, w: 0.64, h: 1 },
      { x: 0.64, y: 0, w: 0.36, h: 0.5 },
      { x: 0.64, y: 0.5, w: 0.36, h: 0.5 },
    ],
  },
  strip: {
    name: 'Strip', desc: 'Three horizontal bands',
    panels: () => [
      { x: 0, y: 0, w: 1, h: 0.42 },
      { x: 0, y: 0.42, w: 1, h: 0.3 },
      { x: 0, y: 0.72, w: 1, h: 0.28 },
    ],
  },
  'duo-slant': {
    name: 'Duo Slant', desc: 'Two panels, slanted horizon cut',
    panels: () => [
      { x: 0, y: 0, w: 1, h: 0.58, poly: [[0, 0], [1, 0], [1, 0.46], [0, 0.58]] },
      { x: 0, y: 0.46, w: 1, h: 0.54, poly: [[0, 0.58], [1, 0.46], [1, 1], [0, 1]] },
    ],
  },
};

export const SAMPLE_ORDER = ['skyline', 'boulevard', 'pier'];

// Deterministic pseudo-random (mulberry32) for procedural decoration.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

// Cover-fit draw of an image into a rect, with zoom (1 = fit) and pan (-1..1).
function drawPhoto(ctx, img, x, y, w, h, zoom, px, py) {
  const s = Math.max(w / img.width, h / img.height) * (zoom || 1);
  const dw = img.width * s;
  const dh = img.height * s;
  let dx = x + (w - dw) / 2;
  let dy = y + (h - dh) / 2;
  if (dw > w) dx += (px || 0) * (dw - w) * 0.5;
  if (dh > h) dy += (py || 0) * (dh - h) * 0.5;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Procedural fallback scene (used when a panel has no photo yet): gradient
// sky, glowing sun, skyline silhouette with lit windows, palms at the edges.
// skipSun omits the sun (used for the dense title-zone band on portrait).
function drawScene(ctx, x, y, w, h, grade, seed, skipSun) {
  const g = GRADES[grade] || GRADES['vice-sunset'];
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  g.sky.forEach((c, i) => sky.addColorStop(i / (g.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  const sunX = x + w * 0.66;
  const sunY = y + h * 0.3;
  const sunR = Math.min(w, h) * 0.14;
  if (!skipSun) {
    const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.6);
    glow.addColorStop(0, g.glow);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = g.sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
  }
  // Skyline.
  const rand = rng(seed);
  ctx.fillStyle = 'rgba(10,4,20,0.88)';
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.07 + rand() * 0.09);
    const bh = h * (0.18 + rand() * 0.3);
    ctx.fillRect(bx, y + h - bh, bw, bh);
    ctx.fillStyle = 'rgba(255,220,140,0.85)';
    for (let wy = y + h - bh + 6; wy < y + h - 8; wy += 11) {
      for (let wx = bx + 5; wx < bx + bw - 5; wx += 10) {
        if (rand() < 0.35) ctx.fillRect(wx, wy, 3, 4);
      }
    }
    ctx.fillStyle = 'rgba(10,4,20,0.88)';
    bx += bw + 2;
  }
  // Palms at the corners.
  drawPalm(ctx, x + w * 0.06, y + h, h * 0.34, -0.25);
  drawPalm(ctx, x + w * 0.94, y + h, h * 0.3, 0.25);
}

function drawPalm(ctx, bx, by, len, lean) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(lean);
  ctx.strokeStyle = 'rgba(8,3,16,0.92)';
  ctx.lineWidth = Math.max(3, len * 0.03);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.08, -len * 0.55, 0, -len);
  ctx.stroke();
  ctx.lineWidth = Math.max(2, len * 0.022);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * (0.12 + i * 0.13);
    const fx = Math.cos(a) * len * 0.42;
    const fy = -len + Math.sin(a) * len * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.quadraticCurveTo(fx * 0.6, -len + fy * 0.4, fx, -len + fy * 0.9);
    ctx.stroke();
  }
  ctx.restore();
}

// Circular seal: ring + circular text + star.
function drawSeal(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `700 ${Math.max(7, r * 0.22)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = 'LEONIDA GOLD ★ EST 2026 ★ ';
  const step = (Math.PI * 2) / text.length;
  for (let i = 0; i < text.length; i++) {
    const a = -Math.PI / 2 + i * step;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  // Star.
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r * 0.34 : r * 0.15;
    const sx = cx + Math.cos(a) * rr;
    const sy = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTag(ctx, x, y, text, accent, fontPx) {
  ctx.save();
  ctx.font = `700 ${fontPx}px Anton, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(1, fontPx * 0.12)}px`; } catch (e) { /* older canvas */ }
  const tw = ctx.measureText(text).width + fontPx * 1.1;
  ctx.fillStyle = 'rgba(8,3,18,0.78)';
  roundRect(ctx, x, y, tw, fontPx * 2.1, fontPx * 1.05);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1.5, fontPx * 0.09);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + fontPx * 0.55, y + fontPx * 1.08);
  ctx.restore();
  return tw;
}

function drawCallout(ctx, x, y, w, text, by, accent) {
  const pad = w * 0.09;
  const fontPx = Math.max(13, w * 0.055);
  ctx.save();
  ctx.font = `italic 400 ${fontPx}px Georgia, serif`;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > w - pad * 2 && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  const lineH = fontPx * 1.35;
  const byPx = Math.max(10, fontPx * 0.62);
  const h = pad + lines.length * lineH + byPx + pad * 0.7;
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  roundRect(ctx, x, y, w, h, Math.min(14, w * 0.05));
  ctx.fill();
  // Tail.
  ctx.beginPath();
  ctx.moveTo(x + w * 0.22, y + h - 1);
  ctx.lineTo(x + w * 0.3, y + h + w * 0.06);
  ctx.lineTo(x + w * 0.36, y + h - 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1c1030';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  lines.forEach((ln, i) => ctx.fillText(ln, x + pad, y + pad + i * lineH));
  ctx.fillStyle = '#7a6a9a';
  ctx.font = `700 ${byPx}px Anton, sans-serif`;
  try { ctx.letterSpacing = '1px'; } catch (e) { /* older canvas */ }
  ctx.fillText('— ' + by, x + pad, y + pad + lines.length * lineH + pad * 0.3);
  ctx.restore();
  return h;
}

// Chrome 3D title: dark outline, cyan under-glow, gold gradient fill, white sheen.
function drawChromeTitle(ctx, cx, cy, text, px, grade) {
  const g = GRADES[grade] || GRADES['vice-sunset'];
  ctx.save();
  ctx.font = `400 ${px}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  // Drop shadow.
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = px * 0.08;
  ctx.shadowOffsetY = px * 0.05;
  // Cyan under-glow offset.
  ctx.strokeStyle = '#19c8e8';
  ctx.lineWidth = px * 0.1;
  ctx.strokeText(text, cx + px * 0.018, cy + px * 0.02);
  ctx.shadowColor = 'transparent';
  // Dark outline.
  ctx.strokeStyle = '#12041f';
  ctx.lineWidth = px * 0.16;
  ctx.strokeText(text, cx, cy);
  // Gold gradient fill.
  const grad = ctx.createLinearGradient(0, cy - px * 0.5, 0, cy + px * 0.55);
  grad.addColorStop(0, g.titleTop);
  grad.addColorStop(0.45, g.titleMid);
  grad.addColorStop(0.62, g.titleBot);
  grad.addColorStop(1, '#7a1e2e');
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, cy);
  // White top sheen.
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - px * 6, cy - px * 0.55, px * 12, px * 0.28);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(text, cx, cy);
  ctx.restore();
  ctx.restore();
}

// Main entry: draw the whole cover. state = { layout, grade, title, kicker,
// tagline, caption, calloutBy, tags[], panels: [{ photo: Image|null, zoom, px, py }] }
export function drawCover(ctx, W, H, state, images) {
  const g = GRADES[state.grade] || GRADES['vice-sunset'];
  const layout = LAYOUTS[state.layout] || LAYOUTS.poster;
  const panels = layout.panels(W, H);
  const portrait = H > W;
  const u = Math.min(W, H) / 100; // 1% of the short side, in px

  // Base.
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d0716';
  ctx.fillRect(0, 0, W, H);

  // Panels.
  panels.forEach((p, i) => {
    const px = p.x * W;
    const py = p.y * H;
    const pw = p.w * W;
    const ph = p.h * H;
    const spec = (state.panels && state.panels[i]) || {};
    const photoKey = spec.photo || SAMPLE_ORDER[i % SAMPLE_ORDER.length];
    const img = images ? images[photoKey] : null;
    ctx.save();
    ctx.beginPath();
    if (p.poly) {
      p.poly.forEach(([ux, uy], j) => {
        if (j === 0) ctx.moveTo(ux * W, uy * H);
        else ctx.lineTo(ux * W, uy * H);
      });
      ctx.closePath();
    } else {
      ctx.rect(px, py, pw, ph);
    }
    ctx.clip();
    if (img) drawPhoto(ctx, img, px, py, pw, ph, spec.zoom || 1.05, spec.px || 0, spec.py || 0);
    else drawScene(ctx, px, py, pw, ph, state.grade, 100 + i * 17);
    ctx.fillStyle = g.tint;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
  });

  // Panel dividers.
  ctx.strokeStyle = 'rgba(8,3,18,0.9)';
  ctx.lineWidth = Math.max(2, u * 0.45);
  panels.forEach((p) => {
    if (p.poly) {
      ctx.beginPath();
      p.poly.forEach(([ux, uy], j) => {
        if (j === 0) ctx.moveTo(ux * W, uy * H);
        else ctx.lineTo(ux * W, uy * H);
      });
      ctx.closePath();
      ctx.stroke();
    }
  });
  ctx.strokeStyle = g.accent;
  ctx.lineWidth = Math.max(1, u * 0.18);
  ctx.globalAlpha = 0.55;
  panels.forEach((p) => {
    if (!p.poly) return;
    ctx.beginPath();
    ctx.moveTo(p.poly[1][0] * W, p.poly[1][1] * H);
    ctx.lineTo(p.poly[2][0] * W, p.poly[2][1] * H);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // Portrait hero: the bottom title zone gets its own procedural skyline band
  // so the canvas is never an empty band (v1's weak spot).
  const titleZoneTop = portrait && layout.portraitTitleZone ? 0.72 : null;
  if (titleZoneTop !== null) {
    const zy = titleZoneTop * H;
    const zh = H - zy;
    const grad = ctx.createLinearGradient(0, zy, 0, H);
    grad.addColorStop(0, 'rgba(10,4,22,0.35)');
    grad.addColorStop(0.12, g.scrim);
    grad.addColorStop(1, 'rgba(8,2,18,0.92)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, zy, W, zh);
    // Dense procedural skyline inside the title zone (no sun: the zone
    // already sits under the photo's own sun).
    drawScene(ctx, 0, zy + zh * 0.05, W, zh * 0.62, state.grade, 777, true);
    const scrim2 = ctx.createLinearGradient(0, zy + zh * 0.4, 0, H);
    scrim2.addColorStop(0, 'rgba(8,2,18,0)');
    scrim2.addColorStop(1, 'rgba(8,2,18,0.88)');
    ctx.fillStyle = scrim2;
    ctx.fillRect(0, zy + zh * 0.4, W, zh * 0.6);
    // Gold rule above the title zone.
    ctx.fillStyle = g.accent;
    ctx.fillRect(W * 0.06, zy, W * 0.88, Math.max(2, u * 0.35));
  }

  // Bottom scrim for legibility on full-bleed layouts.
  if (titleZoneTop === null) {
    const scrim = ctx.createLinearGradient(0, H * 0.55, 0, H);
    scrim.addColorStop(0, 'rgba(8,2,18,0)');
    scrim.addColorStop(1, g.scrim);
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
  }

  // Role tags, top-left.
  const tagPx = Math.max(11, u * 1.9);
  let tx = W * 0.035;
  const ty = H * 0.035;
  (state.tags || []).slice(0, 3).forEach((t) => {
    tx += drawTag(ctx, tx, ty, t, g.accent, tagPx) + W * 0.012;
  });

  // Callout bubble, top-right.
  const cw = portrait ? W * 0.44 : W * 0.34;
  drawCallout(ctx, W - cw - W * 0.03, H * 0.035, cw, state.caption, state.calloutBy, g.accent);

  // Title block.
  const title = (state.title || 'LEONIDA GOLD').toUpperCase();
  const titlePx = Math.min(
    W * 0.92 / Math.max(4, title.length * 0.62),
    portrait ? H * 0.085 : H * 0.16,
  );
  const titleCy = titleZoneTop !== null ? H * 0.865 : H * 0.8;
  // Kicker.
  ctx.save();
  ctx.font = `700 ${Math.max(11, u * 2.1)}px Anton, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(2, u * 0.7)}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = g.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText((state.kicker || 'VICE CITY STORIES').toUpperCase(), W / 2, titleCy - titlePx * 0.78);
  ctx.restore();
  drawChromeTitle(ctx, W / 2, titleCy, title, titlePx, state.grade);
  // Tagline.
  ctx.save();
  ctx.font = `400 ${Math.max(11, u * 2)}px Anton, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(2, u * 0.6)}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText((state.tagline || 'EVERY SUNSET HAS A PRICE').toUpperCase(), W / 2, titleCy + titlePx * 0.62);
  ctx.restore();

  // Seal, bottom-right (overlapping the title zone edge on portrait).
  const sealR = Math.max(26, u * 5.2);
  drawSeal(ctx, W - sealR - W * 0.035, titleZoneTop !== null ? H * 0.79 : H * 0.72, sealR, g.accent);

  // Billing block, bottom-center.
  ctx.save();
  ctx.font = `${Math.max(9, u * 1.25)}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const by = H - Math.max(10, u * 1.6);
  ctx.fillText('ALL CHARACTERS AND EVENTS ARE FICTIONAL  •  NO SUNSETS WERE HARMED', W / 2, by - u * 2.4);
  ctx.fillText('LEONIDA GOLD PICTURES  •  A LEONIDA GOLD PRODUCTION  •  LEONIDAGOLD.PICTURES', W / 2, by);
  ctx.restore();

  // Poster frame: dark outer border + gold hairline.
  ctx.strokeStyle = 'rgba(5,2,12,0.85)';
  ctx.lineWidth = Math.max(3, u * 0.6);
  ctx.strokeRect(0, 0, W, H);
  ctx.strokeStyle = g.accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1, u * 0.16);
  ctx.strokeRect(u * 0.9, u * 0.9, W - u * 1.8, H - u * 1.8);
  ctx.globalAlpha = 1;
}

// Render the cover at an export size and return the canvas.
export function renderCover(state, images, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas.getContext('2d'), w, h, state, images);
  return canvas;
}
