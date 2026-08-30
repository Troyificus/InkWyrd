// Cross-system condition reference. This is a fan-made SUMMARY for quick
// comparison, not exact rules text, and not exhaustive — official
// wording can be more precise (and gets errata'd over time). Always
// check the actual SRD/rulebook for precise current wording before
// relying on this at the table.
//
// Verified against each system's own SRD before writing anything here:
// Daggerheart genuinely only has three universal conditions (Hidden,
// Vulnerable, Restrained) — everything else in Daggerheart is handled
// narratively or through specific move/feature text, not a big shared
// condition list like 5E/PF2E have. Where that's true below, it says so
// plainly rather than inventing a fake equivalent.

const CONDITION_REFERENCE = [
  {
    name: 'Restrained',
    core: true,
    entries: {
      daggerheart: 'One of Daggerheart\u2019s three core conditions. A Restrained creature can\u2019t move, but can still take actions from its current position. Cleared by a successful move against it \u2014 a trait roll for PCs, GM narration for adversaries.',
      dnd5e: 'Speed becomes 0. Attack rolls against the creature have advantage; the creature\u2019s own attack rolls have disadvantage. The creature has disadvantage on Dexterity saving throws.',
      pf2e: 'You\u2019re tied up or pinned by a grappling creature and can\u2019t move. You\u2019re also Off-Guard. Distinct from Grabbed, which is a lighter version of the same idea.'
    }
  },
  {
    name: 'Hidden',
    core: true,
    entries: {
      daggerheart: 'One of Daggerheart\u2019s three core conditions. Gained while out of sight from all enemies and your location is unknown to them. Rolls against a Hidden creature have disadvantage. Lost as soon as an adversary would see you, you move into their line of sight, or you attack.',
      dnd5e: 'Not a formally named condition in the core rules \u2014 "hidden" describes the result of a successful Stealth check under the hiding rules. It isn\u2019t in the game\u2019s official condition list, though the practical effect is similar.',
      pf2e: 'A formal condition. A creature you\u2019re hidden from knows the general space you\u2019re in but can\u2019t see you precisely \u2014 it must succeed at a DC 11 flat check to target you with an attack, spell, or other effect.'
    }
  },
  {
    name: 'Vulnerable',
    core: true,
    entries: {
      daggerheart: 'One of Daggerheart\u2019s three core conditions. All rolls targeting a Vulnerable creature have advantage.',
      dnd5e: 'Not a condition at all in 5E \u2014 "vulnerable" describes a damage type a creature takes double damage from (vulnerable to fire, for example). A completely different meaning from Daggerheart\u2019s use of the word.',
      pf2e: 'Not a named condition in PF2E. The closest mechanical effect is Off-Guard, but it isn\u2019t called Vulnerable and works differently.'
    }
  },
  {
    name: 'Prone',
    entries: {
      daggerheart: 'No formal Prone condition. Being knocked down is typically handled narratively by the GM rather than through a tracked mechanical state.',
      dnd5e: 'A prone creature can only crawl unless it stands up, and has disadvantage on attack rolls. Melee attack rolls against it have advantage; ranged attack rolls against it have disadvantage.',
      pf2e: 'A prone creature is Off-Guard and takes a circumstance penalty to attack rolls, unless the attack is a melee attack against an adjacent creature. Standing up uses an action.'
    }
  },
  {
    name: 'Frightened',
    entries: {
      daggerheart: 'No formal universal condition. Fear is usually handled narratively or through specific move or feature effects rather than a tracked status.',
      dnd5e: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight, and can\u2019t willingly move closer to that source.',
      pf2e: 'A numeric condition (Frightened 2, for example) \u2014 the creature takes a status penalty equal to that value on all checks and DCs. The value normally ticks down by 1 at the end of each of its turns.'
    }
  },
  {
    name: 'Unconscious',
    entries: {
      daggerheart: 'Not one of the three core conditions, but tied closely to Daggerheart\u2019s death mechanics \u2014 a character reduced to 0 HP who chooses to Avoid Death typically ends up Unconscious until specific narrative or rest conditions clear it.',
      dnd5e: 'An unconscious creature is incapacitated, can\u2019t move or speak, and drops what it\u2019s holding. Attack rolls against it have advantage, and any melee hit against it is a critical hit if the attacker is within 5 feet.',
      pf2e: 'An unconscious creature is unable to act, is Blinded, and is Off-Guard. It automatically fails Reflex saves unless the effect doesn\u2019t require one.'
    }
  },
  {
    name: 'Grappled / Grabbed',
    entries: {
      daggerheart: 'No formal grapple condition of its own \u2014 being held is usually resolved through the Restrained condition directly, or handled narratively.',
      dnd5e: 'Grappled: speed becomes 0, and the condition ends if the grappler is incapacitated or the creature is moved out of the grappler\u2019s reach. A separate condition from Restrained.',
      pf2e: 'Grabbed: gives Off-Guard and Immobilized. A lighter version of Restrained \u2014 a creature that\u2019s Grabbed hasn\u2019t necessarily been fully pinned yet, unlike full Restrained.'
    }
  },
  {
    name: 'Blinded',
    entries: {
      daggerheart: 'No formal Blinded condition. Loss of sight is typically a narrative effect from specific abilities rather than a universal tracked condition.',
      dnd5e: 'A blinded creature can\u2019t see and automatically fails checks that require sight. Attack rolls against it have advantage, and its own attack rolls have disadvantage.',
      pf2e: 'A blinded creature has the Off-Guard condition, treats all other creatures as Concealed, automatically fails Perception checks that require sight, and takes a penalty on the ones that don\u2019t.'
    }
  },
  {
    name: 'Deafened',
    entries: {
      daggerheart: 'No formal Deafened condition.',
      dnd5e: 'A deafened creature can\u2019t hear and automatically fails checks that require hearing.',
      pf2e: 'A deafened creature automatically fails Perception checks that require hearing and takes a status penalty on other Perception checks. It\u2019s also immune to auditory effects.'
    }
  },
  {
    name: 'Paralyzed',
    entries: {
      daggerheart: 'No formal Paralyzed condition \u2014 being unable to act is typically resolved narratively or through a specific move\u2019s own effect rather than a standard tracked status.',
      dnd5e: 'A paralyzed creature is incapacitated and can\u2019t move or speak. It automatically fails Strength and Dexterity saving throws. Attack rolls against it have advantage, and any melee hit against it is a critical hit if the attacker is within 5 feet.',
      pf2e: 'A paralyzed creature is Off-Guard and unable to act, though it can still perceive its surroundings. Its Perception checks that require hearing or sight take a status penalty.'
    }
  },
  {
    name: 'Invisible',
    entries: {
      daggerheart: 'No formal Invisible condition \u2014 being unseen is typically handled through the Hidden condition or narratively, rather than a separate invisibility state.',
      dnd5e: 'An invisible creature is impossible to see without special senses, though it can still be detected by noise or tracks. Attack rolls against it have disadvantage, and its own attack rolls have advantage.',
      pf2e: 'An invisible creature can\u2019t be seen. Other creatures treat it as Hidden, and it\u2019s Undetected by anyone who could otherwise see it, unless they have another way to pinpoint it.'
    }
  },
  {
    name: 'Stunned',
    entries: {
      daggerheart: 'No formal Stunned condition. Being unable to act effectively is typically handled through a specific move or feature\u2019s own effect rather than a universal status.',
      dnd5e: 'A stunned creature is incapacitated, can\u2019t move, and can speak only falteringly. It automatically fails Strength and Dexterity saving throws, and attack rolls against it have advantage.',
      pf2e: 'A stunned creature loses a number of actions, sometimes indefinitely. While Stunned, it can\u2019t act at all, and any remaining Stunned value carries over, using up actions on its next turn or turns until the value reaches 0.'
    }
  }
];
