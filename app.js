import { REGIONS } from './regions.js';
import { GOOGLE_MAPS_KEY } from './config.js';

const ROUNDS = 5;
const KEY_STORAGE = 'terran.apiKey';
const TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const MODES = {
  move: { name: 'Move', look: true, walk: true },
  nm:   { name: 'No move', look: true, walk: false },
  nmpz: { name: 'Still', look: false, walk: false },
};

const $ = (id) => document.getElementById(id);

let sv;          // google.maps.StreetViewService
let svLib;       // streetView library namespace
let pano;        // google.maps.StreetViewPanorama
let guessMap, resultMap;
let guessMarker = null;
let resultLayer = null;
let game = null; // { mode, round, results, start, guess, phase }

// ---------- storage ----------

function readKey() {
  const fromUrl = new URLSearchParams(location.search).get('key');
  if (fromUrl) return fromUrl;
  try { return localStorage.getItem(KEY_STORAGE) || GOOGLE_MAPS_KEY; } catch { return GOOGLE_MAPS_KEY; }
}
function writeKey(key) {
  try { key ? localStorage.setItem(KEY_STORAGE, key) : localStorage.removeItem(KEY_STORAGE); } catch {}
}

// ---------- screens ----------

function show(id) {
  for (const s of ['menu', 'keyscreen', 'game']) $(s).classList.toggle('hidden', s !== id);
}

function showKeyScreen(error) {
  $('key-error').textContent = error || '';
  $('key-error').classList.toggle('hidden', !error);
  show('keyscreen');
  $('key-input').focus();
}

// ---------- google maps ----------

function loadGoogle(key) {
  return new Promise((resolve, reject) => {
    window.gm_authFailure = () => {
      writeKey(null);
      showKeyScreen('Google rejected that key. Check that the Maps JavaScript API is enabled for it.');
    };
    window.__terranGoogleReady = resolve;
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__terranGoogleReady`;
    s.onerror = () => reject(new Error('Could not load Google Maps.'));
    document.head.append(s);
  });
}

async function initGoogle() {
  svLib = await google.maps.importLibrary('streetView');
  sv = new svLib.StreetViewService();
  pano = new svLib.StreetViewPanorama($('pano'), {
    visible: true,
    addressControl: false,
    showRoadLabels: false,
    fullscreenControl: false,
    enableCloseButton: false,
    motionTracking: false,
    motionTrackingControl: false,
    imageDateControl: false,
  });
}

function configurePano(mode) {
  const m = MODES[mode];
  pano.setOptions({
    panControl: m.look,
    zoomControl: m.look,
    scrollwheel: m.look,
    linksControl: m.walk,
    clickToGo: m.walk,
    disableDoubleClickZoom: !m.walk,
    keyboardShortcuts: m.walk,
  });
  $('freeze').classList.toggle('hidden', m.look);
  $('to-start').classList.toggle('hidden', !m.walk);
}

// ---------- random location ----------

const totalWeight = REGIONS.reduce((sum, r) => sum + r.w, 0);

function randomPoint() {
  let pick = Math.random() * totalWeight;
  const r = REGIONS.find((r) => (pick -= r.w) < 0) || REGIONS[REGIONS.length - 1];
  // uniform on the sphere within the box
  const [s, n] = [r.lat[0], r.lat[1]].map((d) => Math.sin(d * Math.PI / 180));
  const lat = Math.asin(s + Math.random() * (n - s)) * 180 / Math.PI;
  const lng = r.lng[0] + Math.random() * (r.lng[1] - r.lng[0]);
  return { lat, lng };
}

async function findPano() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const { data } = await sv.getPanorama({
        location: randomPoint(),
        radius: 50000,
        sources: [svLib.StreetViewSource.GOOGLE],
        preference: svLib.StreetViewPreference.NEAREST,
      });
      // official road coverage has links to neighbouring panoramas; lone photospheres don't
      if (data?.location?.pano && data.links?.length) {
        return { pano: data.location.pano, lat: data.location.latLng.lat(), lng: data.location.latLng.lng() };
      }
    } catch {
      // ZERO_RESULTS: try another spot
    }
  }
  throw new Error('Could not find any Street View coverage. Try again.');
}

// ---------- maps ----------

function initMaps() {
  guessMap = L.map('guess-map', { worldCopyJump: true, zoomControl: false, attributionControl: false })
    .setView([20, 0], 1);
  L.tileLayer(TILES, { maxZoom: 18 }).addTo(guessMap);
  guessMap.on('click', (e) => placeGuess(e.latlng.wrap()));
  $('guess-box').addEventListener('transitionend', () => guessMap.invalidateSize());

  resultMap = L.map('result-map', { worldCopyJump: true });
  L.tileLayer(TILES, { maxZoom: 18, attribution: TILE_ATTRIBUTION }).addTo(resultMap);
}

function placeGuess(latlng) {
  if (game?.phase !== 'guessing') return;
  game.guess = { lat: latlng.lat, lng: latlng.lng };
  if (guessMarker) guessMarker.setLatLng(latlng);
  else guessMarker = L.circleMarker(latlng, guessStyle).addTo(guessMap);
  $('guess-btn').disabled = false;
  $('guess-btn').textContent = 'Guess';
}

const guessStyle = { radius: 7, color: '#111', weight: 2, fillColor: '#fff', fillOpacity: 1 };
const actualStyle = { radius: 8, color: '#111', weight: 2, fillColor: '#ff5a36', fillOpacity: 1 };

// ---------- scoring ----------

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function score(km) {
  if (km < 0.025) return 5000;
  return Math.round(5000 * Math.exp(-km / 1492.7));
}

const fmtKm = (km) => km < 1 ? `${Math.round(km * 1000)} m` : `${Math.round(km).toLocaleString('en')} km`;
const fmtPts = (p) => p.toLocaleString('en');
const total = () => game.results.reduce((s, r) => s + r.points, 0);
const mapsLink = (p) => `https://www.google.com/maps/@?api=1&map_action=pano&pano=${encodeURIComponent(p.pano)}`;

// ---------- game flow ----------

function startGame(mode) {
  game = { mode, round: 0, results: [], phase: 'loading' };
  configurePano(mode);
  show('game');
  guessMap.invalidateSize();
  nextRound();
}

async function nextRound() {
  game.round++;
  game.phase = 'loading';
  game.guess = null;
  $('result').classList.add('hidden');
  $('loading').classList.remove('hidden');
  $('loading').textContent = 'finding a place…';
  updateHud();

  if (guessMarker) { guessMarker.remove(); guessMarker = null; }
  $('guess-btn').disabled = true;
  $('guess-btn').textContent = 'Place your guess';
  guessMap.setView([20, 0], 1);

  let place;
  try {
    place = await findPano();
  } catch (e) {
    $('loading').textContent = e.message;
    game.round--;
    setTimeout(() => show('menu'), 2500);
    return;
  }
  if (!game) return; // quit while loading

  game.start = { ...place, pov: { heading: Math.random() * 360, pitch: 0 } };
  pano.setPano(place.pano);
  pano.setPov(game.start.pov);
  pano.setZoom(game.mode === 'nmpz' ? 0.5 : 0);

  $('loading').classList.add('hidden');
  game.phase = 'guessing';
}

function backToStart() {
  if (game?.phase !== 'guessing' || !MODES[game.mode].walk) return;
  pano.setPano(game.start.pano);
  pano.setPov(game.start.pov);
  pano.setZoom(0);
}

function submitGuess() {
  if (game?.phase !== 'guessing' || !game.guess) return;
  game.phase = 'result';
  const km = distanceKm(game.guess, game.start);
  const result = { actual: game.start, guess: game.guess, km, points: score(km) };
  game.results.push(result);
  updateHud();
  showResult([result]);

  const last = game.round >= ROUNDS;
  $('result-text').innerHTML =
    `<div class="big">${fmtPts(result.points)} points</div>` +
    `<div class="muted">${fmtKm(km)} away · <a href="${mapsLink(result.actual)}" target="_blank" rel="noopener">open in Google Maps</a></div>`;
  setActions([[last ? 'Final score' : 'Next round', last ? showSummary : nextRound]]);
}

function showSummary() {
  game.phase = 'summary';
  showResult(game.results);
  const rows = game.results.map((r, i) =>
    `<tr><td>${i + 1}</td><td>${fmtPts(r.points)}</td><td>${fmtKm(r.km)}</td>` +
    `<td><a href="${mapsLink(r.actual)}" target="_blank" rel="noopener">view</a></td></tr>`).join('');
  $('result-text').innerHTML =
    `<div class="big">${fmtPts(total())} / ${fmtPts(ROUNDS * 5000)}</div>` +
    `<div class="muted">${MODES[game.mode].name}</div><table>${rows}</table>`;
  const mode = game.mode;
  setActions([['Menu', quit, false], ['Play again', () => startGame(mode)]]);
}

function showResult(results) {
  $('result').classList.remove('hidden');
  resultMap.invalidateSize();
  if (resultLayer) resultLayer.remove();
  resultLayer = L.layerGroup().addTo(resultMap);
  const points = [];
  for (const r of results) {
    const actual = [r.actual.lat, r.actual.lng];
    // draw the guess on the same world copy as the actual location so the line takes the short way
    let glng = r.guess.lng;
    if (glng - r.actual.lng > 180) glng -= 360;
    if (r.actual.lng - glng > 180) glng += 360;
    const guess = [r.guess.lat, glng];
    L.polyline([guess, actual], { color: '#111', weight: 2, dashArray: '6 6' }).addTo(resultLayer);
    L.circleMarker(guess, guessStyle).addTo(resultLayer);
    L.circleMarker(actual, actualStyle).addTo(resultLayer);
    points.push(guess, actual);
  }
  resultMap.fitBounds(points, { padding: [60, 60], maxZoom: 14 });
}

function setActions(actions) {
  const box = $('result-actions');
  box.replaceChildren(...actions.map(([label, fn, primary = true]) => {
    const b = document.createElement('button');
    b.textContent = label;
    if (primary) b.className = 'primary';
    b.onclick = fn;
    return b;
  }));
}

function updateHud() {
  $('hud-round').textContent = `Round ${Math.min(game.round, ROUNDS)} / ${ROUNDS}`;
  $('hud-score').textContent = `${fmtPts(total())} pts`;
}

function quit() {
  game = null;
  show('menu');
}

// ---------- wiring ----------

document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => startGame(b.dataset.mode)));
$('guess-btn').addEventListener('click', submitGuess);
$('to-start').addEventListener('click', backToStart);
$('quit').addEventListener('click', quit);
$('change-key').addEventListener('click', () => { writeKey(null); location.reload(); });
$('key-form').addEventListener('submit', (e) => {
  e.preventDefault();
  writeKey($('key-input').value.trim());
  location.reload();
});

document.addEventListener('keydown', (e) => {
  if (!game || e.target.tagName === 'INPUT') return;
  if (e.key === ' ' || e.key === 'Enter') {
    if (game.phase === 'guessing' && game.guess) { e.preventDefault(); submitGuess(); }
    else if (game.phase === 'result' || game.phase === 'summary') {
      e.preventDefault();
      $('result-actions').lastElementChild?.click();
    }
  } else if (e.key === 'r' || e.key === 'R') {
    backToStart();
  }
});

// ---------- boot ----------

(async () => {
  const key = readKey();
  if (!key) return showKeyScreen();
  try {
    await loadGoogle(key);
    await initGoogle();
  } catch (e) {
    return showKeyScreen(e.message);
  }
  initMaps();
  show('menu');
})();
