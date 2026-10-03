# terran

Street View guessing. No music, no avatars, no accounts.

Five rounds, three modes:

- **Move** – look around and walk anywhere
- **No move** – look around and zoom, but stay put
- **Still** – one fixed photo

Score per round: `5000 · e^(−km / 1492.7)`, so 25,000 points max per game.

## Run

It's static files with no build step. Serve the folder with any static server:

```sh
python -m http.server 8000
```

Then open http://localhost:8000.

The Maps JavaScript API key lives in `config.js`. Browser keys are public by design: this one is restricted to
localhost and `gh.tschieber.de`, to the Maps JavaScript API only, and capped at 160 loads a day in the
`terran-a7bc67` Google Cloud project. A key pasted on the start screen (or passed as `?key=...`) overrides it.

Live at https://gh.tschieber.de/terran/

## Keys

- `Space` / `Enter`: guess, or go to the next round
- `R`: back to start (Move mode)

## Locations

`regions.js` lists rough boxes around areas with Street View coverage, each with a weight. A random point in a weighted box
is snapped to the nearest official Google panorama within 50 km. Edit the boxes to change where you end up.
