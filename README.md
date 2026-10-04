# terran

Street View guessing. No music, no avatars, no accounts.

Five rounds per game. Hit **Play** for the default: anywhere in the world, Move, 2 minutes per round.
Or pick one of the ready-made games:

| Game | Where | Mode | Time |
|---|---|---|---|
| Sightseeing | landmarks, you start facing them | Move | none |
| Capital hop | capital cities | No move | 1 min |
| World tour | one round per continent | No move | 1 min |
| Lookalikes | a random look-alike group (Nordics, Balkans, Andes…) | No move | 2 min |
| Lost | the middle of nowhere | Move | 5 min |
| Snapshot | anywhere | Still | 30s |

Modes: **Move** (walk anywhere), **No move** (look and zoom), **Still** (one fixed view, NMPZ).
When the time runs out a placed pin is submitted, no pin scores 0.

**Custom game** lets you pick any theme (World, capitals, big cities, landmarks, islands, middle of nowhere,
five continents, a single continent, a look-alike group), any mode and any time limit.

**Daily**: the same five places for everyone, picked from the UTC date. The theme rotates; the settings are
Classic's (Move, 2 min) so scores compare.

**Challenge link**: after a game, copy a link with your exact five places and score for someone to beat.

Score per round: `5000 · e^(−km / 1492.7)`, so 25,000 points max per game.

## Run

It's static files with no build step. Serve the folder with any static server:

```sh
python -m http.server 8000
```

Then open http://localhost:8000.

The Maps JavaScript API key lives in `config.js`. Browser keys are public by design: this one is restricted to
localhost and `gh.tschieber.de`, to the Maps JavaScript API only, and capped at 160 loads a day in the
`terran-a7bc67` Google Cloud project. To use your own key, pass it as `?key=...`. If the built-in key is ever rejected, the game asks for one instead.

Live at https://gh.tschieber.de/terran/

## Keys

- `Space` / `Enter`: guess, or go to the next round
- `R`: back to start (Move mode)
- `Z`: undo last move (Move mode)

## Locations

- `regions.js`: weighted boxes around areas with coverage (world, islands, remote areas, look-alike groups)
- `places.js`: capitals, big cities and landmarks
- `themes.js`: which list each theme uses, how far from a box point or place a round may land, the ready-made games
- `icons.js`: the menu line drawings

A random point in a box, or near a place, is snapped to the nearest official Google panorama. A game never uses the
same box or place twice. Location lookups don't count against the daily quota; only panorama and map loads do.
