// Small original glyphs used to visually flag adversary type on a card.
// These are deliberately simple geometric marks, not reproductions of any
// official Daggerheart iconography.

const TYPE_ICONS = {
  solo:      '<svg viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="currentColor"/></svg>',
  bruiser:   '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/></svg>',
  skulk:     '<svg viewBox="0 0 24 24"><path d="M12 3 L20 20 L4 20 Z" fill="currentColor"/></svg>',
  support:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
  leader:    '<svg viewBox="0 0 24 24"><path d="M12 2 L15 9 L22 9 L16.5 13.5 L18.5 21 L12 16.8 L5.5 21 L7.5 13.5 L2 9 L9 9 Z" fill="currentColor"/></svg>',
  horde:     '<svg viewBox="0 0 24 24"><circle cx="7" cy="8" r="4" fill="currentColor"/><circle cx="17" cy="8" r="4" fill="currentColor"/><circle cx="12" cy="17" r="4" fill="currentColor"/></svg>',
  ranged:    '<svg viewBox="0 0 24 24"><path d="M2 12 H18 M14 6 L20 12 L14 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  standard:  '<svg viewBox="0 0 24 24"><path d="M12 2 L22 7 V17 L12 22 L2 17 V7 Z" fill="currentColor"/></svg>',
  colossus:  '<svg viewBox="0 0 24 24"><path d="M4 20 L4 10 L12 3 L20 10 L20 20 Z" fill="currentColor"/></svg>',
  social:    '<svg viewBox="0 0 24 24"><circle cx="8" cy="9" r="4" fill="currentColor"/><circle cx="16" cy="9" r="4" fill="currentColor"/><path d="M2 20 C2 15 6 13 8 13 C10 13 14 15 14 20 M10 20 C10 15 14 13 16 13 C18 13 22 15 22 20" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  exploration: '<svg viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor"/></svg>',
  traversal: '<svg viewBox="0 0 24 24"><path d="M3 18 Q9 6 12 12 T21 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  default:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>'
};

function getTypeIcon(typeText) {
  const key = (typeText || '').toLowerCase().trim();
  for (const name of Object.keys(TYPE_ICONS)) {
    if (name !== 'default' && key.includes(name)) return TYPE_ICONS[name];
  }
  return TYPE_ICONS.default;
}
