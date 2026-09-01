// Highlights the part of the card preview that corresponds to whichever
// form field currently has focus, so it's clear where on the card you're
// actually editing.
//
// The card is fully re-rendered (innerHTML replaced) on every keystroke,
// which would normally wipe out any highlight class immediately, so
// instead of a simple "highlight on focus" toggle, this tracks which field
// key is currently focused and re-applies the highlight via a
// MutationObserver every time the card's DOM actually changes, regardless
// of which page's render function triggered it.

let currentHighlightKey = null;

function getHighlightKey(el) {
  if (!el || !el.dataset) return null;
  if (el.dataset.field) return el.dataset.field;
  if (el.classList.contains('attack-input')) return `attack-${el.dataset.idx}`;
  if (el.classList.contains('feat-name-input') || el.classList.contains('feat-text-input')) return `feature-${el.dataset.idx}`;
  return null;
}

function applyHighlight() {
  document.querySelectorAll('.field-highlighted').forEach(el => el.classList.remove('field-highlighted'));
  if (!currentHighlightKey) return;
  const card = document.getElementById('statblock-card');
  if (!card) return;
  // ~= matches one of several space-separated values, so an element whose
  // data-source-field lists multiple keys (e.g. a combined "AC; Fort, Ref,
  // Will" line) still highlights correctly regardless of which specific
  // form field is focused. querySelectorAll (not querySelector) because a
  // few fields, Rarity, Category, legitimately appear twice on a card
  // (once in the corner badge, once in the trait-chip row), and both
  // should highlight together, not just whichever is first in the DOM.
  const targets = card.querySelectorAll(`[data-source-field~="${CSS.escape(currentHighlightKey)}"]`);
  targets.forEach(el => el.classList.add('field-highlighted'));
}

document.addEventListener('focusin', (e) => {
  const key = getHighlightKey(e.target);
  if (key) {
    currentHighlightKey = key;
    applyHighlight();
  }
});

document.addEventListener('focusout', () => {
  setTimeout(() => {
    if (!getHighlightKey(document.activeElement)) {
      currentHighlightKey = null;
      applyHighlight();
    }
  }, 50);
});

document.addEventListener('DOMContentLoaded', () => {
  const cardEl = document.getElementById('statblock-card');
  if (!cardEl) return;
  const observer = new MutationObserver(() => applyHighlight());
  observer.observe(cardEl, { childList: true, subtree: true });
});
