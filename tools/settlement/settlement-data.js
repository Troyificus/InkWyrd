// Content pools for the Settlement Generator (Phase 1: Identity,
// Governance, Tavern — scaled across Hamlet/Village/Town/City).
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
