// LEONIDA GOLD — the cover renderer.
//
// Draws a GTA-style multi-panel poster cover onto a canvas: the photos fill
// the panels, a colour grade washes over everything, and the chrome title,
// role tags, callout, seal and billing block finish it. Everything here is
// drawn with the 2D canvas API — no image assets are needed for the art
// itself, so the cover is fully deterministic for a given state.

export const EXPORT_SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { w: 1920, h: 1080, label: '1920 × 1080' },
};

// Eight panel maps. Each layout is a function of the cover size returning an
// array of panels; a panel is a polygon (array of [x, y] corners) so the
// slanted layouts can cut diagonally across the cover.
export const LAYOUTS = {
  hero: {
    name: 'Hero',
    hint: 'One photo, full bleed',
    panels(w, h) { return [[[0, 0], [w, 0], [w, h], [0, h]]]; },
  },
  split: {
    name: 'Split Heist',
    hint: 'Two panels, diagonal cut',
    panels(w, h) {
      return [
        [[0, 0], [w * 0.52, 0], [w * 0.44, h], [0, h]],
        [[w * 0.52, 0], [w, 0], [w, h], [w * 0.44, h]],
      ];
    },
  },
  triptych: {
    name: 'Triptych',
    hint: 'Three stacked bands',
    panels(w, h) {
      return [0, 1, 2].map((i) => {
        const y0 = (h * i) / 3, y1 = (h * (i + 1)) / 3;
        return [[0, y0], [w, y0], [w, y1], [0, y1]];
      });
    },
  },
  quad: {
    name: 'Quad',
    hint: 'Four equal panels',
    panels(w, h) {
      return [
        [[0, 0], [w / 2, 0], [w / 2, h / 2], [0, h / 2]],
        [[w / 2, 0], [w, 0], [w, h / 2], [w / 2, h / 2]],
        [[0, h / 2], [w / 2, h / 2], [w / 2, h], [0, h]],
        [[w / 2, h / 2], [w, h / 2], [w, h], [w / 2, h]],
      ];
    },
  },
  spotlight: {
    name: 'Spotlight',
    hint: 'Big lead + two stacked',
    panels(w, h) {
      return [
        [[0, 0], [w * 0.62, 0], [w * 0.62, h], [0, h]],
        [[w * 0.62, 0], [w, 0], [w, h / 2], [w * 0.62, h / 2]],
        [[w * 0.62, h / 2], [w, h / 2], [w, h], [w * 0.62, h]],
      ];
    },
  },
  strip: {
    name: 'Strip',
    hint: 'Hero over three smalls',
    panels(w, h) {
      const out = [[[0, 0], [w, 0], [w, h * 0.62], [0, h * 0.62]]];
      for (let i = 0; i < 3; i++) {
        const x0 = (w * i) / 3, x1 = (w * (i + 1)) / 3;
        out.push([[x0, h * 0.62], [x1, h * 0.62], [x1, h], [x0, h]]);
      }
      return out;
    },
  },
  duo: {
    name: 'Duo Slant',
    hint: 'Two panels, reverse cut',
    panels(w, h) {
      return [
        [[0, 0], [w * 0.46, 0], [w * 0.54, h], [0, h]],
        [[w * 0.46, 0], [w, 0], [w, h], [w * 0.54, h]],
      ];
    },
  },
  poster: {
    name: 'Poster',
    hint: 'Centre art, side columns',
    panels(w, h) {
      return [
        [[0, 0], [w * 0.22, 0], [w * 0.22, h], [0, h]],
        [[w * 0.22, 0], [w * 0.78, 0], [w * 0.78, h], [w * 0.22, h]],
        [[w * 0.78, 0], [w, 0], [w, h / 2], [w * 0.78, h / 2]],
        [[w * 0.78, h / 2], [w, h / 2], [w, h], [w * 0.78, h]],
      ];
    },
  },
};

// Six colour grades. Each one tints the photos, colours the glow and the
// chrome title, and picks the accent used by the tags and the seal.
export const GRADES = {
  sunset: {
    name: 'Vice Sunset', swatch: 'linear-gradient(135deg,#ff5e78,#ffb347)',
    top: 'rgba(255,94,120,0.10)', bottom: 'rgba(255,170,0,0.30)',
    glow: '#ff7e5f', titleFrom: '#fff7d6', titleTo: '#ffb347',
    accent: '#ff5e78', ink: '#1a0b2e', sky: ['#3b1d5e', '#c33a7a', '#ff9a3d'],
  },
  neon: {
    name: 'Neon Nights', swatch: 'linear-gradient(135deg,#00e5ff,#ff0080)',
    top: 'rgba(0,229,255,0.12)', bottom: 'rgba(255,0,128,0.30)',
    glow: '#00e5ff', titleFrom: '#e0f7ff', titleTo: '#ff5da2',
    accent: '#00e5ff', ink: '#0a1030', sky: ['#0a1030', '#4a2a8a', '#ff2e88'],
  },
  gold: {
    name: 'Palm Gold', swatch: 'linear-gradient(135deg,#fff3b0,#b8860b)',
    top: 'rgba(255,215,0,0.08)', bottom: 'rgba(180,120,0,0.30)',
    glow: '#ffd700', titleFrom: '#fffbe6', titleTo: '#ffc93c',
    accent: '#ffd700', ink: '#241a05', sky: ['#3d2b00', '#8a6d1f', '#ffd76a'],
  },
  ocean: {
    name: 'Ocean Drive', swatch: 'linear-gradient(135deg,#38bdf8,#ff5e8a)',
    top: 'rgba(0,180,255,0.10)', bottom: 'rgba(255,80,160,0.28)',
    glow: '#38bdf8', titleFrom: '#eaf6ff', titleTo: '#ff7ab8',
    accent: '#38bdf8', ink: '#06283d', sky: ['#0b3b5e', '#1e7fa8', '#ff8fb0'],
  },
  dark: {
    name: 'After Dark', swatch: 'linear-gradient(135deg,#2a0a4a,#ff2e63)',
    top: 'rgba(20,0,40,0.25)', bottom: 'rgba(255,30,60,0.30)',
    glow: '#ff2e63', titleFrom: '#ffffff', titleTo: '#ff8fa3',
    accent: '#ff2e63', ink: '#12041f', sky: ['#12041f', '#4a1042', '#ff2e63'],
  },
  noir: {
    name: 'Noir', swatch: 'linear-gradient(135deg,#ffffff,#555555)',
    top: 'rgba(255,255,255,0.05)', bottom: 'rgba(0,0,0,0.45)',
    glow: '#ffffff', titleFrom: '#ffffff', titleTo: '#cfcfcf',
    accent: '#ffffff', ink: '#111111', sky: ['#111111', '#444444', '#bbbbbb'],
  },
};

// A panel's photo slot: the image (or null), and the crop the user picked.
export function blankPanel() {
  return { photo: null, zoom: 1, ox: 0, oy: 0 };
}

export function defaultState() {
  return {
    layout: 'poster',
    grade: 'sunset',
    size: 'wide',
    title: 'LEONIDA GOLD',
    kicker: 'VICE CITY STORIES',
    tagline: 'EVERY SUNSET HAS A PRICE',
    callout: 'We take the city tonight.',
    calloutBy: 'LUCIA',
    calloutOn: true,
    tags: ['THE DRIVER', 'THE FIXER'],
    sealOn: true,
    billingOn: true,
    fillOne: true,
    panels: [blankPanel(), blankPanel(), blankPanel(), blankPanel()],
  };
}

// --- helpers ---------------------------------------------------------------

function polyBounds(poly) {
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

function tracePoly(ctx, poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth, startSize, font) {
  let size = startSize;
  ctx.font = font(size);
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= Math.max(1, Math.floor(size * 0.04));
    ctx.font = font(size);
  }
  return size;
}

// --- procedural scenery (empty panels + the sample photos) -----------------

function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.04);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.06, y - s * 0.5, x + s * 0.18, y - s * 0.85);
  ctx.stroke();
  const topX = x + s * 0.18, topY = y - s * 0.85;
  ctx.lineWidth = Math.max(2, s * 0.028);
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const a = -Math.PI / 2 + (t - 0.5) * Math.PI * 0.68;
    const len = s * (0.36 + ((i * 37) % 3) * 0.05);
    const tipX = topX + Math.cos(a) * len;
    const tipY = topY + Math.sin(a) * len * 0.62 + s * 0.2;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.55, topY + Math.sin(a) * len * 0.5 - s * 0.02,
      tipX, tipY,
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX - s * 0.03, topY + s * 0.03, s * 0.032, 0, Math.PI * 2);
  ctx.arc(topX + s * 0.04, topY + s * 0.045, s * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSkyline(ctx, rect, color, lit) {
  const { x, y, w, h } = rect;
  const base = y + h;
  let bx = x;
  ctx.fillStyle = color;
  while (bx < x + w) {
    const bw = w * (0.08 + ((bx * 7) % 13) / 100);
    const bh = h * (0.35 + ((bx * 13) % 29) / 100);
    ctx.fillRect(bx, base - bh, bw, bh);
    if (lit) {
      ctx.fillStyle = 'rgba(255,214,120,0.85)';
      for (let wy = base - bh + 6; wy < base - 8; wy += 12) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 10) {
          if (((wx * 31 + wy * 17) % 5) < 2) ctx.fillRect(wx, wy, 3, 4);
        }
      }
      ctx.fillStyle = color;
    }
    bx += bw + w * 0.015;
  }
}

// kind: 'boulevard' | 'pier' | 'skyline'. Draws an original illustrated
// Vice-style scene into rect, using the grade's sky colours.
export function drawScene(ctx, rect, kind, grade) {
  const { x, y, w, h } = rect;
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  const sunR = Math.min(w, h) * 0.16;
  const sunX = x + w * (kind === 'pier' ? 0.5 : 0.68);
  const sunY = y + h * 0.42;
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.4);
  glow.addColorStop(0, grade.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = grade.sky[0];
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(sunX - sunR, sunY + sunR * (0.25 + i * 0.22), sunR * 2, sunR * 0.07);
  }
  ctx.restore();
  if (kind === 'pier') {
    ctx.fillStyle = grade.ink;
    ctx.fillRect(x, y + h * 0.62, w, h * 0.38);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    for (let i = 0; i < 24; i++) {
      const lx = x + ((i * 53) % 100) / 100 * w;
      ctx.fillRect(lx, y + h * 0.64, 2, h * 0.3);
    }
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.3);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.42, x + w, y + h * 0.3);
    ctx.stroke();
    ctx.fillStyle = '#ffe9a8';
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const lx = x + w * t;
      const ly = y + h * 0.3 + Math.sin(t * Math.PI) * h * 0.06;
      ctx.beginPath();
      ctx.arc(lx, ly + 8, Math.max(3, w * 0.008), 0, Math.PI * 2);
      ctx.fill();
    }
    drawPalm(ctx, x + w * 0.12, y + h * 0.64, h * 0.42, grade.ink);
    drawPalm(ctx, x + w * 0.86, y + h * 0.64, h * 0.34, grade.ink);
  } else if (kind === 'boulevard') {
    drawSkyline(ctx, { x, y: y + h * 0.18, w, h: h * 0.44 }, grade.ink, true);
    ctx.fillStyle = '#1c0f2e';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.42, y + h);
    ctx.lineTo(x + w * 0.58, y + h);
    ctx.lineTo(x + w * 0.72, y + h * 0.62);
    ctx.lineTo(x + w * 0.28, y + h * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = Math.max(2, w * 0.006);
    ctx.setLineDash([w * 0.03, w * 0.03]);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.98);
    ctx.lineTo(x + w * 0.5, y + h * 0.64);
    ctx.stroke();
    ctx.setLineDash([]);
    drawPalm(ctx, x + w * 0.08, y + h * 0.98, h * 0.5, '#140a24');
    drawPalm(ctx, x + w * 0.9, y + h * 0.98, h * 0.44, '#140a24');
  } else {
    drawSkyline(ctx, { x, y: y + h * 0.3, w, h: h * 0.7 }, grade.ink, true);
    ctx.fillStyle = '#140a24';
    ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
    drawPalm(ctx, x + w * 0.1, y + h * 0.76, h * 0.4, '#0d0618');
    drawPalm(ctx, x + w * 0.88, y + h * 0.76, h * 0.46, '#0d0618');
    ctx.strokeStyle = 'rgba(20,6,24,0.9)';
    ctx.lineWidth = Math.max(2, w * 0.004);
    for (let i = 0; i < 5; i++) {
      const bx = x + w * (0.3 + i * 0.1), by = y + h * (0.2 + (i % 3) * 0.05);
      ctx.beginPath();
      ctx.moveTo(bx - 8, by);
      ctx.quadraticCurveTo(bx, by - 6, bx + 8, by);
      ctx.stroke();
    }
  }
}

// --- the cover -------------------------------------------------------------

function drawPhotoInto(ctx, poly, slot, grade) {
  const box = polyBounds(poly);
  ctx.save();
  tracePoly(ctx, poly);
  ctx.clip();
  if (slot && slot.photo) {
    const img = slot.photo;
    if (grade === GRADES.noir) ctx.filter = 'grayscale(1) contrast(1.12) brightness(1.02)';
    const scale = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * slot.zoom;
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    const dx = box.x + (box.w - dw) / 2 + slot.ox * box.w;
    const dy = box.y + (box.h - dh) / 2 + slot.oy * box.h;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    const kinds = ['boulevard', 'pier', 'skyline'];
    const kind = kinds[Math.abs(Math.floor(box.x + box.y)) % 3];
    drawScene(ctx, box, kind, grade);
  }
  ctx.restore();
}

function drawChromeTitle(ctx, text, cx, baselineY, maxW, grade, scale) {
  const unit = scale;
  const font = (s) => `${s}px Anton, 'Arial Narrow', sans-serif`;
  const size = fitText(ctx, text, maxW, 148 * unit, font);
  ctx.save();
  ctx.translate(cx, baselineY);
  ctx.transform(1, 0, -0.07, 1, 0, 0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const layers = [
    { dx: size * 0.045, dy: size * 0.055, fill: 'rgba(10,4,20,0.9)' },
    { dx: -size * 0.02, dy: -size * 0.02, fill: grade.accent },
    { dx: size * 0.02, dy: size * 0.02, fill: '#22d3ee' },
  ];
  for (const layer of layers) {
    ctx.font = font(size);
    ctx.fillStyle = layer.fill;
    ctx.fillText(text, layer.dx, layer.dy);
  }
  const grad = ctx.createLinearGradient(0, -size, 0, size * 0.15);
  grad.addColorStop(0, grade.titleFrom);
  grad.addColorStop(0.55, '#ffffff');
  grad.addColorStop(1, grade.titleTo);
  ctx.font = font(size);
  ctx.fillStyle = grad;
  ctx.fillText(text, 0, 0);
  ctx.lineWidth = Math.max(2, size * 0.03);
  ctx.strokeStyle = 'rgba(12,4,24,0.85)';
  ctx.strokeText(text, 0, 0);
  ctx.restore();
  return size;
}

function drawTags(ctx, tags, x, y, grade, unit) {
  ctx.save();
  ctx.font = `${Math.round(15 * unit)}px 'Arial Narrow', sans-serif`;
  let cx = x;
  for (const tag of tags) {
    const pad = 12 * unit;
    const tw = ctx.measureText(tag).width + pad * 2;
    const th = 26 * unit;
    ctx.fillStyle = 'rgba(10,4,20,0.78)';
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(1.5, 2 * unit);
    ctx.beginPath();
    ctx.roundRect(cx, y, tw, th, th / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, cx + pad, y + th / 2 + 1);
    cx += tw + 10 * unit;
  }
  ctx.restore();
}

function drawCallout(ctx, text, by, x, y, maxW, unit) {
  ctx.save();
  ctx.font = `italic ${Math.round(19 * unit)}px Georgia, serif`;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW - 36 * unit && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  const lh = 26 * unit;
  const bw = maxW, bh = lines.length * lh + 34 * unit;
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.beginPath();
  ctx.roundRect(x, y, bw, bh, 10 * unit);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 26 * unit, y + bh);
  ctx.lineTo(x + 40 * unit, y + bh + 14 * unit);
  ctx.lineTo(x + 52 * unit, y + bh);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1c102e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  lines.forEach((ln, i) => ctx.fillText(ln, x + 18 * unit, y + 14 * unit + i * lh));
  ctx.font = `bold ${Math.round(12 * unit)}px 'Arial Narrow', sans-serif`;
  ctx.fillStyle = '#8a7aa8';
  ctx.fillText(`— ${by}`, x + 18 * unit, y + bh - 22 * unit);
  ctx.restore();
  return bh;
}

function drawSeal(ctx, cx, cy, r, grade, unit) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.21);
  ctx.strokeStyle = grade.accent;
  ctx.fillStyle = 'rgba(10,4,20,0.72)';
  ctx.lineWidth = Math.max(2, 3 * unit);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = Math.max(1, 1.5 * unit);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(r * 0.22)}px 'Arial Narrow', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const ring = 'LEONIDA ★ EST. 2026 ★ ';
  for (let i = 0; i < ring.length; i++) {
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r * 0.89);
    ctx.fillText(ring[i], 0, 0);
    ctx.restore();
  }
  ctx.font = `${Math.round(r * 0.52)}px Anton, sans-serif`;
  ctx.fillText('★', 0, r * 0.06);
  ctx.restore();
}

function drawBilling(ctx, w, h, unit) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `${Math.round(9 * unit)}px 'Arial Narrow', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('LEONIDA GOLD PICTURES  •  A LEONIDA GOLD PRODUCTION  •  LEONIDAGOLD.PICTURES', w / 2, h - 12 * unit);
  ctx.fillText('ALL CHARACTERS AND EVENTS ARE FICTIONAL  •  NO SUNSETS WERE HARMED', w / 2, h - 24 * unit);
  ctx.restore();
}

// Draws the whole cover for `state` onto `canvas` (sized to state.size).
export function drawCoverArt(canvas, state) {
  const size = EXPORT_SIZES[state.size] ?? EXPORT_SIZES.wide;
  const w = size.w, h = size.h;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.poster;
  const unit = w / 1080;
  ctx.fillStyle = grade.ink;
  ctx.fillRect(0, 0, w, h);
  const polys = layout.panels(w, h);
  const slots = polys.map((_, i) => state.panels[i] ?? blankPanel());
  polys.forEach((poly, i) => drawPhotoInto(ctx, poly, slots[i], grade));
  ctx.save();
  ctx.lineWidth = Math.max(4, 6 * unit);
  ctx.strokeStyle = 'rgba(12,4,24,0.9)';
  for (const poly of polys) {
    tracePoly(ctx, poly);
    ctx.stroke();
  }
  ctx.restore();
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  const sun = ctx.createRadialGradient(w * 0.7, h * 0.3, 10, w * 0.7, h * 0.3, w * 0.55);
  sun.addColorStop(0, grade.glow);
  sun.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(8,2,18,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  const margin = 42 * unit;
  const titleSize = drawChromeTitle(ctx, state.title || 'LEONIDA GOLD', w / 2, h - 78 * unit, w - margin * 2, grade, unit);
  const kicker = (state.kicker || '').trim().toUpperCase();
  if (kicker) {
    ctx.save();
    ctx.font = `bold ${Math.round(17 * unit)}px 'Arial Narrow', sans-serif`;
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'center';
    const ky = h - 78 * unit - titleSize * 1.1;
    ctx.fillText(kicker.split('').join('  '), w / 2, ky);
    ctx.restore();
  }
  if ((state.tagline || '').trim()) {
    ctx.save();
    ctx.font = `${Math.round(15 * unit)}px 'Arial Narrow', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.textAlign = 'center';
    ctx.fillText(state.tagline.trim().toUpperCase(), w / 2, h - 52 * unit);
    ctx.restore();
  }
  const tags = (state.tags ?? []).filter((t) => t.trim());
  if (tags.length) drawTags(ctx, tags.map((t) => t.trim().toUpperCase()), margin, margin, grade, unit);
  if (state.calloutOn && (state.callout || '').trim()) {
    const cw = Math.min(w * 0.34, 420 * unit);
    drawCallout(ctx, state.callout.trim(), (state.calloutBy || '').trim().toUpperCase() || 'LUCIA', w - margin - cw, margin, cw, unit);
  }
  if (state.sealOn) drawSeal(ctx, w - margin - 48 * unit, h - 268 * unit, 48 * unit, grade, unit);
  if (state.billingOn) drawBilling(ctx, w, h, unit);
}

// Renders the cover for `state` at `sizeKey` into a fresh canvas and returns it.
export function renderCover(state, sizeKey) {
  const canvas = document.createElement('canvas');
  drawCoverArt(canvas, { ...state, size: sizeKey });
  return canvas;
}
