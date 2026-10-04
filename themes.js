import { REGIONS, ISLANDS, NOWHERE, NEIGHBOURS } from './regions.js';
import { CAPITALS, BIG_CITIES, LANDMARKS } from './places.js';

// A theme says where rounds come from:
//   boxes:      a weighted random box, then the nearest panorama within `radius` metres
//   points:     a named place, moved up to `jitterKm` in a random direction, then the nearest panorama
//   continents: one round per continent, using the world boxes
// A game never uses the same box or place twice.
const continent = (c) => REGIONS.filter((r) => r.c === c);

export const CONTINENTS = ['Europe', 'Asia', 'Africa', 'Americas', 'Oceania'];

export const THEMES = [
  { id: 'world', name: 'World', group: '', kind: 'boxes', regions: REGIONS, radius: 50000 },

  { id: 'capitals', name: 'Capitals', group: 'Places', kind: 'points', points: CAPITALS, jitterKm: 4, radius: 1000 },
  { id: 'cities', name: 'Big cities', group: 'Places', kind: 'points', points: BIG_CITIES, jitterKm: 10, radius: 1000 },
  { id: 'landmarks', name: 'Landmarks', group: 'Places', kind: 'points', points: LANDMARKS, jitterKm: 0, radius: 800, face: true },
  { id: 'islands', name: 'Islands', group: 'Places', kind: 'boxes', regions: ISLANDS, radius: 8000 },
  { id: 'nowhere', name: 'Middle of nowhere', group: 'Places', kind: 'boxes', regions: NOWHERE, radius: 50000 },

  { id: 'continents', name: 'Five continents', group: 'Regions', kind: 'continents', radius: 50000 },
  ...CONTINENTS.map((c) => ({
    id: c.toLowerCase(), name: c, group: 'Regions', kind: 'boxes', regions: continent(c), radius: 50000,
  })),

  { id: 'nordics', name: 'Nordics', group: 'Tricky neighbours', kind: 'boxes', regions: NEIGHBOURS.nordics, radius: 50000 },
  { id: 'baltics', name: 'Baltics', group: 'Tricky neighbours', kind: 'boxes', regions: NEIGHBOURS.baltics, radius: 30000 },
  { id: 'balkans', name: 'Balkans', group: 'Tricky neighbours', kind: 'boxes', regions: NEIGHBOURS.balkans, radius: 30000 },
  { id: 'andes', name: 'Andes', group: 'Tricky neighbours', kind: 'boxes', regions: NEIGHBOURS.andes, radius: 50000 },
  { id: 'seasia', name: 'Southeast Asia', group: 'Tricky neighbours', kind: 'boxes', regions: NEIGHBOURS.seasia, radius: 30000 },
  { id: 'anglosphere', name: 'Anglosphere', group: 'Tricky neighbours', kind: 'boxes', regions: NEIGHBOURS.anglosphere, radius: 50000 },
];

export const themeById = (id) => THEMES.find((t) => t.id === id);

// Ready-made games on the menu. The first one is the big Play button.
// theme 'lookalikes' picks one of the tricky neighbour groups at random each game.
export const PRESETS = [
  { id: 'classic', name: 'Classic', blurb: 'Anywhere in the world. Walk around.', theme: 'world', mode: 'move', timeLimit: 120 },
  { id: 'sightseeing', name: 'Sightseeing', blurb: 'Famous places. You start facing them.', theme: 'landmarks', mode: 'move', timeLimit: 0, tag: 'easy' },
  { id: 'capitals', name: 'Capital hop', blurb: 'Capital cities, seen from one spot.', theme: 'capitals', mode: 'nm', timeLimit: 60 },
  { id: 'tour', name: 'World tour', blurb: 'One round on every continent.', theme: 'continents', mode: 'nm', timeLimit: 60 },
  { id: 'lookalikes', name: 'Lookalikes', blurb: 'Neighbours that look the same. Spot the details.', theme: 'lookalikes', mode: 'nm', timeLimit: 120 },
  { id: 'lost', name: 'Lost', blurb: 'The middle of nowhere. Find a sign.', theme: 'nowhere', mode: 'move', timeLimit: 300 },
  { id: 'snapshot', name: 'Snapshot', blurb: 'One look. No moving, no turning.', theme: 'world', mode: 'nmpz', timeLimit: 30, tag: 'hard' },
];

// The daily game rotates through these themes with the Classic settings, so scores compare.
export const DAILY = {
  themes: ['world', 'capitals', 'cities', 'islands', 'nowhere', 'continents', 'world'],
  mode: 'move',
  timeLimit: 120,
};
