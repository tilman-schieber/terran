import { REGIONS } from './regions.js';
import { GOOGLE_MAPS_KEY } from './config.js';

const ROUNDS = 5;
const KEY_STORAGE = 'terran.apiKey';
const TIME_STORAGE = 'terran.timeLimit';
const TIME_LIMITS = [0, 10, 30, 60, 120, 300]; // seconds, 0 = no limit

const MODES = {
  move: { name: 'Move', look: true, walk: true },
  nm:   { name: 'No move', look: true, walk: false },
  nmpz: { name: 'Still', look: false, walk: false },
};

const $ = (id) => document.getElementById(id);

let sv;          // google.maps.StreetViewService
let svLib;       // streetView library namespace
let pano;        // google.maps.StreetViewPanorama
let map;         // google.maps.Map; the guess box grows to full screen for results
let guessMarker = null;
let resultOverlays = [];
let game = null; // { mode, timeLimit, round, results, usedRegions, start, trail, guess, phase }
let timer = null;

// ---------- storage ----------

function readKey() {
  const fromUrl = new URLSearchParams(location.search).get('key');
  if (fromUrl) return fromUrl;
  try { return localStorage.getItem(KEY_STORAGE) || GOOGLE_MAPS_KEY; } catch { return GOOGLE_MAPS_KEY; }
}
function readTimeLimit() {
  try { const t = Number(localStorage.getItem(TIME_STORAGE)); return TIME_LIMITS.includes(t) ? t : 0; } catch { return 0; }
}
function writeTimeLimit(t) {
  try { localStorage.setItem(TIME_STORAGE, String(t)); } catch {}
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
    // keep Street View's own controls clear of the guess map in the bottom right
    panControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
    zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
  });
  // remember every panorama walked to, so moves can be undone
  pano.addListener('pano_changed', () => {
    if (game?.phase !== 'guessing') return;
    const id = pano.getPano();
    if (game.trail.at(-1) !== id) game.trail.push(id);
  });
}

function configurePano(mode) {
  const m = MODES[mode];
  pano.setOptions({
    panControl: true, // the compass shows in every mode; in Still the freeze layer makes it read-only
    zoomControl: m.look,
    scrollwheel: m.look,
    linksControl: m.walk,
    clickToGo: m.walk,
    disableDoubleClickZoom: !m.walk,
    keyboardShortcuts: m.walk,
  });
  $('freeze').classList.toggle('hidden', m.look);
  $('walk-controls').classList.toggle('hidden', !m.walk);
}

// ---------- random location ----------

// pick a weighted region, skipping ones already used this game
function randomPoint(used) {
  let pool = REGIONS.filter((r) => !used.has(r.name));
  if (!pool.length) pool = REGIONS;
  let pick = Math.random() * pool.reduce((sum, r) => sum + r.w, 0);
  const r = pool.find((r) => (pick -= r.w) < 0) || pool[pool.length - 1];
  // uniform on the sphere within the box
  const [s, n] = [r.lat[0], r.lat[1]].map((d) => Math.sin(d * Math.PI / 180));
  const lat = Math.asin(s + Math.random() * (n - s)) * 180 / Math.PI;
  const lng = r.lng[0] + Math.random() * (r.lng[1] - r.lng[0]);
  return { lat, lng, region: r.name };
}

async function findPano(used) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const { region, ...location } = randomPoint(used);
    try {
      const { data } = await sv.getPanorama({
        location,
        radius: 50000,
        sources: [svLib.StreetViewSource.GOOGLE],
        preference: svLib.StreetViewPreference.NEAREST,
      });
      // official road coverage has links to neighbouring panoramas; lone photospheres don't
      if (data?.location?.pano && data.links?.length) {
        return { pano: data.location.pano, lat: data.location.latLng.lat(), lng: data.location.latLng.lng(), region };
      }
    } catch {
      // ZERO_RESULTS: try another spot
    }
  }
  throw new Error('Could not find any Street View coverage. Try again.');
}

// ---------- map ----------

const WORLD = { center: { lat: 20, lng: 0 }, zoom: 1 };
const dot = (fill, scale) => ({
  path: google.maps.SymbolPath.CIRCLE, scale, fillColor: fill, fillOpacity: 1, strokeColor: '#111', strokeWeight: 2,
});

async function initMap() {
  const { Map } = await google.maps.importLibrary('maps');
  map = new Map($('map'), {
    ...WORLD,
    minZoom: 1,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
    draggableCursor: 'crosshair',
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
  });
  map.addListener('click', (e) => placeGuess(e.latLng));
}

function placeGuess(latLng) {
  if (game?.phase !== 'guessing') return;
  game.guess = { lat: latLng.lat(), lng: latLng.lng() };
  if (guessMarker) guessMarker.setPosition(latLng);
  else guessMarker = new google.maps.Marker({ map, position: latLng, icon: dot('#fff', 7), clickable: false });
  $('guess-btn').disabled = false;
  $('guess-btn').textContent = 'Guess';
}

function clearMap() {
  if (guessMarker) { guessMarker.setMap(null); guessMarker = null; }
  resultOverlays.forEach((o) => o.setMap(null));
  resultOverlays = [];
}

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

const fmtKm = (km) => km == null ? 'no guess' : km < 1 ? `${Math.round(km * 1000)} m` : `${Math.round(km).toLocaleString('en')} km`;
const fmtPts = (p) => p.toLocaleString('en');
const fmtLimit = (t) => t < 60 ? `${t}s` : `${t / 60} min`;
const total = () => game.results.reduce((s, r) => s + r.points, 0);
const mapsLink = (p) => `https://www.google.com/maps/@?api=1&map_action=pano&pano=${encodeURIComponent(p.pano)}`;

// ---------- game flow ----------

function startGame(mode) {
  game = { mode, timeLimit: readTimeLimit(), round: 0, results: [], usedRegions: new Set(), phase: 'loading' };
  configurePano(mode);
  show('game');
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

  clearMap();
  $('game').classList.remove('showing-result');
  map.setOptions({ ...WORLD, draggableCursor: 'crosshair' });
  $('guess-btn').disabled = true;
  $('guess-btn').textContent = 'Place your guess';

  let place;
  try {
    place = await findPano(game.usedRegions);
  } catch (e) {
    $('loading').textContent = e.message;
    game.round--;
    setTimeout(() => show('menu'), 2500);
    return;
  }
  if (!game) return; // quit while loading

  game.usedRegions.add(place.region);
  game.start = { ...place, pov: { heading: Math.random() * 360, pitch: 0 } };
  game.trail = [place.pano];
  pano.setPano(place.pano);
  pano.setPov(game.start.pov);
  pano.setZoom(0);

  $('loading').classList.add('hidden');
  game.phase = 'guessing';
  startTimer();
}

// ---------- timer ----------

function startTimer() {
  stopTimer();
  if (!game.timeLimit) return;
  const deadline = Date.now() + game.timeLimit * 1000;
  const tick = () => {
    const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    $('hud-timer').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    $('hud-timer').classList.toggle('low', left <= 10);
    if (left === 0) submitGuess(true);
  };
  $('hud-timer').classList.remove('hidden');
  tick();
  timer = setInterval(tick, 250);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  $('hud-timer').classList.add('hidden');
}

function backToStart() {
  if (game?.phase !== 'guessing' || !MODES[game.mode].walk) return;
  game.trail = [game.start.pano];
  pano.setPano(game.start.pano);
  pano.setPov(game.start.pov);
  pano.setZoom(0);
}

function undoMove() {
  if (game?.phase !== 'guessing' || !MODES[game.mode].walk || game.trail.length < 2) return;
  game.trail.pop();
  pano.setPano(game.trail.at(-1));
}

// timedOut: the clock ran out, so submit whatever is there (nothing placed scores 0)
function submitGuess(timedOut = false) {
  if (game?.phase !== 'guessing' || (!game.guess && !timedOut)) return;
  stopTimer();
  game.phase = 'result';
  const km = game.guess ? distanceKm(game.guess, game.start) : null;
  const result = { actual: game.start, guess: game.guess, km, points: km == null ? 0 : score(km) };
  game.results.push(result);
  updateHud();
  showResult([result]);

  const last = game.round >= ROUNDS;
  $('result-text').innerHTML =
    `<div class="big">${fmtPts(result.points)} points</div>` +
    `<div class="muted">${km == null ? 'Time\'s up' : `${fmtKm(km)} away`} · <a href="${mapsLink(result.actual)}" target="_blank" rel="noopener">open in Google Maps</a></div>`;
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
    `<div class="muted">${MODES[game.mode].name}${game.timeLimit ? ` · ${fmtLimit(game.timeLimit)}` : ''}</div>` +
    `<table>${rows}</table>`;
  const mode = game.mode;
  setActions([['Menu', quit, false], ['Play again', () => startGame(mode)]]);
}

async function showResult(results) {
  $('result').classList.remove('hidden');
  $('game').classList.add('showing-result');
  clearMap();
  const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await frames(); // the result text is filled in by now
  $('game').style.setProperty('--bar', `${$('result').offsetHeight}px`);
  await frames(); // let the map pick up its new size before fitting the view
  map.setOptions({ draggableCursor: null });
  const bounds = new google.maps.LatLngBounds();
  for (const r of results) {
    resultOverlays.push(new google.maps.Marker({ map, position: r.actual, icon: dot('#ff5a36', 8), clickable: false }));
    bounds.extend(r.actual);
    if (!r.guess) continue;
    resultOverlays.push(
      new google.maps.Polyline({
        map, path: [r.guess, r.actual], geodesic: true, strokeOpacity: 0,
        icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#111', scale: 2 }, offset: '0', repeat: '12px' }],
      }),
      new google.maps.Marker({ map, position: r.guess, icon: dot('#fff', 7), clickable: false }),
    );
    bounds.extend(r.guess);
  }
  if (results.length === 1 && !results[0].guess) {
    map.setCenter(results[0].actual);
    map.setZoom(4);
    return;
  }
  map.fitBounds(bounds, 60);
  google.maps.event.addListenerOnce(map, 'idle', () => { if (map.getZoom() > 14) map.setZoom(14); });
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
  stopTimer();
  game = null;
  $('game').classList.remove('showing-result');
  show('menu');
}

// ---------- wiring ----------

document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => startGame(b.dataset.mode)));
$('guess-btn').addEventListener('click', () => submitGuess());
$('to-start').addEventListener('click', backToStart);
$('undo').addEventListener('click', undoMove);

function renderTimeLimits() {
  const current = readTimeLimit();
  $('time-limits').replaceChildren(...TIME_LIMITS.map((t) => {
    const b = document.createElement('button');
    b.textContent = t ? fmtLimit(t) : 'off';
    b.classList.toggle('selected', t === current);
    b.onclick = () => { writeTimeLimit(t); renderTimeLimits(); };
    return b;
  }));
}
renderTimeLimits();
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
  } else if (e.key === 'z' || e.key === 'Z') {
    undoMove();
  }
});

// ---------- boot ----------

(async () => {
  const key = readKey();
  if (!key) return showKeyScreen();
  try {
    await loadGoogle(key);
    await initGoogle();
    await initMap();
  } catch (e) {
    return showKeyScreen(e.message);
  }
  show('menu');
})();
