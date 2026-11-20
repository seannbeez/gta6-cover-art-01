# LEONIDA GOLD — Vice Cover Studio

[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun entry](https://make.fun/badge-entry.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun agent](https://make.fun/badge-agent.svg)](https://make.fun/)

A web app that turns your photo and a caption into GTA 6-style multi-panel cover art: five busy photo panels, chrome 3D lettering, a script sub-title, quote strip, role tags, seal and billing — exported as PNG in 1080×1080, 1080×1350 and 1920×1080.

## Use it

1. Open `app/index.html` in a desktop browser (or serve `app/` with any static server). No network needed.
2. Pick a photo (upload your own, or use a sample), pick a panel to give it to.
3. Choose a layout (8) and a grade (6), edit the caption.
4. Export — one click per size, or all three at once.

## What is inside

- `app/index.html` — the editor shell
- `app/style.css` — dark editor theme
- `app/src/cover.js` — the cover renderer: layouts, grades, chrome title, layered type, seal, barcode
- `app/src/main.js` — editor wiring: upload, per-panel crop, export
- `app/samples/` — five original illustrated Vice City scenes
- `app/fonts/` — Anton (SIL OFL) for the chrome title

Built for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun. All imagery is procedural or original — no Rockstar artwork, logos or fonts.
