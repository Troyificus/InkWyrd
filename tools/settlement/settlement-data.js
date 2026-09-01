// Content pools for the Settlement Generator (Phase 1: Identity,
// Governance, Tavern, scaled across Hamlet/Village/Town/City).
// Person names (governance figures, innkeepers) are drawn from the shared
// NPC data (assets/npc-data.js) using whatever race/culture the user
// selects as the settlement's population, rather than a separate pool.

const SETTLEMENT_NAME_PREFIXES = [
  'Ash','Elm','Oak','Thorn','Stone','Iron','Bramble','Willow','Fern','Moss',
  'Raven','Wolf','Hollow','Grey','Silver','Amber','Black','Long','White',
  'Red','Green','Frost','Ember','Wren','Marsh','Cinder','Foxglove','Nettle'
];

const SETTLEMENT_NAME_SUFFIXES = [
  'ford','brook','hollow','reach','moor','haven','wick','stead','mere',
  'gate','vale','crest','hearth','watch','burrow','fen','bridge','market',
  'cross','hall','shire','dell','wood','field','holt'
];

const SETTLEMENT_VIBES = [
  'Built along a slow, silver river, more mud than stone in the wet season.',
  'A cheerful, noisy place that never quite goes quiet, even at night.',
  'Quiet, orderly, and just a little too pleased with itself.',
  'The kind of place travelers pass through and remember for years after.',
  'Smells permanently of woodsmoke and wet wool.',
  'Everyone here knows everyone else\u2019s business, whether they want to or not.',
  'Newer than it looks \u2014 built fast, on someone else\u2019s old ruins.',
  'Prosperous enough to be smug about it, and unsubtle about showing it.',
  'Worn at the edges, but proud of what it has left.',
  'A working place first, a home second \u2014 nobody\u2019s here for the scenery.',
  'Feels like it\u2019s waiting for something, though nobody can say what.',
  'Cramped, loud, and somehow still growing.',
  'Sits a little too close to old, unexplained ruins for most people\u2019s comfort.',
  'Friendly to strangers, in the watchful way border towns often are.',
  'Built around a single very old, very large tree nobody will cut down.',
  'Clean streets, careful people, and a curfew nobody talks about openly.'
];

const GOVERNANCE = {
  hamlet: {
    noLeaderFlavor: [
      'No one\u2019s formally in charge \u2014 disputes get settled over the shared fire, eventually.',
      'Decisions get made by whoever shouts loudest at the monthly gathering, more or less.',
      'There\u2019s no leader as such; the oldest families just tend to get their way.'
    ],
    namedTitle: 'the eldest'
  },
  village: {
    titles: ['Elder', 'Reeve', 'Village Warden']
  },
  town: {
    councilTitle: 'Mayor',
    councilSize: [2, 3],
    soloTitles: ['Lord', 'Lady']
  },
  city: {
    councilTitle: 'Lord Mayor',
    councilSize: [3, 5],
    soloTitles: ['Lord', 'Lady'],
    houseNames: [
      'House Ashwood', 'House Cindermoor', 'House Vantrell', 'House Greymantle',
      'House Duskfire', 'House Ravenscroft', 'House Marrowgate', 'House Sunhollow'
    ]
  }
};

const GOVERNANCE_DESCRIPTORS = [
  'well-liked, though not everyone trusts the reasons why',
  'newer to the role than most people realize',
  'widely respected, and knows exactly how to use that',
  'competent, tired, and clearly counting the days',
  'inherited the position and is still finding their feet in it',
  'genuinely popular with ordinary people, less so with other leaders',
  'quietly ambitious, patient about it so far',
  'well past due for retirement, by their own frequent admission',
  'sharp, a little ruthless, and good at hiding both',
  'beloved for their fairness, if not their patience'
];

const TAVERN_NAME_ADJECTIVES = [
  'Drowned','Broken','Laughing','Silver','Gilded','Crooked','Sleeping',
  'Weary','Golden','Rusty','Howling','Merry','Salty','Painted','Wandering',
  'Faded','Lucky','Bold','Quiet','Restless'
];

const TAVERN_NAME_NOUNS = [
  'Lantern','Wheel','Boar','Tankard','Stag','Anchor','Crown','Kettle','Fox',
  'Raven','Barrel','Bell','Compass','Griffin','Candle','Crow','Hound','Oak',
  'Wolf','Mermaid'
];

const TAVERN_HISTORY = [
  'Run by the same family for three generations, though the recipes have gotten stranger each time.',
  'Built from the timbers of a wrecked ship, or so the innkeeper claims.',
  'Used to be a chapel; the bar is where the altar once stood.',
  'Survived a fire twenty years back that took half the street around it.',
  'Won in a card game by the current owner\u2019s grandmother, allegedly.',
  'Started as a single room and grew, one badly-matched addition at a time.',
  'The cellar floods every spring, and everyone\u2019s made peace with it.',
  'Named for an incident nobody will fully explain to outsiders.',
  'Once hosted a minor noble for a night; the room\u2019s never been rented since.',
  'The oldest building in the settlement still standing on its original foundation.',
  'Rebuilt twice, on the same spot, after two separate disasters.',
  'Started life as a trading post before anyone thought to add a bar.'
];

const TAVERN_MENU_ITEMS = [
  { name: 'Hunter\u2019s Stew', desc: 'rabbit, root vegetables, whatever\u2019s in season' },
  { name: 'Miller\u2019s Pie', desc: 'savory, heavy, comes with a wedge of hard cheese' },
  { name: 'The Ploughman\u2019s Board', desc: 'bread, pickles, cold meat, more than one person can finish' },
  { name: 'Riverfish, Grilled', desc: 'caught that morning, or so they\u2019ll tell you' },
  { name: 'Shepherd\u2019s Bowl', desc: 'lamb, barley, thick enough to stand a spoon in' },
  { name: 'Roast Fowl', desc: 'whole bird, herbs, a side of whatever\u2019s left of the vegetables' },
  { name: 'Traveler\u2019s Loaf', desc: 'dense bread, dried fruit, meant to last a journey' },
  { name: 'Cheese and Onion Tart', desc: 'a house specialty, according to the sign out front' },
  { name: 'The Innkeeper\u2019s Own', desc: 'nobody\u2019s quite sure what\u2019s in it, but it sells out most nights' },
  { name: 'Salted Pork and Beans', desc: 'simple, filling, always available' }
];

// ---------------------------------------------------------------------
// Phase 2: Merchants, Local Tension, Notable Locations
// ---------------------------------------------------------------------

// Each shop type has a minTier (the smallest settlement it can appear in)
// and its own specialty-blurb pool. Shop names reuse the existing surname
// pools via "[Surname]'s [Type]" rather than a separate word bank.
const TIER_ORDER = ['hamlet', 'village', 'town', 'city'];

const SHOP_TYPES = [
  {
    type: 'Blacksmith', minTier: 'village',
    blurbs: [
      'Known for solid, no-nonsense work \u2014 nothing fancy, nothing that breaks.',
      'Takes commissions for custom work, for the right price.',
      'The forge never seems to go cold, even in high summer.',
      'Better with tools and farm gear than with weapons, whatever the sign says.',
      'Booked out weeks in advance; worth the wait, most say.'
    ]
  },
  {
    type: 'General Store', minTier: 'village',
    blurbs: [
      'Somehow always has exactly what you need, and never quite enough of it.',
      'The shelves are a genuine maze; finding anything specific takes patience.',
      'Prices creep up whenever a caravan\u2019s overdue.',
      'Run out of the front room of the owner\u2019s own house.',
      'Buys as much as it sells \u2014 the real business is trade-ins.'
    ]
  },
  {
    type: 'Apothecary', minTier: 'town',
    blurbs: [
      'Shelves lined with jars nobody\u2019s quite brave enough to ask about.',
      'Has a genuine cure for the common cold, and isn\u2019t shy about the price.',
      'Keeps meticulous notes on every customer\u2019s complaints, for better or worse.',
      'Smells overwhelmingly of dried herbs, some days more pleasantly than others.',
      'Will mix something for almost anything \u2014 for the right story about why you need it.'
    ]
  },
  {
    type: 'Tailor', minTier: 'town',
    blurbs: [
      'Turns around a commission faster than seems reasonable.',
      'Has strong, unsolicited opinions about your color choices.',
      'Specializes in mending over making \u2014 cheaper, and just as skilled.',
      'The shop cat has opinions about fabric too, apparently.',
      'Keeps a small locked case of genuinely fine cloth, for the right customer.'
    ]
  },
  {
    type: 'Jeweler', minTier: 'city',
    blurbs: [
      'Deals mostly in old family pieces, discreetly.',
      'Will appraise anything, no questions asked \u2014 for a fee.',
      'The window display changes weekly; the good stock stays in the back.',
      'Known to buy first and ask questions never.',
      'Specializes in resetting old stones into new settings.'
    ]
  },
  {
    type: 'Alchemist', minTier: 'city',
    blurbs: [
      'The smell out front changes daily, and never explains why.',
      'Sells more theory than potions, if you let them talk.',
      'Keeps the truly volatile stock somewhere nobody\u2019s allowed to ask about.',
      'Has a standing bet running about which regular will finally cause an incident.',
      'Genuinely brilliant, by all accounts, and everyone\u2019s a little afraid of the workshop.'
    ]
  },
  {
    type: 'Bookbinder & Scribe', minTier: 'city',
    blurbs: [
      'Keeps meticulous, occasionally suspicious records of every commission.',
      'Will forge a document, for the right story and the right price.',
      'The back room holds more banned material than anyone lets on.',
      'Copies faster and cleaner than seems entirely natural.',
      'Charges by the word, and negotiates by the paragraph.'
    ]
  },
  {
    type: 'Exotic Goods Importer', minTier: 'city',
    blurbs: [
      'Half the stock has no explanation as to where it came from.',
      'Prices change based on how much they like you.',
      'Claims every item has a story; most of the stories don\u2019t hold up.',
      'The genuinely rare pieces never make it to the front room.',
      'Deals in favors as readily as coin.'
    ]
  }
];

const HAMLET_TRADE_BLURBS = [
  'One family trades in preserved food and mended tools \u2014 not a real shop, just what they can spare.',
  'A single household barters homemade goods for whatever travelers happen to carry.',
  'No real trade to speak of \u2014 everyone makes do, or does without.',
  'One elderly resident keeps a small store of odds and ends, more out of habit than business.'
];

const TEMPLE_DEDICATIONS = [
  'safe travels', 'the harvest', 'lost sailors', 'the hearth and home',
  'healing and recovery', 'the turning seasons', 'the old dead', 'fair judgment',
  'safe childbirth', 'the hunt'
];

const FAMILY_GRUDGE_REASONS = [
  'a decades-old dispute over a boundary stone that\u2019s moved twice',
  'neither side remembers exactly how it started, but neither will let it go',
  'a marriage that was called off, badly, two generations back',
  'a debt that was, depending who you ask, either repaid or never real',
  'grazing rights to the same stretch of land',
  'an accusation of theft that was never proven, or forgiven',
  'a well that one family insists the other poisoned, once, long ago',
  'competing claims to be the settlement\u2019s actual founding family'
];

const DISPUTE_REASONS = [
  'a disputed inheritance nobody can produce paperwork for',
  'a business deal gone sour, publicly and loudly',
  'conflicting claims to the same water rights',
  'an accusation of short-changing customers, never proven',
  'a boundary dispute that\u2019s gone to the council twice already',
  'a broken promise involving a marriage that never happened',
  'a public insult, years old, still not forgotten'
];

const GANG_NAMES = [
  'The Ashgate Reavers', 'The Nine Coins', 'The Drowned Hand', 'The Black Lantern Bravos',
  'The Rustwater Crew', 'The Long Knives', 'The Gilded Rats', 'The Nightmarket Guard',
  'The Broken Chain', 'The Cinder Row Boys', 'The Silver Tally', 'The Hollow Vein'
];

const GANG_RIVALRY_BLURBS = [
  'fighting over control of the docks, quietly for now.',
  'locked in an uneasy truce that could break any day.',
  'competing for the same smuggling routes out of the city.',
  'divided by an old grudge nobody outside either group fully understands.',
  'nominally at peace, though everyone expects that to change.',
  'fighting a slow, mostly bloodless war over protection money.'
];

const NOTABLE_LOCATIONS = [
  'An old stone well, said to never run dry.',
  'A collapsed watchtower nobody\u2019s bothered to clear.',
  'A modest shrine at the crossroads, worn smooth by travelers\u2019 hands.',
  'A public bathhouse, surprisingly well-kept.',
  'A fighting pit behind the tavern, unofficial but well-attended.',
  'A market square that doubles as the only real open space in town.',
  'An old bridge, cracked but still load-bearing \u2014 probably.',
  'A bell tower that hasn\u2019t rung in years, for reasons nobody explains.',
  'A small graveyard, older than anyone can account for.',
  'A training yard, shared uneasily by several factions.',
  'A public notice board, layered thick with old and current postings.',
  'An abandoned mill at the edge of town, avoided after dark.',
  'A single massive, ancient tree nobody will cut down.',
  'A stone circle just outside the boundary, purpose long forgotten.',
  'A flooded quarry that\u2019s become the local swimming hole, against advice.'
];
