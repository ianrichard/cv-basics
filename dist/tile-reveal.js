// Staggered tile reveal for a detection box element. A temporary canvas inside the box
// draws the tiles and border trace, then crossfades to the box's normal CSS appearance.
// Tiles land on the same fixed 8 px grid as the settled CSS background (1 px gap at each
// tile's top/left, anchored to the padding box), so the handoff is seamless.
// One shared animation frame loop runs only while reveals are active.
const DEFAULTS = { tileSize: 8, tileGap: 1, stagger: 700, tileFade: 220, jitter: .25, flash: .6, fillOpacity: .12, borderOpacity: .9, border: 3, radius: 17, settle: 250 };
const active = new Set();
let raf = 0;
const ease = t => 1 - (1 - t) ** 3;
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
// Stable per-tile noise so tiles don't reshuffle as the box resizes.
const noise = (i, j, s) => { const v = Math.sin(i * 12.9898 + j * 78.233 + s) * 43758.5453; return v - Math.floor(v) };

export function reveal(el, color, options = {}) {
 const canvas = document.createElement('canvas');
 canvas.className = 'tile-reveal';
 el.classList.add('revealing');
 el.prepend(canvas);
 const rgb = color.match(/[0-9a-f]{2}/gi).map(h => parseInt(h, 16));
 active.add({ el, canvas, ctx: canvas.getContext('2d'), rgb, start: performance.now(), seed: Math.random() * 100, opts: { ...DEFAULTS, ...options } });
 if (!raf) raf = requestAnimationFrame(frame);
}

function frame(now) {
 raf = 0;
 const dpr = Math.min(2, devicePixelRatio || 1);
 for (const r of active) {
  if (!r.el.isConnected) { active.delete(r); continue }
  const o = r.opts, t = now - r.start, end = o.stagger + o.tileFade;
  if (t >= end) { finish(r); continue }
  const w = r.el.offsetWidth, h = r.el.offsetHeight;
  if (!w || !h) continue;
  const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
  if (r.canvas.width !== cw || r.canvas.height !== ch) { r.canvas.width = cw; r.canvas.height = ch } else r.ctx.clearRect(0, 0, cw, ch);
  draw(r, t, w, h, dpr);
 }
 if (active.size) raf = requestAnimationFrame(frame);
}

function draw({ ctx: c, rgb: [r, g, b], seed, opts: o }, t, w, h, dpr) {
 const B = o.border, T = o.tileSize, G = o.tileGap, S = o.stagger, D = o.tileFade;
 const iw = w - 2 * B, ih = h - 2 * B, cols = Math.ceil(iw / T), rows = Math.ceil(ih / T);
 c.setTransform(dpr, 0, 0, dpr, 0, 0);
 c.save();
 roundRect(c, B, B, iw, ih, Math.max(0, o.radius - B));
 c.clip();
 c.fillStyle = `rgb(${r},${g},${b})`;
 for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
  const n = noise(i, j, seed), nx = cols > 1 ? i / (cols - 1) : 0, ny = rows > 1 ? j / (rows - 1) : 0;
  const p = clamp01((t - ((nx + ny) / 2 * (1 - o.jitter) + n * o.jitter) * S) / D);
  if (p <= 0) continue;
  c.globalAlpha = Math.min(1, ease(p) * o.fillOpacity + Math.sin(p * Math.PI) * o.flash * .7);
  c.fillRect(B + i * T + G, B + j * T + G, T - G, T - G);
 }
 c.restore();
 // Border traces on once the tiles are underway.
 const bp = ease(clamp01((t - S * .5) / (S * .5 + D)));
 if (bp > 0) {
  c.globalAlpha = bp * o.borderOpacity;
  c.strokeStyle = `rgb(${r},${g},${b})`;
  c.lineWidth = B;
  roundRect(c, B / 2, B / 2, w - B, h - B, o.radius - B / 2);
  c.setLineDash([Math.max(1, 2 * (w + h) * bp), 1e5]);
  c.stroke();
  c.setLineDash([]);
 }
 c.globalAlpha = 1;
}

function roundRect(c, x, y, w, h, radius) {
 const rr = Math.max(0, Math.min(radius, w / 2, h / 2));
 c.beginPath();
 c.moveTo(x + rr, y);
 c.arcTo(x + w, y, x + w, y + h, rr);
 c.arcTo(x + w, y + h, x, y + h, rr);
 c.arcTo(x, y + h, x, y, rr);
 c.arcTo(x, y, x + w, y, rr);
 c.closePath();
}

function finish(r) {
 active.delete(r);
 r.el.classList.remove('revealing');
 r.canvas.style.opacity = '0';
 setTimeout(() => r.canvas.remove(), r.opts.settle);
}
