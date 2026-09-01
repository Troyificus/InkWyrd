// Population-specific settlement configuration. Each race gets its own
// tier ladder (not every population builds "cities" the way humans do),
// its own governance vocabulary and structure, and its own tavern/shop/
// tension/location flavor, rather than one universal set of content
// reused verbatim across every population with only names swapped.
//
// Governance-figure PERSONALITY reuses RACES[raceKey].descriptors.trait
// from the shared NPC data directly, rather than a separate pool. That
// data is already race-correct and battle-tested, so an Eldritch warden
// draws from Eldritch traits ("finds human urgency incomprehensible"),
// never from a human-flavored pool like "well past due for retirement."

const POPULATION_CONFIG = {

  human: {
    tierLadder: [
      { key: 'hamlet', label: 'Hamlet' },
      { key: 'village', label: 'Village' },
      { key: 'town', label: 'Town' },
      { key: 'city', label: 'City' }
    ],
    governance: {
      0: { mode: 'optional-named', title: 'the eldest', noLeaderFlavor: [
        'No one\u2019s formally in charge \u2014 disputes get settled over the shared fire, eventually.',
        'Decisions get made by whoever shouts loudest at the monthly gathering, more or less.',
        'There\u2019s no leader as such; the oldest families just tend to get their way.'
      ]},
      1: { mode: 'named', titles: ['Elder', 'Reeve', 'Village Warden'] },
      2: { mode: 'council-or-solo', councilTitle: 'Mayor', councilSize: [2, 3], soloTitles: ['Lord', 'Lady'] },
      3: { mode: 'council-or-solo', councilTitle: 'Lord Mayor', councilSize: [3, 5], soloTitles: ['Lord', 'Lady'],
        houseNames: ['House Ashwood', 'House Cindermoor', 'House Vantrell', 'House Greymantle', 'House Duskfire', 'House Ravenscroft', 'House Marrowgate', 'House Sunhollow'] }
    },
    tavernLabel: 'Tavern',
    tavernInformal: [
      'One family trades in preserved food and mended tools \u2014 not a real shop, just what they can spare.',
      'A single household barters homemade goods for whatever travelers happen to carry.',
      'No real trade to speak of \u2014 everyone makes do, or does without.'
    ],
    tavernAdjectives: ['Drowned','Broken','Laughing','Silver','Gilded','Crooked','Sleeping','Weary','Golden','Rusty','Howling','Merry','Salty','Painted','Wandering'],
    tavernNouns: ['Lantern','Wheel','Boar','Tankard','Stag','Anchor','Crown','Kettle','Fox','Raven','Barrel','Bell','Compass','Griffin','Candle'],
    tavernHistory: [
      'Run by the same family for three generations, though the recipes have gotten stranger each time.',
      'Built from the timbers of a wrecked ship, or so the innkeeper claims.',
      'Used to be a chapel; the bar is where the altar once stood.',
      'Survived a fire twenty years back that took half the street around it.',
      'Won in a card game by the current owner\u2019s grandmother, allegedly.',
      'Started as a single room and grew, one badly-matched addition at a time.'
    ],
    tavernMenuLabel: 'Menu',
    tavernMenu: [
      { name: 'Hunter\u2019s Stew', desc: 'rabbit, root vegetables, whatever\u2019s in season' },
      { name: 'Miller\u2019s Pie', desc: 'savory, heavy, comes with a wedge of hard cheese' },
      { name: 'The Ploughman\u2019s Board', desc: 'bread, pickles, cold meat, more than one person can finish' },
      { name: 'Riverfish, Grilled', desc: 'caught that morning, or so they\u2019ll tell you' },
      { name: 'Shepherd\u2019s Bowl', desc: 'lamb, barley, thick enough to stand a spoon in' },
      { name: 'Roast Fowl', desc: 'whole bird, herbs, a side of whatever\u2019s left of the vegetables' }
    ],
    shopTypes: [
      { type: 'Blacksmith', minTierIndex: 1, blurbs: ['Known for solid, no-nonsense work.', 'Takes commissions for custom work, for the right price.', 'The forge never seems to go cold, even in high summer.'] },
      { type: 'General Store', minTierIndex: 1, blurbs: ['Somehow always has exactly what you need.', 'The shelves are a genuine maze.', 'Prices creep up whenever a caravan\u2019s overdue.'] },
      { type: 'Apothecary', minTierIndex: 2, blurbs: ['Shelves lined with jars nobody\u2019s brave enough to ask about.', 'Has a genuine cure for the common cold.', 'Will mix something for almost anything.'] },
      { type: 'Tailor', minTierIndex: 2, blurbs: ['Turns around a commission faster than seems reasonable.', 'Has strong opinions about your color choices.'] },
      { type: 'Jeweler', minTierIndex: 3, blurbs: ['Deals mostly in old family pieces, discreetly.', 'Will appraise anything, no questions asked.'] },
      { type: 'Alchemist', minTierIndex: 3, blurbs: ['The smell out front changes daily.', 'Sells more theory than potions, if you let them talk.'] },
      { type: 'Bookbinder & Scribe', minTierIndex: 3, blurbs: ['Keeps meticulous, occasionally suspicious records.', 'Will forge a document, for the right price.'] },
      { type: 'Exotic Goods Importer', minTierIndex: 3, blurbs: ['Half the stock has no explanation as to where it came from.', 'Prices change based on how much they like you.'] }
    ],
    templeDedications: ['safe travels', 'the harvest', 'lost sailors', 'the hearth and home', 'healing and recovery', 'the turning seasons'],
    tensionSmall: { reasons: [
      'a decades-old dispute over a boundary stone that\u2019s moved twice',
      'neither side remembers exactly how it started, but neither will let it go',
      'a marriage that was called off, badly, two generations back',
      'grazing rights to the same stretch of land',
      'an accusation of theft that was never proven, or forgiven'
    ]},
    tensionMid: { reasons: [
      'a disputed inheritance nobody can produce paperwork for',
      'a business deal gone sour, publicly and loudly',
      'conflicting claims to the same water rights',
      'a broken promise involving a marriage that never happened'
    ]},
    tensionLarge: { groupLabel: 'gangs', names: ['The Ashgate Reavers', 'The Nine Coins', 'The Drowned Hand', 'The Black Lantern Bravos', 'The Rustwater Crew', 'The Long Knives', 'The Gilded Rats', 'The Cinder Row Boys'],
      blurbs: ['fighting over control of the docks, quietly for now.', 'locked in an uneasy truce that could break any day.', 'competing for the same smuggling routes.'] },
    locations: [
      'An old stone well, said to never run dry.', 'A collapsed watchtower nobody\u2019s bothered to clear.',
      'A modest shrine at the crossroads, worn smooth by travelers\u2019 hands.', 'A public bathhouse, surprisingly well-kept.',
      'A market square that doubles as the only real open space in town.', 'An old bridge, cracked but still load-bearing \u2014 probably.',
      'A bell tower that hasn\u2019t rung in years.', 'A single massive, ancient tree nobody will cut down.'
    ]
  },

  elvish: {
    tierLadder: [
      { key: 'glade', label: 'Glade' },
      { key: 'grove', label: 'Grove' },
      { key: 'enclave', label: 'Enclave' },
      { key: 'sanctuary', label: 'Sanctuary' }
    ],
    governance: {
      0: { mode: 'optional-named', title: 'the Eldest', noLeaderFlavor: [
        'No one leads as such \u2014 the eldest present is simply deferred to, without ceremony.',
        'Decisions unfold slowly, by consensus, without anyone claiming to be in charge.'
      ]},
      1: { mode: 'named', titles: ['Warden', 'Keeper'] },
      2: { mode: 'council-or-solo', councilTitle: 'First Warden', councilSize: [3, 3], soloTitles: ['Warden'] },
      3: { mode: 'council-or-solo', councilTitle: 'the Circle', councilSize: [4, 6], soloTitles: ['Archon', 'Sovereign'] }
    },
    tavernLabel: 'Waystop',
    tavernInformal: [
      'No real gathering-house \u2014 those passing through are simply welcomed into whichever home has room.',
      'A single quiet clearing serves as meeting-place, with no structure at all.'
    ],
    tavernAdjectives: ['Silver','Moonlit','Whispering','Starlit','Verdant','Hushed','Amber','Dappled','Silent','Woven'],
    tavernNouns: ['Bough','Hollow','Glade','Spring','Canopy','Willow','Grove','Vale','Bower','Root'],
    tavernHistory: [
      'Older than the settlement itself, or so it\u2019s said, and no one alive disputes it.',
      'Run by the same keeper for longer than anyone can verify.',
      'The wine cellar predates written memory here.',
      'Grown as much as built \u2014 the walls are living wood, still.',
      'Named for an event no one now living witnessed.'
    ],
    tavernMenuLabel: 'Fare',
    tavernMenu: [
      { name: 'Starbloom Wine', desc: 'pale, faintly luminous, drunk in small glasses' },
      { name: 'Woven Bread', desc: 'dense, seed-flecked, keeps for weeks' },
      { name: 'Canopy Broth', desc: 'mushroom and root, served warm year-round' },
      { name: 'Preserved Orchard Fruit', desc: 'kept in honey, saved for guests' }
    ],
    shopTypes: [
      { type: 'Herbalist', minTierIndex: 1, blurbs: ['Knows every plant within a day\u2019s walk, and several that shouldn\u2019t exist.', 'Trades in remedies older than most settlements.'] },
      { type: 'Fletcher', minTierIndex: 1, blurbs: ['Bowyer and fletcher both \u2014 the two crafts were never really separate here.', 'Each arrow fletched by hand, no two quite alike.'] },
      { type: 'Weaver', minTierIndex: 2, blurbs: ['Cloth so fine it barely seems to weigh anything.', 'Patterns repeat generation to generation, never quite the same twice.'] },
      { type: 'Woodwright', minTierIndex: 2, blurbs: ['Works only with wood already fallen, never felled.', 'Furniture built to outlast several owners.'] },
      { type: 'Lorekeeper', minTierIndex: 3, blurbs: ['Trades in old accounts and older songs.', 'Will trade a story for a story, and drive a hard bargain doing it.'] }
    ],
    templeDedications: ['the turning seasons', 'the old groves', 'memory itself', 'quiet endings', 'the first light'],
    tensionSmall: { reasons: [
      'a slight, centuries old, that both sides still consider recent',
      'a broken oath neither side has forgiven, generations on',
      'a dispute over which family\u2019s ancestor actually planted the oldest tree'
    ]},
    tensionMid: { reasons: [
      'a disagreement over stewardship of the grove that has outlasted three generations of both families',
      'an old promise, made in confidence, that was not kept'
    ]},
    tensionLarge: { groupLabel: 'circles', names: ['The Hollow Accord', 'The Silverleaf Rite', 'The Duskbound Choir', 'The Verdant Oath'],
      blurbs: ['divided over how much of the old ways should bend for outsiders.', 'quietly disagreeing about a matter neither will name directly.'] },
    locations: [
      'A reflecting pool that shows more than reflections, on the right night.', 'An ancient tree, hollow enough to shelter a dozen people.',
      'A ring of standing stones, worn smooth by uncounted hands.', 'A memory-stone, said to hold the settlement\u2019s whole history for those who know how to listen.',
      'A grove that sings faintly when the wind is right.'
    ]
  },

  dwarvish: {
    tierLadder: [
      { key: 'outpost', label: 'Outpost' },
      { key: 'hold', label: 'Hold' },
      { key: 'delve', label: 'Delve' },
      { key: 'stronghold', label: 'Stronghold' }
    ],
    governance: {
      0: { mode: 'optional-named', title: 'the Foreman', noLeaderFlavor: [
        'No formal leader \u2014 whoever\u2019s been down the longest tends to get listened to.',
        'The outpost runs itself, more or less, on habit and stubbornness.'
      ]},
      1: { mode: 'named', titles: ['Thane'] },
      2: { mode: 'council-or-solo', councilTitle: 'Council of Clans', councilSize: [3, 4], soloTitles: ['Thane'] },
      3: { mode: 'council-or-solo', councilTitle: 'High Thane', councilSize: [4, 6], soloTitles: ['Monarch Under the Mountain'] }
    },
    tavernLabel: 'Hall',
    tavernInformal: [
      'No proper hall yet \u2014 workers eat where they fall, mostly at the forge-side.',
      'A single long table serves as the whole social life of the outpost.'
    ],
    tavernAdjectives: ['Iron','Golden','Stout','Deep','Forge-lit','Sturdy','Molten','Grim','Bright','Ember'],
    tavernNouns: ['Anvil','Tankard','Hearth','Vein','Hammer','Cask','Chisel','Forge','Bellows','Seam'],
    tavernHistory: [
      'Carved from the mountain itself, not built \u2014 the walls still show the tool-marks.',
      'The oldest structure in the delve, older than most of the tunnels around it.',
      'Run by the same clan for longer than anyone bothers to count.',
      'Survived a cave-in that took half the original hall with it.',
      'The ale recipe is a closely guarded clan secret, allegedly worth killing over.'
    ],
    tavernMenuLabel: 'Fare',
    tavernMenu: [
      { name: 'Root and Ember Stew', desc: 'thick, heavy, meant to stick to your ribs through a long shift' },
      { name: 'Forge-Bread', desc: 'baked in the cooling embers, dense enough to double as a tool' },
      { name: 'Deep Ale', desc: 'brewed in the lower tunnels, strong enough to argue about' },
      { name: 'Salted Cave Fish', desc: 'from the underground streams, an acquired taste' }
    ],
    shopTypes: [
      { type: 'Blacksmith', minTierIndex: 1, blurbs: ['The forge never truly cools, even between shifts.', 'Takes on apprentices rarely, and only the stubborn ones.'] },
      { type: 'Brewer', minTierIndex: 1, blurbs: ['The recipe hasn\u2019t changed in generations, on principle.', 'Brews strong enough to strip paint, by reputation.'] },
      { type: 'Stonemason', minTierIndex: 2, blurbs: ['Work here outlasts the mountain, they\u2019ll tell you.', 'Every carving tells a piece of clan history, if you know how to read it.'] },
      { type: 'Gem-cutter', minTierIndex: 3, blurbs: ['Sees value in stone most others would discard.', 'Trusted with the finest finds from the deepest tunnels.'] },
      { type: 'Armorer', minTierIndex: 3, blurbs: ['Every piece fitted by hand, no two suits alike.', 'Booked out for a year or more, and worth the wait.'] }
    ],
    templeDedications: ['the ancestors', 'the deep earth', 'the forge-fire', 'safe delving', 'unbroken oaths'],
    tensionSmall: { reasons: [
      'a claim dispute over the same rich vein, unresolved for a generation',
      'an old debt of honor neither clan will formally forgive',
      'a forge-rights dispute that started as a joke and never stopped being serious'
    ]},
    tensionMid: { reasons: [
      'a disputed mining claim that\u2019s gone to the Council twice already',
      'an insult to clan honor, decades old, still not settled'
    ]},
    tensionLarge: { groupLabel: 'clans', names: ['Clan Ironvein', 'Clan Deepforge', 'Clan Grimhold', 'Clan Stonecask'],
      blurbs: ['locked in a bitter, mostly civil rivalry over mining rights.', 'divided by an old grudge neither will fully explain to outsiders.'] },
    locations: [
      'A deep forge that\u2019s never once gone cold.', 'An abandoned vein, said to still hold something worth finding.',
      'A collapsed tunnel, sealed and marked, never reopened.', 'An ancestor-shrine carved directly into the stone.',
      'A vast cavern, echoing, used for little but grand occasions.'
    ]
  },

  orcish: {
    tierLadder: [
      { key: 'camp', label: 'Camp' },
      { key: 'warband', label: 'Warband Camp' },
      { key: 'greatcamp', label: 'Great Camp' }
    ],
    governance: {
      0: { mode: 'optional-named', title: 'the Biggest', noLeaderFlavor: [
        'No formal leader \u2014 whoever\u2019s strongest settles most arguments, one way or another.',
        'Loosely held together, more habit than hierarchy.'
      ]},
      1: { mode: 'solo-only', titles: ['Warchief'] },
      2: { mode: 'warlord-with-lieutenants', title: 'Warchief', lieutenantTitle: 'Blooded', lieutenantCount: [2, 3] }
    },
    tavernLabel: 'Grog-tent',
    tavernInformal: [
      'No real gathering-place \u2014 whoever has drink shares it, loudly, by the nearest fire.'
    ],
    tavernAdjectives: ['Bloodied','Scarred','Broken','Howling','Rust-fanged','Black','Grim','Cracked'],
    tavernNouns: ['Tusk','Bonefire','Skull','Axe','Fang','Hide','Blade','Warpost'],
    tavernHistory: [
      'Built from a defeated enemy\u2019s wagon, or so the story goes \u2014 no one checks too closely.',
      'Standing since before the current Warchief, which is saying something.',
      'Named for a fight that\u2019s grown taller in the telling every year since.',
      'The bonefire out front hasn\u2019t gone out in longer than anyone remembers.'
    ],
    tavernMenuLabel: 'What\u2019s Roasting',
    tavernMenu: [
      { name: 'Spit-Roasted Game', desc: 'whatever was caught that day, no questions asked' },
      { name: 'Bonefire Stew', desc: 'thick, dark, better not to ask what\u2019s in it' },
      { name: 'Fermented Milk', desc: 'strong, sour, an acquired taste for outsiders' }
    ],
    shopTypes: [
      { type: 'Weaponsmith', minTierIndex: 1, blurbs: ['Crude work, but it holds an edge.', 'Trades weapons for stories of how the last ones broke.'] },
      { type: 'Hide-tanner', minTierIndex: 1, blurbs: ['Nothing killed nearby goes to waste.', 'The smell announces the shop before you see it.'] },
      { type: 'Trophy-trader', minTierIndex: 2, blurbs: ['Deals in the proof of victories, verified or not.', 'Will pay well for a good story to go with the trophy.'] },
      { type: 'Bonecarver', minTierIndex: 2, blurbs: ['Turns the fallen into tools, ornaments, and warnings.', 'Every piece is a little unsettling, deliberately.'] }
    ],
    templeDedications: null,
    shrineOverride: { title: 'Bone-shrine', dedications: ['the strongest ancestors', 'a famous victory', 'a fallen champion', 'the bonefire itself'] },
    tensionSmall: { reasons: [
      'an old, unresolved challenge for dominance that never quite finished',
      'a dispute over who actually won a fight everyone remembers differently'
    ]},
    tensionMid: { reasons: [
      'a standing challenge for leadership that hasn\u2019t yet come to blows',
      'a dispute over hunting rights that\u2019s escalated further than it should have'
    ]},
    tensionLarge: { groupLabel: 'warbands', names: ['The Bloodfang Riders', 'The Ashwake Raiders', 'The Skulltakers', 'The Iron Tusk Band'],
      blurbs: ['locked in an uneasy rivalry that could turn violent at any provocation.', 'competing openly for standing within the Great Camp.'] },
    locations: [
      'A fighting circle, well-used, blood-stained into the dirt permanently.', 'A trophy rack, growing every season.',
      'A bone-pile shrine to a victory no one now living witnessed firsthand.', 'A watch-post on the highest ground, always manned.'
    ]
  },

  halfling: {
    tierLadder: [
      { key: 'hamlet', label: 'Hamlet' },
      { key: 'village', label: 'Village' },
      { key: 'town', label: 'Town' }
    ],
    governance: {
      0: { mode: 'optional-named', title: 'the eldest', noLeaderFlavor: [
        'No one\u2019s really in charge \u2014 everyone just sort of knows what needs doing.',
        'Decisions get made over shared meals, informally, and somehow it works.'
      ]},
      1: { mode: 'named', titles: ['Elder'] },
      2: { mode: 'council-or-solo', councilTitle: 'Mayor', councilSize: [2, 3], soloTitles: ['Elder'] }
    },
    tavernLabel: 'Tavern',
    tavernInformal: [
      'No real trade to speak of \u2014 everyone shares, and everyone remembers who owes what.'
    ],
    tavernAdjectives: ['Cozy','Golden','Merry','Plump','Sunny','Warm','Snug','Honeyed'],
    tavernNouns: ['Hearth','Pantry','Barrel','Garden','Kettle','Burrow','Orchard','Larder'],
    tavernHistory: [
      'Run by the same family for as long as anyone can remember, recipes and all.',
      'The cellar is more famous than the tavern itself, by most accounts.',
      'Started as someone\u2019s kitchen and simply never stopped being one, just bigger.',
      'Every regular has a claimed seat, unofficially but absolutely enforced.'
    ],
    tavernMenuLabel: 'Menu',
    tavernMenu: [
      { name: 'Second Breakfast Board', desc: 'eggs, bacon, more bread than strictly necessary' },
      { name: 'Garden Pie', desc: 'whatever\u2019s ripe, always something' },
      { name: 'Honeyed Root Bake', desc: 'sweet, filling, a local point of pride' },
      { name: 'Berry Preserve Tart', desc: 'made fresh, rarely lasts the day' }
    ],
    shopTypes: [
      { type: 'Bakery', minTierIndex: 1, blurbs: ['Smells like home from halfway down the lane.', 'Sells out of the good stuff embarrassingly early most days.'] },
      { type: 'General Store', minTierIndex: 1, blurbs: ['A little of everything, mostly food-adjacent.', 'The owner remembers everyone\u2019s favorite order.'] },
      { type: 'Tailor', minTierIndex: 2, blurbs: ['Specializes in comfort over fashion, unapologetically.', 'Will mend anything, free, if you stay for tea.'] }
    ],
    templeDedications: ['the harvest', 'good fortune', 'safe travels', 'a full pantry'],
    tensionSmall: { reasons: [
      'a decades-old disagreement over a shared garden fence',
      'a recipe dispute that has genuinely divided the family for years',
      'a borrowed item, never returned, never forgotten'
    ]},
    tensionMid: { reasons: [
      'a dispute over whose pie won the harvest fair, seven years running',
      'an inheritance argument over a particularly good vegetable patch'
    ]},
    tensionLarge: null,
    locations: [
      'A shared garden that somehow feeds half the settlement.', 'A well-worn picnic green, used for every occasion.',
      'An old smokehouse, still in use, still argued over.', 'A public notice board, mostly recipes and lost-and-found.'
    ]
  },

  draconic: {
    tierLadder: [
      { key: 'roost', label: 'Roost' },
      { key: 'enclave', label: 'Enclave' },
      { key: 'bastion', label: 'Bastion' },
      { key: 'dominion', label: 'Dominion' }
    ],
    governance: {
      0: { mode: 'optional-named', title: 'the Eldest', noLeaderFlavor: [
        'No formal rule \u2014 the strongest or oldest present is simply deferred to, without ceremony.'
      ]},
      1: { mode: 'named', titles: ['Wyrm-Warden'] },
      2: { mode: 'solo-only', titles: ['Wyrm-Warden', 'Ashen Lord', 'Ashen Lady'] },
      3: { mode: 'solo-with-court', title: 'Dominion-Lord', altTitle: 'Dominion-Lady', courtTitle: 'Court', courtSize: [2, 4] }
    },
    tavernLabel: 'Hoard-hall',
    tavernInformal: [
      'No real gathering-place \u2014 those present simply share what they\u2019ve claimed, when they choose to.'
    ],
    tavernAdjectives: ['Gilded','Ember','Scaled','Molten','Amber','Coiled','Sunlit','Ashen'],
    tavernNouns: ['Hoard','Talon','Wing','Ember','Coil','Vault','Perch','Flame'],
    tavernHistory: [
      'Built around a single enormous claimed treasure, now mostly ceremonial.',
      'The oldest structure in the enclave, scorched deliberately into shape rather than built.',
      'Named for a hoard long since spent, remembered fondly regardless.',
      'Every notable visit is recorded somewhere on the walls, in claw-marks.'
    ],
    tavernMenuLabel: 'Offerings',
    tavernMenu: [
      { name: 'Smoked Highland Game', desc: 'prepared over open flame, always' },
      { name: 'Spiced Ember-Wine', desc: 'served warm, strong enough to notice' },
      { name: 'Gilded Honeycomb', desc: 'a delicacy, and treated like one' }
    ],
    shopTypes: [
      { type: 'Exotic Goods Trader', minTierIndex: 1, blurbs: ['Deals only in the genuinely rare.', 'Prices reflect prestige as much as material worth.'] },
      { type: 'Gem-cutter', minTierIndex: 2, blurbs: ['Understands the difference between valuable and merely shiny, and charges for the distinction.', 'Trusted with pieces most wouldn\u2019t risk cutting.'] },
      { type: 'Armorer', minTierIndex: 2, blurbs: ['Works in materials most smiths wouldn\u2019t attempt.', 'Every commission is treated as a matter of personal reputation.'] },
      { type: 'Relic-Keeper', minTierIndex: 3, blurbs: ['Curates rather than sells, mostly \u2014 acquisition is the real business.', 'Will trade almost anything for the right story.'] }
    ],
    templeDedications: null,
    shrineOverride: { title: 'Ember-shrine', dedications: ['a legendary ancestor', 'a great hoard, long spent', 'a famous flight', 'the first claiming of this territory'] },
    tensionSmall: { reasons: [
      'a disputed claim to the same hunting territory',
      'an insult to pride, unresolved, festering quietly'
    ]},
    tensionMid: { reasons: [
      'competing claims to the same rich territory',
      'a debt of pride neither side will formally settle'
    ]},
    tensionLarge: { groupLabel: 'claims', names: ['The Ember Claim', 'The Coiled Accord', 'The Ashwing Rite', 'The Sunfall Pact'],
      blurbs: ['locked in a slow, prideful standoff over territory.', 'divided by an old insult neither will name directly.'] },
    locations: [
      'A hoard-vault, heavily guarded, rarely opened even to residents.', 'A high perch, used for watching rather than living.',
      'A bone-yard of old kills and older trophies.', 'A scorched clearing where every major decision is made, by tradition.'
    ]
  },

  eldritch: {
    tierLadder: [
      { key: 'gathering', label: 'Gathering' },
      { key: 'conclave', label: 'Conclave' },
      { key: 'nexus', label: 'Nexus' },
      { key: 'convergence', label: 'Convergence' }
    ],
    governance: {
      0: { mode: 'optional-named', title: 'the First-Arrived', noLeaderFlavor: [
        'Nothing resembling leadership \u2014 whatever gathers here simply arrived, and simply stays.',
        'No hierarchy at all; presence itself seems to be the only qualification.'
      ]},
      1: { mode: 'named', titles: ['the Watcher'] },
      2: { mode: 'solo-only', titles: ['the Conclave'] },
      3: { mode: 'solo-only', titles: ['the Choir', 'the Convergence Itself'] }
    },
    tavernLabel: 'the Gathering-place',
    tavernInformal: [
      'Nothing resembling a gathering-place \u2014 whatever passes for company here simply occurs, without invitation.'
    ],
    tavernAdjectives: ['Hollow','Whispering','Unblinking','Silent','Folded','Distant','Unwritten','Waiting'],
    tavernNouns: ['Hollow','Eye','Threshold','Echo','Hush','Fold','Vigil','Depth'],
    tavernHistory: [
      'No one recalls it being built; it was simply, at some point, already there.',
      'The proportions are subtly wrong, in a way most visitors can\u2019t quite name.',
      'Time seems to pass differently inside than out, though no one discusses it.',
      'Every visit here is remembered slightly differently by each visitor.'
    ],
    tavernMenuLabel: 'What\u2019s Offered',
    tavernMenu: [
      { name: 'Something Warm', desc: 'no one asks what, exactly \u2014 it satisfies regardless' },
      { name: 'The Usual', desc: 'different every time, somehow always called this' },
      { name: 'Still Water', desc: 'perfectly still, even when the glass is moved' }
    ],
    shopTypes: [
      { type: 'Exchange', minTierIndex: 1, blurbs: ['Trades in things that aren\u2019t quite objects.', 'Payment is rarely coin, and rarely explained.'] },
      { type: 'Archive', minTierIndex: 2, blurbs: ['Keeps records of things that haven\u2019t happened yet, allegedly.', 'The keeper answers questions you didn\u2019t ask out loud.'] },
      { type: 'Reliquary', minTierIndex: 3, blurbs: ['Holds objects nobody fully explains the purpose of.', 'Entry is permitted, rarely, and never fully remembered afterward.'] }
    ],
    templeDedications: null,
    shrineOverride: { title: 'Still-shrine', dedications: ['something unnamed', 'a silence that predates the settlement', 'a promise no one recalls making', 'the space between things'] },
    tensionSmall: { reasons: [
      'a disagreement so old neither side can articulate what it was originally about',
      'a boundary that shifts, subtly, and both sides blame the other for it'
    ]},
    tensionMid: { reasons: [
      'a dispute over a matter neither side will discuss directly',
      'a broken arrangement, the terms of which no outsider has ever heard in full'
    ]},
    tensionLarge: { groupLabel: 'choirs', names: ['The Hollow Chorus', 'The Unwritten Accord', 'The Waiting Rite', 'The Folded Vigil'],
      blurbs: ['locked in a disagreement that predates most mortal memory of this place.', 'divided over something neither will name to outsiders.'] },
    locations: [
      'A still pool that reflects something other than the sky.', 'A doorway that leads to the same room from every direction.',
      'A patch of ground where nothing has grown, or died, in memory.', 'A gathering-stone, warm to the touch for no discernible reason.'
    ]
  }
};
