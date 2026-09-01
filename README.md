# Statblock Forge (InkWyrd)

**Live at [inkwyrd.com](https://inkwyrd.com)**

A growing suite of free, browser-based tools for tabletop RPGs — statblock and magic item cards for three systems, plus a set of system-agnostic worldbuilding and table-prep tools. No backend, no account, no build step: everything runs client-side from static HTML/CSS/JS, with each generator auto-saving your work to browser storage.

## What's here

### Statblock & Magic Item Generators
Each system is a self-contained app under its own folder, sharing the same visual language and toolset (deck management, JSON import/export, single + batch PNG export, print sheets, custom `[TOKEN]` variables):

- **[/daggerheart/](daggerheart/)** — Adversary & Environment cards, built from the Daggerheart SRD under the Darrington Press Community Gaming License (DPCGL).
- **[/dnd5e/](dnd5e/)** — Creature statblock cards, built from the D&D 5E SRD (5.1 / 5.2), released by Wizards of the Coast under Creative Commons CC-BY-4.0. Toggle between 2014-style and 2024-style presentation.
- **[/pathfinder2e/](pathfinder2e/)** — Creature statblock cards, built from Pathfinder Second Edition rules text released under the ORC License.

A **cross-system creature converter** (5E ↔ Pathfinder 2E) lives inside the statblock generators themselves — send a card from one system to the other as a starting point, with ability scores, saves, and skills carried across and fully editable after.

Inspired by tools like [tetra-cube's D&D statblock generator](https://tetra-cube.com/dnd/dnd-statblock.html), but multi-system and with an original visual design throughout.

### Extra Tools
System-agnostic utilities under **[/tools/](tools/)**, useful at any table regardless of ruleset:

- **[NPC Generator](tools/name-generator.html)** — race- and culture/region-specific names (seven populations, each with multiple real sub-cultures) plus a physical descriptor system (build, notable features, accessories, mannerisms, traits), all with anti-repeat logic within a batch.
- **[Settlement Generator](tools/settlement/generator.html)** — scales from a hamlet to a city, with governance, taverns, merchants, and local tension all sized appropriately, plus a full demographics system: set a population's cultural makeup and every council seat, tavern, and shop independently rolls which culture it belongs to, weighted by your percentages. Population-aware tier ladders and vocabulary per race (Orcish camps use a Warchief, not a mayor; Halfling settlements cap out at Town, never a City). XLSX and PNG export.
- **[Pantheon Generator](tools/pantheon/generator.html)** — race- and culture-specific deities across all sixteen race/sub-culture combinations the site supports, each with alignment, domain(s), a domain-matched symbol, and a gender presentation field (masculine/feminine/fluid/non-binary/not applicable).
- **[Session Zero Questionnaire](tools/session-zero/generator.html)** — a toggleable discussion checklist for the whole table before a campaign starts (content & safety, tone, logistics, character creation, player expectations), plus optional system-specific notes. Print/save-as-PDF or copy as plain text.
- **[Cross-System Condition Reference](tools/conditions/generator.html)** — how Daggerheart, D&D 5E, and Pathfinder 2E each handle the same mechanical idea (Restrained, Frightened, Prone, etc.), including being explicit about when a system genuinely has no equivalent rather than forcing a fake one. Verified against each system's own SRD, not written from memory.

## Status

- Shared **`/assets/base.css`** holds all genuinely site-wide styling (colors, typography, header/footer, deck/form/preview layout, buttons, form elements) — loaded by every page before its own much smaller `style.css`, which only needs to define its accent color and whatever's genuinely page-specific.
- Illustration upload with `shape-outside` text wrap around the character's actual silhouette, across the statblock/item generators.
- A "deck" of cards/settlements/pantheons per tool (new/duplicate/delete), auto-saved to browser storage, with a migration path for cards saved under an older data model so a rewrite never silently breaks someone's saved work.
- Custom `[TOKEN]` variables, plus built-in stat tokens per system.
- JSON import/export, single-item PNG export, batch PNG export as `.zip`, print sheets.
- Original SVG iconography per system — none of it derived from official artwork or proprietary icon fonts.
- Analogue balance-guidance hints (CR/Level/Tier-based, our own approximate formulas) driving both the inline "typical for this level" hints and the Randomize Stats buttons across all three statblock generators.
- GitHub Issues integration for bug reports and feature requests, with structured templates for each — proven working end-to-end, not just set up and untested.
- Custom domain via GitHub Pages, DNS through Cloudflare.

## Roadmap

- [ ] Backstory Hook generator (the one item remaining from the original tool wishlist)
- [ ] Adventure PDF Forge — a separate Obsidian-vault-to-PDF pipeline, generalized engine built, public web layer not yet started
- [ ] Configurable print sheet (card count per page, page size)
- [ ] Deck organization (folders/tags for multi-adventure-pack use)

## Running locally

No build step — it's plain HTML/CSS/JS. Each generator is independent; open its HTML file directly, or serve the whole repo:

```bash
git clone https://github.com/Troyificus/InkWyrd.git
cd InkWyrd
python3 -m http.server 8000
# then visit localhost:8000, or localhost:8000/dnd5e/, localhost:8000/tools/settlement/generator.html, etc.
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

### Random content generators (Magic Items, NPCs, Settlements, Pantheons)
All names, descriptors, flavor text, deity epithets, and settlement content across every generator are original creative content, written for this project — composed from original word/name pools (`/assets/item-words.js`, `/assets/npc-data.js`, and the per-tool data files under `/tools/`), not reproduced or derived from any publisher's proprietary tables, named items, or creative content. Where a generator reflects genuine cultural naming conventions (e.g. the NPC Generator's regional name pools), that's a deliberate real-world-inspired design choice, not sourced from any single publisher's IP.

The **Cross-System Condition Reference** is the one tool that summarizes actual published rules rather than generating original content — it's written as a fan-made comparison summary in our own words, not reproduced rules text, and links back to each system's own SRD/rulebook for precise current wording.

If monetizing generated content or these tools (e.g. via Ko-fi), stay within each license's terms — SRD/rules text only, original art/logos, no implication of official status.

## License

Code in this repository: MIT (see `LICENSE`). Rules text referenced/used within each system's generator remains under that system's own license (DPCGL / CC-BY-4.0 / ORC as applicable) — not covered by this repo's MIT license.
