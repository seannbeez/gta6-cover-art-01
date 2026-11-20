# LEONIDA GOLD — Vice Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/seannbeez/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/seannbeez/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn any photo into a GTA 6-style multi-panel cover: pick a photo, choose one of 8 layouts and 6 sunset/neon colour grades, edit the title, kicker, tagline, role tags and dialogue callout, then export a print-ready PNG in three sizes — 1080×1080, 1080×1350, or 1920×1080.

## What it does

- **8 panel layouts** — Poster, Hero, Split Heist (diagonal cut), Triptych, Quad, Spotlight, Strip, Duo Slant
- **6 colour grades** — Vice Sunset, Neon Nights, Palm Gold, Ocean Drive, After Dark, B&W Noir
- **Chrome 3D title** — layered gold-gradient lettering with cyan under-glow, plus a kicker line, tagline, role tags, dialogue callout bubble, circular seal and billing block
- **Any photo** — upload your own, or use the three bundled original illustrated Vice City scenes (boulevard, pier, skyline); per-panel crop with zoom and pan, drag-free panel picking
- **Fast export** — one click per size, or all three sizes at once, as PNG
- **Fully offline** — static files only, zero network requests; the Anton display font ships under `app/fonts/` under the SIL Open Font License

## How to use

1. Open `app/index.html` in a desktop browser (or serve the folder: `node serve.ts`, then open http://localhost:8080).
2. **Photo** — click a panel in the preview, then pick a bundled sample or upload your own. "Use in all panels" fills every panel with the same photo.
3. **Layout & grade** — choose a layout and a colour grade; the cover updates live.
4. **Words** — edit the title, kicker, tagline, callout and role tags.
5. **Crop** — zoom and pan the active panel until the framing is right.
6. **Export** — hit a PNG button in the top toolbar (1080×1080, 1080×1350, or 1920×1080) or "Export all 3 sizes".

## Files

- `main.ts` — entry point: copies `app/` and `screenshots/` to the output and writes `dossier.json`
- `app/index.html` — the editor shell
- `app/style.css` — editor styles
- `app/src/cover.js` — the cover renderer (layouts, grades, chrome title, seal, callout)
- `app/src/main.js` — editor wiring, upload, crop, export, screenshot mode
- `app/samples/` — three original illustrated scenes, rendered procedurally
- `app/fonts/Anton-Regular.ttf` — display font (SIL OFL 1.1, see `OFL.txt`)
- `vendor/makefun-app.ts` — vendored make.fun library, unchanged from the kit

## Screenshots

1. `1-cover.jpg` — Poster layout, Vice Sunset (landscape cover)
2. `2-editor.jpg` — editor with the pier photo loaded, Spotlight layout, Neon Nights
3. `3-cover.jpg` — Hero layout, Palm Gold (dense portrait cover)
4. `4-cover.jpg` — Split Heist layout, Neon Nights (square cover)

## Notes

- All artwork is original and procedural — no Rockstar logos, artwork, or fonts are used, and no character from any game appears.
- The sample scenes are illustrated in-session; every character and event in the cover text is fictional.
- Built for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun.
