# Adversary Card Forge

A free, browser-based statblock card generator for **Daggerheart Compatible** content — build an Adversary or Environment statblock in a form, preview it live, and export it as a PNG for use in homebrew adventure packs, VTTs, or print.

Inspired by tools like [tetra-cube's D&D statblock generator](https://tetra-cube.com/dnd/dnd-statblock.html), but built for Daggerheart with an original visual design.

## Status

Functional multi-card build:
- Adversary and Environment forms
- Live-updating card preview
- Add/remove arbitrary Features
- A "deck" of cards (new/duplicate/delete), auto-saved to browser `localStorage`
- Export/import the whole deck as JSON
- Single-card PNG export via `html2canvas`
- Batch PNG export of the whole deck as a `.zip` via `JSZip`
- Print-friendly multi-card sheet (opens a print dialog, 2-up grid)
- Four starter themes (dark / parchment / verdant / arcane) with an accent color picker
- Small original SVG icon set that flags adversary/environment type on the card (not derived from official Daggerheart iconography)

## Roadmap

- [ ] More themes / layout variety
- [ ] Configurable print sheet (card count per page, page size)
- [ ] Deck organization (folders/tags for multi-adventure-pack use)
- [ ] Hosting (GitHub Pages) + Ko-fi link once stable

## Running locally

No build step — it's plain HTML/CSS/JS.

```bash
git clone https://github.com/Troyificus/daggerheart-statblock-generator.git
cd daggerheart-statblock-generator
# open index.html in a browser, or serve it:
python3 -m http.server 8000
```

## Legal / Compliance

This project uses **Public Game Content** from the [Daggerheart System Reference Document (SRD) 1.0](https://www.daggerheart.com/srd/), under the [Darrington Press Community Gaming License (DPCGL)](https://darringtonpress.com/license/).

What that means for this repo:
- Field labels and terminology (Difficulty, Thresholds, Stress, Motives & Tactics, etc.) come from the SRD and are Public Game Content — safe to use.
- The **card design, layout, colors, and typography in this project are original** — they do not copy official Daggerheart artwork, logos, or book layouts, which are not covered by the license.
- This tool does not include or distribute any official Daggerheart art, trademarked logos, or verbatim rulebook text beyond the SRD.
- Any output cards should carry (or the project should make available) the required attribution:

  > This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC, under the terms of the Darrington Press Community Gaming License. More information at www.daggerheart.com.

- "Daggerheart™" and related trademarks belong to Critical Role, LLC. This project is unofficial fan content and is not affiliated with or endorsed by Darrington Press or Critical Role.

If monetizing generated content or this tool itself (e.g. via Ko-fi), stay within DPCGL terms: build from the SRD (not the full rulebook), don't use official art/logos, and don't imply the product is official.

## License

Code in this repository: MIT (see `LICENSE`).
Daggerheart SRD content referenced/used within: © Critical Role, LLC, used under the DPCGL — not covered by this repo's MIT license.
