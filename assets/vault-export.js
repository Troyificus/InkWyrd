// Shared "Export for Obsidian" helpers for the statblock generators.
//
// Turns a card into an Obsidian markdown note in the shape Adventure PDF
// Forge (pdf.inkwyrd.com) already recognises: an H1 title, an optional
// intro paragraph, then a "## D&D 5E" / "## Pathfinder 2E" / "## Daggerheart"
// section, which the Forge wraps in a styled stat block box. Everything up
// to the next H1/H2 belongs to that box, so the body below only ever uses
// H3 and plain paragraphs.
//
// Each system's statblock.js supplies a cardToVaultSection(card) that
// returns { header, intro, body }, using VaultExport.md() on every piece of
// user text.
const VaultExport = (() => {
  // Escapes inline markdown in user-written text, so a stray * or _ in a
  // feature description prints as itself instead of italicising half the
  // stat block, and a [TOKEN] that was never filled in stays literal
  // rather than looking like a link. An underscore inside a word is left
  // alone, since markdown never reads that as emphasis anyway.
  //
  // A value usually lands mid-line ("**HP** 30"), so only its SECOND and
  // later lines start a line of the note. Those get anything markdown
  // would read as structure neutralised: a heading (which would END the
  // stat block), a list, a quote, or a setext underline. Pass
  // atLineStart for text that opens a line itself, like the intro. HTML
  // entities rather than backslashes, because python-markdown only
  // honours backslash escapes for a fixed set of characters and = is not
  // one of them.
  function md(text, atLineStart = false) {
    if (text === undefined || text === null) return '';
    return String(text)
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line, i) => {
        let l = line.trim()
          .replace(/[\\`*[\]|]/g, '\\$&')
          .replace(/(?<![A-Za-z0-9])_|_(?![A-Za-z0-9])/g, '\\_')
          .replace(/</g, '&lt;');
        if (i === 0 && !atLineStart) return l;
        return l.replace(/^#/, '&#35;')
          .replace(/^>/, '&gt;')
          .replace(/^-/, '&#45;')
          .replace(/^\+/, '&#43;')
          .replace(/^=/, '&#61;')
          .replace(/^(\d+)\./, '$1&#46;');
      })
      .join('\n')
      .trim();
  }

  // Obsidian links notes by file name, so keep the card's own name (spaces
  // and capitals included) and drop only what a file name or a wikilink
  // can't contain.
  function noteName(card) {
    const cleaned = String(card.name || '')
      .replace(/[\\/:*?"<>|#^[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned || 'Statblock';
  }

  function uniqueName(base, used) {
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) name = `${base} ${n++}`;
    used.add(name.toLowerCase());
    return name;
  }

  function imageInfo(dataUrl) {
    const m = /^data:image\/(png|jpe?g|webp|gif);base64,(.*)$/i.exec(dataUrl || '');
    if (!m) return null;
    const ext = m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase();
    return { ext, base64: m[2] };
  }

  // Builds the note text. imageFile is the illustration's file name inside
  // the vault (or null): it goes in the frontmatter's art field, which the
  // Forge renders above the note and its editor can resize afterwards.
  function noteText(card, section, title, imageFile) {
    const parts = [];
    if (imageFile) {
      parts.push('---');
      parts.push(`art: ${JSON.stringify(imageFile)}`);
      parts.push('art_width: "3in"');
      parts.push('---');
    }
    parts.push(`# ${title}`);
    parts.push('');
    if (section.intro) {
      parts.push(section.intro);
      parts.push('');
    }
    parts.push(`## ${section.header}`);
    parts.push('');
    parts.push(section.body.trim());
    parts.push('');
    return parts.join('\n');
  }

  // Adds one card (note plus illustration, if it has one) to a zip and
  // returns the note's name.
  function addCardToZip(zip, card, toSection, used) {
    const name = uniqueName(noteName(card), used);
    const img = card.image ? imageInfo(card.image) : null;
    const imageFile = img ? `${name}.${img.ext}` : null;
    zip.file(`${name}.md`, noteText(card, toSection(card), name, imageFile));
    if (img) zip.file(imageFile, img.base64, { base64: true });
    return name;
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // One card: a bare .md when there's no illustration (drop it straight
  // into a vault), otherwise a .zip holding the note and its image, since
  // the note's art field points at that image by name.
  async function exportCard(card, toSection) {
    if (card.image && imageInfo(card.image)) {
      const zip = new JSZip();
      const name = addCardToZip(zip, card, toSection, new Set());
      download(await zip.generateAsync({ type: 'blob' }), `${name}.zip`);
      return 'zip';
    }
    const name = noteName(card);
    const text = noteText(card, toSection(card), name, null);
    download(new Blob([text], { type: 'text/markdown;charset=utf-8' }), `${name}.md`);
    return 'md';
  }

  async function exportDeck(deck, toSection, zipName) {
    const zip = new JSZip();
    const used = new Set();
    deck.forEach(card => addCardToZip(zip, card, toSection, used));
    download(await zip.generateAsync({ type: 'blob' }), zipName);
  }

  return { md, noteName, noteText, exportCard, exportDeck };
})();
