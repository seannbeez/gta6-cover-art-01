// LEONIDA GOLD — Vice Cover Studio: canvas cover renderer (no dependencies).
// Pure Canvas 2D: layouts, grades, chrome titles, procedural scenery, export.

export const LAYOUTS = [
  { id: 'poster', name: 'Poster' },
  { id: 'hero', name: 'Hero' },
  { id: 'split', name: 'Split Heist' },
  { id: 'triptych', name: 'Triptych' },
  { id: 'quad', name: 'Quad' },
  { id: 'spotlight', name: 'Spotlight' },
  { id: 'strip', name: 'Strip' },
  { id: 'slant', name: 'Duo Slant' },
];

export const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', sky: ['#2b0a3d', '#7b1e5b', '#ff5e3a', '#ffb347'], sun: '#ffd76a', title: ['#fff3c4', '#ffb347', '#ff5e3a'], accent: '#ff5e3a', tint: '#ff5e3a', ink: '#1a0b2e' },
  { id: 'neon', name: 'Neon Nights', sky: ['#050b2e', '#0b2a6b', '#123a8f', '#ff2e88'], sun: '#eaf6ff', title: ['#ffffff', '#7dd7ff', '#ff5da2'], accent: '#2fd4ff', tint: '#2fd4ff', ink: '#04081f' },
  { id: 'gold', name: 'Palm Gold', sky: ['#3d2b00', '#8a6d00', '#e0a800', '#ffe9a8'], sun: '#fff3c4', title: ['#fffbe8', '#ffd76a', '#ff9a3c'], accent: '#ffd76a', tint: '#ffd76a', ink: '#241a00' },
  { id: 'ocean', name: 'Ocean Drive', sky: ['#002b3d', '#005f73', '#0a9396', '#94d2bd'], sun: '#fff8d6', title: ['#eafffb', '#7fe3d0', '#0a9396'], accent: '#5eead4', tint: '#0a9396', ink: '#001b26' },
  { id: 'dark', name: 'After Dark', sky: ['#0d001f', '#2a0a4a', '#5b2a86', '#c77dff'], sun: '#f3e8ff', title: ['#ffffff', '#c77dff', '#7b2ff7'], accent: '#c77dff', tint: '#7b2ff7', ink: '#0d001f' },
  { id: 'noir', name: 'B&W Noir', sky: ['#000000', '#1a1a1a', '#4a4a4a', '#9a9a9a'], sun: '#f5f5f5', title: ['#ffffff', '#d4d4d4', '#8a8a8a'], accent: '#e5e5e5', tint: '#888888', ink: '#000000' },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Panel rectangles for a layout, as fractions of (W, H). A panel may carry a
// diagonal clip: { a: [x0,y0], b: [x1,y1] } fractions of the panel rect.
export function panelsFor(layoutId, W, H) {
  const portrait = H > W;
  const gap = Math.max(3, Math.round(Math.min(W, H) * 0.006));
  switch (layoutId) {
    case 'hero':
      if (portrait) {
        return [
          { x: 0, y: 0, w: W, h: H * 0.44 },
          { x: 0, y: H * 0.44, w: W, h: H * 0.22 },
        ];
      }
      return [{ x: 0, y: 0, w: W, h: H }];
    case 'split':
      return [
        { x: 0, y: 0, w: W, h: H, diag: [[0, 0], [0.56, 0], [0.4, 1], [0, 1]] },
        { x: 0, y: 0, w: W, h: H, diag: [[0.56, 0], [1, 0], [1, 1], [0.4, 1]] },
      ];
    case 'triptych':
      return [0, 1, 2].map((i) => ({
        x: i * (W / 3) + (i > 0 ? gap / 2 : 0),
        y: 0,
        w: W / 3 - (i === 1 ? gap : gap / 2),
        h: H,
      }));
    case 'quad':
      return [
        { x: 0, y: 0, w: W / 2 - gap / 2, h: H / 2 - gap / 2 },
        { x: W / 2 + gap / 2, y: 0, w: W / 2 - gap / 2, h: H / 2 - gap / 2 },
        { x: 0, y: H / 2 + gap / 2, w: W / 2 - gap / 2, h: H / 2 - gap / 2 },
        { x: W / 2 + gap / 2, y: H / 2 + gap / 2, w: W / 2 - gap / 2, h: H / 2 - gap / 2 },
      ];
    case 'spotlight':
      return [
        { x: 0, y: 0, w: W * 0.62 - gap / 2, h: H },
        { x: W * 0.62 + gap / 2, y: 0, w: W * 0.38 - gap / 2, h: H / 2 - gap / 2 },
        { x: W * 0.62 + gap / 2, y: H / 2 + gap / 2, w: W * 0.38 - gap / 2, h: H / 2 - gap / 2 },
      ];
    case 'strip':
      return [
        { x: 0, y: 0, w: W, h: H * 0.36 - gap / 2 },
        { x: 0, y: H * 0.36 + gap / 2, w: W, h: H * 0.34 - gap },
        { x: 0, y: H * 0.70 + gap / 2, w: W, h: H * 0.30 - gap / 2 },
      ];
    case 'slant':
      return [
        { x: 0, y: 0, w: W, h: H, diag: [[0, 0], [0.47, 0], [0.59, 1], [0, 1]] },
        { x: 0, y: 0, w: W, h: H, diag: [[0.47, 0], [1, 0], [1, 1], [0.59, 1]] },
      ];
    case 'poster':
    default:
      return [{ x: 0, y: 0, w: W, h: H }];
  }
}

// Where the title block sits for a layout. Returns { cx, eyebrowY, titleY,
// taglineY, billingY, sealX, sealY, zone } in pixels; zone is the rect behind
// the title (drawn as a skyline band for the portrait hero).
export function titleZone(layoutId, W, H) {
  const portrait = H > W;
  if (layoutId === 'hero' && portrait) {
    return {
      cx: W / 2, eyebrowY: H * 0.64, titleY: H * 0.75, taglineY: H * 0.885,
      billingY: H * 0.96, sealX: W * 0.93, sealY: H * 0.92,
      zone: { x: 0, y: H * 0.66, w: W, h: H * 0.34 },
    };
  }
  if (layoutId === 'hero') {
    return {
      cx: W / 2, eyebrowY: H * 0.48, titleY: H * 0.58, taglineY: H * 0.70,
      billingY: H * 0.96, sealX: W * 0.93, sealY: H * 0.92,
      zone: null,
    };
  }
  return {
    cx: W / 2, eyebrowY: H * 0.64, titleY: H * 0.75, taglineY: H * 0.885,
    billingY: H * 0.96, sealX: W * 0.93, sealY: H * 0.92,
    zone: null,
  };
}

function skyline(ctx, x, y, w, h, rand, lit) {
  // Deterministic building silhouettes with lit windows.
  let bx = x;
  ctx.fillStyle = '#0d0618';
  while (bx < x + w - 8) {
    const bw = 18 + rand() * (w * 0.09);
    const bh = h * (0.35 + rand() * 0.6);
    const by = y + h - bh;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = lit;
    const cols = Math.max(1, Math.floor(bw / 12));
    const rows = Math.max(1, Math.floor(bh / 16));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() < 0.45) {
          ctx.fillRect(bx + 4 + c * 12, by + 6 + r * 16, 3.5, 5);
        }
      }
    }
    ctx.fillStyle = '#0d0618';
    bx += bw + 2 + rand() * 8;
  }
}

function palm(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.03);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.22, y - s * 0.8);
  ctx.stroke();
  const tx = x + s * 0.22;
  const ty = y - s * 0.8;
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * 0.15) - (i * Math.PI) / 7.2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(a) * s * 0.3, ty + Math.sin(a) * s * 0.22 + s * 0.08,
      tx + Math.cos(a) * s * 0.52, ty + Math.sin(a) * s * 0.4 + s * 0.22,
    );
    ctx.stroke();
  }
}

// One procedural Vice City scene, drawn into rect (x, y, w, h) on ctx.
// scene: 'boulevard' | 'pier' | 'skyline'. Deterministic per (scene, seed).
export function drawScene(ctx, x, y, w, h, grade, scene, seed) {
  const rand = rng(seed);
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  grade.sky.forEach((c, i) => sky.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  // Sun with glow — kept clear of the top-right callout bubble.
  const sx = x + w * 0.45;
  const sy = y + h * 0.24;
  const sr = Math.min(w, h) * 0.16;
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 2.4);
  glow.addColorStop(0, grade.sun);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = glow;
  ctx.fillRect(sx - sr * 2.4, sy - sr * 2.4, sr * 4.8, sr * 4.8);
  ctx.globalAlpha = 1;
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();

  // Skyline band.
  const bandY = y + h * 0.52;
  skyline(ctx, x, bandY, w, h * 0.26, rand, 'rgba(255, 214, 106, 0.85)');

  // Ground band per scene.
  const gy = y + h * 0.78;
  if (scene === 'boulevard') {
    const road = ctx.createLinearGradient(0, gy, 0, y + h);
    road.addColorStop(0, '#2a1a33');
    road.addColorStop(1, '#12081f');
    ctx.fillStyle = road;
    ctx.fillRect(x, gy, w, y + h - gy);
    ctx.fillStyle = 'rgba(255, 214, 106, 0.8)';
    const dw = w * 0.02;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + w * 0.5 - dw / 2, gy + 6 + i * ((y + h - gy - 12) / 5), dw, (y + h - gy) * 0.09);
    }
    palm(ctx, x + w * 0.06, y + h * 0.82, h * 0.22, '#0d0618');
    palm(ctx, x + w * 0.93, y + h * 0.8, h * 0.18, '#0d0618');
  } else if (scene === 'pier') {
    const sea = ctx.createLinearGradient(0, gy, 0, y + h);
    sea.addColorStop(0, '#0b2a6b');
    sea.addColorStop(1, '#050b2e');
    ctx.fillStyle = sea;
    ctx.fillRect(x, gy, w, y + h - gy);
    ctx.fillStyle = 'rgba(234, 246, 255, 0.35)';
    for (let i = 0; i < 6; i++) {
      const lw = w * (0.1 + rand() * 0.25);
      ctx.fillRect(x + rand() * (w - lw), gy + 8 + i * ((y + h - gy - 16) / 6), lw, 2);
    }
    ctx.fillStyle = '#0d0618';
    for (let i = 0; i < 7; i++) {
      const px = x + (i + 0.5) * (w / 7);
      ctx.fillRect(px - 3, gy + h * 0.04, 6, y + h - gy - h * 0.04);
    }
    ctx.fillRect(x, gy + h * 0.04, w, 5);
    palm(ctx, x + w * 0.08, y + h * 0.8, h * 0.2, '#0d0618');
  } else {
    const sea = ctx.createLinearGradient(0, gy, 0, y + h);
    sea.addColorStop(0, grade.sky[2]);
    sea.addColorStop(1, '#0d0618');
    ctx.fillStyle = sea;
    ctx.fillRect(x, gy, w, y + h - gy);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let i = 0; i < 8; i++) {
      const lw = w * (0.08 + rand() * 0.3);
      ctx.fillRect(x + rand() * (w - lw), gy + 6 + i * ((y + h - gy - 12) / 8), lw, 2);
    }
    palm(ctx, x + w * 0.05, y + h * 0.82, h * 0.24, '#0d0618');
    palm(ctx, x + w * 0.94, y + h * 0.8, h * 0.2, '#0d0618');
  }
}

function drawPhoto(ctx, photo, rect, grade) {
  const { img, zoom = 1, panX = 0, panY = 0 } = photo;
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = rect.x + (rect.w - dw) / 2 + panX * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + panY * rect.h;
  if (grade.id === 'noir') ctx.filter = 'grayscale(1)';
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalAlpha = 1;
}

function fitFont(ctx, text, maxW, size, family) {
  let s = size;
  ctx.font = `400 ${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && s > 16) {
    s -= 4;
    ctx.font = `400 ${s}px ${family}`;
  }
  return s;
}

function chromeTitle(ctx, text, cx, y, maxW, size, grade) {
  const s = fitFont(ctx, text, maxW, size, 'Anton, sans-serif');
  const w = ctx.measureText(text).width;
  const grad = ctx.createLinearGradient(0, y - s * 0.55, 0, y + s * 0.55);
  grad.addColorStop(0, grade.title[0]);
  grad.addColorStop(0.55, grade.title[1]);
  grad.addColorStop(1, grade.title[2]);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = grade.ink;
  for (let i = 6; i >= 1; i--) ctx.fillText(text, cx + i * 1.4, y + i * 2);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, y);
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - w / 2, y - s * 0.55, w, s * 0.24);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText(text, cx, y);
  ctx.restore();
}

function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxW) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function star(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// The main entry: draw the cover into canvas at (W, H).
// state: { layout, grade, title, tagline, callout, calloutBy, roles, scenes }
// images: array parallel to panelsFor(layout, W, H): { img, zoom, panX, panY } | null
export function renderCover(canvas, state, images) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.grade);
  const panels = panelsFor(state.layout, W, H);
  const scenes = state.scenes || ['boulevard', 'pier', 'skyline'];

  // Base sky.
  const base = ctx.createLinearGradient(0, 0, 0, H);
  grade.sky.forEach((c, i) => base.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Panels.
  panels.forEach((p, i) => {
    ctx.save();
    ctx.beginPath();
    if (p.diag) {
      p.diag.forEach(([fx, fy], j) => {
        const px = p.x + fx * p.w;
        const py = p.y + fy * p.h;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
    } else {
      ctx.rect(p.x, p.y, p.w, p.h);
    }
    ctx.clip();
    const photo = images && images[i];
    if (photo && photo.img) {
      drawPhoto(ctx, photo, p, grade);
    } else {
      drawScene(ctx, p.x, p.y, p.w, p.h, grade, scenes[i % scenes.length], 100 + i * 37);
    }
    ctx.restore();
    // Panel separators.
    ctx.strokeStyle = 'rgba(13, 6, 24, 0.9)';
    ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.004);
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  });

  const tz = titleZone(state.layout, W, H);
  const u = Math.min(W, H) / 1000; // unit scale

  // Portrait hero: skyline band behind the title zone for density.
  if (tz.zone) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(tz.zone.x, tz.zone.y, tz.zone.w, tz.zone.h);
    ctx.clip();
    const band = ctx.createLinearGradient(0, tz.zone.y, 0, tz.zone.y + tz.zone.h);
    band.addColorStop(0, grade.sky[1]);
    band.addColorStop(1, grade.ink);
    ctx.fillStyle = band;
    ctx.fillRect(tz.zone.x, tz.zone.y, tz.zone.w, tz.zone.h);
    const rand = rng(777);
    skyline(ctx, tz.zone.x, tz.zone.y + tz.zone.h * 0.42, tz.zone.w, tz.zone.h * 0.5, rand, 'rgba(255, 214, 106, 0.7)');
    ctx.fillStyle = grade.ink;
    ctx.fillRect(tz.zone.x, tz.zone.y + tz.zone.h * 0.88, tz.zone.w, tz.zone.h * 0.12);
    ctx.restore();
  }

  // Role tags, top-left.
  const tagSize = Math.round(26 * u + 10);
  ctx.font = `400 ${tagSize}px Anton, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let tx = W * 0.03;
  const ty = H * 0.045;
  (state.roles || []).forEach((role) => {
    const tw = ctx.measureText(role).width + tagSize * 1.4;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(1.5, 2 * u);
    ctx.beginPath();
    ctx.roundRect(tx, ty - tagSize * 0.75, tw, tagSize * 1.5, tagSize * 0.75);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(role, tx + tagSize * 0.7, ty + 1);
    tx += tw + W * 0.015;
  });

  // Dialogue callout, top-right.
  const cw = W * 0.38;
  const ch = H * 0.125;
  const cx0 = W * 0.59;
  const cy0 = H * 0.035;
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.beginPath();
  ctx.roundRect(cx0, cy0, cw, ch, Math.min(18, ch * 0.22));
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx0 + cw * 0.22, cy0 + ch);
  ctx.lineTo(cx0 + cw * 0.3, cy0 + ch + H * 0.02);
  ctx.lineTo(cx0 + cw * 0.36, cy0 + ch);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#241a33';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const qSize = Math.round(24 * u + 9);
  ctx.font = `italic 400 ${qSize}px Georgia, serif`;
  const lines = wrapText(ctx, state.callout || '', cw - qSize * 1.6);
  lines.forEach((line, i) => {
    ctx.fillText(line, cx0 + qSize * 0.8, cy0 + ch * 0.36 + i * qSize * 1.25);
  });
  ctx.fillStyle = grade.accent === '#e5e5e5' ? '#5b2a86' : grade.accent;
  ctx.font = `400 ${Math.round(15 * u + 7)}px Anton, sans-serif`;
  ctx.fillText(`— ${state.calloutBy || ''}`, cx0 + qSize * 0.8, cy0 + ch * 0.82);

  // Eyebrow, chrome title, tagline.
  const ebSize = Math.round(22 * u + 9);
  ctx.font = `400 ${ebSize}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = grade.accent;
  ctx.fillText('VICE CITY STORIES', tz.cx, tz.eyebrowY);
  chromeTitle(ctx, state.title || '', tz.cx, tz.titleY, W * 0.86, Math.round(H * 0.14), grade);
  const tgSize = Math.round(20 * u + 8);
  ctx.font = `400 ${tgSize}px Anton, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(state.tagline || '', tz.cx, tz.taglineY);

  // Seal, bottom-right of the title zone.
  const sr = Math.round(34 * u + 14);
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = Math.max(2, 3 * u);
  ctx.beginPath();
  ctx.arc(tz.sealX, tz.sealY, sr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(tz.sealX, tz.sealY, sr * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  star(ctx, tz.sealX, tz.sealY, sr * 0.42, grade.accent);

  // Billing, bottom-centre.
  const bSize = Math.round(13 * u + 6);
  ctx.font = `400 ${bSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('ALL CHARACTERS AND EVENTS ARE FICTIONAL  •  NO SUNSETS WERE HARMED', tz.cx, tz.billingY - bSize * 1.5);
  ctx.fillText('LEONIDA GOLD PICTURES  •  A LEONIDA GOLD PRODUCTION  •  LEONIDAGOLD.PICTURES', tz.cx, tz.billingY);
}

// Render the cover to an offscreen canvas at (w, h) and return a PNG blob.
export function exportPNG(state, images, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas, state, images);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
