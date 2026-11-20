// LEONIDA GOLD cover renderer: multi-panel poster art, chrome 3D lettering,
// layered type (title, script line, quote strip, tagline ribbon, seal, barcode).
// Everything is drawn on canvas from the editor state; no network, no assets
// outside app/. Panels are fractions of the canvas so every layout adapts to
// any of the three export sizes.

export const LAYOUTS = {
  poster:    { name: 'Poster',    titleY: 0.60 },
  hero:      { name: 'Hero',      titleY: 0.58 },
  split:     { name: 'Split Heist', titleY: 0.55 },
  triptych:  { name: 'Triptych',  titleY: 0.62 },
  quad:      { name: 'Quad',      titleY: 0.55 },
  spotlight: { name: 'Spotlight', titleY: 0.60 },
  strip:     { name: 'Strip',     titleY: 0.60 },
  slant:     { name: 'Duo Slant', titleY: 0.60 },
};

export const GRADES = {
  sunset: { name: 'Vice Sunset', wash: ['rgba(255,45,120,0.20)', 'rgba(255,140,40,0.26)'], title: ['#ffe9a8', '#ff9a3d', '#ff5e62'], accent: '#ff7ad9', tag: '#ffb347' },
  neon:   { name: 'Neon Nights', wash: ['rgba(0,220,255,0.18)', 'rgba(255,0,160,0.22)'], title: ['#eafcff', '#7de3ff', '#c86bff'], accent: '#39d5ff', tag: '#39d5ff' },
  palm:   { name: 'Palm Gold',   wash: ['rgba(255,190,60,0.22)', 'rgba(255,110,20,0.24)'], title: ['#fff6c9', '#ffd34d', '#ff8a1e'], accent: '#ffd34d', tag: '#ffd34d' },
  ocean:  { name: 'Ocean Drive', wash: ['rgba(0,200,220,0.20)', 'rgba(0,120,255,0.22)'], title: ['#eafcff', '#8fe8ff', '#2f9dff'], accent: '#5fe8d0', tag: '#5fe8d0' },
  dark:   { name: 'After Dark',  wash: ['rgba(20,10,60,0.30)', 'rgba(90,20,120,0.24)'], title: ['#f2ecff', '#b9a7ff', '#7a5cff'], accent: '#b9a7ff', tag: '#b9a7ff' },
  noir:   { name: 'B&W Noir',    wash: null, title: ['#ffffff', '#d8d8d8', '#8a8a8a'], accent: '#ffffff', tag: '#ffffff' },
};

export const ROLE_TAGS = ['THE WHEELMAN', 'THE LOOKOUT', 'THE DEALER', 'THE RUNNER', 'THE QUEEN'];

export const SAMPLES = ['boulevard', 'pier', 'skyline', 'street', 'marina'];

const GAP = 0.006; // panel gap as a fraction of canvas width

function panelRects(layout, W, H) {
  const top = 0.055, bottom = 0.855;
  const gh = bottom - top;
  switch (layout) {
    case 'poster': return [
      { x: 0, y: top, w: 0.333, h: gh * 0.5 },
      { x: 0.333, y: top, w: 0.334, h: gh * 0.5 },
      { x: 0.667, y: top, w: 0.333, h: gh * 0.5 },
      { x: 0, y: top + gh * 0.5, w: 0.5, h: gh * 0.5 },
      { x: 0.5, y: top + gh * 0.5, w: 0.5, h: gh * 0.5 },
    ];
    case 'hero': return [
      { x: 0, y: top, w: 1, h: gh * 0.44 },
      { x: 0, y: top + gh * 0.44, w: 0.5, h: gh * 0.28 },
      { x: 0.5, y: top + gh * 0.44, w: 0.5, h: gh * 0.28 },
      { x: 0, y: top + gh * 0.72, w: 0.5, h: gh * 0.28 },
      { x: 0.5, y: top + gh * 0.72, w: 0.5, h: gh * 0.28 },
    ];
    case 'split': return [
      { x: 0, y: top, w: 0.52, h: gh * 0.5, clip: 'diagL' },
      { x: 0, y: top + gh * 0.5, w: 0.52, h: gh * 0.5, clip: 'diagL' },
      { x: 0.48, y: top, w: 0.52, h: gh * 0.5, clip: 'diagR' },
      { x: 0.48, y: top + gh * 0.5, w: 0.52, h: gh * 0.5, clip: 'diagR' },
    ];
    case 'triptych': return [
      { x: 0, y: top, w: 0.333, h: gh },
      { x: 0.333, y: top, w: 0.334, h: gh },
      { x: 0.667, y: top, w: 0.333, h: gh },
    ];
    case 'quad': return [
      { x: 0, y: top, w: 0.5, h: gh * 0.5 },
      { x: 0.5, y: top, w: 0.5, h: gh * 0.5 },
      { x: 0, y: top + gh * 0.5, w: 0.5, h: gh * 0.5 },
      { x: 0.5, y: top + gh * 0.5, w: 0.5, h: gh * 0.5 },
    ];
    case 'spotlight': return [
      { x: 0, y: top, w: 0.55, h: gh * 0.75 },
      { x: 0.55, y: top, w: 0.45, h: gh * 0.375 },
      { x: 0.55, y: top + gh * 0.375, w: 0.45, h: gh * 0.375 },
      { x: 0, y: top + gh * 0.75, w: 0.5, h: gh * 0.25 },
      { x: 0.5, y: top + gh * 0.75, w: 0.5, h: gh * 0.25 },
    ];
    case 'strip': return [0, 1, 2, 3, 4].map(i => ({ x: i * 0.2, y: top, w: 0.2, h: gh }));
    case 'slant': return [0, 1, 2, 3, 4].map(i => ({ x: i * 0.2, y: top, w: 0.2, h: gh, clip: 'slant' }));
    default: return panelRects('poster', W, H);
  }
}

function clipPath(ctx, rect, W, H) {
  const px = rect.x * W, py = rect.y * H, pw = rect.w * W, ph = rect.h * H;
  ctx.beginPath();
  if (rect.clip === 'diagL') {
    ctx.moveTo(px, py); ctx.lineTo(px + pw + W * 0.06, py);
    ctx.lineTo(px + pw - W * 0.02, py + ph); ctx.lineTo(px, py + ph);
  } else if (rect.clip === 'diagR') {
    ctx.moveTo(px + W * 0.02, py); ctx.lineTo(px + pw, py);
    ctx.lineTo(px + pw, py + ph); ctx.lineTo(px - W * 0.06, py + ph);
  } else if (rect.clip === 'slant') {
    const s = W * 0.03;
    ctx.moveTo(px + s, py); ctx.lineTo(px + pw + s, py);
    ctx.lineTo(px + pw - s, py + ph); ctx.lineTo(px - s, py + ph);
  } else {
    ctx.rect(px, py, pw, ph);
  }
  ctx.closePath();
  ctx.clip();
}

function drawPanelPhoto(ctx, panel, rect, W, H) {
  const px = (rect.x + GAP / 2) * W, py = (rect.y + GAP / 2) * H;
  const pw = (rect.w - GAP) * W, ph = (rect.h - GAP) * H;
  ctx.save();
  clipPath(ctx, { x: rect.x + GAP / 2, y: rect.y + GAP / 2, w: rect.w - GAP, h: rect.h - GAP, clip: rect.clip }, W, H);
  const img = panel.img;
  if (img && img.naturalWidth) {
    const zoom = panel.zoom || 1;
    const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    const dx = px + (pw - dw) / 2 + (panel.panX || 0) * pw;
    const dy = py + (ph - dh) / 2 + (panel.panY || 0) * ph;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    const g = ctx.createLinearGradient(px, py, px, py + ph);
    g.addColorStop(0, '#3a1445'); g.addColorStop(1, '#12081f');
    ctx.fillStyle = g; ctx.fillRect(px, py, pw, ph);
  }
  ctx.restore();
  // frame line
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = Math.max(2, W * 0.002);
  ctx.strokeRect(px, py, pw, ph);
  ctx.restore();
}

function drawRoleTag(ctx, panel, rect, W, H, accent, titleBand) {
  const px = (rect.x + GAP / 2) * W, py = (rect.y + GAP / 2) * H;
  const ph = (rect.h - GAP) * H;
  const fs = Math.max(10, H * 0.018);
  ctx.save();
  ctx.font = `${fs}px Anton, sans-serif`;
  const label = panel.tag || '';
  const tw = ctx.measureText(label).width;
  const bx = px + W * 0.008, bw = tw + W * 0.02, bh = fs * 1.7;
  let by = py + ph - fs * 2.1;
  // Hard gate: never let the chrome title hide a role tag. If the tag's
  // default bottom-left spot falls under the title band, move it to the
  // panel's top-left corner instead.
  if (titleBand && by < titleBand.y1 && by + bh > titleBand.y0 && bx < titleBand.x1 && bx + bw > titleBand.x0) {
    by = py + fs * 0.4;
  }
  ctx.fillStyle = 'rgba(10,4,18,0.88)';
  roundRect(ctx, bx, by, bw, bh, bh / 2); ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = Math.max(1.5, W * 0.0015); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + W * 0.01, by + bh / 2 + 1);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitFont(ctx, text, maxW, startPx, family, weight = '') {
  let size = startPx;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 12 && ctx.measureText(text).width > maxW) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawChromeTitle(ctx, text, cx, cy, maxW, maxH, colors) {
  const size = fitFont(ctx, text, maxW, maxH, 'Anton, sans-serif');
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${size}px Anton, sans-serif`;
  // 3D depth: stacked dark layers
  const depth = Math.max(3, size * 0.06);
  ctx.fillStyle = '#1c0710';
  for (let i = 5; i >= 1; i--) ctx.fillText(text, cx, cy + (depth * i) / 5);
  ctx.fillStyle = '#3d0a2e';
  ctx.fillText(text, cx, cy + depth);
  // chrome gradient face with a warm glow so the title is the hero focal
  // point even at thumbnail size (studio standard: dynamic lighting)
  const g = ctx.createLinearGradient(cx, cy - size * 0.5, cx, cy + size * 0.5);
  g.addColorStop(0, colors[0]); g.addColorStop(0.5, colors[1]); g.addColorStop(1, colors[2]);
  ctx.shadowColor = colors[1];
  ctx.shadowBlur = size * 0.14;
  ctx.fillStyle = g;
  ctx.fillText(text, cx, cy);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(20,4,16,0.9)'; ctx.lineWidth = Math.max(2, size * 0.03);
  ctx.strokeText(text, cx, cy);
  ctx.restore();
  return size;
}

function drawSeal(ctx, cx, cy, r, grade) {
  ctx.save();
  ctx.translate(cx, cy);
  // scalloped ring
  ctx.fillStyle = '#f7b731';
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.88;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1c0710';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd34d';
  ctx.font = `${r * 0.42}px Anton, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('★', 0, -r * 0.18);
  ctx.font = `${r * 0.16}px Anton, sans-serif`;
  ctx.fillText('ORIGINAL', 0, r * 0.22);
  ctx.fillText('COVER ART', 0, r * 0.42);
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111';
  let bx = x + w * 0.04;
  const widths = [3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 3, 2, 1];
  for (const bw of widths) {
    const ww = bw * (w / 90);
    ctx.fillRect(bx, y + h * 0.06, ww, h * 0.68);
    bx += ww + w / 45;
    if (bx > x + w * 0.96) break;
  }
  ctx.fillStyle = '#111';
  const numSize = fitFont(ctx, '8 0413 2026 11', w * 0.92, Math.max(8, h * 0.16), 'monospace');
  ctx.font = `${numSize}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('8 0413 2026 11', x + w / 2, y + h * 0.88);
  ctx.restore();
}

export function drawCover(ctx, state, W, H) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = panelRects(state.layout, W, H);
  const titleY = (LAYOUTS[state.layout] || LAYOUTS.poster).titleY;

  // base
  ctx.save();
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, W, H);

  // panels
  const panels = state.panels || [];
  rects.forEach((r, i) => {
    drawPanelPhoto(ctx, panels[i] || {}, r, W, H);
  });

  // grade wash over the photo grid
  if (grade.wash) {
    ctx.save();
    clipPath(ctx, { x: 0, y: 0.055, w: 1, h: 0.8 }, W, H);
    const g = ctx.createLinearGradient(0, H * 0.055, 0, H * 0.855);
    g.addColorStop(0, grade.wash[0]);
    g.addColorStop(1, grade.wash[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.055, W, H * 0.8);
    ctx.restore();
  } else {
    // noir: desaturate the grid
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, H * 0.055, W, H * 0.8);
    ctx.restore();
  }

  // role tags (title band computed first so a tag never hides under it)
  const titleSizeEarly = fitFont(ctx, state.title || 'LEONIDA GOLD', W * 0.94, H * 0.13, 'Anton, sans-serif');
  ctx.font = `${titleSizeEarly}px Anton, sans-serif`;
  const titleW = ctx.measureText(state.title || 'LEONIDA GOLD').width;
  const titleBand = {
    x0: W / 2 - titleW / 2 - W * 0.01, x1: W / 2 + titleW / 2 + W * 0.01,
    y0: H * titleY - titleSizeEarly * 0.65, y1: H * titleY + titleSizeEarly * 0.65,
  };
  rects.forEach((r, i) => {
    const p = panels[i] || {};
    if (p.tag) drawRoleTag(ctx, p, r, W, H, grade.tag, titleBand);
  });

  // callout bubble (top-right of the grid, small)
  if (state.callout) {
    const bw = W * 0.30, bh = H * 0.105;
    const bx = W * 0.665, by = H * 0.075;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    roundRect(ctx, bx, by, bw, bh, bh * 0.18); ctx.fill();
    ctx.fillStyle = '#1c0710';
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.22, by + bh);
    ctx.lineTo(bx + bw * 0.30, by + bh + H * 0.02);
    ctx.lineTo(bx + bw * 0.34, by + bh);
    ctx.closePath(); ctx.fill();
    ctx.font = `italic ${Math.max(11, H * 0.021)}px Georgia, serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1c0710';
    ctx.fillText(state.callout, bx + bw * 0.05, by + bh * 0.36, bw * 0.9);
    ctx.fillStyle = grade.accent;
    ctx.font = `${Math.max(10, H * 0.019)}px Anton, sans-serif`;
    ctx.fillText('— ' + (state.calloutBy || 'LUCIA'), bx + bw * 0.05, by + bh * 0.76);
    ctx.restore();
  }

  // top strip: stars + quote + VOL. 1 (quote starts after the measured stars)
  const stripY = H * 0.028;
  ctx.save();
  ctx.font = `${Math.max(11, H * 0.02)}px Anton, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd34d';
  ctx.textAlign = 'left';
  ctx.fillText('★★★★★', W * 0.015, stripY);
  const starsW = ctx.measureText('★★★★★').width;
  const quoteX = W * 0.015 + starsW + W * 0.012;
  const badgeW = W * 0.055, badgeH = H * 0.032;
  const badgeX = W - badgeW - W * 0.012;
  ctx.fillStyle = '#fff';
  const quote = (state.quote || 'SUNSET HEIST OF THE YEAR') + '  —  THE LEONIDA LEDGER';
  const qSize = fitFont(ctx, quote, badgeX - quoteX - W * 0.015, Math.max(11, H * 0.02), 'Anton, sans-serif');
  ctx.font = `${qSize}px Anton, sans-serif`;
  ctx.fillText(quote, quoteX, stripY);
  // VOL. 1 badge
  ctx.fillStyle = '#ffd34d';
  roundRect(ctx, badgeX, stripY - badgeH / 2, badgeW, badgeH, 3); ctx.fill();
  ctx.fillStyle = '#1c0710';
  ctx.textAlign = 'center';
  ctx.fillText('VOL. 1', badgeX + badgeW / 2, stripY);
  ctx.restore();

  // chrome title + script line
  const titleSize = drawChromeTitle(
    ctx, state.title || 'LEONIDA GOLD', W / 2, H * titleY, W * 0.94, H * 0.13, grade.title,
  );
  ctx.save();
  ctx.translate(W / 2, H * (titleY + 0.085));
  ctx.rotate(-0.035);
  ctx.font = `italic ${Math.max(14, H * 0.042)}px Georgia, serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = grade.accent;
  ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = H * 0.008; ctx.shadowOffsetY = H * 0.003;
  ctx.fillText(state.script || 'chasing the golden hour', 0, 0);
  ctx.restore();

  // tagline ribbon
  const ribbonY = H * (titleY + 0.125), ribbonH = H * 0.032;
  ctx.save();
  ctx.fillStyle = 'rgba(10,4,18,0.92)';
  ctx.fillRect(W * 0.18, ribbonY, W * 0.64, ribbonH);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `${Math.max(10, H * 0.019)}px Anton, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(state.tagline || 'ONE CREW · ONE COAST · NO WAY HOME', W / 2, ribbonY + ribbonH / 2);
  ctx.restore();

  // bottom strip
  const botY = H * 0.875, botH = H * 0.125;
  ctx.save();
  ctx.fillStyle = 'rgba(10,4,18,0.96)';
  ctx.fillRect(0, botY, W, botH);
  // COMING SOON
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.max(11, H * 0.024)}px Anton, sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('COMING SOON', W * 0.02, botY + botH * 0.42);
  // billing
  ctx.textAlign = 'center';
  ctx.font = `${Math.max(9, H * 0.015)}px Anton, sans-serif`;
  ctx.fillStyle = '#ffe9b0';
  ctx.fillText('LEONIDA GOLD PICTURES  ·  A LEONIDA GOLD PRODUCTION', W / 2, botY + botH * 0.30);
  ctx.fillStyle = '#c9b8d9';
  ctx.fillText('ALL CHARACTERS AND EVENTS ARE FICTIONAL  ·  NO SUNSETS WERE HARMED', W / 2, botY + botH * 0.58);
  ctx.fillText('LEONIDAGOLD.PICTURES', W / 2, botY + botH * 0.84);
  // seal + barcode (sized so they can never overlap, even in portrait)
  const barcodeX = W * 0.915, barcodeW = W * 0.07;
  let sealCx = W * 0.865;
  let sealR = botH * 0.42;
  const maxSealR = barcodeX - sealCx - W * 0.012;
  if (sealR > maxSealR) sealR = Math.max(botH * 0.22, maxSealR);
  if (sealCx + sealR > barcodeX - W * 0.008) sealCx = barcodeX - sealR - W * 0.01;
  drawSeal(ctx, sealCx, botY + botH * 0.5, sealR, grade);
  drawBarcode(ctx, barcodeX, botY + botH * 0.14, barcodeW, botH * 0.72);
  ctx.restore();
  ctx.restore();
  return titleSize;
}

export function exportPNG(state, w, h) {
  return new Promise((resolve) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    drawCover(ctx, state, w, h);
    c.toBlob((b) => resolve(b), 'image/png');
  });
}
