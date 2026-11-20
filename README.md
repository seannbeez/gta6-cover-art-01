[![Make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/seannbeez/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/seannbeez/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# LEONIDA GOLD — Vice Cover Studio

A web app that turns a photo + caption into GTA 6-style multi-panel cover art: five AI-generated photorealistic Vice City portraits with role tags, layered typography (stars + quote strip, giant chrome 3D title with glow, script line, ribbon, callout, VOL. 1 badge, seal, barcode, billing), 8 layouts, 6 golden-hour grades, per-panel crop, and one-click PNG export in three sizes (1080×1080, 1080×1350, 1920×1080). Fully offline — static files only, zero network calls.

## Run

```sh
node serve.ts
```

Then open http://localhost:8080.

## How it works

1. Pick a panel, give it a photo (upload your own or use the sample portraits).
2. Choose a layout and a grade, edit the title, script line and callout.
3. Drag a panel photo to pan, scroll to zoom, then export all three PNG sizes.

Built for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun. All portraits are original AI-generated images; no Rockstar artwork, logos or fonts are used. The Anton typeface is bundled under the SIL Open Font License (see `app/fonts/OFL.txt`).
