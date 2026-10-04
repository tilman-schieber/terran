import { REGIONS } from './regions.js';
import { THEMES, CONTINENTS, DAILY, themeById } from './themes.js';
import { GOOGLE_MAPS_KEY } from './config.js';

const ROUNDS = 5;
const KEY_STORAGE = 'terran.apiKey';
const TIME_STORAGE = 'terran.timeLimit';
const THEME_STORAGE = 'terran.theme';
const DAILY_STORAGE = 'terran.daily.'; // + date
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
let game = null; // see startGame
let timer = null;
let challenge = null; // decoded challenge link waiting on the menu

// ---------- storage ----------

function load(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function save(key, value) {
  try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, String(value)); } catch {}
}

function readKey() {
  return new URLSearchParams(location.search).get('key') || load(KEY_STORAGE) || GOOGLE_MAPS_KEY;
}
function readTimeLimit() {
  const t = Number(load(TIME_STORAGE));
  return TIME_LIMITS.includes(t) ? t : 0;
}
function readTheme() {
  return themeById(load(THEME_STORAGE)) || THEMES[0];
}

// ---------- seeded random ----------

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// mulberry32: small, fast, good enough to pick places
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- screens ----------

function show(id) {
  for (const s of ['menu', 'keyscreen', 'game']) $(s).classList.toggle('hidden', s !== id);
  if (id === 'menu') renderMenu();
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
      save(KEY_STORAGE, null);
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

// ---------- picking places ----------

const RAD = Math.PI / 180;

// move a point `km` kilometres in direction `deg`
function offset(p, km, deg) {
  const dLat = (km / 111.32) * Math.cos(deg * RAD);
  const dLng = (km / (111.32 * Math.cos(p.lat * RAD))) * Math.sin(deg * RAD);
  return { lat: p.lat + dLat, lng: p.lng + dLng };
}

function bearing(from, to) {
  const dLng = (to.lng - from.lng) * RAD;
  const y = Math.sin(dLng) * Math.cos(to.lat * RAD);
  const x = Math.cos(from.lat * RAD) * Math.sin(to.lat * RAD) -
    Math.sin(from.lat * RAD) * Math.cos(to.lat * RAD) * Math.cos(dLng);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}

// one candidate spot for this round; `key` names the box or place so a game doesn't repeat it
function pickSpot() {
  const { theme, rng, used } = game;
  const unused = (list) => {
    const fresh = list.filter((x) => !used.has(x.name));
    return fresh.length ? fresh : list;
  };

  if (theme.kind === 'points') {
    const pool = unused(theme.points);
    const place = pool[Math.floor(rng() * pool.length)];
    const at = theme.jitterKm ? offset(place, theme.jitterKm * Math.sqrt(rng()), rng() * 360) : place;
    return { lat: at.lat, lng: at.lng, key: place.name, target: theme.face ? place : null };
  }

  const regions = theme.kind === 'continents'
    ? REGIONS.filter((r) => r.c === game.continents[game.round - 1])
    : theme.regions;
  const pool = unused(regions);
  let pick = rng() * pool.reduce((sum, r) => sum + r.w, 0);
  const r = pool.find((r) => (pick -= r.w) < 0) || pool[pool.length - 1];
  // uniform on the sphere within the box
  const [s, n] = [r.lat[0], r.lat[1]].map((d) => Math.sin(d * RAD));
  const lat = Math.asin(s + rng() * (n - s)) / RAD;
  const lng = r.lng[0] + rng() * (r.lng[1] - r.lng[0]);
  return { lat, lng, key: r.name };
}

const where = (data) => ({ pano: data.location.pano, lat: data.location.latLng.lat(), lng: data.location.latLng.lng() });

async function findRound() {
  // challenge links carry the exact panoramas
  if (game.preset) {
    const [id, heading] = game.preset[game.round - 1];
    try {
      const { data } = await sv.getPanorama({ pano: id });
      return { ...where(data), heading };
    } catch {
      throw new Error('This place is no longer on Street View.');
    }
  }

  for (let attempt = 0; attempt < 100; attempt++) {
    const spot = pickSpot();
    let data;
    try {
      ({ data } = await sv.getPanorama({
        location: { lat: spot.lat, lng: spot.lng },
        radius: game.theme.radius,
        sources: [svLib.StreetViewSource.GOOGLE],
        preference: svLib.StreetViewPreference.NEAREST,
      }));
    } catch {
      continue; // ZERO_RESULTS: try another spot
    }
    // official road coverage has links to neighbouring panoramas; lone photospheres don't
    if (!data?.location?.pano || !data.links?.length) continue;
    const place = where(data);
    const heading = spot.target ? bearing(place, spot.target) : game.rng() * 360;
    return { ...place, heading, key: spot.key };
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
  const dLat = (b.lat - a.lat) * RAD;
  const dLng = (b.lng - a.lng) * RAD;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLng / 2) ** 2;
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
const describe = (themeName, mode, limit) => [themeName, MODES[mode].name, limit ? fmtLimit(limit) : ''].filter(Boolean).join(' · ');
const today = () => new Date().toISOString().slice(0, 10); // UTC, so everyone shares the same day

// ---------- game flow ----------

// opts: { theme, mode, timeLimit, rng?, preset?, daily?, challenge? }
function startGame(opts) {
  const rng = opts.rng || Math.random;
  game = {
    ...opts,
    rng,
    round: 0,
    results: [],
    used: new Set(),
    continents: opts.theme.kind === 'continents' ? shuffle(CONTINENTS, rng) : null,
    phase: 'loading',
  };
  configurePano(game.mode);
  show('game');
  nextRound();
}

function playDaily() {
  const date = today();
  const theme = themeById(DAILY.themes[hashString(date) % DAILY.themes.length]);
  startGame({ theme, mode: DAILY.mode, timeLimit: DAILY.timeLimit, rng: seededRandom(hashString(`terran-daily-${date}`)), daily: date });
}

function playChallenge() {
  const c = challenge;
  challenge = null;
  startGame({ theme: themeById(c.t) || THEMES[0], mode: c.m, timeLimit: c.l, preset: c.r, challenge: c });
}

async function nextRound() {
  if (game.round > 0 && game.phase !== 'result') return; // a double click or held key
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

  const current = game;
  let place;
  try {
    place = await findRound();
  } catch (e) {
    if (game !== current) return;
    stopTimer();
    $('loading').textContent = e.message || 'Could not load this place.';
    game = null;
    setTimeout(() => show('menu'), 2500);
    return;
  }
  if (game !== current) return; // quit while loading

  if (place.key) game.used.add(place.key);
  game.start = { ...place, pov: { heading: place.heading, pitch: 0 } };
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

// ---------- moving ----------

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

// ---------- results ----------

// timedOut: the clock ran out, so submit whatever is there (nothing placed scores 0)
function submitGuess(timedOut = false) {
  if (game?.phase !== 'guessing' || (!game.guess && !timedOut)) return;
  stopTimer();
  game.phase = 'result';
  const km = game.guess ? distanceKm(game.guess, game.start) : null;
  const result = { actual: game.start, guess: game.guess, km, points: km == null ? 0 : score(km) };
  game.results.push(result);
  updateHud();

  const last = game.round >= ROUNDS;
  $('result-text').innerHTML =
    `<div class="big">${fmtPts(result.points)} points</div>` +
    `<div class="muted">${km == null ? 'Time\'s up' : `${fmtKm(km)} away`} · <a href="${mapsLink(result.actual)}" target="_blank" rel="noopener">open in Google Maps</a></div>`;
  setActions([[last ? 'Final score' : 'Next round', last ? showSummary : nextRound]]);
  showResult([result]);
}

function showSummary() {
  if (game.phase !== 'result') return;
  game.phase = 'summary';
  const points = total();
  const rows = game.results.map((r, i) =>
    `<tr><td>${i + 1}</td><td>${fmtPts(r.points)}</td><td>${fmtKm(r.km)}</td>` +
    `<td><a href="${mapsLink(r.actual)}" target="_blank" rel="noopener">view</a></td></tr>`).join('');
  let note = '';
  if (game.challenge) {
    const theirs = game.challenge.s;
    note = `<div class="verdict">${points > theirs ? 'You win' : points < theirs ? 'They win' : 'A draw'}: ` +
      `${fmtPts(points)} vs ${fmtPts(theirs)}</div>`;
  }
  $('result-text').innerHTML =
    `<div class="big">${fmtPts(points)} / ${fmtPts(ROUNDS * 5000)}</div>` +
    `<div class="muted">${game.daily ? `Daily ${game.daily} · ` : ''}${describe(game.theme.name, game.mode, game.timeLimit)}</div>` +
    note + `<table>${rows}</table>`;

  if (game.daily) {
    if (load(DAILY_STORAGE + game.daily) == null) save(DAILY_STORAGE + game.daily, points);
    setActions([['Menu', quit, false], ['Copy result', (e) => copy(e.target, dailyText(game.daily, points))]]);
  } else {
    const { theme, mode, timeLimit } = game;
    setActions([
      ['Menu', quit, false],
      ['Copy challenge link', (e) => copy(e.target, challengeLink()), false],
      ['Play again', () => startGame({ theme, mode, timeLimit })],
    ]);
  }
  showResult(game.results);
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
  $('hud-theme').textContent = game.daily ? 'Daily' : game.challenge ? 'Challenge' : game.theme.name;
  $('hud-round').textContent = `Round ${Math.min(game.round, ROUNDS)} / ${ROUNDS}`;
  $('hud-score').textContent = `${fmtPts(total())} pts`;
}

function quit() {
  stopTimer();
  game = null;
  $('game').classList.remove('showing-result');
  show('menu');
}

// ---------- sharing ----------

const siteUrl = () => location.origin + location.pathname;

function dailyText(date, points) {
  return `terran daily ${date}: ${fmtPts(points)} / ${fmtPts(ROUNDS * 5000)}\n${siteUrl()}`;
}

function challengeLink() {
  const data = {
    t: game.theme.id, m: game.mode, l: game.timeLimit, s: total(),
    r: game.results.map((r) => [r.actual.pano, Math.round(r.actual.pov.heading)]),
  };
  const encoded = btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${siteUrl()}#c=${encoded}`;
}

function readChallenge() {
  const m = location.hash.match(/^#c=([\w-]+)$/);
  if (!m) return null;
  history.replaceState(null, '', location.pathname + location.search);
  try {
    const c = JSON.parse(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')));
    const valid = MODES[c.m] && TIME_LIMITS.includes(c.l) && Number.isInteger(c.s) &&
      Array.isArray(c.r) && c.r.length === ROUNDS &&
      c.r.every(([id, h]) => typeof id === 'string' && /^[\w-]{1,100}$/.test(id) && Number.isFinite(h));
    return valid ? c : null;
  } catch {
    return null;
  }
}

async function copy(button, text) {
  const label = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
  } catch {
    // no clipboard access: show the text so it can be copied by hand
    const out = document.createElement('input');
    out.value = text;
    out.readOnly = true;
    out.className = 'copy-out';
    $('result-text').append(out);
    out.select();
    button.textContent = 'Copy it below';
  }
  setTimeout(() => { button.textContent = label; }, 2000);
}

// ---------- menu ----------

function renderMenu() {
  renderChallengeCard();
  renderDailyCard();
  renderThemes();
  renderTimeLimits();
}

function renderChallengeCard() {
  $('challenge-card').classList.toggle('hidden', !challenge);
  if (!challenge) return;
  $('challenge-text').textContent =
    `${describe((themeById(challenge.t) || THEMES[0]).name, challenge.m, challenge.l)} · beat ${fmtPts(challenge.s)}`;
}

function renderDailyCard() {
  const date = today();
  const theme = themeById(DAILY.themes[hashString(date) % DAILY.themes.length]);
  const played = load(DAILY_STORAGE + date);
  $('daily-text').textContent = `${date} · ${describe(theme.name, DAILY.mode, DAILY.timeLimit)}` +
    (played != null ? ` · you scored ${fmtPts(Number(played))}` : '');
  const btn = $('daily-btn');
  if (played != null) {
    btn.textContent = 'Copy result';
    btn.onclick = () => copy(btn, dailyText(date, Number(played)));
  } else {
    btn.textContent = 'Play';
    btn.onclick = playDaily;
  }
}

function renderThemes() {
  const current = readTheme();
  const groups = [...new Set(THEMES.map((t) => t.group))];
  $('themes').replaceChildren(...groups.map((g) => {
    const row = document.createElement('div');
    row.className = 'theme-row';
    if (g) {
      const label = document.createElement('span');
      label.textContent = g;
      row.append(label);
    }
    for (const t of THEMES.filter((t) => t.group === g)) {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = t.name;
      b.classList.toggle('selected', t === current);
      b.onclick = () => { save(THEME_STORAGE, t.id); renderThemes(); };
      row.append(b);
    }
    return row;
  }));
}

function renderTimeLimits() {
  const current = readTimeLimit();
  $('time-limits').replaceChildren(...TIME_LIMITS.map((t) => {
    const b = document.createElement('button');
    b.textContent = t ? fmtLimit(t) : 'off';
    b.classList.toggle('selected', t === current);
    b.onclick = () => { save(TIME_STORAGE, t); renderTimeLimits(); };
    return b;
  }));
}

// ---------- wiring ----------

document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () =>
  startGame({ theme: readTheme(), mode: b.dataset.mode, timeLimit: readTimeLimit() })));
$('challenge-btn').addEventListener('click', playChallenge);
$('challenge-skip').addEventListener('click', () => { challenge = null; renderChallengeCard(); });
$('guess-btn').addEventListener('click', () => submitGuess());
$('to-start').addEventListener('click', backToStart);
$('undo').addEventListener('click', undoMove);
$('quit').addEventListener('click', quit);
$('key-form').addEventListener('submit', (e) => {
  e.preventDefault();
  save(KEY_STORAGE, $('key-input').value.trim());
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
  challenge = readChallenge();
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
