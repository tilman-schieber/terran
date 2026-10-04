# terran

Street View guessing. No music, no avatars, no accounts.

Five rounds, the three classic modes, optional time limit (10s to 5 min):

- **Move** – look around and walk anywhere
- **No move** – look around and zoom, but stay put
- **Still** – one fixed photo (NMPZ)

When the time runs out a placed pin is submitted, no pin scores 0.

Themes decide where the five places come from:

- **World** – anywhere with coverage
- **Places** – capitals, big cities, landmarks (you start facing it), islands, middle of nowhere
- **Regions** – five continents (one round each), or a single continent
- **Tricky neighbours** – Nordics, Baltics, Balkans, Andes, Southeast Asia, Anglosphere

**Daily**: the same five places for everyone, picked from the UTC date. The theme rotates; mode (No move) and
time limit (2 min) are fixed so scores compare.

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
- `themes.js`: which list each theme uses and how far from a box point or place a round may land

A random point in a box, or near a place, is snapped to the nearest official Google panorama. A game never uses the
same box or place twice. Location lookups don't count against the daily quota; only panorama and map loads do.
