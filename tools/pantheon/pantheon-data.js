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

  // Still to author: human (jade, amber, frost, ember, frontier),
  // dwarvish (mountain, hill, dark), halfling, draconic.
};
