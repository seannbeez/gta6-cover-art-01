# LEONIDA GOLD — Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your photo and a caption into GTA-style multi-panel cover art and export
it as a PNG to share. Pick a layout, pick a sunset-or-neon grade, crop each
panel, write the title — the cover updates live, and one click exports it in
1080 × 1080, 1080 × 1350 and 1920 × 1080.

## Run it

```sh
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080 in a desktop browser. Everything runs
offline: the photos never leave the machine, and the app loads no network
resources at all. The display font (Anton, SIL Open Font License) ships in
`app/fonts/` with its license text.

## What is inside

- `app/index.html` + `app/style.css` — the studio: photo picker, 8 layouts,
  6 grades, title/callout/tag editors, 3-size export.
- `app/src/cover.js` — the cover renderer: panel maps, colour grades, chrome
  3D title, role tags, dialogue callout, seal stamp and billing block, plus
  the procedural Vice scenery used when a panel has no photo yet.
- `app/src/main.js` — the wiring: panel selection, crop sliders, export, and
  the `?shot=` scenes used for the screenshots.
- `app/samples/` — three original illustrated sample photos, drawn for this
  entry (boulevard, pier, skyline).
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to the
  output folder and writes the dossier with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ebv85brk&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
