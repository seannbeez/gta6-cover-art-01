// LEONIDA GOLD — Vice Cover Studio (v3.2)
// Procedural GTA-style cover renderer: busy illustrated scenes + big illustrated
// characters, chrome 3D titles, layered poster type. Everything is drawn with
// canvas vector shapes — no external assets, no network, all original art.
export const TITLE_FONT = 'Anton, "Arial Black", sans-serif';
export const BODY_FONT = '"Arial Narrow", Arial, sans-serif';

export const SCENES = [
  { id: 'boulevard', name: 'Ocean Drive', label: 'OCEAN DR', char: 'wheelman' },
  { id: 'pier', name: 'Pier 9', label: 'PIER 9', char: 'lookout' },
  { id: 'skyline', name: 'Downtown', label: 'DOWNTOWN', char: 'dealer' },
  { id: 'street', name: 'Vice City', label: 'VICE CITY', char: 'runner' },
  { id: 'marina', name: 'Marina', label: 'MARINA', char: 'queen' },
];

export const CHARACTERS = [
  { id: 'wheelman', tag: 'THE WHEELMAN', scene: 'boulevard',
    blurb: 'Leather jacket, dark shades, car keys in hand.' },
  { id: 'lookout', tag: 'THE LOOKOUT', scene: 'pier',
    blurb: 'Navy cap, binoculars on a strap, always watching.' },
  { id: 'dealer', tag: 'THE DEALER', scene: 'skyline',
    blurb: 'Sharp suit, gold chain, a fan of cash.' },
  { id: 'runner', tag: 'THE RUNNER', scene: 'street',
    blurb: 'Hoodie up, duffel over the shoulder, mid-stride.' },
  { id: 'queen', tag: 'THE QUEEN', scene: 'marina',
    blurb: 'Big sunglasses, gold hoops, hair in the sea wind.' },
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

export const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', sky: ['#ff5e7a', '#ff9a3d', '#ffd23d'],
    glow: '#ff7a3d', title: ['#fff3c4', '#ff8a2a'], accent: '#ffd23d', dark: false },
  { id: 'neon', name: 'Neon Nights', sky: ['#3b1d6e', '#a32a8e', '#ff4d8d'],
    glow: '#c44dff', title: ['#dff6ff', '#4db8ff'], accent: '#4dd8ff', dark: true },
  { id: 'palm', name: 'Palm Gold', sky: ['#ff6a2a', '#ffb52e', '#ffe89a'],
    glow: '#ff9a1f', title: ['#fff8d6', '#ff7a1a'], accent: '#ffb52e', dark: false },
  { id: 'ocean', name: 'Ocean Drive', sky: ['#0b3d66', '#1f7a9e', '#5fd4c8'],
    glow: '#3ec8e8', title: ['#e8fbff', '#2aa8d8'], accent: '#5fd4c8', dark: true },
  { id: 'dark', name: 'After Dark', sky: ['#160b2e', '#3d1a5e', '#7a2a6e'],
    glow: '#8a3dff', title: ['#f3e8ff', '#b46bff'], accent: '#c44dff', dark: true },
  { id: 'noir', name: 'B&W Noir', sky: ['#e8e8e8', '#9a9a9a', '#3d3d3d'],
    glow: '#ffffff', title: ['#ffffff', '#8a8a8a'], accent: '#e8e8e8', dark: true },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
export function sceneById(id) {
  return SCENES.find((s) => s.id === id) || SCENES[0];
}

// ---------- small canvas helpers ----------
const INK = '#22101f'; // bold cel outline colour
export function poly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function ell(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}
function fillStroke(ctx, fill, lw) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.stroke();
}
function shade(ctx, x, y, w, h, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- procedural scenery (no photo) ----------
export function drawScene(ctx, sceneId, x, y, w, h, grade) {
  const g = gradeById(grade);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const sky = ctx.createLinearGradient(0, y, 0, y + h * 0.62);
  sky.addColorStop(0, g.sky[0]);
  sky.addColorStop(0.55, g.sky[1]);
  sky.addColorStop(1, g.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h * 0.62);
  // sun with halo
  const sx = x + w * (sceneId === 'marina' ? 0.72 : 0.26);
  const sy = y + h * 0.22;
  const sr = h * 0.11;
  const halo = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 3.2);
  halo.addColorStop(0, g.glow);
  halo.addColorStop(1, 'rgba(255,122,61,0)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = halo;
  ctx.fillRect(x, y, w, h * 0.62);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff2cf';
  ell(ctx, sx, sy, sr, sr);
  ctx.fill();
  // skyline
  const rnd = mulberry(sceneId.length * 977 + 13);
  const base = y + h * 0.62;
  const bw = w / 9;
  for (let i = 0; i < 9; i++) {
    const bh = h * (0.16 + rnd() * 0.26);
    const bx = x + i * bw + bw * 0.06;
    const bwid = bw * 0.88;
    const grad = ctx.createLinearGradient(0, base - bh, 0, base);
    grad.addColorStop(0, '#2a1230');
    grad.addColorStop(1, '#160a1c');
    ctx.fillStyle = grad;
    ctx.fillRect(bx, base - bh, bwid, bh);
    ctx.fillStyle = g.dark ? '#ffd76a' : '#ffe89a';
    const rows = Math.floor(bh / (h * 0.045));
    const cols = Math.max(1, Math.floor(bwid / (w * 0.045)));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rnd() < 0.42) {
          ctx.fillRect(bx + bwid * 0.14 + c * (bwid * 0.72 / cols), base - bh + h * 0.03 + r * (h * 0.045), w * 0.012, h * 0.02);
        }
      }
    }
  }
  // ground band
  const gy = base;
  ctx.fillStyle = sceneId === 'marina' || sceneId === 'pier' ? '#1d4a5e' : '#3a1c2e';
  ctx.fillRect(x, gy, w, h - gy);
  if (sceneId === 'marina' || sceneId === 'pier') {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = Math.max(1, h * 0.006);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x, gy + h * (0.08 + i * 0.05));
      ctx.bezierCurveTo(x + w * 0.3, gy + h * (0.06 + i * 0.05), x + w * 0.7, gy + h * (0.10 + i * 0.05), x + w, gy + h * (0.08 + i * 0.05));
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#241226';
    ctx.fillRect(x, gy + h * 0.10, w, h * 0.05);
    ctx.fillStyle = '#ffd23d';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(x + w * (0.04 + i * 0.14), gy + h * 0.115, w * 0.06, h * 0.012);
    }
  }
  // scene props
  if (sceneId === 'pier') {
    // ferris wheel
    const fx = x + w * 0.72, fy = y + h * 0.34, fr = h * 0.16;
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = Math.max(1.5, h * 0.008);
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(a) * fr, fy + Math.sin(a) * fr);
      ctx.stroke();
      ctx.fillStyle = i % 2 ? '#ff5e7a' : '#5fd4c8';
      ell(ctx, fx + Math.cos(a) * fr, fy + Math.sin(a) * fr, h * 0.02, h * 0.02);
      ctx.fill();
    }
    ctx.fillStyle = '#2a1230';
    ctx.fillRect(fx - w * 0.01, fy, w * 0.02, y + h * 0.62 - fy);
  }
  if (sceneId === 'boulevard' || sceneId === 'street') {
    // palm silhouettes
    for (const px of [0.12, 0.88]) {
      const tx = x + w * px, ty = y + h * 0.52;
      ctx.strokeStyle = '#160a1c';
      ctx.lineWidth = Math.max(2, h * 0.012);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + w * 0.02, ty - h * 0.16, tx + w * 0.05, ty - h * 0.2); ctx.stroke();
      ctx.fillStyle = '#160a1c';
      for (let i = 0; i < 5; i++) {
        const a = Math.PI * (0.08 + i * 0.18);
        poly(ctx, [[tx + w * 0.05, ty - h * 0.2], [tx + w * 0.05 + Math.cos(a) * w * 0.09, ty - h * 0.2 - Math.sin(a) * h * 0.05], [tx + w * 0.05 + Math.cos(a + 0.12) * w * 0.07, ty - h * 0.2 - Math.sin(a + 0.12) * h * 0.03]]);
        ctx.fill();
      }
    }
    // cars on the street
    const carCols = ['#ff5e7a', '#4dd8ff', '#ffd23d'];
    for (let i = 0; i < 3; i++) {
      const cx = x + w * (0.14 + i * 0.34), cy = gy + h * 0.02 + (i % 2) * h * 0.05;
      const cw = w * 0.17, chh = h * 0.055;
      ctx.fillStyle = carCols[i % 3];
      rr(ctx, cx, cy, cw, chh, chh * 0.4);
      ctx.fill();
      ctx.fillStyle = '#1d2b3a';
      rr(ctx, cx + cw * 0.18, cy - chh * 0.5, cw * 0.5, chh * 0.55, chh * 0.25);
      ctx.fill();
      ctx.fillStyle = '#160a1c';
      ell(ctx, cx + cw * 0.22, cy + chh, cw * 0.09, cw * 0.09); ctx.fill();
      ell(ctx, cx + cw * 0.78, cy + chh, cw * 0.09, cw * 0.09); ctx.fill();
    }
  }
  if (sceneId === 'marina') {
    // boats
    for (let i = 0; i < 2; i++) {
      const bx = x + w * (0.12 + i * 0.42), by = gy + h * (0.05 + i * 0.04);
      ctx.fillStyle = '#f5f0e6';
      poly(ctx, [[bx, by], [bx + w * 0.16, by], [bx + w * 0.13, by + h * 0.05], [bx + w * 0.03, by + h * 0.05]]);
      ctx.fill();
      ctx.fillStyle = i ? '#ff5e7a' : '#4dd8ff';
      poly(ctx, [[bx + w * 0.07, by], [bx + w * 0.07, by - h * 0.09], [bx + w * 0.13, by]]);
      ctx.fill();
    }
  }
  if (sceneId === 'skyline') {
    // neon signs
    const signs = [['HOTEL VICE', '#ff5e7a', 0.1], ['ARCADE', '#4dd8ff', 0.42], ['TACOS', '#ffd23d', 0.74]];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const [t, c, fx] of signs) {
      ctx.font = `700 ${Math.max(9, h * 0.035)}px ${BODY_FONT}`;
      const tw = ctx.measureText(t).width + w * 0.03;
      ctx.fillStyle = 'rgba(20,8,24,0.85)';
      rr(ctx, x + w * fx - tw / 2, y + h * 0.44, tw, h * 0.06, h * 0.012);
      ctx.fill();
      ctx.fillStyle = c;
      ctx.fillText(t, x + w * fx, y + h * 0.472);
    }
  }
  ctx.restore();
}

// ---------- big illustrated characters (GTA-style, original art) ----------
// Unit space: 100 wide x 160 tall (head top 0, waist cut 160). Caller scales.
// drawCharacter(ctx, id, cx, bottom, heightPx): character centred on cx,
// standing with its waist at `bottom`, total height `heightPx`.
function bustBase(ctx, skin, top, topShade) {
  // short neck, no outline (blends into the head), shoulders raised to the chin
  ctx.fillStyle = skin;
  ctx.fillRect(43, 56, 14, 12);
  shade(ctx, 52, 56, 5, 12, '#00000022', 1);
  ell(ctx, 33, 40, 3.6, 5.2); fillStroke(ctx, skin, 1.6);
  ell(ctx, 67, 40, 3.6, 5.2); fillStroke(ctx, skin, 1.6);
  ell(ctx, 50, 38, 17, 20.5); fillStroke(ctx, skin, 1.8);
  // soft cel shade on the right side of the face
  ctx.save();
  ell(ctx, 50, 38, 17, 20.5); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(57, 18, 12, 44);
  ctx.restore();
  // torso: broad shoulders at the chin, tapered waist, straight cut at 160
  ctx.beginPath();
  ctx.moveTo(31, 160);
  ctx.lineTo(33, 128);
  ctx.quadraticCurveTo(27, 96, 33, 76);
  ctx.lineTo(44, 67);
  ctx.lineTo(56, 67);
  ctx.lineTo(67, 76);
  ctx.quadraticCurveTo(73, 96, 67, 128);
  ctx.lineTo(69, 160);
  ctx.closePath();
  const tg = ctx.createLinearGradient(31, 0, 69, 0);
  tg.addColorStop(0, topShade);
  tg.addColorStop(0.45, top);
  tg.addColorStop(1, topShade);
  fillStroke(ctx, tg, 1.8);
  // shoulder seam
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(33, 78); ctx.quadraticCurveTo(50, 74, 67, 78); ctx.stroke();
}
function eyes(ctx, look) {
  // bold cartoon eyes; look = 'open' | 'shades'
  if (look === 'shades') {
    ctx.fillStyle = '#14090f';
    rr(ctx, 35.5, 31, 12, 8, 3); ctx.fill();
    rr(ctx, 52.5, 31, 12, 8, 3); ctx.fill();
    ctx.strokeStyle = '#14090f'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(47.5, 35); ctx.lineTo(52.5, 35); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(37.5, 33.5); ctx.lineTo(42.5, 33); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(54.5, 33.5); ctx.lineTo(59.5, 33); ctx.stroke();
    return;
  }
  for (const cx of [43, 57]) {
    ell(ctx, cx, 35, 4, 2.6); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke();
    ell(ctx, cx, 35.2, 1.8, 1.9); ctx.fillStyle = '#14090f'; ctx.fill();
  }
  // brows
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(38.5, 29.5); ctx.lineTo(47.5, 28.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(52.5, 28.5); ctx.lineTo(61.5, 29.5); ctx.stroke();
  // nose + mouth
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(50, 38); ctx.quadraticCurveTo(51.5, 43, 49.5, 44.5); ctx.stroke();
}
function mouth(ctx, kind) {
  ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  ctx.beginPath();
  if (kind === 'smirk') { ctx.moveTo(44, 50); ctx.quadraticCurveTo(50, 53.5, 56.5, 49); }
  else if (kind === 'smile') { ctx.moveTo(44, 49); ctx.quadraticCurveTo(50, 54, 56, 49); }
  else { ctx.moveTo(45, 51); ctx.quadraticCurveTo(50, 52.5, 55, 51); }
  ctx.stroke();
}
function armBent(ctx, color, from, mid, hand) {
  // filled tapered arm (shoulder -> elbow -> hand), not a thin line
  const dx1 = mid[0] - from[0], dy1 = mid[1] - from[1];
  const l1 = Math.hypot(dx1, dy1) || 1;
  const nx1 = -dy1 / l1, ny1 = dx1 / l1;
  const dx2 = hand[0] - mid[0], dy2 = hand[1] - mid[1];
  const l2 = Math.hypot(dx2, dy2) || 1;
  const nx2 = -dy2 / l2, ny2 = dx2 / l2;
  const w1 = 4.4, w2 = 3.4;
  ctx.beginPath();
  ctx.moveTo(from[0] + nx1 * w1, from[1] + ny1 * w1);
  ctx.lineTo(mid[0] + nx1 * w1, mid[1] + ny1 * w1);
  ctx.lineTo(hand[0] + nx2 * w2, hand[1] + ny2 * w2);
  ctx.lineTo(hand[0] - nx2 * w2, hand[1] - ny2 * w2);
  ctx.lineTo(mid[0] - nx1 * w1, mid[1] - ny1 * w1);
  ctx.lineTo(from[0] - nx1 * w1, from[1] - ny1 * w1);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.stroke();
}
function handDot(ctx, skin, x, y) {
  ell(ctx, x, y, 4.6, 4.6);
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.lineWidth = 1.4; ctx.strokeStyle = INK; ctx.stroke();
}

const CHAR_DRAW = {
  wheelman(ctx) {
    const skin = '#c98d5f';
    bustBase(ctx, skin, '#1d1d26', '#101018');
    // leather jacket: collar + zipper + tee
    ctx.fillStyle = '#f5f0e6';
    poly(ctx, [[44, 74], [56, 74], [53, 112], [47, 112]]); ctx.fill();
    ctx.strokeStyle = '#c8c0b0'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(50, 76); ctx.lineTo(50, 112); ctx.stroke();
    ctx.fillStyle = '#2a2a33';
    poly(ctx, [[38, 74], [46, 78], [44, 74], [36, 70]]); ctx.fill();
    poly(ctx, [[62, 74], [54, 78], [56, 74], [64, 70]]); ctx.fill();
    // right arm hugging the body, keys in hand
    armBent(ctx, '#1d1d26', [68, 86], [76, 108], [66, 100]);
    handDot(ctx, skin, 70, 104);
    ctx.strokeStyle = '#d8d8d8'; ctx.lineWidth = 1.6;
    ell(ctx, 66, 100, 2.6, 2.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(66, 102.5); ctx.lineTo(63, 108); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(68, 102); ctx.lineTo(69, 107.5); ctx.stroke();
    // slicked hair + sideburns
    ctx.fillStyle = '#14100c';
    ctx.beginPath();
    ctx.moveTo(34.5, 40);
    ctx.quadraticCurveTo(33, 18, 50, 17.5);
    ctx.quadraticCurveTo(67, 18, 65.5, 40);
    ctx.quadraticCurveTo(64, 27, 58, 25.5);
    ctx.quadraticCurveTo(50, 22.5, 42, 25.5);
    ctx.quadraticCurveTo(36, 27, 34.5, 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillRect(33.5, 38, 2.4, 8);
    ctx.fillRect(64.1, 38, 2.4, 8);
    eyes(ctx, 'shades');
    mouth(ctx, 'smirk');
  },
  lookout(ctx) {
    const skin = '#e8b98d';
    bustBase(ctx, skin, '#1f3a5e', '#14263e');
    // striped tee + jacket open
    ctx.fillStyle = '#f5f0e6';
    poly(ctx, [[44, 74], [56, 74], [54, 112], [46, 112]]); ctx.fill();
    ctx.strokeStyle = '#ff5e7a'; ctx.lineWidth = 2;
    for (const yy of [82, 92, 102]) {
      ctx.beginPath(); ctx.moveTo(45, yy); ctx.lineTo(55, yy); ctx.stroke();
    }
    // binocular strap + binoculars on chest
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(28, 88); ctx.lineTo(64, 128); ctx.stroke();
    ctx.fillStyle = '#22242c';
    rr(ctx, 40, 118, 9, 7, 2); ctx.fill();
    rr(ctx, 50, 118, 9, 7, 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
    rr(ctx, 40, 118, 9, 7, 2); ctx.stroke();
    rr(ctx, 50, 118, 9, 7, 2); ctx.stroke();
    // cap
    ctx.fillStyle = '#1f3a5e';
    ctx.beginPath();
    ctx.moveTo(34, 34);
    ctx.quadraticCurveTo(34, 16, 50, 15.5);
    ctx.quadraticCurveTo(66, 16, 66, 34);
    ctx.lineTo(60, 30);
    ctx.quadraticCurveTo(50, 26, 40, 30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
    ell(ctx, 50, 31.5, 17, 3.2);
    ctx.fillStyle = '#1f3a5e'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#ffd23d';
    ell(ctx, 50, 22, 3, 3); ctx.fill();
    eyes(ctx, 'open');
    mouth(ctx, 'flat');
    // left arm hugging the body, hand shading eyes
    armBent(ctx, '#1f3a5e', [32, 86], [22, 106], [30, 98]);
    handDot(ctx, skin, 30, 98);
  },
  dealer(ctx) {
    const skin = '#8a5a3b';
    bustBase(ctx, skin, '#4a1d4e', '#2e1230');
    // white shirt + lapels
    ctx.fillStyle = '#f8f4ec';
    poly(ctx, [[44, 74], [56, 74], [53, 112], [47, 112]]); ctx.fill();
    ctx.fillStyle = '#4a1d4e';
    poly(ctx, [[44, 74], [50, 92], [44, 104], [38, 78]]); ctx.fill();
    poly(ctx, [[56, 74], [50, 92], [56, 104], [62, 78]]); ctx.fill();
    // gold chain
    ctx.strokeStyle = '#ffd23d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(50, 76, 12, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.fillStyle = '#ffd23d';
    ell(ctx, 50, 88.5, 2.6, 3.4); ctx.fill();
    // cash fan in the hand at the chest
    armBent(ctx, '#4a1d4e', [68, 86], [76, 108], [70, 98]);
    handDot(ctx, skin, 70, 98);
    ctx.save();
    ctx.translate(70, 94);
    for (let i = -1; i <= 1; i++) {
      ctx.save();
      ctx.rotate(i * 0.5);
      ctx.fillStyle = '#7ec850';
      rr(ctx, -3.4, -16, 6.8, 13, 1); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.fillStyle = '#2f6b1e';
      ell(ctx, 0, -9.5, 1.8, 2.6); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // short cropped hair
    ctx.fillStyle = '#0d0a08';
    ctx.beginPath();
    ctx.moveTo(34.5, 38);
    ctx.quadraticCurveTo(34, 19, 50, 18.5);
    ctx.quadraticCurveTo(66, 19, 65.5, 38);
    ctx.quadraticCurveTo(63, 26, 57, 25);
    ctx.quadraticCurveTo(50, 23, 43, 25);
    ctx.quadraticCurveTo(37, 26, 34.5, 38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
    eyes(ctx, 'open');
    mouth(ctx, 'smirk');
  },
  runner(ctx) {
    const skin = '#d9a06b';
    bustBase(ctx, skin, '#5e1f2e', '#3c1220');
    // hood framing the face
    ctx.fillStyle = '#5e1f2e';
    ctx.beginPath();
    ctx.moveTo(30, 52);
    ctx.quadraticCurveTo(28, 14, 50, 12);
    ctx.quadraticCurveTo(72, 14, 70, 52);
    ctx.quadraticCurveTo(68, 30, 62, 26);
    ctx.quadraticCurveTo(50, 20, 38, 26);
    ctx.quadraticCurveTo(32, 30, 30, 52);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
    // curly fringe under the hood
    ctx.fillStyle = '#241812';
    for (const [fx, fy, fr] of [[40, 26, 3.4], [46, 24, 3.8], [53, 24, 3.8], [59, 26, 3.4]]) {
      ell(ctx, fx, fy, fr, fr); ctx.fill();
    }
    // duffel strap + bag at the hip
    ctx.strokeStyle = '#ffd23d'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(26, 84); ctx.lineTo(72, 138); ctx.stroke();
    ctx.fillStyle = '#2a2a33';
    rr(ctx, 66, 132, 20, 14, 4); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = '#4dd8ff'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(70, 132); ctx.lineTo(70, 146); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(82, 132); ctx.lineTo(82, 146); ctx.stroke();
    eyes(ctx, 'open');
    mouth(ctx, 'smile');
    // left arm pumping forward
    armBent(ctx, '#5e1f2e', [32, 86], [22, 104], [30, 96]);
    handDot(ctx, skin, 30, 96);
  },
  queen(ctx) {
    const skin = '#b97a4e';
    bustBase(ctx, skin, '#c22a6e', '#7e1748');
    // off-shoulder top + necklace
    ctx.fillStyle = '#c22a6e';
    poly(ctx, [[30, 82], [70, 82], [76, 96], [24, 96]]); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = '#ffd23d'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(50, 78, 9, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
    // big gold hoops
    ctx.strokeStyle = '#ffd23d'; ctx.lineWidth = 2.2;
    ell(ctx, 32, 49, 3.6, 4.6); ctx.stroke();
    ell(ctx, 68, 49, 3.6, 4.6); ctx.stroke();
    // long wavy hair flowing to the shoulders
    ctx.fillStyle = '#1c0f14';
    ctx.beginPath();
    ctx.moveTo(33, 46);
    ctx.quadraticCurveTo(28, 12, 50, 11);
    ctx.quadraticCurveTo(72, 12, 67, 46);
    ctx.quadraticCurveTo(70, 66, 64, 82);
    ctx.quadraticCurveTo(62, 66, 60, 52);
    ctx.quadraticCurveTo(62, 30, 58, 24);
    ctx.quadraticCurveTo(50, 20, 42, 24);
    ctx.quadraticCurveTo(38, 30, 40, 52);
    ctx.quadraticCurveTo(38, 66, 36, 82);
    ctx.quadraticCurveTo(30, 66, 33, 46);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
    // hand on hip (elbow slightly out)
    armBent(ctx, '#c22a6e', [68, 86], [78, 112], [66, 122]);
    handDot(ctx, skin, 66, 122);
    eyes(ctx, 'shades');
    mouth(ctx, 'smile');
  },
};

// For slanted (split) panels: the diagonal edge of the clip polygon, and the
// x of that edge at a given height — so characters, tags and labels stay
// inside the visible wedge instead of being clipped away by the diagonal.
function diagEdge(poly) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (a[0] !== b[0] && a[1] !== b[1]) return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
  }
  return null;
}
function diagXAt(poly, y) {
  const e = diagEdge(poly);
  if (!e) return null;
  return e.x1 + (e.x2 - e.x1) * (y - e.y1) / (e.y2 - e.y1);
}
function polySide(poly) { return poly[0][0] === 0 ? 'left' : 'right'; }

export function drawCharacter(ctx, charId, cx, bottom, heightPx) {
  const draw = CHAR_DRAW[charId];
  if (!draw) return;
  const s = heightPx / 160;
  const w = 100 * s;
  ctx.save();
  // warm rim-light glow behind the character
  const gx = cx, gy = bottom - heightPx * 0.55;
  const glow = ctx.createRadialGradient(gx, gy, 4, gx, gy, heightPx * 0.62);
  glow.addColorStop(0, 'rgba(255,150,70,0.5)');
  glow.addColorStop(1, 'rgba(255,150,70,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - w * 0.8, bottom - heightPx * 1.15, w * 1.6, heightPx * 1.15);
  ctx.translate(cx - w / 2, bottom - heightPx);
  ctx.scale(s, s);
  draw(ctx);
  ctx.restore();
}

// ---------- layouts: 5 panels, one per scene/character ----------
function rects(W, H, layout) {
  const head = 0.07 * H, foot = 0.88 * H;
  const top = head, bot = foot;
  const cw = W, ch = bot - top;
  const P = (x, y, w, h, scene) => ({ x, y, w, h, scene, poly: null });
  switch (layout) {
    case 'hero': {
      // bands sized so the title block (0.52H) threads between band2 and band3 faces
      const b1 = 0.23 * H, b2 = 0.22 * H;
      return [
        P(0, top, W, b1, 0),
        P(0, top + b1, W / 2, b2, 1),
        P(W / 2, top + b1, W / 2, b2, 2),
        P(0, top + b1 + b2, W / 2, bot - top - b1 - b2, 3),
        P(W / 2, top + b1 + b2, W / 2, bot - top - b1 - b2, 4),
      ];
    }
    case 'split': {
      // strong diagonal from (0.66W, top) to (0.20W, bot): left region 2 panels, right 3
      const dTop = 0.66 * W, dBot = 0.20 * W;
      const leftPoly = [[0, top], [dTop, top], [dBot, bot], [0, bot]];
      const rightPoly = [[dTop, top], [W, top], [W, bot], [dBot, bot]];
      const lh = ch / 2, rh = ch / 3;
      const panels = [
        P(0, top, W * 0.66, lh, 0),
        P(0, top + lh, W * 0.66, lh, 3),
        P(W * 0.20, top, W * 0.80, rh, 1),
        P(W * 0.20, top + rh, W * 0.80, rh, 2),
        P(W * 0.20, top + rh * 2, W * 0.80, rh, 4),
      ];
      panels[0].poly = leftPoly; panels[1].poly = leftPoly;
      panels[2].poly = rightPoly; panels[3].poly = rightPoly; panels[4].poly = rightPoly;
      return panels;
    }
    case 'triptych': {
      const up = 0.62 * ch;
      return [
        P(0, top, W / 3, up, 0),
        P(W / 3, top, W / 3, up, 1),
        P((2 * W) / 3, top, W / 3, up, 2),
        P(0, top + up, W / 2, bot - top - up, 3),
        P(W / 2, top + up, W / 2, bot - top - up, 4),
      ];
    }
    case 'quad': {
      const up = 0.62 * ch;
      return [
        P(0, top, W / 2, up / 2, 0),
        P(W / 2, top, W / 2, up / 2, 1),
        P(0, top + up / 2, W / 2, up / 2, 2),
        P(W / 2, top + up / 2, W / 2, up / 2, 3),
        P(0, top + up, W, bot - top - up, 4),
      ];
    }
    case 'spotlight': {
      const big = { x: W * 0.22, y: top + ch * 0.10, w: W * 0.56, h: ch * 0.62 };
      return [
        P(big.x, big.y, big.w, big.h, 2),
        P(0, top, W * 0.20, ch * 0.30, 0),
        P(W * 0.80, top, W * 0.20, ch * 0.30, 1),
        P(0, top + ch * 0.72, W * 0.48, ch * 0.28, 3),
        P(W * 0.52, top + ch * 0.72, W * 0.48, ch * 0.28, 4),
      ];
    }
    case 'strip': {
      return SCENES.map((_, i) => P((W / 5) * i, top, W / 5, ch, i));
    }
    case 'duo': {
      const slant = W * 0.045;
      const up = 0.60 * ch;
      const p0 = P(0, top, W * 0.52, up, 0);
      p0.poly = [[slant, top], [W * 0.52 + slant, top], [W * 0.52 - slant, top + up], [-slant, top + up]];
      const p1 = P(W * 0.48, top, W * 0.52, up, 1);
      p1.poly = [[W * 0.48 + slant, top], [W - slant, top], [W + slant, top + up], [W * 0.48 - slant, top + up]];
      return [
        p0, p1,
        P(0, top + up, W / 3, bot - top - up, 2),
        P(W / 3, top + up, W / 3, bot - top - up, 3),
        P((2 * W) / 3, top + up, W / 3, bot - top - up, 4),
      ];
    }
    case 'poster':
    default: {
      const up = 0.46 * ch;
      return [
        P(0, top, W / 3, up, 0),
        P(W / 3, top, W / 3, up, 1),
        P((2 * W) / 3, top, W / 3, up, 2),
        P(0, top + up, W / 2, bot - top - up, 3),
        P(W / 2, top + up, W / 2, bot - top - up, 4),
      ];
    }
  }
}

function fitFont(ctx, text, maxW, startPx, family, weight = 400) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 8 && ctx.measureText(text).width > maxW) {
    px -= 1;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

function drawCoverFit(ctx, img, x, y, w, h, zoom = 1, ox = 0, oy = 0) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const s = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * s, dh = ih * s;
  const dx = x + (w - dw) / 2 + ox * w * 0.1;
  const dy = y + (h - dh) / 2 + oy * h * 0.1;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawTag(ctx, text, x, y, h) {
  ctx.font = `700 ${h * 0.52}px ${TITLE_FONT}`;
  const tw = ctx.measureText(text).width + h * 0.9;
  ctx.fillStyle = 'rgba(16,6,20,0.92)';
  rr(ctx, x, y, tw, h, h * 0.5);
  ctx.fill();
  ctx.lineWidth = Math.max(1, h * 0.06);
  ctx.strokeStyle = '#ffd23d';
  ctx.stroke();
  ctx.fillStyle = '#fff3c4';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + h * 0.45, y + h * 0.54);
}

function drawBarcode(ctx, x, y, w, h, number) {
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(x, y, w, h);
  let bx = x + w * 0.06;
  const bw = w * 0.88;
  let seed = 7;
  while (bx < x + bw) {
    seed = (seed * 31 + 17) % 97;
    const barW = w * (0.012 + (seed % 5) * 0.008);
    if (seed % 3 === 0) {
      ctx.fillStyle = '#14090f';
      ctx.fillRect(bx, y + h * 0.08, barW, h * 0.58);
    }
    bx += barW + w * 0.012;
  }
  ctx.fillStyle = '#14090f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const px = fitFont(ctx, number, w * 0.92, h * 0.2, BODY_FONT, 700);
  ctx.fillText(number, x + w / 2, y + h * 0.83);
  return px;
}

function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#ffd23d';
  ctx.strokeStyle = '#14090f';
  ctx.lineWidth = Math.max(1, r * 0.08);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    poly(ctx, [[Math.cos(a) * r, Math.sin(a) * r], [Math.cos(a + 0.13) * r * 1.18, Math.sin(a + 0.13) * r * 1.18], [Math.cos(a + 0.26) * r, Math.sin(a + 0.26) * r]]);
    ctx.fill();
    ctx.stroke();
  }
  ell(ctx, 0, 0, r * 0.86, r * 0.86);
  ctx.fillStyle = '#14090f';
  ctx.fill();
  ctx.fillStyle = '#ffd23d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${r * 0.34}px ${TITLE_FONT}`;
  ctx.fillText('★', 0, -r * 0.28);
  fitFont(ctx, 'ORIGINAL', r * 1.2, r * 0.26, BODY_FONT, 700);
  ctx.fillText('ORIGINAL', 0, r * 0.08);
  fitFont(ctx, 'COVER ART', r * 1.2, r * 0.26, BODY_FONT, 700);
  ctx.fillText('COVER ART', 0, r * 0.38);
  ctx.restore();
}

// ---------- the cover ----------
export function renderCover(ctx, opts) {
  const { W, H, layout = 'poster', grade = 'sunset', title = 'LEONIDA GOLD',
    caption = 'chasing the golden hour', quote = 'SUNSET HEIST OF THE YEAR — THE LEONIDA LEDGER',
    photos = [], crops = [] } = opts;
  const g = gradeById(grade);
  const margin = Math.max(16, W * 0.018);
  ctx.save();
  ctx.fillStyle = '#14081a';
  ctx.fillRect(0, 0, W, H);
  const panels = rects(W, H, layout);
  const headH = 0.07 * H, footY = 0.88 * H;

  // panels: photo (sample images already carry their character) or procedural scene + character
  for (const p of panels) {
    ctx.save();
    if (p.poly) { poly(ctx, p.poly); ctx.clip(); }
    else { ctx.beginPath(); ctx.rect(p.x, p.y, p.w, p.h); ctx.clip(); }
    const photo = photos[p.scene];
    const crop = crops[p.scene] || {};
    if (photo) {
      if (g.id === 'noir') ctx.filter = 'grayscale(1) contrast(1.08)';
      drawCoverFit(ctx, photo, p.x, p.y, p.w, p.h, crop.zoom || 1, crop.ox || 0, crop.oy || 0);
      ctx.filter = 'none';
    } else {
      drawScene(ctx, SCENES[p.scene].id, p.x, p.y, p.w, p.h, grade);
      // for slanted panels, keep the character's face clear of the diagonal
      let cx = p.x + p.w * 0.62;
      if (p.poly) {
        const charH = p.h * 0.8;
        const faceY = p.y + p.h * 0.97 - 0.75 * charH;
        const dx = diagXAt(p.poly, faceY);
        const m = 0.20 * charH;
        if (dx !== null) cx = polySide(p.poly) === 'left' ? Math.min(cx, dx - m) : Math.max(cx, dx + m);
      }
      drawCharacter(ctx, SCENES[p.scene].char, cx, p.y + p.h * 0.97, p.h * 0.8);
    }
    // grade wash
    const wash = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
    wash.addColorStop(0, 'rgba(255,255,255,0)');
    wash.addColorStop(1, g.id === 'noir' ? 'rgba(0,0,0,0.16)' : hexA(g.glow, 0.13));
    ctx.fillStyle = wash;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.restore();
    // panel frame: stroke the clip polygon for slanted panels, the rect otherwise
    ctx.strokeStyle = 'rgba(20,8,26,0.9)';
    ctx.lineWidth = Math.max(2, W * 0.002);
    if (p.poly) { poly(ctx, p.poly); ctx.stroke(); }
    else ctx.strokeRect(p.x, p.y, p.w, p.h);
    // small scene label: for left slanted panels right-align to the diagonal
    // (top-left is under the callout, top-right is cut by the diagonal);
    // top-right otherwise (callout owns the top-left)
    ctx.font = `700 ${Math.max(9, H * 0.016)}px ${BODY_FONT}`;
    const lab = SCENES[p.scene].label;
    const lw = ctx.measureText(lab).width + W * 0.016;
    const labY = p.y + Math.max(6, H * 0.01);
    let lx;
    if (p.poly && polySide(p.poly) === 'left') {
      const dx = diagXAt(p.poly, labY);
      lx = (dx !== null ? dx : p.x + p.w) - lw - Math.max(8, W * 0.008);
    } else {
      lx = p.x + p.w - lw - Math.max(8, W * 0.008);
    }
    ctx.fillStyle = 'rgba(16,6,20,0.75)';
    rr(ctx, lx, p.y + Math.max(6, H * 0.01), lw, H * 0.026, H * 0.008);
    ctx.fill();
    ctx.fillStyle = '#9fd8e8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(lab, lx + W * 0.008, p.y + Math.max(6, H * 0.01) + H * 0.013);
  }

  // split layout: a visible gold divider along the diagonal seam
  if (layout === 'split') {
    ctx.strokeStyle = '#14081a';
    ctx.lineWidth = Math.max(4, W * 0.007);
    ctx.beginPath(); ctx.moveTo(W * 0.66, 0.07 * H); ctx.lineTo(W * 0.20, 0.88 * H); ctx.stroke();
    ctx.strokeStyle = '#ffd23d';
    ctx.lineWidth = Math.max(2, W * 0.003);
    ctx.beginPath(); ctx.moveTo(W * 0.66, 0.07 * H); ctx.lineTo(W * 0.20, 0.88 * H); ctx.stroke();
  }

  // header band: stars + quote, VOL. 1 badge kept inside the frame
  ctx.fillStyle = 'rgba(16,6,22,0.94)';
  ctx.fillRect(0, 0, W, headH);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd23d';
  ctx.font = `${Math.max(12, headH * 0.42)}px ${BODY_FONT}`;
  ctx.fillText('★★★★★', margin, headH * 0.52);
  const starsW = ctx.measureText('★★★★★').width;
  ctx.fillStyle = '#fff3c4';
  fitFont(ctx, quote, W * 0.62, headH * 0.4, TITLE_FONT, 400);
  ctx.fillText(quote, margin + starsW + W * 0.012, headH * 0.54);
  const badgeH = headH * 0.62;
  ctx.font = `700 ${badgeH * 0.52}px ${TITLE_FONT}`;
  const badgeW = ctx.measureText('VOL. 1').width + badgeH * 0.9;
  const badgeX = W - margin - badgeW;
  ctx.fillStyle = '#ffd23d';
  rr(ctx, badgeX, (headH - badgeH) / 2, badgeW, badgeH, badgeH * 0.25);
  ctx.fill();
  ctx.fillStyle = '#14090f';
  ctx.textAlign = 'center';
  ctx.fillText('VOL. 1', badgeX + badgeW / 2, headH * 0.53);

  // callout bubble, top-left of the first panel (never over a face)
  const p0 = panels[0];
  const cw = Math.min(p0.w * 0.46, W * 0.24);
  const chh = Math.max(34, H * 0.085);
  const cx0 = p0.x + Math.max(10, W * 0.01);
  const cy0 = p0.y + Math.max(10, H * 0.02);
  ctx.fillStyle = 'rgba(245,240,230,0.96)';
  rr(ctx, cx0, cy0, cw, chh, chh * 0.18);
  ctx.fill();
  ctx.fillStyle = '#22101f';
  ctx.textAlign = 'left';
  fitFont(ctx, 'We take the city tonight.', cw * 0.9, chh * 0.3, 'Georgia, serif', 400);
  ctx.fillText('We take the city tonight.', cx0 + cw * 0.05, cy0 + chh * 0.34);
  ctx.fillStyle = g.id === 'neon' ? '#c22a6e' : '#ff5e7a';
  fitFont(ctx, '— LUCIA', cw * 0.9, chh * 0.26, 'Georgia, serif', 700);
  ctx.fillText('— LUCIA', cx0 + cw * 0.05, cy0 + chh * 0.72);
  // bubble tail
  ctx.fillStyle = 'rgba(245,240,230,0.96)';
  poly(ctx, [[cx0 + cw * 0.3, cy0 + chh - 1], [cx0 + cw * 0.38, cy0 + chh + chh * 0.22], [cx0 + cw * 0.46, cy0 + chh - 1]]);
  ctx.fill();

  // hero title: chrome 3D with warm glow, fitted to the canvas width.
  // titleY is per-layout so the title band never crosses a character's face:
  // faces sit at ~37% of panel height, so the band threads between the rows.
  // Split gets a smaller title (its middle-row faces leave only a narrow slot),
  // and hero/split drop the script/ribbon — the slot cannot hold them.
  const titleY = layout === 'hero' ? 0.52 * H : layout === 'split' ? 0.535 * H : layout === 'poster' ? 0.44 * H : 0.545 * H;
  let titlePx = Math.min(H * 0.15, W * 0.16);
  if (layout === 'split') titlePx = Math.min(titlePx, H * 0.09);
  ctx.font = `${titlePx}px ${TITLE_FONT}`;
  while (titlePx > 20 && ctx.measureText(title).width > W * 0.94) {
    titlePx -= 2;
    ctx.font = `${titlePx}px ${TITLE_FONT}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.shadowColor = g.glow;
  ctx.shadowBlur = titlePx * 0.35;
  ctx.fillStyle = '#2a0a1e';
  ctx.fillText(title, W / 2, titleY + titlePx * 0.07);
  ctx.fillText(title, W / 2, titleY + titlePx * 0.13);
  const tg = ctx.createLinearGradient(0, titleY - titlePx * 0.5, 0, titleY + titlePx * 0.5);
  tg.addColorStop(0, g.title[0]);
  tg.addColorStop(0.55, g.title[1]);
  tg.addColorStop(1, '#ff5e7a');
  ctx.fillStyle = tg;
  ctx.fillText(title, W / 2, titleY);
  ctx.restore();
  // script line under the title (skipped for split: no room in its slot)
  if (layout !== 'split') {
    ctx.fillStyle = g.id === 'noir' ? '#ffffff' : '#ffe89a';
    ctx.font = `italic 700 ${Math.max(16, H * 0.052)}px Georgia, 'Times New Roman', serif`;
    ctx.fillText(caption, W / 2, titleY + titlePx * 0.62);
  }
  // ribbon (kept narrow so it threads between the bottom-row faces;
  // skipped for hero/split: their slots cannot hold it)
  if (layout !== 'hero' && layout !== 'split') {
  const ribH = Math.max(18, H * 0.038);
  const ribY = titleY + titlePx * 0.62 + H * 0.03;
  const ribText = 'ONE CREW · ONE COAST · NO WAY HOME';
  ctx.font = `700 ${ribH * 0.5}px ${TITLE_FONT}`;
  const ribW = Math.min(W * 0.5, ctx.measureText(ribText).width + W * 0.06);
  ctx.fillStyle = 'rgba(16,6,22,0.88)';
  rr(ctx, (W - ribW) / 2, ribY, ribW, ribH, ribH * 0.2);
  ctx.fill();
  ctx.fillStyle = '#ffd23d';
  fitFont(ctx, ribText, ribW * 0.94, ribH * 0.5, TITLE_FONT, 700);
  ctx.fillText(ribText, W / 2, ribY + ribH * 0.54);
  }

  // role tags, bottom-left of each panel — drawn AFTER the title so the title
  // never hides a tag (the seam tags sit under the title band)
  for (const p of panels) {
    const tagH = Math.max(16, H * 0.032);
    const tagY = p.y + p.h - tagH - Math.max(6, H * 0.012);
    let tagX = p.x + Math.max(8, W * 0.008);
    // right slanted panels: the tag's home corner is left of the diagonal,
    // so anchor it just right of the diagonal at the tag's height
    if (p.poly && polySide(p.poly) === 'right') {
      const dx = diagXAt(p.poly, tagY);
      if (dx !== null) tagX = dx + Math.max(8, W * 0.008);
    }
    drawTag(ctx, CHARACTERS[p.scene].tag, tagX, tagY, tagH);
  }

  // footer: COMING SOON | billing | seal + barcode (all inside the frame)
  ctx.fillStyle = 'rgba(16,6,22,0.96)';
  ctx.fillRect(0, footY, W, H - footY);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff3c4';
  fitFont(ctx, 'COMING SOON', W * 0.16, (H - footY) * 0.34, TITLE_FONT, 700);
  ctx.fillText('COMING SOON', margin, footY + (H - footY) * 0.5);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd76a';
  fitFont(ctx, 'LEONIDA GOLD PICTURES · A LEONIDA GOLD PRODUCTION', W * 0.5, (H - footY) * 0.2, TITLE_FONT, 400);
  ctx.fillText('LEONIDA GOLD PICTURES · A LEONIDA GOLD PRODUCTION', W / 2, footY + (H - footY) * 0.32);
  ctx.fillStyle = '#c8b8d8';
  fitFont(ctx, 'ALL CHARACTERS AND EVENTS ARE FICTIONAL · NO SUNSETS WERE HARMED', W * 0.5, (H - footY) * 0.16, BODY_FONT, 400);
  ctx.fillText('ALL CHARACTERS AND EVENTS ARE FICTIONAL · NO SUNSETS WERE HARMED', W / 2, footY + (H - footY) * 0.58);
  ctx.fillStyle = '#fff3c4';
  fitFont(ctx, 'LEONIDAGOLD.PICTURES', W * 0.3, (H - footY) * 0.16, BODY_FONT, 700);
  ctx.fillText('LEONIDAGOLD.PICTURES', W / 2, footY + (H - footY) * 0.82);
  // seal + barcode with a real right margin
  const footH = H - footY;
  const barW = Math.max(64, W * 0.085);
  const barH = footH * 0.78;
  const barX = W - margin - barW;
  const barY = footY + (footH - barH) / 2;
  drawSeal(ctx, barX - Math.max(12, W * 0.012) - footH * 0.32, footY + footH / 2, footH * 0.32);
  drawBarcode(ctx, barX, barY, barW, barH, '8 0413 2026 11');
  ctx.restore();
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// Sample render (used by the sample-render page): scene + its character.
export function renderSample(ctx, sceneId, grade, w, h) {
  const sc = sceneById(sceneId);
  drawScene(ctx, sceneId, 0, 0, w, h, grade);
  // the street runner stands left-of-centre in his sample: in the Split Heist
  // layout his panel is a wedge that narrows toward the diagonal, and a
  // character at 0.62w would be clipped away by the diagonal entirely
  const cx = sceneId === 'street' ? w * 0.40 : w * 0.62;
  drawCharacter(ctx, sc.char, cx, h * 0.97, h * 0.8);
  const g = gradeById(grade);
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, 'rgba(255,255,255,0)');
  wash.addColorStop(1, hexA(g.glow, 0.12));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
}

export async function exportPNG(state, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  renderCover(ctx, { ...state, W: w, H: h });
  return new Promise((res) => c.toBlob(res, 'image/png'));
}
