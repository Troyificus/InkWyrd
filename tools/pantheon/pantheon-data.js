// Shared pools, plus per-culture (race + subtype) deity pools. A culture
// not yet listed in PANTHEON_CULTURES simply isn't available in the
// Population dropdown yet. See the "still to author" note at the
// bottom of this file for what's pending.

const PANTHEON_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

const GENDER_PRESENTATIONS = ['Masculine', 'Feminine', 'Fluid', 'Non-binary', 'Not applicable'];

// Shared across every culture. Real-world pantheons across every human
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
  'War': ['a crossed sword and spear', 'a notched battle-axe', 'a shield split by a single crack', 'a clenched gauntlet', 'a morning star in flight', 'a blood red sky over a battlefield', 'an arrow in the socket of a skull', 'a spear in the ribcage of a skeleton'],
  'Death': ['an hourglass with black sand', 'a single unlit candle', 'a raven with wings spread', 'a door standing ajar', 'a desert of black sand', 'a scythe against a field of golden wheat'],
  'Life': ['a sprouting seed', 'an open hand cupping water', 'a newborn\u2019s first breath rendered as mist', 'a green shoot through stone', 'a blazing sun over a field of golden wheat', 'a lit candle with a black flame'],
  'Love': ['two interlocked rings', 'a heart pierced by a quill, not an arrow', 'twin doves in flight', 'a knot that cannot be untied', 'a heart aflame'],
  'Trickery': ['a fox\u2019s mask', 'a coin that shows the same face on both sides', 'a door with no handle', 'a jester\u2019s three-pointed cap', 'a coin on it\u2019s edge', 'a hand of 5 cards, all aces'],
  'Nature': ['an antler wreathed in vines', 'a single oak leaf', 'a spiral of growing thorns', 'a wolf\u2019s paw print','a stream over lush moorland','a stag with symettrical antlers'],
  'Knowledge': ['an open book with no visible text', 'an eye set inside a spiral', 'a lantern with a flame that never gutters', 'a key in the forehead of a skull','a golden quill'],
  'Craft': ['a hammer resting on an anvil', 'interlocking gears', 'a chisel and a single perfect stone', 'a loom mid-weave'],
  'Storms': ['a forked bolt of lightning', 'a spiral of wind', 'a cracked sky rendered in one jagged line', 'a ship\u2019s broken mast','a fist holding a bolt of lightning'],
  'the Hunt': ['a drawn bow', 'a wolf\u2019s howling silhouette', 'a shrub with a pair of eyes visible', 'a single arrow through a leaf'],
  'the Forge': ['a hammer wreathed in flame', 'a horseshoe glowing at the center', 'molten metal frozen mid-pour', 'an anvil cracked clean in two','a glowing forge'],
  'the Hearth': ['a hearth-fire inside an open doorway', 'a kettle over embers', 'a woven basket of bread', 'a lit candle in a window'],
  'Fate': ['three interwoven threads', 'a set of scales with no weights', 'an unspooling loom', 'a pair of dice frozen mid-roll','a snake biting its own tail'],
  'Dreams': ['a closed eye with a spiral beneath it', 'a moth circling a candle', 'a key made of smoke', 'a doorway opening onto stars','a closed door standing on open water'],
  'the Sea': ['a wave curling into a spiral', 'a single anchor', 'a shell split to show a pearl', 'a trident wrapped in kelp','a crab with its claws raised'],
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
      alignmentBias: ['Lawful Good', 'Lawful Neutral', 'Neutral Good', 'Lawful Evil'],
      deities: [
        { name: 'Aldric', epithet: 'the Unbroken Oath', domains: ['Justice'] },
        { name: 'Seraphine', epithet: 'Keeper of the Long Watch', domains: ['Justice'] },
        { name: 'Corwyn', epithet: 'the Iron Judge', domains: ['Justice', 'War'] },
        { name: 'Maribel', epithet: 'the Hearth-Warden', domains: ['the Hearth'] },
        { name: 'Osric', epithet: 'Who Reaps in Silence', domains: ['Death'] },
        { name: 'Elowen', epithet: 'the Dawn-Bringer', domains: ['the Sun'] },
        { name: 'Garrow', epithet: 'the Anvil-Handed', domains: ['Craft'] },
        { name: 'Isolde', epithet: 'the Fate-Weaver', domains: ['Fate'] },
        { name: 'Baldric', epithet: 'the Field Marshal', domains: ['War'] },
        { name: 'Rosalind', epithet: 'of the Golden Harvest', domains: ['the Harvest'] },
        { name: 'Thaddeus', epithet: 'the Last Word', domains: ['Justice'] },
        { name: 'Wynne', epithet: 'the Quiet Mercy', domains: ['Life'] },
        { name: 'Halric', epithet: 'the Storm-Caller', domains: ['Storms'] }
      ]
    },
    jade: {
      label: 'The Jade Provinces',
      alignmentBias: ['Lawful Good', 'Lawful Neutral', 'True Neutral', 'Neutral Good'],
      deities: [
        { name: 'Zhaolin', epithet: 'the Measured Path', domains: ['Fate', 'Justice'] },
        { name: 'Meihua', epithet: 'Keeper of Ten Thousand Names', domains: ['Knowledge'] },
        { name: 'Takeshi', epithet: 'the Unbending Reed', domains: ['Justice'] },
        { name: 'Xiulan', epithet: 'Who Balances the Scale', domains: ['Justice'] },
        { name: 'Haruki', epithet: 'the Second Harvest', domains: ['the Harvest'] },
        { name: 'Yumei', epithet: 'the Silver Loom', domains: ['Fate'] },
        { name: 'Renshu', epithet: 'the Ancestor\u2019s Debt', domains: ['Death', 'Fate'] },
        { name: 'Fenghua', epithet: 'of the Turning Wheel', domains: ['Fate'] },
        { name: 'Kaito', epithet: 'the Quiet Discipline', domains: ['Knowledge'] },
        { name: 'Lianhua', epithet: 'the Lotus Judge', domains: ['Justice'] },
        { name: 'Daisuke', epithet: 'Who Walks the Old Roads', domains: ['Travel'] },
        { name: 'Shizuka', epithet: 'the Moon\u2019s Reflection', domains: ['the Moon'] },
        { name: 'Junwei', epithet: 'the Standing Stone', domains: ['Justice'] }
      ]
    },
    amber: {
      label: 'The Amber Dunes',
      alignmentBias: ['Lawful Good', 'True Neutral', 'Lawful Neutral', 'Chaotic Good'],
      deities: [
        { name: 'Rashida', epithet: 'the Sun\u2019s First Blessing', domains: ['the Sun'] },
        { name: 'Kassim', epithet: 'Who Walks the Long Road', domains: ['Travel'] },
        { name: 'Aaliyah', epithet: 'the Oasis Keeper', domains: ['the Sea', 'Life'] },
        { name: 'Farouk', epithet: 'the Iron Caravan', domains: ['Travel'] },
        { name: 'Nadira', epithet: 'of the Shifting Sands', domains: ['Storms'] },
        { name: 'Zayd', epithet: 'the Storm on the Horizon', domains: ['Storms'] },
        { name: 'Yasmina', epithet: 'the Fair Bargain', domains: ['Justice'] },
        { name: 'Malik', epithet: 'Who Counts the Stars', domains: ['Knowledge', 'the Moon'] },
        { name: 'Samira', epithet: 'the Well-Found', domains: ['Luck'] },
        { name: 'Hadid', epithet: 'the Unbroken Contract', domains: ['Justice'] },
        { name: 'Layla', epithet: 'of the Second Dawn', domains: ['the Sun'] },
        { name: 'Tariq', epithet: 'the Wanderer\u2019s Debt', domains: ['Travel'] }
      ]
    },
    frost: {
      label: 'The Frost Marches',
      alignmentBias: ['Chaotic Good', 'True Neutral', 'Chaotic Neutral', 'Lawful Neutral'],
      deities: [
        { name: 'Volkarik', epithet: 'the Wolf\u2019s Own Judgment', domains: ['Beasts'] },
        { name: 'Morzhena', epithet: 'Mother of the Long Winter', domains: ['Storms'] },
        { name: 'Sokolav', epithet: 'the Iron Talon', domains: ['War'] },
        { name: 'Zimara', epithet: 'Who Walks the Ice Unbroken', domains: ['Storms'] },
        { name: 'Bogomir', epithet: 'the Last Ember', domains: ['the Hearth'] },
        { name: 'Yaroslana', epithet: 'the Storm-Wife', domains: ['Storms'] },
        { name: 'Kazimir', epithet: 'the Bear\u2019s Debt', domains: ['Beasts'] },
        { name: 'Vesnika', epithet: 'of the Thawing Ground', domains: ['Life'] },
        { name: 'Oleg', epithet: 'the Unyielding Frost', domains: ['Storms'] },
        { name: 'Radomira', epithet: 'the Hunter\u2019s Toll', domains: ['the Hunt'] },
        { name: 'Stanimir', epithet: 'Who Counts the Fallen Snow', domains: ['Death'] },
        { name: 'Miroslava', epithet: 'the Quiet Blizzard', domains: ['Storms'] }
      ]
    },
    ember: {
      label: 'The Ember Plains',
      alignmentBias: ['Neutral Good', 'True Neutral', 'Lawful Good', 'Chaotic Good'],
      deities: [
        { name: 'Kwabena', epithet: 'the First Sunrise', domains: ['the Sun'] },
        { name: 'Adaeze', epithet: 'Keeper of the Living Root', domains: ['Nature'] },
        { name: 'Osei', epithet: 'the Unbroken Drum', domains: ['Knowledge'] },
        { name: 'Nia', epithet: 'of the Gathering Rains', domains: ['Storms'] },
        { name: 'Chidubem', epithet: 'the Ancestor\u2019s Voice', domains: ['Knowledge'] },
        { name: 'Folasade', epithet: 'the Golden Harvest', domains: ['the Harvest'] },
        { name: 'Kwame', epithet: 'Who Walks Before the Herd', domains: ['Beasts'] },
        { name: 'Zainab', epithet: 'the Patient River', domains: ['the Sea'] },
        { name: 'Tunde', epithet: 'the Lion\u2019s Own Judgment', domains: ['Beasts'] },
        { name: 'Adanna', epithet: 'of the Sacred Grove', domains: ['Nature'] },
        { name: 'Chike', epithet: 'the Long Memory', domains: ['Knowledge'] },
        { name: 'Amara', epithet: 'the Life-Bringer', domains: ['Life'] }
      ]
    },
    frontier: {
      label: 'The Frontier Territories',
      alignmentBias: ['Chaotic Good', 'Neutral Good', 'True Neutral', 'Lawful Neutral'],
      deities: [
        { name: 'Dutch', epithet: 'the First Stake Driven', domains: ['Justice'] },
        { name: 'Josephine', epithet: 'the Lucky Crossing', domains: ['Luck'] },
        { name: 'Ezra', epithet: 'the Fair Claim', domains: ['Justice'] },
        { name: 'Willa', epithet: 'of the New Furrow', domains: ['the Harvest'] },
        { name: 'Reeve', epithet: 'the Long Ledger', domains: ['Justice'] },
        { name: 'Maybelle', epithet: 'the Standing Fence', domains: ['Justice'] },
        { name: 'Silas', epithet: 'Who Judges the Boundary', domains: ['Justice'] },
        { name: 'Sadie', epithet: 'the Second Chance', domains: ['Luck'] },
        { name: 'Wyatt', epithet: 'the Root and Stone', domains: ['Craft'] },
        { name: 'Etta', epithet: 'the Open Road', domains: ['Travel'] },
        { name: 'Grady', epithet: 'of the Settled Debt', domains: ['Justice'] },
        { name: 'Birdie', epithet: 'the Gentle Reckoning', domains: ['Fate'] }
      ]
    }
  },

  elvish: {
    high: {
      label: 'High Elves',
      alignmentBias: ['Lawful Neutral', 'Lawful Good', 'True Neutral', 'Neutral Good'],
      deities: [
        { name: 'Aurelion', epithet: 'the First Star Counted', domains: ['Knowledge'] },
        { name: 'Isandriel', epithet: 'Keeper of the Unwritten', domains: ['Secrets'] },
        { name: 'Thelorien', epithet: 'the Patient Loom', domains: ['Fate'] },
        { name: 'Nyvaeth', epithet: 'Who Dreams the Waking World', domains: ['Dreams'] },
        { name: 'Caelithor', epithet: 'the Long Memory', domains: ['Knowledge'] },
        { name: 'Silmariel', epithet: 'the Moon\u2019s Own Counsel', domains: ['the Moon'] },
        { name: 'Vaelendor', epithet: 'the Measured Word', domains: ['Justice'] },
        { name: 'Ashariel', epithet: 'of the Unbroken Line', domains: ['Fate'] },
        { name: 'Orindel', epithet: 'the Star-Bound Judge', domains: ['Justice'] },
        { name: 'Lythariel', epithet: 'the Quiet Certainty', domains: ['Knowledge'] },
        { name: 'Faelendris', epithet: 'Who Waits Without Waiting', domains: ['Fate'] },
        { name: 'Serevanth', epithet: 'the Golden Archive', domains: ['Knowledge'] }
      ]
    },
    wood: {
      label: 'Wood Elves',
      alignmentBias: ['Chaotic Good', 'Neutral Good', 'True Neutral', 'Chaotic Neutral'],
      deities: [
        { name: 'Brannoc', epithet: 'the First Root', domains: ['Nature'] },
        { name: 'Fernwyn', epithet: 'Who Runs Ahead of Autumn', domains: ['the Harvest'] },
        { name: 'Talrion', epithet: 'the Antlered Wanderer', domains: ['Beasts'] },
        { name: 'Sorrelith', epithet: 'of the Green Deep', domains: ['Nature'] },
        { name: 'Wrendal', epithet: 'the Sudden Storm', domains: ['Storms'] },
        { name: 'Hazelwen', epithet: 'the Bramble-Blessed', domains: ['Nature'] },
        { name: 'Corathal', epithet: 'Who Names No Master', domains: ['Travel'] },
        { name: 'Mossira', epithet: 'the Patient Undergrowth', domains: ['Nature'] },
        { name: 'Vethorion', epithet: 'the Lucky Arrow', domains: ['the Hunt'] },
        { name: 'Willowfen', epithet: 'of the Thousand Paths', domains: ['Travel'] },
        { name: 'Rowanth', epithet: 'the Wild Harvest', domains: ['the Harvest'] },
        { name: 'Duskaria', epithet: 'the Quiet Between Trees', domains: ['Nature'] }
      ]
    },
    umbral: {
      label: 'Umbral Elves',
      alignmentBias: ['Chaotic Neutral', 'Neutral Evil', 'True Neutral', 'Lawful Evil'],
      deities: [
        { name: 'Kethraxis', epithet: 'That Which Waits', domains: ['Shadows'] },
        { name: 'Nyxarelle', epithet: 'the Unlit Path', domains: ['Shadows'] },
        { name: 'Malvorien', epithet: 'Keeper of Owed Debts', domains: ['Fate'] },
        { name: 'Vethanine', epithet: 'the Unspoken Name', domains: ['Secrets'] },
        { name: 'Orvath', epithet: 'the Hollow Judge', domains: ['Justice'] },
        { name: 'Serathyx', epithet: 'Who Counts What Is Lost', domains: ['Death'] },
        { name: 'Ulmaris', epithet: 'the Voice Beneath the Voice', domains: ['Secrets'] },
        { name: 'Xandrielle', epithet: 'of the Turning Dark', domains: ['Shadows'] },
        { name: 'Quorathiel', epithet: 'the Second Shadow', domains: ['Shadows'] },
        { name: 'Zorathine', epithet: 'the Patient Undoing', domains: ['Fate'] },
        { name: 'Ashvarion', epithet: 'Who Was Never Named', domains: ['Secrets'] },
        { name: 'Morwyndra', epithet: 'the Last Silence', domains: ['Death'] }
      ]
    }
  },

  dwarvish: {
    mountain: {
      label: 'Mountain Dwarves',
      alignmentBias: ['Lawful Good', 'Lawful Neutral', 'Lawful Evil', 'True Neutral'],
      deities: [
        { name: 'Thurgrimm', epithet: 'the Unbroken Vein', domains: ['the Forge'] },
        { name: 'Brenhilda', epithet: 'Keeper of the Deep Oath', domains: ['Justice'] },
        { name: 'Dainor', epithet: 'the Anvil\u2019s Judgment', domains: ['the Forge'] },
        { name: 'Grunvald', epithet: 'Who Names the Mountain\u2019s Root', domains: ['Craft'] },
        { name: 'Sigrunna', epithet: 'the Thunder Below', domains: ['War'] },
        { name: 'Baldrek', epithet: 'the Iron Testament', domains: ['Craft'] },
        { name: 'Vondra', epithet: 'of the Endless Delve', domains: ['Craft'] },
        { name: 'Harnok', epithet: 'the Standing Peak', domains: ['Justice'] },
        { name: 'Katrindra', epithet: 'the Forge-Sworn', domains: ['the Forge'] },
        { name: 'Orrindal', epithet: 'Who Answers the Deep Bell', domains: ['Justice'] },
        { name: 'Runeheld', epithet: 'the Unshaken Wall', domains: ['War'] },
        { name: 'Thyranna', epithet: 'the Last Chamber', domains: ['Death'] }
      ]
    },
    hill: {
      label: 'Hill Dwarves',
      alignmentBias: ['Neutral Good', 'Lawful Good', 'True Neutral', 'Chaotic Good'],
      deities: [
        { name: 'Dorbin', epithet: 'the Full Cask', domains: ['the Hearth'] },
        { name: 'Cordelietta', epithet: 'Keeper of the Warm Table', domains: ['the Hearth'] },
        { name: 'Farrik', epithet: 'the Lucky Harvest', domains: ['Luck'] },
        { name: 'Marellda', epithet: 'of the Golden Wheel', domains: ['the Harvest'] },
        { name: 'Perrindale', epithet: 'the Brewer\u2019s Blessing', domains: ['Craft'] },
        { name: 'Odessa', epithet: 'the Sunlit Meadow', domains: ['the Sun'] },
        { name: 'Wendrick', epithet: 'Who Fills the Empty Bowl', domains: ['the Hearth'] },
        { name: 'Tavianna', epithet: 'the Second Helping', domains: ['the Hearth'] },
        { name: 'Rombus', epithet: 'the Hearth-Keeper', domains: ['the Hearth'] },
        { name: 'Junieta', epithet: 'of the First Frost Cellar', domains: ['the Harvest'] },
        { name: 'Yorrick', epithet: 'the Generous Toll', domains: ['Love'] },
        { name: 'Bramma', epithet: 'the Orchard\u2019s Own', domains: ['the Harvest'] }
      ]
    },
    dark: {
      label: 'Dark Dwarves',
      alignmentBias: ['Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'True Neutral'],
      deities: [
        { name: 'Grimnarok', epithet: 'the Cold Forge', domains: ['the Forge'] },
        { name: 'Karvassa', epithet: 'Keeper of the Buried Debt', domains: ['Secrets'] },
        { name: 'Nulgrimm', epithet: 'the Unlit Seam', domains: ['Shadows'] },
        { name: 'Orzethra', epithet: 'Who Names No Price Too High', domains: ['Secrets'] },
        { name: 'Skregnar', epithet: 'the Slag-Handed', domains: ['the Forge'] },
        { name: 'Thrakonis', epithet: 'the Deep Betrayal', domains: ['Shadows'] },
        { name: 'Ulgorra', epithet: 'of the Hollow Vault', domains: ['Secrets'] },
        { name: 'Vraskanth', epithet: 'the Voidforge Oath', domains: ['the Forge'] },
        { name: 'Zhurnath', epithet: 'the Last Ember Turned Cold', domains: ['Death'] },
        { name: 'Morvekka', epithet: 'Who Counts the Silent Dead', domains: ['Death'] },
        { name: 'Direthok', epithet: 'the Grim Contract', domains: ['Secrets'] },
        { name: 'Ashkarra', epithet: 'the Buried Flame', domains: ['Shadows'] }
      ]
    }
  },

  orcish: {
    standard: {
      label: 'Standard',
      alignmentBias: ['Chaotic Neutral', 'Chaotic Evil', 'Neutral Evil', 'Chaotic Good'],
      deities: [
        { name: 'Grokthar', epithet: 'the Unyielding Tusk', domains: ['War'] },
        { name: 'Zulgara', epithet: 'Mother of the First Warband', domains: ['War'] },
        { name: 'Drennok', epithet: 'the Storm That Answers', domains: ['Storms'] },
        { name: 'Karvesh', epithet: 'Who Breaks the Line', domains: ['War'] },
        { name: 'Ragathok', epithet: 'the Forge-Scarred', domains: ['the Forge'] },
        { name: 'Vraskuna', epithet: 'the Blood-Counted', domains: ['War'] },
        { name: 'Morzuk', epithet: 'the Last Stand', domains: ['War'] },
        { name: 'Ushkara', epithet: 'of the Endless Hunt', domains: ['the Hunt'] },
        { name: 'Thrakgor', epithet: 'the Bone-Truth', domains: ['Death'] },
        { name: 'Skavara', epithet: 'the Wild Reckoning', domains: ['Beasts'] },
        { name: 'Grumnash', epithet: 'Who Answers No Chief', domains: ['War'] },
        { name: 'Nagrothi', epithet: 'the Iron Verdict', domains: ['War'] }
      ]
    }
  },

  halfling: {
    standard: {
      label: 'Standard',
      alignmentBias: ['Neutral Good', 'Lawful Good', 'Chaotic Good', 'True Neutral'],
      deities: [
        { name: 'Merrywyn', epithet: 'the Full Larder', domains: ['the Hearth'] },
        { name: 'Tobias', epithet: 'Keeper of the Second Slice', domains: ['the Hearth'] },
        { name: 'Poppy', epithet: 'the Lucky Threshold', domains: ['Luck'] },
        { name: 'Bramblewick', epithet: 'of the Well-Tended Row', domains: ['the Harvest'] },
        { name: 'Marigold', epithet: 'the Warm Welcome', domains: ['Love'] },
        { name: 'Fennick', epithet: 'Who Remembers Every Name', domains: ['Love'] },
        { name: 'Clementine', epithet: 'the Overflowing Basket', domains: ['the Harvest'] },
        { name: 'Wilbur', epithet: 'the Patient Garden', domains: ['Nature'] },
        { name: 'Daisy', epithet: 'of the Shared Table', domains: ['the Hearth'] },
        { name: 'Peregrin', epithet: 'the Homeward Path', domains: ['Travel'] },
        { name: 'Rosalie', epithet: 'the Gentle Harvest', domains: ['the Harvest'] },
        { name: 'Fitzwilliam', epithet: 'the Good Neighbor', domains: ['Love'] }
      ]
    }
  },

  draconic: {
    standard: {
      label: 'Standard',
      alignmentBias: ['Lawful Neutral', 'Neutral Evil', 'Lawful Evil', 'True Neutral'],
      deities: [
        { name: 'Vaelithrax', epithet: 'the First Flame Claimed', domains: ['the Forge'] },
        { name: 'Ashkariel', epithet: 'Keeper of the Old Hoard', domains: ['Luck'] },
        { name: 'Zephyrion', epithet: 'the Unbroken Wing', domains: ['Travel'] },
        { name: 'Nyrathiss', epithet: 'Who Names the True Price', domains: ['Justice'] },
        { name: 'Korvantis', epithet: 'the Ember Testament', domains: ['the Forge'] },
        { name: 'Sylvarax', epithet: 'of the Ancient Claim', domains: ['Fate'] },
        { name: 'Thraxamere', epithet: 'the Golden Reckoning', domains: ['Justice'] },
        { name: 'Ilvarion', epithet: 'the Sky-Bound Judge', domains: ['Justice'] },
        { name: 'Vexandria', epithet: 'the Coiled Wisdom', domains: ['Knowledge'] },
        { name: 'Draxenth', epithet: 'Who Remembers Every Debt', domains: ['Fate'] },
        { name: 'Ophrelia', epithet: 'the Sunlit Hoard', domains: ['the Sun'] },
        { name: 'Kaelthorn', epithet: 'the Last Ember', domains: ['the Forge'] }
      ]
    }
  },

  eldritch: {
    standard: {
      label: 'Standard',
      alignmentBias: ['True Neutral', 'Chaotic Neutral', 'Neutral Evil', 'Lawful Neutral'],
      deities: [
        { name: 'Vhalkirith', epithet: 'the Unwritten Verdict', domains: ['Fate'] },
        { name: 'Ashkarel', epithet: 'the Unmade', domains: ['Death'] },
        { name: 'Nythera', epithet: 'Who Counts the Uncounted', domains: ['Fate'] },
        { name: 'Corvaxis', epithet: 'the Folded Truth', domains: ['Secrets'] },
        { name: 'Umbrielle', epithet: 'the Space Between Answers', domains: ['Shadows'] },
        { name: 'Zhalkorith', epithet: 'Who Was Always Watching', domains: ['Knowledge'] },
        { name: 'Serathkin', epithet: 'the Second Question', domains: ['Knowledge'] },
        { name: 'Vorenathi', epithet: 'the Still Convergence', domains: ['Fate'] },
        { name: 'Nhalvarik', epithet: 'That Which Remembers Forward', domains: ['Fate'] },
        { name: 'Ithrakelle', epithet: 'the Hollow Chorus', domains: ['Dreams'] },
        { name: 'Quovethis', epithet: 'the Unfinished Name', domains: ['Secrets'] },
        { name: 'Malkurath', epithet: 'Who Waits Beneath the Waiting', domains: ['Shadows'] }
      ]
    }
  }

};
