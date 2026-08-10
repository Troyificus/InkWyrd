# Statblock Forge

A free, browser-based statblock card generator for tabletop RPGs. Build a creature/adversary card in a form, drop in your own transparent-background illustration (e.g. from a local ComfyUI pipeline), and export a print-ready PNG — for homebrew adventure packs, VTTs, or print.

Each system is a self-contained app under its own folder, sharing the same visual language and toolset (deck management, JSON import/export, single + batch PNG export, print sheets, custom `[TOKEN]` variables):

- **[/daggerheart/](daggerheart/)** — Adversary & Environment cards, built from the Daggerheart SRD under the Darrington Press Community Gaming License (DPCGL).
- **[/dnd5e/](dnd5e/)** — Creature statblock cards, built from the D&D 5E SRD (5.1 / 5.2), released by Wizards of the Coast under Creative Commons CC-BY-4.0.
- **[/pathfinder2e/](pathfinder2e/)** — Creature statblock cards, built from Pathfinder Second Edition rules text released under the ORC License.

Inspired by tools like [tetra-cube's D&D statblock generator](https://tetra-cube.com/dnd/dnd-statblock.html), but multi-system and with an original visual design across the board.

## Status

All three generators are functional:
- Illustration upload with `shape-outside` text wrap around the character's actual silhouette
- A "deck" of cards per system (new/duplicate/delete), auto-saved to browser storage
- Custom `[TOKEN]` variables, plus built-in stat tokens per system
- JSON import/export, single-card PNG export, batch PNG export as `.zip`, print sheet
- Four shared themes (parchment / ink / verdant / arcane) with an accent color picker
- Original SVG iconography per system — none of it derived from official artwork or proprietary icon fonts (e.g. Pathfinder's action-cost icons are represented as plain text labels, not the trademarked Pathfinder-Icons font)

## Roadmap

- [ ] Reduce duplication between the three apps by extracting a shared engine (deck/export/illustration plumbing is currently copied per system)
- [ ] Configurable print sheet (card count per page, page size)
- [ ] Deck organization (folders/tags for multi-adventure-pack use)
- [ ] More themes / layout variety
- [ ] Ko-fi link once stable

## Running locally

No build step — it's plain HTML/CSS/JS. Each system is independent; open its `index.html` directly, or serve the whole repo:

```bash
git clone https://github.com/Troyificus/daggerheart-statblock-generator.git
cd daggerheart-statblock-generator
python3 -m http.server 8000
# then visit localhost:8000, or localhost:8000/dnd5e/, etc.
```

## Legal / Compliance

Each system's rules content comes from a different license — summarized here.

### Daggerheart (`/daggerheart/`)
Built from the [Daggerheart SRD 1.0](https://www.daggerheart.com/srd/) under the [Darrington Press Community Gaming License](https://darringtonpress.com/license/). Field labels/terminology are Public Game Content. Card design, layout, colors, and typography are original — not a copy of official Daggerheart artwork, logos, or book layouts. Required attribution:

> This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC, under the terms of the Darrington Press Community Gaming License. More information at www.daggerheart.com.

"Daggerheart™" and related trademarks belong to Critical Role, LLC. Unofficial fan content, not affiliated with or endorsed by Darrington Press or Critical Role.

### D&D 5E (`/dnd5e/`)
Built from the 5E System Reference Document (5.1 and 5.2), released by Wizards of the Coast under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/legalcode) (CC-BY-4.0) — permissive and irrevocable, requiring only attribution. Card design is original. "Dungeons & Dragons" and "D&D" are trademarks of Wizards of the Coast and are not used to imply endorsement; product is described as "5E compatible," not as official D&D content.

### Pathfinder 2E (`/pathfinder2e/`)
Built from Pathfinder Second Edition rules text released under the [ORC License](https://paizo.com/licenses) (Open RPG Creative License). The ORC covers rules mechanics only — it does **not** cover Paizo's trademarks or "Restricted Material" (character names, settings, logos, the Pathfinder-Icons font). This project doesn't use the Pathfinder or Paizo names in its product title, doesn't use Paizo's compatibility logos or proprietary icon font, and uses original visual design throughout. "Pathfinder" is a registered trademark of Paizo Inc.; this project is unofficial fan content, not affiliated with or endorsed by Paizo.

If monetizing generated content or these tools (e.g. via Ko-fi), stay within each license's terms — SRD/rules text only, original art/logos, no implication of official status.

## License

Code in this repository: MIT (see `LICENSE`). Rules text referenced/used within each system's generator remains under that system's own license (DPCGL / CC-BY-4.0 / ORC as applicable) — not covered by this repo's MIT license.
