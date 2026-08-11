// Original word pools for procedurally generating magic item concepts.
// Nothing here reproduces named items, effects, or tables from any
// publisher's books — these are original words/phrases combined at random.

const ITEM_PREFIXES = [
  'Ashwrought', 'Duskwoven', 'Sunlit', 'Moonsilvered', 'Frostbound', 'Emberkissed',
  'Stormcalled', 'Voidtouched', 'Gloomforged', 'Thornbound', 'Verdant', 'Hollowed',
  'Wyrmscaled', 'Graveworn', 'Starforged', 'Ironclad', 'Bloodroot', 'Whispering',
  'Sunken', 'Obsidian', 'Ivoryclasped', 'Shardlight', 'Ebonwreathed', 'Tidewrought',
  'Cinderborn', 'Hallowed', 'Ruinous', 'Wanderer\'s', 'Bramblewrought', 'Coldforged',
  'Sableveined', 'Amberlit', 'Windcarved', 'Nightspun', 'Sunscarred', 'Ashenfold',
  'Prismatic', 'Rustbitten', 'Silverthorn', 'Deepdwelling'
];

const ITEM_ORIGINS = [
  'a collapsed foundry beneath the salt flats', 'the drowned archives of a forgotten order',
  'a hermit\'s workshop lost to the frost line', 'the ashes of a burned cathedral',
  'a caravan that never reached the coast', 'the roots of a tree older than the kingdom',
  'a battlefield the crows still avoid', 'the last forge of a dead guild',
  'a shrine reclaimed by the tide', 'the hoard of a beast long since slain',
  'a market stall in a city that no longer exists', 'the hands of a wandering tinker',
  'the wreck of a ship that sailed too far', 'a monastery sealed after the plague',
  'the workshop of an artificer who vanished mid-project', 'a crypt sealed three generations ago'
];

const ITEM_NOUNS = {
  weapon: ['Blade', 'Dagger', 'Axe', 'Warhammer', 'Longbow', 'Spear', 'Rapier', 'Mace',
    'Quarterstaff', 'Flail', 'Glaive', 'Scythe', 'Shortsword', 'Crossbow', 'Sickle', 'Halberd', 'Cutlass'],
  armor: ['Cuirass', 'Gauntlets', 'Greaves', 'Helm', 'Shield', 'Breastplate', 'Pauldrons',
    'Bracers', 'Warplate', 'Chainshirt', 'Vambraces', 'Faceguard', 'Targe', 'Scaleharness'],
  wearable: ['Amulet', 'Ring', 'Cloak', 'Boots', 'Belt', 'Circlet', 'Brooch', 'Talisman',
    'Pendant', 'Mask', 'Sash', 'Charm', 'Bracelet', 'Earring', 'Diadem', 'Signet', 'Locket'],
  consumable: ['Draught', 'Elixir', 'Tonic', 'Powder', 'Vial', 'Tincture', 'Salve', 'Philtre',
    'Brew', 'Extract', 'Essence', 'Infusion'],
  wondrous: ['Orb', 'Tome', 'Lantern', 'Mirror', 'Compass', 'Hourglass', 'Chime', 'Key',
    'Coin', 'Dice', 'Flute', 'Lockbox', 'Idol', 'Prism', 'Censer', 'Quill', 'Inkwell']
};

// Effect phrases grouped into 5 power tiers (1 = weakest/most common, 5 = strongest/rarest).
// Each phrase can be used as-is or combined with a charges/uses clause by the caller.
const ITEM_EFFECTS = {
  1: [
    'Grants a faint, steady light in a 10-foot radius when the command word is spoken.',
    'Once per day, purifies a container of food or drink of ordinary poison.',
    'Keeps its wearer comfortably warm or cool regardless of the weather.',
    'Mends a single small tear, crack, or fray once per day, as if new.',
    'Faintly hums when a hidden door or trap lies within 10 feet.',
    'Never needs cleaning and always looks freshly presentable.',
    'Grants advantage on one check to recall local rumors or directions, once per day.',
    'Softens the sound of its wearer\'s footsteps by half, always active.',
    'Once per day, calms a single frightened animal that can see it.',
    'Floats gently to the ground instead of falling if dropped or knocked loose.'
  ],
  2: [
    'Once per day, the wielder can reroll one failed check tied to this item\'s purpose.',
    'Grants resistance to one chosen minor discomfort (extreme heat, extreme cold, or bright light).',
    'Once per short rest, sheds a burst of light bright enough to blind a nearby foe briefly.',
    'The wearer can breathe comfortably in thin air or light smoke for up to an hour per day.',
    'Grants a faint danger sense — a brief tingling warning before an ambush, once per day.',
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
    'Once per day, the item conceals its bearer from a single instance of magical detection.',
    'Grants resistance to one type of harm chosen when the item is first attuned or bonded.',
    'Once per short rest, the item lets its bearer act with unusual speed for a few moments.',
    'The item stores a small number of charges, each able to fuel a minor burst of its granted effect.',
    'Once per day, it can ward off a single instance of exhaustion or lingering fatigue.',
    'Grants the bearer a hazy, useful glimpse of the immediate future once per day.',
    'The item can briefly render its bearer difficult to pinpoint by sound or scent, a few times per day.'
  ],
  4: [
    'The item stores several charges, each capable of unleashing a significant burst of its bound power.',
    'Once per day, the bearer can shrug off an effect that would otherwise incapacitate them.',
    'Grants the bearer the ability to move through a solid obstacle once per day, briefly and carefully.',
    'The item can restore a companion from the brink of death, once, before it must recover its power.',
    'Once per day, the bearer can turn aside a serious blow entirely, taking no harm from it.',
    'Grants resistance to nearly all harm of one chosen type for as long as the item is worn.',
    'The item\'s charges can be spent to duplicate a powerful, rare effect, though they recover slowly.',
    'Once per day, the bearer can vanish from sight for a short while, even under scrutiny.',
    'The item allows its bearer to communicate with a chosen kind of creature as if sharing a language.',
    'Once per week, the item can undo a single significant injury or affliction entirely.'
  ],
  5: [
    'The item\'s power is nearly limitless — its charges regenerate fully with each new day.',
    'Once per day, the bearer can achieve something normally thought impossible, at great cost.',
    'The item can be called upon, once, to reverse a single moment that has already passed.',
    'Grants the bearer command over a chosen domain (fire, shadow, growth, or similar) in a limited but potent way.',
    'The item\'s presence alone reshapes the immediate area around it in a way tied to its nature.',
    'Once per year, the item can grant a wish-like effect of modest, GM-approved scope.',
    'The bearer becomes exceptionally difficult to kill while the item remains active and bonded.',
    'The item can restore an entire fallen party member, once, with no lasting cost.',
    'Grants the bearer a signature, story-defining ability tied directly to the item\'s origin.',
    'The item is aware, and may act — or refuse to act — according to a will of its own.'
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

function pickMany(arr, n) {
  const copy = arr.slice();
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

// category: 'weapon' | 'armor' | 'wearable' | 'consumable' | 'wondrous'
// powerTier: 1-5 (how strong the generated effect should feel)
// chargesLikely: whether this generation should lean toward including a charges clause
function generateItemConcept(category, powerTier, chargesLikely) {
  const cat = ITEM_NOUNS[category] ? category : 'wondrous';
  const noun = pick(ITEM_NOUNS[cat]);
  const prefix = pick(ITEM_PREFIXES);
  const origin = pick(ITEM_ORIGINS);
  const tier = Math.max(1, Math.min(5, Math.round(powerTier) || 1));

  const name = `${prefix} ${noun}`;
  const description = `Said to have come from ${origin}.`;

  const effectCount = tier >= 4 ? 2 : 1;
  const effects = pickMany(ITEM_EFFECTS[tier], effectCount);
  let effect = effects.join(' ');

  let charges = '';
  if (chargesLikely) {
    charges = pick(CHARGE_PHRASES);
  }

  return { name, description, effect, charges };
}
