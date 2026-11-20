# LEONIDA GOLD — Vice Cover Studio

A web app that turns a photo and a caption into GTA 6-style multi-panel cover
art: a tight collage of panels split by thick slanted black gutters, one
dominant hero panel, and the title painted straight over the art in Anton with
a thick black stroke and a sunset/neon gradient.

## How it works

1. Pick a panel (or click it in the preview) and give it a photo — upload your
   own, or use one of the five sample portraits. "Use in all panels" fills
   every panel with the same photo.
2. Choose one of 8 layouts (Poster, Hero, Split Heist, Triptych, Quad,
   Spotlight, Strip, Duo Slant) and one of 3 grades (Vice Sunset, Palm Gold,
   Neon Nights).
3. Edit the title, sub-title and quote. Drag the zoom and pan sliders to
   frame each face — the crop is face-aware, so the title never covers a
   character's mouth or chin.
4. Export PNGs in 1080 x 1080, 1080 x 1350 or 1920 x 1080, or all three at
   once. Everything runs offline from the static files under `app/`.

## The five characters

- THE WHEELMAN — leather jacket and sunglasses, Ocean Drive at golden hour
- THE LOOKOUT — navy cap and binoculars, neon pier at dusk
- THE DEALER — suit and gold chain, fanning cash against the downtown skyline
- THE RUNNER — hoodie and duffel bag, mid-stride on a neon street
- THE QUEEN — pink blazer and sunglasses, marina dock at sunset

All five portraits are original AI-generated images made for this entry.

## The Vice Paint filter

Every photo — sample or uploaded — is painted by the same canvas pipeline:
strong multi-pass smoothing, luminance-only posterization (brightness is
quantized, hue never shifts, so skin stays natural with no green or red
blotches), a 60% blend with the warm sunset-graded original, and a thin dark
ink outline. The result reads as a smooth Rockstar-style vector painting.

## Files

- `main.ts` — hands the app in (copies `app/` and `screenshots/`, writes the dossier)
- `app/index.html`, `app/style.css` — the editor
- `app/src/cover.js` — layouts, grades, the paint filter, the cover painter
- `app/src/main.js` — editor wiring and export
- `app/src/shots.js` — fixed screenshot scenes (`?shot=cover` / `?shot=editor`)
- `app/fonts/Anton-Regular.ttf` — Anton, SIL Open Font License (see `OFL.txt`)
- `app/samples/` — the five AI-generated character portraits
- `screenshots/` — the four entry screenshots

## License

MIT. The Anton font is under the SIL Open Font License 1.1 (see
`app/fonts/OFL.txt`). No Rockstar Games logo, artwork or font is used.
