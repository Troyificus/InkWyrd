// Small original glyphs — not reproductions of any official D&D iconography.

const TYPE_ICONS = {
  aberration:  '<svg viewBox="0 0 24 24"><path d="M12 2 C6 2 3 7 3 12 C3 18 8 22 12 22 C16 22 21 18 21 12 C21 7 18 2 12 2 Z M12 8 L12 16 M8 12 L16 12" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  beast:       '<svg viewBox="0 0 24 24"><path d="M12 3 L21 19 L3 19 Z" fill="currentColor"/></svg>',
  celestial:   '<svg viewBox="0 0 24 24"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="currentColor"/></svg>',
  construct:   '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" fill="currentColor"/></svg>',
  dragon:      '<svg viewBox="0 0 24 24"><path d="M2 20 L12 4 L22 20 L12 15 Z" fill="currentColor"/></svg>',
  elemental:   '<svg viewBox="0 0 24 24"><path d="M3 18 Q9 6 12 12 T21 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  fey:         '<svg viewBox="0 0 24 24"><circle cx="8" cy="16" r="4" fill="currentColor"/><circle cx="16" cy="8" r="4" fill="currentColor"/></svg>',
  fiend:       '<svg viewBox="0 0 24 24"><path d="M4 4 L12 20 L20 4 L15 8 L12 4 L9 8 Z" fill="currentColor"/></svg>',
  giant:       '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
  humanoid:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" fill="currentColor"/><path d="M4 21 C4 14 8 12 12 12 C16 12 20 14 20 21" fill="currentColor"/></svg>',
  monstrosity: '<svg viewBox="0 0 24 24"><path d="M12 2 L21 12 L12 22 L3 12 Z" fill="currentColor"/></svg>',
  ooze:        '<svg viewBox="0 0 24 24"><path d="M12 4 C18 4 20 10 18 15 C16 20 8 20 6 15 C4 10 6 4 12 4 Z" fill="currentColor"/></svg>',
  plant:       '<svg viewBox="0 0 24 24"><path d="M12 22 L12 10 M12 10 C12 4 6 4 6 4 C6 10 12 10 12 10 M12 10 C12 4 18 4 18 4 C18 10 12 10 12 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  undead:      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="8.5" cy="10.5" r="1.4" fill="currentColor"/><circle cx="15.5" cy="10.5" r="1.4" fill="currentColor"/></svg>',
  default:     '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>'
};

function getTypeIcon(typeText) {
  const key = (typeText || '').toLowerCase().trim();
  for (const name of Object.keys(TYPE_ICONS)) {
    if (name !== 'default' && key.includes(name)) return TYPE_ICONS[name];
  }
  return TYPE_ICONS.default;
}

// Marks for Ability / Reaction / Free Action feature categories.
const FEATURE_ICONS = {
  ability:      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>',
  reaction:     '<svg viewBox="0 0 24 24"><path d="M12 3 L21 12 L12 21 L3 12 Z" fill="currentColor"/></svg>',
  'free action': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>'
};

function getFeatureIcon(category) {
  return FEATURE_ICONS[(category || '').toLowerCase()] || FEATURE_ICONS.ability;
}
