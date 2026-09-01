// Original word pools and mechanical baselines for procedurally generating
// magic item concepts. Nothing here reproduces named items or exact tables
// from any publisher's books, these are original words/phrases and our own
// reasonable approximate baseline stats, combined at random.

// Themes tie a prefix, an origin, and a damage type together so a generated
// item reads as coherent. "Sunken" and "reclaimed by the tide" both point at
// water/cold, so the theme's damage type is cold, not an unrelated fire roll.
// damageType: null marks the neutral theme, used for items that shouldn't
// read as elemental at all (prestige/utility flavor instead).
const THEMES = [
  {
    damageType: 'fire',
    prefixes: ['Emberkissed', 'Cinderborn', 'Ashenfold', 'Sunscarred'],
    origins: ['the ashes of a burned cathedral', 'the last forge of a dead guild', 'a volcanic vent that never cooled']
  },
  {
    damageType: 'cold',
    prefixes: ['Frostbound', 'Sunken', 'Tidewrought', 'Coldforged', 'Deepdwelling'],
    origins: ['a shrine reclaimed by the tide', 'the wreck of a ship that sailed too far', 'a hermit\'s workshop lost to the frost line', 'the drowned archives of a forgotten order']
  },
  {
    damageType: 'lightning',
    prefixes: ['Stormcalled', 'Windcarved'],
    origins: ['a tower struck by lightning a hundred times over', 'a caravan caught in an endless storm']
  },
  {
    damageType: 'thunder',
    prefixes: ['Thunderforged', 'Ruinous'],
    origins: ['a canyon that still echoes with old war-horns', 'a battlefield the crows still avoid']
  },
  {
    damageType: 'acid',
    prefixes: ['Rustbitten', 'Obsidian'],
    origins: ['a collapsed foundry beneath the salt flats', 'a swamp that dissolves anything left too long']
  },
  {
    damageType: 'poison',
    prefixes: ['Bramblewrought', 'Verdant', 'Bloodroot', 'Thornbound'],
    origins: ['the roots of a tree older than the kingdom', 'a poisoner\'s garden gone wild']
  },
  {
    damageType: 'necrotic',
    prefixes: ['Gloomforged', 'Hollowed', 'Graveworn', 'Ebonwreathed', 'Sableveined'],
    origins: ['a crypt sealed three generations ago', 'the hoard of a beast long since slain', 'a monastery sealed after the plague']
  },
  {
    damageType: 'radiant',
    prefixes: ['Hallowed', 'Ivoryclasped', 'Shardlight', 'Starforged'],
    origins: ['a temple where the sun never set', 'a shrine to a forgotten light']
  },
  {
    damageType: 'force',
    prefixes: ['Prismatic', 'Wyrmscaled', 'Voidtouched'],
    origins: ['the workshop of an artificer who vanished mid-project', 'a rift that was never fully sealed']
  },
  {
    damageType: 'psychic',
    prefixes: ['Whispering', 'Nightspun', 'Silverthorn'],
    origins: ['a mind that shattered under a curse', 'an asylum abandoned overnight']
  },
  {
    damageType: null,
    prefixes: ['Ashwrought', 'Duskwoven', 'Sunlit', 'Moonsilvered', 'Ironclad', 'Wanderer\'s', 'Amberlit'],
    origins: ['a market stall in a city that no longer exists', 'the hands of a wandering tinker', 'a caravan that never reached the coast']
  }
];

const ITEM_NOUNS = {
  wearable: ['Amulet', 'Ring', 'Cloak', 'Boots', 'Belt', 'Circlet', 'Brooch', 'Talisman',
    'Pendant', 'Mask', 'Sash', 'Charm', 'Bracelet', 'Earring', 'Diadem', 'Signet', 'Locket'],
  consumable: ['Draught', 'Elixir', 'Tonic', 'Powder', 'Vial', 'Tincture', 'Salve', 'Philtre',
    'Brew', 'Extract', 'Essence', 'Infusion'],
  wondrous: ['Orb', 'Tome', 'Lantern', 'Mirror', 'Compass', 'Hourglass', 'Chime', 'Key',
    'Coin', 'Dice', 'Flute', 'Lockbox', 'Idol', 'Prism', 'Censer', 'Quill', 'Inkwell']
};

// Real baseline weapon stats (our own reasonable approximation of common fantasy
// weapon conventions, such as die, damage type). Used both by the randomizer and by the
// "look up base stats for this weapon" helper in the form.
const WEAPON_TYPES = [
  { name: 'Dagger', die: '1d4', type: 'piercing', range: 'Melee (or thrown, range 20/60 ft)' },
  { name: 'Shortsword', die: '1d6', type: 'piercing', range: 'Melee' },
  { name: 'Longsword', die: '1d8', type: 'slashing', range: 'Melee' },
  { name: 'Greatsword', die: '2d6', type: 'slashing', range: 'Melee' },
  { name: 'Rapier', die: '1d8', type: 'piercing', range: 'Melee' },
  { name: 'Scimitar', die: '1d6', type: 'slashing', range: 'Melee' },
  { name: 'Mace', die: '1d6', type: 'bludgeoning', range: 'Melee' },
  { name: 'Warhammer', die: '1d8', type: 'bludgeoning', range: 'Melee' },
  { name: 'Battleaxe', die: '1d8', type: 'slashing', range: 'Melee' },
  { name: 'Greataxe', die: '1d12', type: 'slashing', range: 'Melee' },
  { name: 'Spear', die: '1d6', type: 'piercing', range: 'Melee (or thrown, range 20/60 ft)' },
  { name: 'Halberd', die: '1d10', type: 'slashing', range: 'Melee, reach 10 ft' },
  { name: 'Quarterstaff', die: '1d6', type: 'bludgeoning', range: 'Melee' },
  { name: 'Flail', die: '1d8', type: 'bludgeoning', range: 'Melee' },
  { name: 'Whip', die: '1d4', type: 'slashing', range: 'Melee, reach 10 ft' },
  { name: 'Shortbow', die: '1d6', type: 'piercing', range: 'Range 80/320 ft' },
  { name: 'Longbow', die: '1d8', type: 'piercing', range: 'Range 150/600 ft' },
  { name: 'Light Crossbow', die: '1d8', type: 'piercing', range: 'Range 80/320 ft' },
  { name: 'Heavy Crossbow', die: '1d10', type: 'piercing', range: 'Range 100/400 ft' },
  { name: 'Sling', die: '1d4', type: 'bludgeoning', range: 'Range 30/120 ft' }
];

// Real baseline armor stats (our own reasonable approximation). acText is
// written to be usable across systems without assuming one exact formula.
const ARMOR_TYPES = [
  { name: 'Padded', acText: 'base AC 11 + Dex modifier' },
  { name: 'Leather', acText: 'base AC 11 + Dex modifier' },
  { name: 'Studded Leather', acText: 'base AC 12 + Dex modifier' },
  { name: 'Hide', acText: 'base AC 12 + Dex modifier (max 2)' },
  { name: 'Chain Shirt', acText: 'base AC 13 + Dex modifier (max 2)' },
  { name: 'Scale Mail', acText: 'base AC 14 + Dex modifier (max 2)' },
  { name: 'Breastplate', acText: 'base AC 14 + Dex modifier (max 2)' },
  { name: 'Half Plate', acText: 'base AC 15 + Dex modifier (max 2)' },
  { name: 'Ring Mail', acText: 'base AC 14' },
  { name: 'Chain Mail', acText: 'base AC 16' },
  { name: 'Splint', acText: 'base AC 17' },
  { name: 'Plate', acText: 'base AC 18' },
  { name: 'Shield', acText: '+2 AC while carried' }
];

const DAMAGE_TYPES = ['fire', 'cold', 'lightning', 'acid', 'poison', 'necrotic', 'radiant', 'force', 'thunder', 'psychic'];

// Bonus damage dice added on top of a weapon's base damage, scaled by power tier.
const WEAPON_BONUS_DICE = { 1: '1d4', 2: '1d6', 3: '2d6', 4: '3d6', 5: '4d8' };
// Larger dice for a once-per-day area/ranged blast effect (wearables/wondrous items).
const BLAST_DICE = { 1: '2d6', 2: '3d6', 3: '4d6', 4: '6d6', 5: '8d10' };
// Flat numeric bonus (attack/damage rolls, or AC), scaled by power tier.
const FLAT_BONUS = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 };

function saveDcForTier(tier) {
  return 11 + tier;
}

// Effect phrases for wearable / consumable / wondrous items, grouped by power
// tier (1 = weakest/most common, 5 = strongest/rarest). Use {dice}, {type},
// and {dc} placeholders. These get filled with a concrete damage type, dice
// notation, and save DC at generation time so nothing reads as vague.
const ITEM_EFFECTS = {
  1: [
    'Grants a faint, steady light in a 10-foot radius when the command word is spoken.',
    'Once per day, purifies a container of food or drink of ordinary poison.',
    'Keeps its wearer comfortably warm or cool regardless of the weather.',
    'Mends a single small tear, crack, or fray once per day, as if new.',
    'Faintly hums when a hidden door or trap lies within 10 feet.',
    'Grants advantage on one check to recall local rumors or directions, once per day.',
    'Softens the sound of its wearer\'s footsteps by half, always active.',
    'Once per day, calms a single frightened animal that can see it.',
    'Once per day, the item can deal {dice} {type} damage to a single creature it touches.',
    'Floats gently to the ground instead of falling if dropped or knocked loose.'
  ],
  2: [
    'Once per day, the wielder can reroll one failed check tied to this item\'s purpose.',
    'Grants resistance to one chosen minor discomfort (extreme heat, extreme cold, or bright light).',
    'Once per short rest, sheds a burst of light bright enough to blind a nearby foe briefly.',
    'The wearer can breathe comfortably in thin air or light smoke for up to an hour per day.',
    'Once per short rest, unleash a {dice} {type} damage bolt at a target within 30 feet.',
    'Once per day, the item can be used to send a short whispered message to a person the user has met.',
    'The wielder\'s grip cannot be forced open against their will.',
    'Once per short rest, grants a short burst of speed, covering ground faster than normal.',
    'The wearer leaves no tracks on soft ground for up to ten minutes, once per day.',
    'Grants advantage on a save against being frightened, once per encounter.'
  ],
  3: [
    'Once per day, the item can shrug off a single blow that would otherwise connect.',
    'Grants a limited number of charges that restore a small measure of vitality once per day.',
    'The wielder can call the item to their hand from a short distance, up to three times per day.',
    'Once per day, the item deals {dice} {type} damage to each creature within 10 feet (DC {dc} save for half).',
    'Grants resistance to one type of harm chosen when the item is first attuned or bonded.',
    'Once per short rest, the item lets its bearer act with unusual speed for a few moments.',
    'The item stores a small number of charges, each able to fuel a {dice} {type} damage blast at a target within 60 feet.',
    'Once per day, it can ward off a single instance of exhaustion or lingering fatigue.',
    'Grants the bearer a hazy, useful glimpse of the immediate future once per day.',
    'The item can briefly render its bearer difficult to pinpoint by sound or scent, a few times per day.'
  ],
  4: [
    'The item stores several charges, each able to unleash a {dice} {type} damage blast at a target within 90 feet.',
    'Once per day, the bearer can shrug off an effect that would otherwise incapacitate them.',
    'Grants the bearer the ability to move through a solid obstacle once per day, briefly and carefully.',
    'The item can restore a companion from the brink of death, once, before it must recover its power.',
    'Once per day, the bearer can turn aside a serious blow entirely, taking no harm from it.',
    'Grants resistance to {type} damage for as long as the item is worn.',
    'Once per day, the item unleashes a {dice} {type} damage burst in a 20-foot radius (DC {dc} save for half).',
    'Once per day, the bearer can vanish from sight for a short while, even under scrutiny.',
    'The item allows its bearer to communicate with a chosen kind of creature as if sharing a language.',
    'Once per week, the item can undo a single significant injury or affliction entirely.'
  ],
  5: [
    'The item\'s charges regenerate fully with each new day, each able to unleash a {dice} {type} damage blast at a target within 120 feet.',
    'Once per day, the bearer can achieve something normally thought impossible, at great cost.',
    'The item can be called upon, once, to reverse a single moment that has already passed.',
    'Once per day, the item can call down a {dice} {type} damage strike on a chosen point within sight (DC {dc} save for half).',
    'The item\'s presence alone reshapes the immediate area around it in a way tied to its nature.',
    'Once per year, the item can grant a wish-like effect of modest, GM-approved scope.',
    'The bearer becomes exceptionally difficult to kill while the item remains active and bonded.',
    'The item can restore an entire fallen party member, once, with no lasting cost.',
    'Grants the bearer a signature, story-defining ability tied directly to the item\'s origin.',
    'The item is aware, and may act, or refuse to act, according to a will of its own.'
  ]
};

const CHARGE_PHRASES = [
  'Recovers 1d4 charges each dawn.',
  'Recovers all expended charges at dawn.',
  'Recovers half its charges (rounded up) after a long rest.',
  'Regains a single charge each day.',
  'Recharges fully once per week.'
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clampTier(t) {
  return Math.max(1, Math.min(5, Math.round(t) || 1));
}

// Looks up known base stats for a typed-in weapon or armor name (case-insensitive,
// partial match). Returns null if nothing matches, so callers can leave a custom
// name's stats untouched rather than overwriting them.
function lookupWeaponStats(name) {
  const key = (name || '').toLowerCase().trim();
  const found = WEAPON_TYPES.find(w => w.name.toLowerCase() === key) ||
    WEAPON_TYPES.find(w => key.includes(w.name.toLowerCase()));
  return found ? `${found.die} ${found.type}` : null;
}

function lookupWeaponRange(name) {
  const key = (name || '').toLowerCase().trim();
  const found = WEAPON_TYPES.find(w => w.name.toLowerCase() === key) ||
    WEAPON_TYPES.find(w => key.includes(w.name.toLowerCase()));
  return found ? found.range : null;
}

function lookupArmorStats(name) {
  const key = (name || '').toLowerCase().trim();
  const found = ARMOR_TYPES.find(a => a.name.toLowerCase() === key) ||
    ARMOR_TYPES.find(a => key.includes(a.name.toLowerCase()));
  return found ? found.acText : null;
}

// category: 'weapon' | 'armor' | 'wearable' | 'consumable' | 'wondrous'
// powerTier: 1-5 (how strong the generated effect should feel)
// chargesLikely: whether this generation should lean toward including a charges clause
// Returns { name, description, itemType, baseStats, effect, charges }
function generateItemConcept(category, powerTier, chargesLikely) {
  const tier = clampTier(powerTier);
  const theme = pick(THEMES);
  const prefix = pick(theme.prefixes);
  const origin = pick(theme.origins);
  const description = `Said to have come from ${origin}.`;
  const charges = chargesLikely ? pick(CHARGE_PHRASES) : '';
  const isElemental = theme.damageType !== null;

  if (category === 'weapon') {
    const w = pick(WEAPON_TYPES);
    const name = `${prefix} ${w.name}`;
    const baseStats = `${w.die} ${w.type}`;
    let effect;
    if (isElemental && (tier >= 3 || Math.random() < 0.6)) {
      const dice = WEAPON_BONUS_DICE[tier];
      effect = `Deals an additional ${dice} ${theme.damageType} damage on a hit.`;
      if (tier >= 3 && Math.random() < 0.5) {
        effect += ` Grants a +${FLAT_BONUS[tier]} bonus to attack and damage rolls.`;
      }
    } else {
      effect = `Grants a +${FLAT_BONUS[tier]} bonus to attack and damage rolls.`;
    }
    return { name, description, itemType: w.name, baseStats, range: w.range, effect, charges };
  }

  if (category === 'armor') {
    const a = pick(ARMOR_TYPES);
    const name = `${prefix} ${a.name}`;
    const baseStats = a.acText;
    let effect;
    if (isElemental && tier >= 2 && Math.random() < 0.5) {
      effect = tier >= 4
        ? `Grants immunity to ${theme.damageType} damage while worn.`
        : `Grants resistance to ${theme.damageType} damage while worn.`;
    } else {
      effect = `Grants a +${FLAT_BONUS[tier]} bonus to AC.`;
    }
    return { name, description, itemType: a.name, baseStats, range: '', effect, charges };
  }

  // wearable / consumable / wondrous - no inherent base stats
  const noun = pick(ITEM_NOUNS[category] || ITEM_NOUNS.wondrous);
  const name = `${prefix} ${noun}`;
  const dice = BLAST_DICE[tier];
  const dc = saveDcForTier(tier);
  const pool = isElemental
    ? ITEM_EFFECTS[tier]
    : ITEM_EFFECTS[tier].filter(e => !e.includes('{dice}') && !e.includes('{type}'));
  const effect = pick(pool.length ? pool : ITEM_EFFECTS[tier])
    .replace(/\{dice\}/g, dice)
    .replace(/\{type\}/g, theme.damageType || 'force')
    .replace(/\{dc\}/g, dc);
  return { name, description, itemType: '', baseStats: '', range: '', effect, charges };
}
