// Cross-system creature converter (Daggerheart <-> D&D 5E <-> Pathfinder 2E).
//
// Design: this never claims a perfect mechanical translation, the three
// systems use fundamentally different math (ability scores vs modifiers,
// CR vs Level vs Tier, AC vs Difficulty, dice-based HP vs flat pools). What
// it DOES do honestly:
//   1. Anchors on power level (CR ~= Level; Tier maps to a CR/Level band).
//   2. For numbers that have a real analog across systems (AC/Difficulty,
//      HP, attack bonus, damage), it computes how far the source value is
//      from what's TYPICAL for its own power level, then reproduces that
//      same relative deviation at the target's equivalent power level —
//      using each system's own guidance formulas as the baseline. This is
//      real, defensible math: "this creature is unusually tough" carries
//      across systems even though the raw numbers don't.
//   3. For fields with no analog (ability scores, skills, saves, senses,
//      speed, size/type) it resets to a sensible baseline for the target
//      system rather than fabricating a fake conversion, and says so in
//      the returned flags[] array.
//   4. Feature/ability TEXT is never auto-translated (mechanics like Fear,
//      Stress, or PF2E's action-cost economy can't be safely rewritten by
//      formula), it carries over verbatim with an appended review note.

// ===== Duplicated baseline guidance per system (self-contained on purpose,
// so this file works regardless of which page loads it). =====

function ccParseCR(crText) {
  const t = String(crText || '').trim();
  if (t.includes('/')) {
    const [num, den] = t.split('/').map(Number);
    return den ? num / den : 0;
  }
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 1;
}

function ccPbForCR(cr) {
  if (cr < 5) return 2;
  if (cr < 9) return 3;
  if (cr < 13) return 4;
  if (cr < 17) return 5;
  if (cr < 21) return 6;
  if (cr < 25) return 7;
  return 8;
}

function ccCRGuidance(crText) {
  const cr = ccParseCR(crText);
  const pb = ccPbForCR(cr);
  let ac, hpMid;
  if (cr < 1) { ac = 12; hpMid = Math.max(1, Math.round(cr * 40) + 5); }
  else { ac = Math.min(19, 12 + Math.floor(cr / 3)); hpMid = Math.round(15 * cr + 65); }
  const atk = pb + 3;
  const dmgMid = Math.max(2, Math.round(hpMid / 3.5));
  return { ac, hpMid, atk, dmgMid };
}

function ccLevelGuidance(levelVal) {
  const level = Number(levelVal) || 0;
  const ac = 16 + level;
  const hpMid = Math.round(16 * (level + 2));
  const atk = level + 9;
  const dmgMid = Math.max(2, Math.round(hpMid / 4));
  return { ac, hpMid, atk, dmgMid };
}

const CC_TIER_GUIDANCE = {
  1: { difficulty: 12, hpMid: 4.5, atk: 2, dmgMid: 6 },
  2: { difficulty: 13, hpMid: 6.5, atk: 3, dmgMid: 11 },
  3: { difficulty: 15, hpMid: 8.5, atk: 4, dmgMid: 17 },
  4: { difficulty: 17, hpMid: 11.5, atk: 5, dmgMid: 25 }
};

function ccTierGuidance(tierVal) {
  const tier = Math.max(1, Math.min(4, Number(tierVal) || 1));
  return CC_TIER_GUIDANCE[tier];
}

// ===== Power-level equivalence. CR and PF2E Level are treated as roughly
// 1:1 (a common, defensible crossover approximation). Daggerheart's Tier
// is far coarser (4 bands covering the whole range), so it maps to a
// representative CR/Level. =====

function ccCrOrLevelToTier(crOrLevel) {
  const n = ccParseCR(crOrLevel);
  if (n < 4) return 1;
  if (n < 8) return 2;
  if (n < 14) return 3;
  return 4;
}

const CC_TIER_REPRESENTATIVE = { 1: 2, 2: 5, 3: 10, 4: 17 };

function ccTierToCrOrLevel(tier) {
  return CC_TIER_REPRESENTATIVE[Math.max(1, Math.min(4, Number(tier) || 1))];
}

// ===== Ratio math, with dampening when Daggerheart is involved. DH's raw
// numbers (HP in single digits, Difficulty in the low teens) are coarse —
// an entirely ordinary DH creature can be 20-30% off its Tier's baseline
// just from small-integer rounding, and that "noise" gets wildly amplified
// once reapplied against D&D/PF2E's much larger baselines. Dampening pulls
// the ratio toward 1 (typical) proportionally, so real outliers still show
// but small DH-scale noise doesn't explode. =====

function ccRatio(value, baseline) {
  const v = Number(value);
  if (!Number.isFinite(v) || !baseline) return 1;
  const r = v / baseline;
  return Math.max(0.4, Math.min(2.5, r));
}

function ccDampen(ratio, factor) {
  return 1 + (ratio - 1) * factor;
}

function ccScaleInt(target, ratio, min) {
  return Math.max(min, Math.round(target * ratio));
}

// ===== Numeric extraction helpers =====

function ccFirstNumber(text) {
  const m = /(-?\d+(?:\.\d+)?)/.exec(String(text || ''));
  return m ? parseFloat(m[1]) : null;
}

function ccAvgFromDamageText(text) {
  const m = /(\d+)\s*d\s*(\d+)\s*(?:\+\s*(\d+))?/i.exec(String(text || ''));
  if (!m) return null;
  const count = parseInt(m[1], 10);
  const die = parseInt(m[2], 10);
  const flat = m[3] ? parseInt(m[3], 10) : 0;
  return count * ((die + 1) / 2) + flat;
}

function ccDiceForAvg(avg, dieSize) {
  const dieAvg = (dieSize + 1) / 2;
  let count = Math.max(1, Math.round(avg / dieAvg / 1.3));
  let remainder = Math.round(avg - count * dieAvg);
  if (remainder < 0) remainder = 0;
  return remainder > 0 ? `${count}d${dieSize}+${remainder}` : `${count}d${dieSize}`;
}

function ccRescaleDamage(damageText, newAvg, dieSize) {
  const typeMatch = /\d\s*(?:[a-z]+)?\s+([a-z]+)\s*$/i.exec(String(damageText || '').trim());
  const type = typeMatch ? typeMatch[1] : '';
  const dice = ccDiceForAvg(newAvg, dieSize);
  return type ? `${dice} ${type}` : dice;
}

// ===== 5E attack text parsing. 5E has no structured attacks[] array —
// attack info lives as free text inside Action-category features, so it
// has to be regex-extracted. Falls back to null (never fabricates) if the
// text doesn't match a recognizable pattern. =====

function ccParse5EAttackText(text) {
  if (!text) return null;
  const bonusMatch = /\+(\d+)\s*to hit/i.exec(text);
  const bonus = bonusMatch ? '+' + bonusMatch[1] : null;

  let damageMatch = /\((\d+\s*d\s*\d+(?:\s*\+\s*\d+)?)\)\s*(\w+)?\s*damage/i.exec(text);
  let damageText = null, damageType = '';
  if (damageMatch) {
    damageText = damageMatch[1].replace(/\s+/g, '');
    damageType = damageMatch[2] || '';
  } else {
    damageMatch = /(\d+\s*d\s*\d+(?:\s*\+\s*\d+)?)\s*(\w+)?\s*damage/i.exec(text);
    if (damageMatch) {
      damageText = damageMatch[1].replace(/\s+/g, '');
      damageType = damageMatch[2] || '';
    }
  }

  if (!bonus && !damageText) return null;

  const rangeMatch = /(Melee|Ranged)\s+(?:Weapon|Spell)?\s*Attack/i.exec(text);
  const range = rangeMatch ? rangeMatch[1] : 'Melee';

  return { bonus, damageText, damageType, range };
}

// ===== Feature category remapping. Best-effort, not mechanically
// equivalent (the systems' action economies don't line up 1:1). =====

const CC_CATEGORY_TO_NEUTRAL = {
  dh: { Passive: 'passive', Action: 'action', Reaction: 'reaction' },
  dnd5e: { Trait: 'passive', Action: 'action', 'Bonus Action': 'action', Reaction: 'reaction', 'Legendary Action': 'legendary' },
  pf2e: { Ability: 'passive', Reaction: 'reaction', 'Free Action': 'action' }
};

const CC_NEUTRAL_TO_CATEGORY = {
  dh: { passive: 'Passive', action: 'Action', reaction: 'Reaction', legendary: 'Action' },
  dnd5e: { passive: 'Trait', action: 'Action', reaction: 'Reaction', legendary: 'Legendary Action' },
  pf2e: { passive: 'Ability', action: 'Ability', reaction: 'Reaction', legendary: 'Ability' }
};

const CC_REVIEW_NOTE = {
  dh: 'review wording for Daggerheart (Fear/Stress rolls, action economy)',
  dnd5e: 'review wording for 5E (action economy, spell save DCs)',
  pf2e: 'review wording for PF2E (action costs, degrees of success)'
};

// Rewrites 5E/PF2E "DC X [Ability] saving throw" phrasing into Daggerheart's
// own vocabulary, a Reaction Roll against a stated Difficulty. Same
// underlying concept (a target number the PC rolls against), so this is a
// real structural rewrite, not a guess. Only the Ability -> Trait mapping
// is approximate, since Daggerheart's six Traits don't line up 1:1 with
// six ability scores (e.g. there's no direct Constitution equivalent).
const CC_ABILITY_TO_DH_TRAIT = {
  strength: 'Strength', dexterity: 'Agility', constitution: 'Strength',
  intelligence: 'Knowledge', wisdom: 'Instinct', charisma: 'Presence'
};

function ccRewriteSavingThrowsForDH(text) {
  return text.replace(
    /DC\s*(\d+)\s*(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s*saving throw/gi,
    (match, dc, ability) => {
      const trait = CC_ABILITY_TO_DH_TRAIT[ability.toLowerCase()] || ability;
      return `${trait} Reaction Roll (Difficulty ${dc})`;
    }
  );
}

// 5E ties a saving throw to one specific ability score; PF2E ties it to one
// of three named saves (Fortitude/Reflex/Will). This mapping is the same one
// used for the strong-save nudge in ccFromNeutral, kept consistent.
const CC_ABILITY_TO_PF2E_SAVE = {
  strength: 'Fortitude', constitution: 'Fortitude', dexterity: 'Reflex',
  intelligence: 'Will', wisdom: 'Will', charisma: 'Will'
};

function ccRewriteSavingThrowsForPF2E(text) {
  return text.replace(
    /DC\s*(\d+)\s*(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s*saving throw/gi,
    (match, dc, ability) => {
      const save = CC_ABILITY_TO_PF2E_SAVE[ability.toLowerCase()] || ability;
      return `DC ${dc} ${save} save`;
    }
  );
}

// Reverse direction: PF2E's three named saves don't map back to one specific
// ability score the way 5E requires, this uses the single most common
// association for each (Fortitude->Constitution, Reflex->Dexterity,
// Will->Wisdom), which is the same approximation any GM would reach for.
const CC_PF2E_SAVE_TO_ABILITY = { fortitude: 'Constitution', reflex: 'Dexterity', will: 'Wisdom' };

function ccRewriteSavingThrowsFor5E(text) {
  return text.replace(
    /DC\s*(\d+)\s*(Fortitude|Reflex|Will)\s*(?:save|saving throw)/gi,
    (match, dc, save) => {
      const ability = CC_PF2E_SAVE_TO_ABILITY[save.toLowerCase()] || save;
      return `DC ${dc} ${ability} saving throw`;
    }
  );
}

function ccConvertFeature(feature, fromSystem, toSystem, card, resolveFn) {
  const neutral = CC_CATEGORY_TO_NEUTRAL[fromSystem][feature.category || feature.type] || 'passive';
  const category = CC_NEUTRAL_TO_CATEGORY[toSystem][neutral];
  const name = feature.name;
  // Resolve [TOKEN] references (e.g. [STRSAVE]) against the SOURCE card
  // before the text ever leaves that system. A target system has no idea
  // what a source-only token means, so an unresolved token left in would
  // just print as literal garbage on the converted card.
  let resolvedText = resolveFn ? resolveFn(feature.text, card) : feature.text;
  if (toSystem === 'dh') resolvedText = ccRewriteSavingThrowsForDH(resolvedText);
  else if (toSystem === 'pf2e') resolvedText = ccRewriteSavingThrowsForPF2E(resolvedText);
  else if (toSystem === 'dnd5e') resolvedText = ccRewriteSavingThrowsFor5E(resolvedText);
  // PF2E's own DCs run on a different curve than 5E's (roughly 10 + level +
  // a proficiency-rank bonus, vs 5E's 8 + proficiency bonus + ability mod) —
  // the DC number itself is carried across as-is, only the vocabulary
  // changes, so it's flagged rather than silently treated as exact.
  const dcNoteNeeded = /DC\s*\d+/i.test(resolvedText) && (toSystem === 'pf2e' || toSystem === 'dnd5e') && fromSystem !== toSystem && (fromSystem === 'dnd5e' || fromSystem === 'pf2e');
  const text = `${resolvedText} [Converted ${CC_REVIEW_NOTE[toSystem]}${dcNoteNeeded ? '; DC number carried across as-is, but the two systems scale DCs differently, so sanity-check it against a typical DC for this level' : ''}.]`;
  return { category, type: category, name, text };
}

// 5E-specific structural entries that exist only because of how 5E writes
// statblocks (Multiattack just narrates "use these other actions together"),
// they carry no information a target system's card doesn't already show
// via its own attack lines, so they get dropped rather than copied over as
// a confusing duplicate feature.
function ccIsStructuralOnly(fromSystem, feature) {
  if (fromSystem !== 'dnd5e') return false;
  const category = feature.category || feature.type;
  return category === 'Action' && /^multiattack\b/i.test(feature.name || '');
}

// Ability modifiers, normalized to a common form regardless of how the
// source system stores them (5E stores a 1-30 score and derives the
// modifier; PF2E stores the modifier directly). Only meaningful between
// 5E and PF2E, which share the same six abilities in the same sense —
// Daggerheart has no equivalent concept at all.
function ccAbilityModsFromCard(fromSystem, card) {
  if (fromSystem === 'dnd5e') {
    const mod = (score) => Math.floor((Number(score) - 10) / 2);
    return { str: mod(card.str), dex: mod(card.dex), con: mod(card.con), int: mod(card.int), wis: mod(card.wis), cha: mod(card.cha) };
  }
  if (fromSystem === 'pf2e') {
    return { str: Number(card.str) || 0, dex: Number(card.dex) || 0, con: Number(card.con) || 0, int: Number(card.int) || 0, wis: Number(card.wis) || 0, cha: Number(card.cha) || 0 };
  }
  return null;
}

// ===== Neutral intermediate representation =====

function ccToNeutral(fromSystem, card, resolveFn) {
  const flags = [];
  let powerLevel, hpValue, defenseValue, attacks, strongSaves;
  const consumedFeatures = [];

  if (fromSystem === 'dh') {
    powerLevel = { tier: card.tier };
    const g = ccTierGuidance(card.tier);
    hpValue = ccRatio(card.hp, g.hpMid);
    defenseValue = ccRatio(card.difficultyAdv, g.difficulty);
    attacks = (card.attacks || []).map(a => {
      const dmgAvg = ccAvgFromDamageText(a.damage);
      return {
        bonusRatio: ccRatio(ccFirstNumber(a.atk), g.atk),
        dmgAvg,
        dmgRatio: dmgAvg !== null ? ccRatio(dmgAvg, g.dmgMid) : 1,
        rawDamageText: a.damage,
        range: a.range,
        name: a.name
      };
    });
  } else if (fromSystem === 'dnd5e') {
    powerLevel = { cr: card.cr };
    const g = ccCRGuidance(card.cr);
    hpValue = ccRatio(ccFirstNumber(card.hp), g.hpMid);
    defenseValue = ccRatio(ccFirstNumber(card.ac), g.ac);
    attacks = [];
    (card.features || []).forEach(f => {
      if (f.category !== 'Action') return;
      // f.text may contain unresolved [TOKEN] placeholders (e.g. [STRHIT])
      // instead of a literal "+11 to hit." Resolve those to real values
      // first, or the regex-based parser below can't find a bonus/damage
      // number at all and silently falls back to a generic computed one.
      const resolvedText = resolveFn ? resolveFn(f.text, card) : f.text;
      const parsed = ccParse5EAttackText(resolvedText);
      if (!parsed) return;
      const bonusNum = parsed.bonus ? parseInt(parsed.bonus.replace('+', ''), 10) : null;
      const dmgAvg = parsed.damageText ? ccAvgFromDamageText(parsed.damageText) : null;
      attacks.push({
        bonusRatio: bonusNum !== null ? ccRatio(bonusNum, g.atk) : 1,
        dmgAvg,
        dmgRatio: dmgAvg !== null ? ccRatio(dmgAvg, g.dmgMid) : 1,
        rawDamageText: parsed.damageText ? `${parsed.damageText} ${parsed.damageType}`.trim() : null,
        range: parsed.range,
        name: f.name
      });
      consumedFeatures.push(f);
    });
    if (!attacks.length) flags.push('No attacks could be parsed from 5E Action text, a placeholder attack was generated instead.');

    // Extract which abilities 5E lists as proficient saves (e.g. "Dex +6, Con +4"),
    // real differentiated info worth carrying forward when targeting PF2E.
    strongSaves = [];
    (String(card.savingThrows || '').match(/\b(Str|Dex|Con|Int|Wis|Cha)\b/gi) || []).forEach(m => {
      const key = { str: 'str', dex: 'dex', con: 'con', int: 'int', wis: 'wis', cha: 'cha' }[m.toLowerCase()];
      if (key) strongSaves.push(key);
    });
  } else if (fromSystem === 'pf2e') {
    powerLevel = { level: card.level };
    const g = ccLevelGuidance(card.level);
    hpValue = ccRatio(ccFirstNumber(card.hp), g.hpMid);
    defenseValue = ccRatio(ccFirstNumber(card.ac), g.ac);
    attacks = (card.attacks || []).map(a => {
      const dmgAvg = ccAvgFromDamageText(a.damage);
      return {
        bonusRatio: ccRatio(ccFirstNumber(a.bonus), g.atk),
        dmgAvg,
        dmgRatio: dmgAvg !== null ? ccRatio(dmgAvg, g.dmgMid) : 1,
        rawDamageText: a.damage,
        range: a.type,
        name: a.name
      };
    });
  }

  // Dampen ratio noise coming FROM Daggerheart's coarse small-integer scale.
  if (fromSystem === 'dh') {
    hpValue = ccDampen(hpValue, 0.5);
    defenseValue = ccDampen(defenseValue, 0.5);
    attacks.forEach(a => {
      a.bonusRatio = ccDampen(a.bonusRatio, 0.5);
      a.dmgRatio = ccDampen(a.dmgRatio, 0.5);
    });
  }

  return {
    name: card.name,
    description: resolveFn ? resolveFn(card.description || '', card) : (card.description || ''),
    powerLevel,
    hpRatio: hpValue,
    defenseRatio: defenseValue,
    abilityMods: ccAbilityModsFromCard(fromSystem, card),
    strongSaves: strongSaves || [],
    attacks,
    features: [],
    consumedFeatures,
    flags
  };
}

function ccFromNeutral(toSystem, neutral, fromSystem) {
  const flags = neutral.flags.slice();
  const card = { name: neutral.name, description: neutral.description };

  // Dampen ratio noise going TO Daggerheart's coarse small-integer scale
  // (only applied once, dh never converts to/from itself, so only one
  // side of any given conversion is ever 'dh').
  const dampFactor = (toSystem === 'dh' && fromSystem !== 'dh') ? 0.5 : 1;
  const hpRatio = ccDampen(neutral.hpRatio, dampFactor);
  const defenseRatio = ccDampen(neutral.defenseRatio, dampFactor);

  if (toSystem === 'dh') {
    const tier = ccCrOrLevelToTier(neutral.powerLevel.cr !== undefined ? neutral.powerLevel.cr : neutral.powerLevel.level);
    const g = ccTierGuidance(tier);
    card.tier = tier;
    card.difficultyAdv = ccScaleInt(g.difficulty, defenseRatio, 8);
    card.hp = ccScaleInt(g.hpMid, hpRatio, 2);
    card.thresholdMajor = Math.max(3, Math.round(card.hp * 1.4));
    card.thresholdSevere = Math.max(card.thresholdMajor + 3, Math.round(card.hp * 2.2));
    card.stress = Math.max(2, Math.round(2 + tier));
    card.attacks = neutral.attacks.length ? neutral.attacks.map(a => {
      const dmgAvg = Math.max(1, Math.round(g.dmgMid * ccDampen(a.dmgRatio, dampFactor)));
      return {
        atk: '+' + ccScaleInt(g.atk, ccDampen(a.bonusRatio, dampFactor), 1),
        name: a.name || 'Strike',
        range: /ranged/i.test(a.range || '') ? 'Far' : 'Melee',
        damage: a.rawDamageText ? ccRescaleDamage(a.rawDamageText, dmgAvg, tier <= 2 ? 8 : 10) : ccDiceForAvg(dmgAvg, tier <= 2 ? 8 : 10)
      };
    }) : [{ atk: '+' + g.atk, name: 'Strike', range: 'Melee', damage: ccDiceForAvg(g.dmgMid, 8) }];
    card.experience = '';
    card.motives = '';
    flags.push('Ability scores/skills/senses have no Daggerheart equivalent and were not carried over, this card only has the fields Daggerheart adversaries use. Experience and Motives & Tactics are left blank rather than invented, the source system has no structured data to draw them from honestly, so write these from the description above.');
  } else if (toSystem === 'dnd5e') {
    const cr = neutral.powerLevel.tier !== undefined ? ccTierToCrOrLevel(neutral.powerLevel.tier) : (neutral.powerLevel.level !== undefined ? neutral.powerLevel.level : ccParseCR(neutral.powerLevel.cr));
    const g = ccCRGuidance(cr);
    card.cr = String(cr);
    card.xp = Math.round(g.hpMid * 4);
    card.ac = String(ccScaleInt(g.ac, defenseRatio, 10));
    const hp = ccScaleInt(g.hpMid, hpRatio, 1);
    card.hp = `${hp}`;
    if (neutral.abilityMods) {
      // Reconstruct a plausible 5E score from a PF2E modifier: 10 + 2*mod is
      // the canonical midpoint score that produces that exact modifier.
      const scoreFromMod = (m) => 10 + 2 * m;
      card.str = scoreFromMod(neutral.abilityMods.str);
      card.dex = scoreFromMod(neutral.abilityMods.dex);
      card.con = scoreFromMod(neutral.abilityMods.con);
      card.int = scoreFromMod(neutral.abilityMods.int);
      card.wis = scoreFromMod(neutral.abilityMods.wis);
      card.cha = scoreFromMod(neutral.abilityMods.cha);
    } else {
      card.str = 10; card.dex = 10; card.con = 10; card.int = 10; card.wis = 10; card.cha = 10;
    }
    card.proficiencyBonus = ccPbForCR(cr);
    card.savingThrows = ''; card.skills = ''; card.senses = 'passive Perception 10'; card.languages = '—';
    const pb = card.proficiencyBonus;
    card.features = (neutral.attacks.length ? neutral.attacks : [{ bonusRatio: 1, dmgRatio: 1, rawDamageText: null, name: 'Strike', range: 'Melee' }]).map(a => {
      const bonus = ccScaleInt(g.atk, a.bonusRatio, pb + 1);
      const dmgAvg = Math.max(1, Math.round(g.dmgMid * a.dmgRatio));
      const damageText = a.rawDamageText ? ccRescaleDamage(a.rawDamageText, dmgAvg, 6) : ccDiceForAvg(dmgAvg, 6) + ' bludgeoning';
      return {
        category: 'Action',
        name: a.name || 'Strike',
        text: `Melee or Ranged Weapon Attack: +${bonus} to hit. Hit: ${dmgAvg} (${damageText}) damage.`
      };
    });
    if (neutral.abilityMods) {
      flags.push('Ability scores converted directly from the source modifiers. Skills/senses/languages carry over as raw text where the calling page supports it. Review wording, since PF2E and 5E phrase some skills differently. Saving throw proficiencies have no PF2E equivalent to draw from and were left blank.');
    } else {
      flags.push('Ability scores/skills/saves have no source-system equivalent and were reset to a flat 10 (+0). Review before use.');
    }
  } else if (toSystem === 'pf2e') {
    const level = neutral.powerLevel.tier !== undefined ? ccTierToCrOrLevel(neutral.powerLevel.tier) : (neutral.powerLevel.cr !== undefined ? Math.round(ccParseCR(neutral.powerLevel.cr)) : neutral.powerLevel.level);
    const g = ccLevelGuidance(level);
    card.level = level;
    card.rarity = 'Common';
    card.ac = String(ccScaleInt(g.ac, defenseRatio, 12));
    card.hp = String(ccScaleInt(g.hpMid, hpRatio, 1));
    if (neutral.abilityMods) {
      card.str = neutral.abilityMods.str; card.dex = neutral.abilityMods.dex; card.con = neutral.abilityMods.con;
      card.int = neutral.abilityMods.int; card.wis = neutral.abilityMods.wis; card.cha = neutral.abilityMods.cha;
    } else {
      card.str = 0; card.dex = 0; card.con = 0; card.int = 0; card.wis = 0; card.cha = 0;
    }
    const moderate = level + 8;
    card.fort = '+' + moderate; card.ref = '+' + moderate; card.will = '+' + moderate;
    // 5E lists specific proficient saves (e.g. "Dex +6, Con +4"), that's
    // real differentiated information PF2E's own flat-baseline reset was
    // throwing away. Nudge the matching PF2E save up from the moderate
    // baseline rather than inventing an exact number (the two scales don't
    // convert cleanly enough for that to be honest), so a creature that's
    // notably strong on a given save still reads as such after conversion.
    if (neutral.strongSaves && neutral.strongSaves.length) {
      const saveMap = { str: 'fort', con: 'fort', dex: 'ref', int: 'will', wis: 'will', cha: 'will' };
      const bumped = new Set();
      neutral.strongSaves.forEach(ability => {
        const key = saveMap[ability];
        if (key && !bumped.has(key)) {
          card[key] = '+' + (moderate + 2);
          bumped.add(key);
        }
      });
    }
    card.perception = '+' + moderate;
    card.senses = ''; card.languages = '—'; card.skills = ''; card.items = '';
    card.attacks = (neutral.attacks.length ? neutral.attacks : [{ bonusRatio: 1, dmgRatio: 1, rawDamageText: null, name: 'Strike', range: 'Melee' }]).map(a => {
      const bonus = ccScaleInt(g.atk, a.bonusRatio, level + 5);
      const dmgAvg = Math.max(1, Math.round(g.dmgMid * a.dmgRatio));
      return {
        actionCost: '1 action',
        type: /ranged/i.test(a.range || '') ? 'Ranged' : 'Melee',
        name: a.name || 'Strike',
        bonus: '+' + bonus,
        damage: a.rawDamageText ? ccRescaleDamage(a.rawDamageText, dmgAvg, 8) : ccDiceForAvg(dmgAvg, 8)
      };
    });
    if (neutral.abilityMods) {
      flags.push('Ability modifiers converted directly from the source scores. Fort/Ref/Will start at a moderate baseline for this level' + (neutral.strongSaves && neutral.strongSaves.length ? ", with the saves matching the source's proficient ability scores nudged up, exact numbers don't convert cleanly between the two systems' proficiency models, so treat these as a starting point, not a precise conversion." : '.') + ' Skills/senses/languages carry over as raw text where the calling page supports it. Review wording.');
    } else {
      flags.push('Ability modifiers/skills/saves have no source-system equivalent and were reset to a flat moderate baseline. Review before use.');
    }
  }

  card.flags = flags;
  return card;
}

// Public API. system keys: 'dh' | 'dnd5e' | 'pf2e'.
// resolveFn: the SOURCE system's own applySubs(text, card) function, passed
// in by the calling page so token references (e.g. [STRSAVE]) get resolved
// into real values before the text ever crosses systems.
function convertCreatureCard(fromSystem, toSystem, card, resolveFn) {
  const neutral = ccToNeutral(fromSystem, card, resolveFn);
  // Attacks already extracted from 5E Action-text features shouldn't also
  // appear as duplicate narrative features on the target card, and purely
  // structural entries (Multiattack) carry no information the target card
  // doesn't already show via its own attack lines.
  const consumed = new Set(neutral.consumedFeatures || []);
  const remainingFeatures = (card.features || []).filter(f =>
    !consumed.has(f) && !ccIsStructuralOnly(fromSystem, f)
  );
  neutral.features = remainingFeatures.map(f => ccConvertFeature(f, fromSystem, toSystem, card, resolveFn));
  const result = ccFromNeutral(toSystem, neutral, fromSystem);
  result.features = neutral.features;
  return result;
}
