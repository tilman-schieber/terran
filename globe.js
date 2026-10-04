// The menu logo: a wireframe globe drawn in SVG, slowly turning.
const RAD = Math.PI / 180;
const SIZE = 64;
const C = SIZE / 2;
const R = C - 2;
const TILT = 20 * RAD;          // north pole leans toward the viewer
const SECONDS_PER_TURN = 30;
const PIN = { lat: 48, lng: 10 }; // the accent dot

const range = (from, to, step) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

// graticule lines as [lat, lng] point lists
const LINES = [
  ...range(-180, 150, 30).map((lng) => range(-90, 90, 5).map((lat) => [lat, lng])),
  ...range(-60, 60, 30).map((lat) => range(-180, 180, 5).map((lng) => [lat, lng])),
];

// orthographic projection after turning the globe by `spin` radians
function project(lat, lng, spin) {
  const phi = lat * RAD;
  const lambda = lng * RAD + spin;
  const x = Math.cos(phi) * Math.sin(lambda);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(lambda);
  return [C + R * x, C - R * (y * Math.cos(TILT) - z * Math.sin(TILT)), y * Math.sin(TILT) + z * Math.cos(TILT)];
}

export function mountGlobe(svg) {
  const ns = 'http://www.w3.org/2000/svg';
  const el = (tag, cls) => {
    const e = document.createElementNS(ns, tag);
    e.setAttribute('class', cls);
    svg.append(e);
    return e;
  };
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  const back = el('path', 'globe-back');
  const rim = el('circle', 'globe-rim');
  const front = el('path', 'globe-front');
  const pin = el('circle', 'globe-pin');
  rim.setAttribute('cx', C);
  rim.setAttribute('cy', C);
  rim.setAttribute('r', R);
  pin.setAttribute('r', 2.4);

  function draw(spin) {
    const d = { front: '', back: '' };
    for (const line of LINES) {
      let side = null;
      for (const [lat, lng] of line) {
        const [x, y, z] = project(lat, lng, spin);
        const s = z >= 0 ? 'front' : 'back';
        const pt = `${x.toFixed(2)} ${y.toFixed(2)}`;
        if (side && s !== side) d[side] += `L${pt}`; // run the old side up to the horizon
        d[s] += `${s === side ? 'L' : 'M'}${pt}`;
        side = s;
      }
    }
    front.setAttribute('d', d.front);
    back.setAttribute('d', d.back);
    const [px, py, pz] = project(PIN.lat, PIN.lng, spin);
    pin.setAttribute('cx', px.toFixed(2));
    pin.setAttribute('cy', py.toFixed(2));
    pin.style.opacity = pz >= 0 ? 1 : 0;
  }

  draw(0);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = performance.now();
  const tick = (now) => {
    if (svg.getClientRects().length) draw((((now - start) / 1000) / SECONDS_PER_TURN) * 2 * Math.PI);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
