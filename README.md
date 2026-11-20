[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/seannbeez/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/seannbeez/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# LEONIDA GOLD — Vice Cover Studio

A web app that turns a photo + caption into GTA 6-style multi-panel cover art — Vice City sunset and neon grade, bold over-art lettering — and exports it as a PNG in three sizes. Built for the [gta6-cover-art-01 bounty on make.fun](https://make.fun/bounty/gta6-cover-art-01).

Try it on make.fun with referral code `ebv85brk`.

## What it does

- **5-panel GTA box-art collage** — full-canvas panels split by thick black slanted gutters, one dominant hero panel, role tags per panel (THE WHEELMAN, THE LOOKOUT, THE DEALER, THE RUNNER, THE QUEEN), a VICE badge, and a dialogue callout.
- **Vice Paint filter** — every photo (sample or your own upload) is painted in-canvas: strong smoothing, luminance-only posterization (skin stays natural, no colour blotches), a 60% blend over the warm-graded original, and a thin ink outline. The result reads as a flat Rockstar-style vector painting.
- **Face-aware framing** — each panel's crop centres on the face, zooms to keep it prominent, and clamps the chin clear of the title, so no title ever covers a mouth or chin.
- **8 layouts** (Poster, Hero, Split Heist, Triptych, Quad, Spotlight, Strip, Duo Slant) and **3 grades** (Vice Sunset, Palm Gold, Neon Nights).
- **Per-panel editing** — click a panel to give it its own photo, zoom, and drag to pan.
- **One-click export** — PNG 1080×1080, 1080×1350, and 1920×1080, plus “Export all 3 sizes”.
- **Fully offline** — static files under `app/`, zero network calls. The only font is Anton (SIL OFL, bundled in `app/fonts/`).

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Or open `app/index.html` directly from any static server. Pick a panel, upload a photo (or keep the five AI-generated sample portraits), choose a layout and grade, edit the caption, and export.

## Files

- `main.ts` — entrypoint: copies `app/` + `screenshots/` to the output dir and writes `dossier.json`.
- `app/index.html`, `app/style.css` — the editor.
- `app/src/cover.js` — the box-art renderer + Vice Paint pipeline.
- `app/src/main.js` — editor wiring (layouts, grades, upload, export, drag-to-pan).
- `app/src/shots.js` — fixed screenshot scenes (`?shot=cover` / `?shot=editor`).
- `app/samples/` — five AI-generated original portraits (no real people, no celebrities).
- `app/fonts/Anton-Regular.ttf` (+ `OFL.txt`) — Anton, SIL Open Font License.
- `shots.json` — the four screenshots.

## Credits

- Anton typeface: [google/fonts](https://github.com/google/fonts/tree/main/ofl/anton), SIL OFL 1.1.
- Sample portraits: AI-generated originals, made for this entry.
- No Rockstar logo, artwork, or fonts are used anywhere in this project.
