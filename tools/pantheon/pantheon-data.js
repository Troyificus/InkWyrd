// Shared pools, plus per-culture (race + subtype) deity pools. A culture
// not yet listed in PANTHEON_CULTURES simply isn't available in the
// Population dropdown yet — see the "still to author" note at the
// bottom of this file for what's pending.

const PANTHEON_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

const GENDER_PRESENTATIONS = ['Masculine', 'Feminine', 'Fluid', 'Non-binary', 'Not applicable'];

// Shared across every culture — real-world pantheons across every human
// culture converge on largely the same handful of spheres of concern, so
// a shared domain pool (with each culture leaning toward a biased subset
// of it, defined per-culture below) is more honest than inventing a
// fully separate domain vocabulary per culture.
const PANTHEON_DOMAINS = [
  'War', 'Death', 'Life', 'Love', 'Trickery', 'Nature', 'Knowledge', 'Craft',
  'Storms', 'the Hunt', 'the Forge', 'the Hearth', 'Fate', 'Dreams', 'the Sea',
  'the Sun', 'the Moon', 'Shadows', 'Secrets', 'Justice', 'the Harvest',
  'Beasts', 'Travel', 'Luck'
];

// A deity's symbol is drawn from whichever of its assigned domains gets
// picked, so a War deity's iconography actually looks war-appropriate
// rather than a symbol drawn independent of what the god is god of.
const DOMAIN_SYMBOLS = {
  'War': ['a crossed sword and spear', 'a notched battle-axe', 'a shield split by a single crack', 'a clenched gauntlet'],
  'Death': ['an hourglass with black sand', 'a single unlit candle', 'a raven with wings spread', 'a door standing ajar'],
  'Life': ['a sprouting seed', 'an open hand cupping water', 'a newborn\u2019s first breath rendered as mist', 'a green shoot through stone'],
  'Love': ['two interlocked rings', 'a heart pierced by a quill, not an arrow', 'twin doves in flight', 'a knot that cannot be untied'],
  'Trickery': ['a fox\u2019s mask', 'a coin that shows the same face on both sides', 'a door with no handle', 'a jester\u2019s three-pointed cap'],
  'Nature': ['an antler wreathed in vines', 'a single oak leaf', 'a spiral of growing thorns', 'a wolf\u2019s paw print'],
  'Knowledge': ['an open book with no visible text', 'an eye set inside a spiral', 'a lantern with a flame that never gutters', 'a key without a matching lock'],
  'Craft': ['a hammer resting on an anvil', 'interlocking gears', 'a chisel and a single perfect stone', 'a loom mid-weave'],
  'Storms': ['a forked bolt of lightning', 'a spiral of wind', 'a cracked sky rendered in one jagged line', 'a ship\u2019s broken mast'],
  'the Hunt': ['a drawn bow', 'a wolf\u2019s howling silhouette', 'a set of antlers', 'a single arrow through a leaf'],
  'the Forge': ['a hammer wreathed in flame', 'a horseshoe glowing at the center', 'molten metal frozen mid-pour', 'an anvil cracked clean in two'],
  'the Hearth': ['a hearth-fire inside an open doorway', 'a kettle over embers', 'a woven basket of bread', 'a lit candle in a window'],
  'Fate': ['three interwoven threads', 'a set of scales with no weights', 'an unspooling loom', 'a single die frozen mid-roll'],
  'Dreams': ['a closed eye with a spiral beneath it', 'a moth circling a candle', 'a key made of smoke', 'a doorway opening onto stars'],
  'the Sea': ['a wave curling into a spiral', 'a single anchor', 'a shell split to show a pearl', 'a trident wrapped in kelp'],
  'the Sun': ['a full sunburst', 'a single eye rayed like the sun', 'a golden disc, half-eclipsed', 'a flame shaped like a crown'],
  'the Moon': ['a crescent cradling a single star', 'a full moon reflected in still water', 'three moons in phase', 'a silver disc behind a wolf\u2019s silhouette'],
  'Shadows': ['a candle casting a shadow larger than itself', 'a cloak with no wearer', 'an eclipsed sun', 'a doorway leading into darkness'],
  'Secrets': ['a locked box with no visible seam', 'a mouth stitched shut', 'a key with no teeth', 'a single sealed scroll'],
  'Justice': ['a balanced set of scales', 'a sword laid flat across open palms', 'an unbroken chain', 'a single unblinking eye'],
  'the Harvest': ['a sheaf of wheat bound with red thread', 'a scythe resting in tall grass', 'an overflowing basket', 'a single ripe seed pod'],
  'Beasts': ['a paw print beside a hoof print', 'a coiled serpent', 'antlers interlocked with claws', 'a pack of wolves rendered as one shape'],
  'Travel': ['a worn walking staff', 'a compass with no fixed north', 'a single footprint in sand', 'a road forking three ways'],
  'Luck': ['a coin balanced on its edge', 'a four-leafed vine', 'a pair of dice showing matching faces', 'a horseshoe hung open-end up']
};

const PANTHEON_CULTURES = {

  human: {
    european: {
      label: 'The Old Kingdoms',
      domainBias: ['War', 'Justice', 'the Hearth', 'the Harvest', 'Craft', 'the Sun', 'Death', 'Fate'],
      alignmentBias: ['Lawful Good', 'Lawful Neutral', 'Neutral Good', 'Lawful Evil'],
      deities: [
        { name: 'Aldric', epithet: 'the Unbroken Oath' },
        { name: 'Seraphine', epithet: 'Keeper of the Long Watch' },
        { name: 'Corwyn', epithet: 'the Iron Judge' },
        { name: 'Maribel', epithet: 'the Hearth-Warden' },
        { name: 'Osric', epithet: 'Who Reaps in Silence' },
        { name: 'Elowen', epithet: 'the Dawn-Bringer' },
        { name: 'Garrow', epithet: 'the Anvil-Handed' },
        { name: 'Isolde', epithet: 'the Fate-Weaver' },
        { name: 'Baldric', epithet: 'the Field Marshal' },
        { name: 'Rosalind', epithet: 'of the Golden Harvest' },
        { name: 'Thaddeus', epithet: 'the Last Word' },
        { name: 'Wynne', epithet: 'the Quiet Mercy' },
        { name: 'Halric', epithet: 'the Storm-Caller' }
      ]
    },
    jade: {
      label: 'The Jade Provinces',
      domainBias: ['Knowledge', 'Fate', 'the Moon', 'Craft', 'Justice', 'the Harvest', 'Life'],
      alignmentBias: ['Lawful Good', 'Lawful Neutral', 'True Neutral', 'Neutral Good'],
      deities: [
        { name: 'Zhaolin', epithet: 'the Measured Path' },
        { name: 'Meihua', epithet: 'Keeper of Ten Thousand Names' },
        { name: 'Takeshi', epithet: 'the Unbending Reed' },
        { name: 'Xiulan', epithet: 'Who Balances the Scale' },
        { name: 'Haruki', epithet: 'the Second Harvest' },
        { name: 'Yumei', epithet: 'the Silver Loom' },
        { name: 'Renshu', epithet: 'the Ancestor\u2019s Debt' },
        { name: 'Fenghua', epithet: 'of the Turning Wheel' },
        { name: 'Kaito', epithet: 'the Quiet Discipline' },
        { name: 'Lianhua', epithet: 'the Lotus Judge' },
        { name: 'Daisuke', epithet: 'Who Walks the Old Roads' },
        { name: 'Shizuka', epithet: 'the Moon\u2019s Reflection' },
        { name: 'Junwei', epithet: 'the Standing Stone' }
      ]
    },
    amber: {
      label: 'The Amber Dunes',
      domainBias: ['the Sun', 'Travel', 'Fate', 'Storms', 'Luck', 'Justice', 'the Sea'],
      alignmentBias: ['Lawful Good', 'True Neutral', 'Lawful Neutral', 'Chaotic Good'],
      deities: [
        { name: 'Rashida', epithet: 'the Sun\u2019s First Blessing' },
        { name: 'Kassim', epithet: 'Who Walks the Long Road' },
        { name: 'Aaliyah', epithet: 'the Oasis Keeper' },
        { name: 'Farouk', epithet: 'the Iron Caravan' },
        { name: 'Nadira', epithet: 'of the Shifting Sands' },
        { name: 'Zayd', epithet: 'the Storm on the Horizon' },
        { name: 'Yasmina', epithet: 'the Fair Bargain' },
        { name: 'Malik', epithet: 'Who Counts the Stars' },
        { name: 'Samira', epithet: 'the Well-Found' },
        { name: 'Hadid', epithet: 'the Unbroken Contract' },
        { name: 'Layla', epithet: 'of the Second Dawn' },
        { name: 'Tariq', epithet: 'the Wanderer\u2019s Debt' }
      ]
    },
    frost: {
      label: 'The Frost Marches',
      domainBias: ['War', 'Storms', 'the Hunt', 'Beasts', 'Death', 'the Forge'],
      alignmentBias: ['Chaotic Good', 'True Neutral', 'Chaotic Neutral', 'Lawful Neutral'],
      deities: [
        { name: 'Volkarik', epithet: 'the Wolf\u2019s Own Judgment' },
        { name: 'Morzhena', epithet: 'Mother of the Long Winter' },
        { name: 'Sokolav', epithet: 'the Iron Talon' },
        { name: 'Zimara', epithet: 'Who Walks the Ice Unbroken' },
        { name: 'Bogomir', epithet: 'the Last Ember' },
        { name: 'Yaroslana', epithet: 'the Storm-Wife' },
        { name: 'Kazimir', epithet: 'the Bear\u2019s Debt' },
        { name: 'Vesnika', epithet: 'of the Thawing Ground' },
        { name: 'Oleg', epithet: 'the Unyielding Frost' },
        { name: 'Radomira', epithet: 'the Hunter\u2019s Toll' },
        { name: 'Stanimir', epithet: 'Who Counts the Fallen Snow' },
        { name: 'Miroslava', epithet: 'the Quiet Blizzard' }
      ]
    },
    ember: {
      label: 'The Ember Plains',
      domainBias: ['the Sun', 'the Harvest', 'Life', 'Nature', 'the Hunt', 'Fate', 'Beasts'],
      alignmentBias: ['Neutral Good', 'True Neutral', 'Lawful Good', 'Chaotic Good'],
      deities: [
        { name: 'Kwabena', epithet: 'the First Sunrise' },
        { name: 'Adaeze', epithet: 'Keeper of the Living Root' },
        { name: 'Osei', epithet: 'the Unbroken Drum' },
        { name: 'Nia', epithet: 'of the Gathering Rains' },
        { name: 'Chidubem', epithet: 'the Ancestor\u2019s Voice' },
        { name: 'Folasade', epithet: 'the Golden Harvest' },
        { name: 'Kwame', epithet: 'Who Walks Before the Herd' },
        { name: 'Zainab', epithet: 'the Patient River' },
        { name: 'Tunde', epithet: 'the Lion\u2019s Own Judgment' },
        { name: 'Adanna', epithet: 'of the Sacred Grove' },
        { name: 'Chike', epithet: 'the Long Memory' },
        { name: 'Amara', epithet: 'the Life-Bringer' }
      ]
    },
    frontier: {
      label: 'The Frontier Territories',
      domainBias: ['Travel', 'Luck', 'Justice', 'the Harvest', 'War', 'Craft'],
      alignmentBias: ['Chaotic Good', 'Neutral Good', 'True Neutral', 'Lawful Neutral'],
      deities: [
        { name: 'Dutch', epithet: 'the First Stake Driven' },
        { name: 'Josephine', epithet: 'the Lucky Crossing' },
        { name: 'Ezra', epithet: 'the Fair Claim' },
        { name: 'Willa', epithet: 'of the New Furrow' },
        { name: 'Reeve', epithet: 'the Long Ledger' },
        { name: 'Maybelle', epithet: 'the Standing Fence' },
        { name: 'Silas', epithet: 'Who Judges the Boundary' },
        { name: 'Sadie', epithet: 'the Second Chance' },
        { name: 'Wyatt', epithet: 'the Root and Stone' },
        { name: 'Etta', epithet: 'the Open Road' },
        { name: 'Grady', epithet: 'of the Settled Debt' },
        { name: 'Birdie', epithet: 'the Gentle Reckoning' }
      ]
    }
  },

  elvish: {
    high: {
      label: 'High Elves',
      domainBias: ['Knowledge', 'the Moon', 'Fate', 'Dreams', 'Secrets', 'the Sun', 'Justice'],
      alignmentBias: ['Lawful Neutral', 'Lawful Good', 'True Neutral', 'Neutral Good'],
      deities: [
        { name: 'Aurelion', epithet: 'the First Star Counted' },
        { name: 'Isandriel', epithet: 'Keeper of the Unwritten' },
        { name: 'Thelorien', epithet: 'the Patient Loom' },
        { name: 'Nyvaeth', epithet: 'Who Dreams the Waking World' },
        { name: 'Caelithor', epithet: 'the Long Memory' },
        { name: 'Silmariel', epithet: 'the Moon\u2019s Own Counsel' },
        { name: 'Vaelendor', epithet: 'the Measured Word' },
        { name: 'Ashariel', epithet: 'of the Unbroken Line' },
        { name: 'Orindel', epithet: 'the Star-Bound Judge' },
        { name: 'Lythariel', epithet: 'the Quiet Certainty' },
        { name: 'Faelendris', epithet: 'Who Waits Without Waiting' },
        { name: 'Serevanth', epithet: 'the Golden Archive' }
      ]
    },
    wood: {
      label: 'Wood Elves',
      domainBias: ['Nature', 'the Hunt', 'Beasts', 'the Harvest', 'Travel', 'Luck', 'Storms'],
      alignmentBias: ['Chaotic Good', 'Neutral Good', 'True Neutral', 'Chaotic Neutral'],
      deities: [
        { name: 'Brannoc', epithet: 'the First Root' },
        { name: 'Fernwyn', epithet: 'Who Runs Ahead of Autumn' },
        { name: 'Talrion', epithet: 'the Antlered Wanderer' },
        { name: 'Sorrelith', epithet: 'of the Green Deep' },
        { name: 'Wrendal', epithet: 'the Sudden Storm' },
        { name: 'Hazelwen', epithet: 'the Bramble-Blessed' },
        { name: 'Corathal', epithet: 'Who Names No Master' },
        { name: 'Mossira', epithet: 'the Patient Undergrowth' },
        { name: 'Vethorion', epithet: 'the Lucky Arrow' },
        { name: 'Willowfen', epithet: 'of the Thousand Paths' },
        { name: 'Rowanth', epithet: 'the Wild Harvest' },
        { name: 'Duskaria', epithet: 'the Quiet Between Trees' }
      ]
    },
    umbral: {
      label: 'Umbral Elves',
      domainBias: ['Shadows', 'Secrets', 'Death', 'Dreams', 'Trickery', 'the Moon', 'Fate'],
      alignmentBias: ['Chaotic Neutral', 'Neutral Evil', 'True Neutral', 'Lawful Evil'],
      deities: [
        { name: 'Kethraxis', epithet: 'That Which Waits' },
        { name: 'Nyxarelle', epithet: 'the Unlit Path' },
        { name: 'Malvorien', epithet: 'Keeper of Owed Debts' },
        { name: 'Vethanine', epithet: 'the Unspoken Name' },
        { name: 'Orvath', epithet: 'the Hollow Judge' },
        { name: 'Serathyx', epithet: 'Who Counts What Is Lost' },
        { name: 'Ulmaris', epithet: 'the Voice Beneath the Voice' },
        { name: 'Xandrielle', epithet: 'of the Turning Dark' },
        { name: 'Quorathiel', epithet: 'the Second Shadow' },
        { name: 'Zorathine', epithet: 'the Patient Undoing' },
        { name: 'Ashvarion', epithet: 'Who Was Never Named' },
        { name: 'Morwyndra', epithet: 'the Last Silence' }
      ]
    }
  },

  dwarvish: {
    mountain: {
      label: 'Mountain Dwarves',
      domainBias: ['the Forge', 'Craft', 'War', 'Storms', 'Justice', 'Death'],
      alignmentBias: ['Lawful Good', 'Lawful Neutral', 'Lawful Evil', 'True Neutral'],
      deities: [
        { name: 'Thurgrimm', epithet: 'the Unbroken Vein' },
        { name: 'Brenhilda', epithet: 'Keeper of the Deep Oath' },
        { name: 'Dainor', epithet: 'the Anvil\u2019s Judgment' },
        { name: 'Grunvald', epithet: 'Who Names the Mountain\u2019s Root' },
        { name: 'Sigrunna', epithet: 'the Thunder Below' },
        { name: 'Baldrek', epithet: 'the Iron Testament' },
        { name: 'Vondra', epithet: 'of the Endless Delve' },
        { name: 'Harnok', epithet: 'the Standing Peak' },
        { name: 'Katrindra', epithet: 'the Forge-Sworn' },
        { name: 'Orrindal', epithet: 'Who Answers the Deep Bell' },
        { name: 'Runeheld', epithet: 'the Unshaken Wall' },
        { name: 'Thyranna', epithet: 'the Last Chamber' }
      ]
    },
    hill: {
      label: 'Hill Dwarves',
      domainBias: ['the Hearth', 'the Harvest', 'Craft', 'Luck', 'the Sun', 'Love'],
      alignmentBias: ['Neutral Good', 'Lawful Good', 'True Neutral', 'Chaotic Good'],
      deities: [
        { name: 'Dorbin', epithet: 'the Full Cask' },
        { name: 'Cordelietta', epithet: 'Keeper of the Warm Table' },
        { name: 'Farrik', epithet: 'the Lucky Harvest' },
        { name: 'Marellda', epithet: 'of the Golden Wheel' },
        { name: 'Perrindale', epithet: 'the Brewer\u2019s Blessing' },
        { name: 'Odessa', epithet: 'the Sunlit Meadow' },
        { name: 'Wendrick', epithet: 'Who Fills the Empty Bowl' },
        { name: 'Tavianna', epithet: 'the Second Helping' },
        { name: 'Rombus', epithet: 'the Hearth-Keeper' },
        { name: 'Junieta', epithet: 'of the First Frost Cellar' },
        { name: 'Yorrick', epithet: 'the Generous Toll' },
        { name: 'Bramma', epithet: 'the Orchard\u2019s Own' }
      ]
    },
    dark: {
      label: 'Dark Dwarves',
      domainBias: ['the Forge', 'Shadows', 'Death', 'Secrets', 'War'],
      alignmentBias: ['Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'True Neutral'],
      deities: [
        { name: 'Grimnarok', epithet: 'the Cold Forge' },
        { name: 'Karvassa', epithet: 'Keeper of the Buried Debt' },
        { name: 'Nulgrimm', epithet: 'the Unlit Seam' },
        { name: 'Orzethra', epithet: 'Who Names No Price Too High' },
        { name: 'Skregnar', epithet: 'the Slag-Handed' },
        { name: 'Thrakonis', epithet: 'the Deep Betrayal' },
        { name: 'Ulgorra', epithet: 'of the Hollow Vault' },
        { name: 'Vraskanth', epithet: 'the Voidforge Oath' },
        { name: 'Zhurnath', epithet: 'the Last Ember Turned Cold' },
        { name: 'Morvekka', epithet: 'Who Counts the Silent Dead' },
        { name: 'Direthok', epithet: 'the Grim Contract' },
        { name: 'Ashkarra', epithet: 'the Buried Flame' }
      ]
    }
  },

  orcish: {
    standard: {
      label: 'Standard',
      domainBias: ['War', 'Storms', 'the Forge', 'Beasts', 'Death', 'the Hunt'],
      alignmentBias: ['Chaotic Neutral', 'Chaotic Evil', 'Neutral Evil', 'Chaotic Good'],
      deities: [
        { name: 'Grokthar', epithet: 'the Unyielding Tusk' },
        { name: 'Zulgara', epithet: 'Mother of the First Warband' },
        { name: 'Drennok', epithet: 'the Storm That Answers' },
        { name: 'Karvesh', epithet: 'Who Breaks the Line' },
        { name: 'Ragathok', epithet: 'the Forge-Scarred' },
        { name: 'Vraskuna', epithet: 'the Blood-Counted' },
        { name: 'Morzuk', epithet: 'the Last Stand' },
        { name: 'Ushkara', epithet: 'of the Endless Hunt' },
        { name: 'Thrakgor', epithet: 'the Bone-Truth' },
        { name: 'Skavara', epithet: 'the Wild Reckoning' },
        { name: 'Grumnash', epithet: 'Who Answers No Chief' },
        { name: 'Nagrothi', epithet: 'the Iron Verdict' }
      ]
    }
  },

  halfling: {
    standard: {
      label: 'Standard',
      domainBias: ['the Hearth', 'the Harvest', 'Love', 'Luck', 'Life', 'Nature'],
      alignmentBias: ['Neutral Good', 'Lawful Good', 'Chaotic Good', 'True Neutral'],
      deities: [
        { name: 'Merrywyn', epithet: 'the Full Larder' },
        { name: 'Tobias', epithet: 'Keeper of the Second Slice' },
        { name: 'Poppy', epithet: 'the Lucky Threshold' },
        { name: 'Bramblewick', epithet: 'of the Well-Tended Row' },
        { name: 'Marigold', epithet: 'the Warm Welcome' },
        { name: 'Fennick', epithet: 'Who Remembers Every Name' },
        { name: 'Clementine', epithet: 'the Overflowing Basket' },
        { name: 'Wilbur', epithet: 'the Patient Garden' },
        { name: 'Daisy', epithet: 'of the Shared Table' },
        { name: 'Peregrin', epithet: 'the Homeward Path' },
        { name: 'Rosalie', epithet: 'the Gentle Harvest' },
        { name: 'Fitzwilliam', epithet: 'the Good Neighbor' }
      ]
    }
  },

  draconic: {
    standard: {
      label: 'Standard',
      domainBias: ['the Sun', 'War', 'Fate', 'Knowledge', 'the Forge', 'Luck'],
      alignmentBias: ['Lawful Neutral', 'Neutral Evil', 'Lawful Evil', 'True Neutral'],
      deities: [
        { name: 'Vaelithrax', epithet: 'the First Flame Claimed' },
        { name: 'Ashkariel', epithet: 'Keeper of the Old Hoard' },
        { name: 'Zephyrion', epithet: 'the Unbroken Wing' },
        { name: 'Nyrathiss', epithet: 'Who Names the True Price' },
        { name: 'Korvantis', epithet: 'the Ember Testament' },
        { name: 'Sylvarax', epithet: 'of the Ancient Claim' },
        { name: 'Thraxamere', epithet: 'the Golden Reckoning' },
        { name: 'Ilvarion', epithet: 'the Sky-Bound Judge' },
        { name: 'Vexandria', epithet: 'the Coiled Wisdom' },
        { name: 'Draxenth', epithet: 'Who Remembers Every Debt' },
        { name: 'Ophrelia', epithet: 'the Sunlit Hoard' },
        { name: 'Kaelthorn', epithet: 'the Last Ember' }
      ]
    }
  },

  eldritch: {
    standard: {
      label: 'Standard',
      domainBias: ['Shadows', 'Secrets', 'Dreams', 'Fate', 'Death', 'Knowledge'],
      alignmentBias: ['True Neutral', 'Chaotic Neutral', 'Neutral Evil', 'Lawful Neutral'],
      deities: [
        { name: 'Vhalkirith', epithet: 'the Unwritten Verdict' },
        { name: 'Ashkarel', epithet: 'the Unmade' },
        { name: 'Nythera', epithet: 'Who Counts the Uncounted' },
        { name: 'Corvaxis', epithet: 'the Folded Truth' },
        { name: 'Umbrielle', epithet: 'the Space Between Answers' },
        { name: 'Zhalkorith', epithet: 'Who Was Always Watching' },
        { name: 'Serathkin', epithet: 'the Second Question' },
        { name: 'Vorenathi', epithet: 'the Still Convergence' },
        { name: 'Nhalvarik', epithet: 'That Which Remembers Forward' },
        { name: 'Ithrakelle', epithet: 'the Hollow Chorus' },
        { name: 'Quovethis', epithet: 'the Unfinished Name' },
        { name: 'Malkurath', epithet: 'Who Waits Beneath the Waiting' }
      ]
    }
  }

};
