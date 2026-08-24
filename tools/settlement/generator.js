const STORAGE_KEY = 'settlement.deck.v1';
const $ = id => document.getElementById(id);

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function randomInt(low, high) { return Math.floor(Math.random() * (high - low + 1)) + low; }

// ===== Generation =====

function genSettlementName() {
  return pick(SETTLEMENT_NAME_PREFIXES) + pick(SETTLEMENT_NAME_SUFFIXES);
}

function genVibe() {
  return pick(SETTLEMENT_VIBES);
}

function pickRaceSubtype(raceKey) {
  const keys = Object.keys(RACES[raceKey].subtypes);
  return keys[Math.floor(Math.random() * keys.length)];
}

// Resolves which subtype (Culture/Region) a name draw for a given race
// should use within the current settlement: the explicit choice on the
// primary population, or on whichever demographic entry matches that
// race, or null (meaning "Any" — keep rolling a random subtype per name,
// the original behavior) if nothing specific was chosen.
function getSubtypeForRace(card, raceKey) {
  if (raceKey === card.race) return card.raceSubtype || null;
  const demo = (card.demographics || []).find(d => d.race === raceKey);
  return (demo && demo.subtype) || null;
}

function genPersonName(raceKey, forcedSubtype) {
  const race = RACES[raceKey];
  const subtypeKey = (forcedSubtype && race.subtypes[forcedSubtype]) ? forcedSubtype : pickRaceSubtype(raceKey);
  const sub = race.subtypes[subtypeKey];
  const first = pick(sub.masc.concat(sub.fem));
  const sur = pick(sub.surnames);
  return race.pattern(first, sur);
}

function maxTierIndex(raceKey) {
  return POPULATION_CONFIG[raceKey].tierLadder.length - 1;
}
function clampTierIndex(raceKey, tierIndex) {
  return Math.max(0, Math.min(tierIndex, maxTierIndex(raceKey)));
}

// Rolls which population a single seat/tavern/shop belongs to, weighted
// by the settlement's demographics for the given category ('governance',
// 'tavern', or 'merchants'). Each roll is independent — a five-seat
// council with a 5% dwarvish population has a real, correctly
// proportioned chance of one seat landing dwarvish on any given roll,
// not a guaranteed "one dwarf seat" outcome. A secondary population not
// allowed in this category is excluded from the pool entirely, and its
// share reverts to the primary population for that specific roll.
function rollWeightedRace(card, category) {
  const demographics = card.demographics || [];
  const allowKey = 'allow' + capitalize(category);
  const allowed = demographics.filter(d => d[allowKey] && POPULATION_CONFIG[d.race]);
  const secondarySum = allowed.reduce((sum, d) => sum + (Number(d.weight) || 0), 0);
  const primaryWeight = Math.max(0, 100 - secondarySum);
  const pool = [{ race: card.race, weight: primaryWeight }, ...allowed.map(d => ({ race: d.race, weight: Number(d.weight) || 0 }))];
  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  if (total <= 0) return card.race;
  let roll = Math.random() * total;
  for (const p of pool) {
    if (roll < p.weight) return p.race;
    roll -= p.weight;
  }
  return card.race;
}

// Governance figure personality reuses the race's own NPC trait pool
// directly (RACES[raceKey].descriptors.trait) rather than a separate
// universal pool, so an Eldritch warden reads as genuinely eldritch, not
// like a tired human bureaucrat. Each figure independently rolls which
// population it belongs to via rollWeightedRace, so a council seat (or
// even the sole leader, if the settlement has one) can land on a
// minority population proportional to the settlement's demographics.
function genGovernance(raceKey, tierIndex, govChoice, card) {
  const config = POPULATION_CONFIG[raceKey];
  const tierGov = config.governance[tierIndex];
  if (!tierGov) return null;

  const usedNames = new Set();
  const usedTraitsByRace = new Map();
  function nextFigure() {
    const figureRace = rollWeightedRace(card, 'governance');
    const subtype = getSubtypeForRace(card, figureRace);
    let name = genPersonName(figureRace, subtype);
    let guard = 0;
    while (usedNames.has(name) && guard < 10) { name = genPersonName(figureRace, subtype); guard++; }
    usedNames.add(name);
    if (!usedTraitsByRace.has(figureRace)) usedTraitsByRace.set(figureRace, new Set());
    const desc = pickUnique(RACES[figureRace].descriptors.trait, usedTraitsByRace.get(figureRace));
    return { name, desc, race: figureRace };
  }

  if (tierGov.mode === 'optional-named') {
    if (Math.random() < 0.5) return { kind: 'none', flavor: pick(tierGov.noLeaderFlavor) };
    const f = nextFigure();
    return { kind: 'named', figures: [{ name: f.name, title: capitalize(tierGov.title), desc: f.desc, race: f.race }] };
  }
  if (tierGov.mode === 'named') {
    const f = nextFigure();
    return { kind: 'named', figures: [{ name: f.name, title: pick(tierGov.titles), desc: f.desc, race: f.race }] };
  }
  if (tierGov.mode === 'council-or-solo') {
    if (govChoice === 'solo') {
      const f = nextFigure();
      const result = { kind: 'solo', figures: [{ name: f.name, title: pick(tierGov.soloTitles), desc: f.desc, race: f.race }] };
      if (tierGov.houseNames) result.houseName = pick(tierGov.houseNames);
      return result;
    }
    const [lo, hi] = tierGov.councilSize;
    const size = randomInt(lo, hi);
    const figures = [];
    for (let i = 0; i < size; i++) {
      const f = nextFigure();
      figures.push({ name: f.name, title: i === 0 ? tierGov.councilTitle : 'Council Member', desc: f.desc, race: f.race });
    }
    return { kind: 'council', figures };
  }
  if (tierGov.mode === 'solo-only') {
    const title = Array.isArray(tierGov.titles) ? pick(tierGov.titles) : tierGov.title;
    const f = nextFigure();
    return { kind: 'solo', figures: [{ name: f.name, title, desc: f.desc, race: f.race }] };
  }
  if (tierGov.mode === 'warlord-with-lieutenants') {
    const [lo, hi] = tierGov.lieutenantCount;
    const count = randomInt(lo, hi);
    const leader = nextFigure();
    const figures = [{ name: leader.name, title: tierGov.title, desc: leader.desc, race: leader.race }];
    for (let i = 0; i < count; i++) {
      const f = nextFigure();
      figures.push({ name: f.name, title: tierGov.lieutenantTitle, desc: f.desc, race: f.race });
    }
    return { kind: 'warlord', figures };
  }
  if (tierGov.mode === 'solo-with-court') {
    const title = Math.random() < 0.5 ? tierGov.title : tierGov.altTitle;
    const leader = nextFigure();
    const figures = [{ name: leader.name, title, desc: leader.desc, race: leader.race }];
    const [lo, hi] = tierGov.courtSize;
    const count = randomInt(lo, hi);
    for (let i = 0; i < count; i++) {
      const f = nextFigure();
      figures.push({ name: f.name, title: `${tierGov.courtTitle} Member`, desc: f.desc, race: f.race });
    }
    return { kind: 'court', figures };
  }
  return null;
}

function genTavernEntry(card, tierIndex, maxT, includeFood) {
  const entryRace = rollWeightedRace(card, 'tavern');
  const config = POPULATION_CONFIG[entryRace];
  const name = `The ${pick(config.tavernAdjectives)} ${pick(config.tavernNouns)}`;
  const innkeeper = genPersonName(entryRace, getSubtypeForRace(card, entryRace));
  const history = pick(config.tavernHistory);
  let menu = null;
  if (includeFood) {
    const count = tierIndex === maxT ? Math.min(4, config.tavernMenu.length) : Math.min(3, config.tavernMenu.length);
    menu = [...config.tavernMenu].sort(() => Math.random() - 0.5).slice(0, count);
  }
  return { name, innkeeper, history, race: entryRace, menuLabel: config.tavernMenuLabel, menu };
}

function genTavern(raceKey, tierIndex, includeFood, card) {
  const config = POPULATION_CONFIG[raceKey];
  if (tierIndex === 0) return { kind: 'informal', blurb: pick(config.tavernInformal) };

  const maxT = maxTierIndex(raceKey);
  const usedNames = new Set();
  const usedInnkeepers = new Set();
  function genUniqueEntry() {
    let entry = genTavernEntry(card, tierIndex, maxT, includeFood);
    let guard = 0;
    while ((usedNames.has(entry.name) || usedInnkeepers.has(entry.innkeeper)) && guard < 10) {
      entry = genTavernEntry(card, tierIndex, maxT, includeFood);
      guard++;
    }
    usedNames.add(entry.name);
    usedInnkeepers.add(entry.innkeeper);
    return entry;
  }

  const main = genUniqueEntry();
  const extraCount = tierIndex === maxT - 1 ? 1 : tierIndex === maxT ? randomInt(2, 3) : 0;
  const extras = [];
  for (let i = 0; i < Math.max(0, extraCount); i++) extras.push(genUniqueEntry());
  return { kind: 'real', name: main.name, innkeeper: main.innkeeper, history: main.history, race: main.race, includeFood, menuLabel: main.menuLabel, menu: main.menu, extras };
}

function genMerchants(raceKey, tierIndex, card) {
  const config = POPULATION_CONFIG[raceKey];
  if (tierIndex === 0) return { kind: 'informal', blurb: pick(config.tavernInformal) };

  const maxT = maxTierIndex(raceKey);
  const bounds = tierIndex >= maxT ? [5, 7] : (tierIndex === maxT - 1 ? [3, 4] : [1, 2]);
  const [lo, hi] = bounds;
  const count = randomInt(lo, hi);
  const usedTypesByRace = new Map();
  const shops = [];
  for (let i = 0; i < count; i++) {
    const shopRace = rollWeightedRace(card, 'merchants');
    const shopConfig = POPULATION_CONFIG[shopRace];
    const availableTypes = shopConfig.shopTypes.filter(s => s.minTierIndex <= tierIndex);
    if (!availableTypes.length) continue;
    if (!usedTypesByRace.has(shopRace)) usedTypesByRace.set(shopRace, new Set());
    const usedTypes = usedTypesByRace.get(shopRace);
    const pool = availableTypes.filter(s => !usedTypes.has(s.type));
    const typeEntry = pool.length ? pick(pool) : pick(availableTypes);
    usedTypes.add(typeEntry.type);
    const race = RACES[shopRace];
    const forcedSubtype = getSubtypeForRace(card, shopRace);
    const subtypeKey = (forcedSubtype && race.subtypes[forcedSubtype]) ? forcedSubtype : pickRaceSubtype(shopRace);
    const sub = race.subtypes[subtypeKey];
    const first = pick(sub.masc.concat(sub.fem));
    const sur = pick(sub.surnames);
    const proprietor = race.pattern(first, sur);
    shops.push({ shopName: `${sur}\u2019s ${typeEntry.type}`, type: typeEntry.type, proprietor, blurb: pick(typeEntry.blurbs), race: shopRace });
  }
  let temple = null;
  if (tierIndex >= Math.min(2, maxT) && Math.random() < 0.6) {
    if (config.shrineOverride) {
      temple = { title: config.shrineOverride.title, caretaker: genPersonName(raceKey, getSubtypeForRace(card, raceKey)), dedication: pick(config.shrineOverride.dedications) };
    } else if (config.templeDedications) {
      temple = { title: 'Shrine', caretaker: genPersonName(raceKey, getSubtypeForRace(card, raceKey)), dedication: pick(config.templeDedications) };
    }
  }
  return { kind: 'shops', shops, temple };
}

function genTension(raceKey, tierIndex, card) {
  const config = POPULATION_CONFIG[raceKey];
  const maxT = maxTierIndex(raceKey);
  const forcedSubtype = getSubtypeForRace(card, raceKey);
  const subtypeKey = (forcedSubtype && RACES[raceKey].subtypes[forcedSubtype]) ? forcedSubtype : pickRaceSubtype(raceKey);
  const sub = RACES[raceKey].subtypes[subtypeKey];

  if (tierIndex <= (maxT >= 3 ? 1 : 0)) {
    let famA = pick(sub.surnames);
    let famB = pick(sub.surnames);
    let guard = 0;
    while (famB === famA && guard < 10) { famB = pick(sub.surnames); guard++; }
    return { kind: 'family', familyA: famA, familyB: famB, reason: pick(config.tensionSmall.reasons) };
  }
  if (tierIndex < maxT || !config.tensionLarge) {
    const partyA = genPersonName(raceKey, forcedSubtype);
    let partyB = genPersonName(raceKey, forcedSubtype);
    let guard = 0;
    while (partyB === partyA && guard < 10) { partyB = genPersonName(raceKey, forcedSubtype); guard++; }
    return { kind: 'dispute', partyA, partyB, reason: pick(config.tensionMid.reasons) };
  }
  let groupA = pick(config.tensionLarge.names);
  let groupB = pick(config.tensionLarge.names);
  let guard = 0;
  while (groupB === groupA && guard < 10) { groupB = pick(config.tensionLarge.names); guard++; }
  return { kind: 'group', groupLabel: config.tensionLarge.groupLabel, groupA, groupB, blurb: pick(config.tensionLarge.blurbs) };
}

function genLocations(raceKey, tierIndex) {
  const config = POPULATION_CONFIG[raceKey];
  const maxT = maxTierIndex(raceKey);
  const countsByRelative = tierIndex === 0 ? [0, 1] : tierIndex === maxT ? [3, Math.min(4, config.locations.length)] : [1, 2];
  const [lo, hi] = countsByRelative;
  const count = Math.min(randomInt(lo, hi), config.locations.length);
  const used = new Set();
  const locations = [];
  for (let i = 0; i < count; i++) locations.push(pickUnique(config.locations, used));
  return locations;
}

function regenerateName(card) { card.name = genSettlementName(); }
function regenerateVibe(card) { card.vibe = genVibe(); }
function regenerateGovernance(card) { card.governance = genGovernance(card.race, card.tierIndex, card.govType, card); }
function regenerateTavern(card) { card.tavern = genTavern(card.race, card.tierIndex, card.includeFood, card); }
function regenerateMerchants(card) { card.merchants = genMerchants(card.race, card.tierIndex, card); }
function regenerateTension(card) { card.tension = genTension(card.race, card.tierIndex, card); }
function regenerateLocations(card) { card.locations = genLocations(card.race, card.tierIndex); }
function regenerateAll(card) {
  card.tierIndex = clampTierIndex(card.race, card.tierIndex);
  regenerateName(card);
  regenerateVibe(card);
  regenerateGovernance(card);
  regenerateTavern(card);
  regenerateMerchants(card);
  regenerateTension(card);
  regenerateLocations(card);
}

function starterCard() {
  return {
    id: 'settlement-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    race: 'human',
    raceSubtype: null,
    tierIndex: 1,
    name: '',
    vibe: '',
    govType: 'council',
    includeFood: true,
    population: null,
    demographics: [],
    governance: null,
    tavern: null,
    merchants: null,
    tension: null,
    locations: null
  };
}

// ===== Deck management =====

let deck = [];
let currentId = null;

// Maps the old pre-rewrite string tier keys (which were literally Human's
// own tier names, since every population shared one universal ladder
// before) to a starting tierIndex guess for migration purposes.
const LEGACY_TIER_MAP = { hamlet: 0, village: 1, town: 2, city: 3 };

// Cards saved before the population-specific rewrite have no tierIndex at
// all (size was a string like 'city') and their governance/tavern/
// merchants/tension data was built by the old universal generators, which
// used different field shapes than the new population-aware ones. Rather
// than trying to carefully patch every old field name, treat any card
// missing a valid tierIndex as pre-rewrite: keep only what's safely
// version-independent (id, name, vibe, food toggle), regenerate
// everything else fresh under the new system. Also guards against a
// race key that no longer exists (defensive, not currently reachable).
function migrateCard(card) {
  if (!RACES[card.race] || !POPULATION_CONFIG[card.race]) card.race = 'human';
  if (!Array.isArray(card.demographics)) card.demographics = [];
  if (card.population === undefined) card.population = null;
  if (card.raceSubtype === undefined || (card.raceSubtype && !RACES[card.race].subtypes[card.raceSubtype])) card.raceSubtype = null;

  const hasValidTierIndex = Number.isInteger(card.tierIndex) &&
    card.tierIndex >= 0 && card.tierIndex <= maxTierIndex(card.race);

  if (hasValidTierIndex) return card;

  const legacyGuess = typeof card.tier === 'string' ? LEGACY_TIER_MAP[card.tier] : undefined;
  card.tierIndex = clampTierIndex(card.race, legacyGuess !== undefined ? legacyGuess : 1);
  delete card.tier;
  card.govType = card.govType === 'solo' ? 'solo' : 'council';
  regenerateGovernance(card);
  regenerateTavern(card);
  regenerateMerchants(card);
  regenerateTension(card);
  regenerateLocations(card);
  return card;
}

function loadDeck() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(migrateCard);
    }
  } catch (e) { /* fall through */ }
  const card = starterCard();
  regenerateAll(card);
  return [card];
}

function saveDeck() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deck)); } catch (e) { /* best effort */ }
}

function currentCard() {
  return deck.find(c => c.id === currentId) || deck[0];
}

function renderDeckList() {
  const list = $('deck-list');
  list.innerHTML = '';
  deck.forEach(card => {
    const item = document.createElement('div');
    item.className = 'deck-item' + (card.id === currentId ? ' active' : '');
    item.textContent = card.name || '(unnamed)';
    item.addEventListener('click', () => {
      currentId = card.id;
      renderDeckList();
      renderForm();
      renderCard();
    });
    list.appendChild(item);
  });
}

// ===== Form binding =====

function populateRaceSelect() {
  const sel = $('race-select');
  sel.innerHTML = '';
  Object.keys(RACES).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = RACES[key].label;
    sel.appendChild(opt);
  });
}

function populateTierSelect(raceKey, selectedIndex) {
  const sel = $('tier-select');
  sel.innerHTML = '';
  POPULATION_CONFIG[raceKey].tierLadder.forEach((tier, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = tier.label;
    if (i === selectedIndex) opt.selected = true;
    sel.appendChild(opt);
  });
}

// Populates a Culture/Region <select> for the given race, with a leading
// "Any" option (empty value) that keeps the original behavior of rolling
// a random subtype per name. Hides the whole field if the race only has
// one subtype, matching the NPC Generator's own pattern exactly.
function populateCultureSelect(selectEl, fieldEl, raceKey, selectedSubtype) {
  selectEl.innerHTML = '';
  const subtypes = RACES[raceKey].subtypes;
  const keys = Object.keys(subtypes);
  if (keys.length === 1) {
    fieldEl.style.display = 'none';
    return;
  }
  fieldEl.style.display = '';
  const anyOpt = document.createElement('option');
  anyOpt.value = '';
  anyOpt.textContent = 'Any';
  selectEl.appendChild(anyOpt);
  keys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = subtypes[k].label;
    if (k === selectedSubtype) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function populateGovTypeSelect(raceKey, tierIndex, selected) {
  const field = $('gov-type-field');
  const sel = $('gov-type-select');
  const tierGov = POPULATION_CONFIG[raceKey].governance[tierIndex];
  sel.innerHTML = '';
  if (!tierGov || tierGov.mode !== 'council-or-solo') {
    field.hidden = true;
    return;
  }
  field.hidden = false;
  const councilOpt = document.createElement('option');
  councilOpt.value = 'council';
  councilOpt.textContent = tierGov.councilTitle + ' & Council';
  const soloOpt = document.createElement('option');
  soloOpt.value = 'solo';
  soloOpt.textContent = tierGov.soloTitles.join(' / ');
  sel.appendChild(councilOpt);
  sel.appendChild(soloOpt);
  sel.value = selected === 'solo' ? 'solo' : 'council';
}

function renderForm() {
  const card = currentCard();
  $('race-select').value = card.race;
  populateCultureSelect($('race-subtype-select'), $('race-subtype-field'), card.race, card.raceSubtype);
  $('population-input').value = card.population || '';
  populateTierSelect(card.race, card.tierIndex);
  $('name-input').value = card.name;
  $('vibe-input').value = card.vibe;
  $('food-toggle').checked = card.includeFood;
  populateGovTypeSelect(card.race, card.tierIndex, card.govType);
  renderDemographicsList();
}

function renderDemographicsList() {
  const card = currentCard();
  const container = $('demographics-list');
  container.innerHTML = '';
  (card.demographics || []).forEach((demo, idx) => {
    const row = document.createElement('div');
    row.className = 'demo-row';

    const top = document.createElement('div');
    top.className = 'demo-row-top';

    const raceField = document.createElement('label');
    raceField.className = 'demo-race';
    raceField.innerHTML = 'Population';
    const raceSelect = document.createElement('select');
    Object.keys(RACES).forEach(key => {
      if (key === card.race) return; // don't duplicate the primary population
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = RACES[key].label;
      if (key === demo.race) opt.selected = true;
      raceSelect.appendChild(opt);
    });
    raceSelect.addEventListener('change', e => {
      demo.race = e.target.value;
      demo.subtype = null; // reset — the old subtype belonged to the previous race
      regenerateGovernance(card); regenerateTavern(card); regenerateMerchants(card);
      renderForm(); saveDeck(); renderCard();
    });
    raceField.appendChild(raceSelect);

    const weightField = document.createElement('label');
    weightField.className = 'demo-weight';
    weightField.innerHTML = 'Weight (%)';
    const weightInput = document.createElement('input');
    weightInput.type = 'text';
    weightInput.inputMode = 'numeric';
    weightInput.value = demo.weight;
    weightInput.addEventListener('input', e => {
      demo.weight = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
      regenerateGovernance(card); regenerateTavern(card); regenerateMerchants(card);
      saveDeck(); renderCard();
    });
    weightField.appendChild(weightInput);

    top.appendChild(raceField);
    top.appendChild(weightField);
    row.appendChild(top);

    const cultureField = document.createElement('label');
    cultureField.className = 'demo-culture';
    cultureField.textContent = 'Culture / Region';
    const cultureSelect = document.createElement('select');
    cultureField.appendChild(cultureSelect);
    row.appendChild(cultureField);
    populateCultureSelect(cultureSelect, cultureField, demo.race, demo.subtype);
    cultureSelect.addEventListener('change', e => {
      demo.subtype = e.target.value || null;
      regenerateGovernance(card); regenerateTavern(card); regenerateMerchants(card);
      saveDeck(); renderCard();
    });

    const checks = document.createElement('div');
    checks.className = 'demo-row-checks';
    [['allowGovernance', 'Allow in Governance'], ['allowTavern', 'Allow in Tavern'], ['allowMerchants', 'Allow in Merchants']].forEach(([key, label]) => {
      const checkLabel = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = demo[key] !== false;
      checkbox.addEventListener('change', e => {
        demo[key] = e.target.checked;
        regenerateGovernance(card); regenerateTavern(card); regenerateMerchants(card);
        saveDeck(); renderCard();
      });
      checkLabel.appendChild(checkbox);
      checkLabel.appendChild(document.createTextNode(label));
      checks.appendChild(checkLabel);
    });
    row.appendChild(checks);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'demo-remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      card.demographics.splice(idx, 1);
      regenerateGovernance(card); regenerateTavern(card); regenerateMerchants(card);
      renderForm(); saveDeck(); renderCard();
    });
    row.appendChild(removeBtn);

    container.appendChild(row);
  });
}

// ===== Card rendering =====

let activeTab = 'overview';

function raceTag(race, primaryRace) {
  return race && race !== primaryRace ? ` <span class="race-tag">(${escapeHtml(RACES[race].label)})</span>` : '';
}

function renderGovernanceHtml(gov, primaryRace) {
  if (!gov) return '';
  if (gov.kind === 'none') return `<div class="card-line">${escapeHtml(gov.flavor)}</div>`;
  let html = '';
  if (gov.houseName) html += `<div class="card-line"><b>Ruling House</b> ${escapeHtml(gov.houseName)}</div>`;
  gov.figures.forEach(f => {
    html += `<div class="gov-figure">
      <div class="gov-figure-name">${escapeHtml(f.name)}${raceTag(f.race, primaryRace)}</div>
      <div class="gov-figure-title">${escapeHtml(f.title)}</div>
      <div class="gov-figure-desc">${escapeHtml(capitalize(f.desc))}</div>
    </div>`;
  });
  return html;
}

function renderTavernHtml(tav, primaryRace) {
  if (!tav) return '';
  if (tav.kind === 'informal') {
    return `<div class="card-line">${escapeHtml(tav.blurb)}</div>`;
  }
  let html = `<div class="tavern-name">${escapeHtml(tav.name)}${raceTag(tav.race, primaryRace)}</div>`;
  html += `<div class="tavern-meta">Innkeeper: ${escapeHtml(tav.innkeeper)}</div>`;
  html += `<div class="card-line">${escapeHtml(tav.history)}</div>`;
  if (tav.menu) {
    html += `<div class="card-line" style="margin-top:8px;"><b>${escapeHtml(tav.menuLabel)}</b></div><ul class="menu-list">`;
    tav.menu.forEach(item => { html += `<li><span class="menu-item-name">${escapeHtml(item.name)}</span> \u2014 ${escapeHtml(item.desc)}</li>`; });
    html += `</ul>`;
  }
  if (tav.extras && tav.extras.length) {
    html += `<div class="card-line" style="margin-top:12px;"><b>Also here:</b></div>`;
    tav.extras.forEach(ex => { html += `<div class="card-line">${escapeHtml(ex.name)}${raceTag(ex.race, primaryRace)}, run by ${escapeHtml(ex.innkeeper)}</div>`; });
  }
  return html;
}

function renderMerchantsHtml(merch, primaryRace) {
  if (!merch) return '';
  if (merch.kind === 'informal') return `<div class="card-line">${escapeHtml(merch.blurb)}</div>`;
  let html = '';
  merch.shops.forEach(s => {
    html += `<div class="gov-figure">
      <div class="gov-figure-name">${escapeHtml(s.shopName)}${raceTag(s.race, primaryRace)}</div>
      <div class="gov-figure-title">${escapeHtml(s.type)} \u2014 ${escapeHtml(s.proprietor)}</div>
      <div class="gov-figure-desc">${escapeHtml(s.blurb)}</div>
    </div>`;
  });
  if (merch.temple) {
    html += `<div class="gov-figure">
      <div class="gov-figure-name">${escapeHtml(merch.temple.title)}, dedicated to ${escapeHtml(merch.temple.dedication)}</div>
      <div class="gov-figure-title">Caretaker: ${escapeHtml(merch.temple.caretaker)}</div>
    </div>`;
  }
  return html;
}

function renderTensionHtml(tension) {
  if (!tension) return '';
  if (tension.kind === 'family') return `<div class="card-line"><b>${escapeHtml(tension.familyA)}</b> and <b>${escapeHtml(tension.familyB)}</b> \u2014 ${escapeHtml(tension.reason)}.</div>`;
  if (tension.kind === 'dispute') return `<div class="card-line"><b>${escapeHtml(tension.partyA)}</b> and <b>${escapeHtml(tension.partyB)}</b>, over ${escapeHtml(tension.reason)}.</div>`;
  return `<div class="card-line"><b>${escapeHtml(tension.groupA)}</b> and <b>${escapeHtml(tension.groupB)}</b> are ${escapeHtml(tension.blurb)}</div>`;
}

function renderLocationsHtml(locations) {
  if (!locations || !locations.length) return '';
  let html = '<div class="card-line" style="margin-top:14px;"><b>Notable locations</b></div>';
  locations.forEach(loc => { html += `<div class="card-line">${escapeHtml(loc)}</div>`; });
  return html;
}

function renderDemographicsBreakdown(card) {
  const demographics = (card.demographics || []).filter(d => POPULATION_CONFIG[d.race]);
  if (!demographics.length) return '';
  const secondarySum = demographics.reduce((sum, d) => sum + (Number(d.weight) || 0), 0);
  const primaryPct = Math.max(0, 100 - secondarySum);
  const parts = [`${primaryPct}% ${RACES[card.race].label}`, ...demographics.map(d => `${Number(d.weight) || 0}% ${RACES[d.race].label}`)];
  return `<div class="card-line" style="font-size:0.85rem; color:#6b5a3f;">${escapeHtml(parts.join(' \u00b7 '))}</div>`;
}

function renderCard() {
  const card = currentCard();
  const config = POPULATION_CONFIG[card.race];
  const tierLabel = config.tierLadder[card.tierIndex].label;
  const cardEl = $('settlement-card');

  let html = '';
  html += `<div class="settlement-tier-tag">${escapeHtml(tierLabel)}</div>`;
  html += `<div class="settlement-name">${escapeHtml(card.name)}</div>`;
  html += `<div class="settlement-vibe">${escapeHtml(card.vibe)}</div>`;

  html += `<div class="card-tabs">
    <button type="button" class="card-tab-btn${activeTab === 'overview' ? ' active' : ''}" data-tab="overview">Overview</button>
    <button type="button" class="card-tab-btn${activeTab === 'governance' ? ' active' : ''}" data-tab="governance">Governance</button>
    <button type="button" class="card-tab-btn${activeTab === 'tavern' ? ' active' : ''}" data-tab="tavern">${escapeHtml(config.tavernLabel)}</button>
    <button type="button" class="card-tab-btn${activeTab === 'merchants' ? ' active' : ''}" data-tab="merchants">Merchants</button>
    <button type="button" class="card-tab-btn${activeTab === 'tension' ? ' active' : ''}" data-tab="tension">Tension</button>
  </div>`;

  html += `<div class="card-tab-panel${activeTab === 'overview' ? ' active' : ''}" data-panel="overview">
    <div class="card-line"><b>Population</b> ${escapeHtml(RACES[card.race].label)}${card.population ? ` (~${Number(card.population).toLocaleString()})` : ''}</div>
    ${renderDemographicsBreakdown(card)}
    <div class="card-line"><b>Size</b> ${escapeHtml(tierLabel)}</div>
    ${renderLocationsHtml(card.locations)}
  </div>`;
  html += `<div class="card-tab-panel${activeTab === 'governance' ? ' active' : ''}" data-panel="governance">${renderGovernanceHtml(card.governance, card.race)}</div>`;
  html += `<div class="card-tab-panel${activeTab === 'tavern' ? ' active' : ''}" data-panel="tavern">${renderTavernHtml(card.tavern, card.race)}</div>`;
  html += `<div class="card-tab-panel${activeTab === 'merchants' ? ' active' : ''}" data-panel="merchants">${renderMerchantsHtml(card.merchants, card.race)}</div>`;
  html += `<div class="card-tab-panel${activeTab === 'tension' ? ' active' : ''}" data-panel="tension">${renderTensionHtml(card.tension)}</div>`;

  html += `<div class="card-footer">Statblock Forge &middot; original settlement concept</div>`;

  cardEl.innerHTML = html;
  cardEl.querySelectorAll('.card-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => { activeTab = btn.dataset.tab; renderCard(); });
  });
}

// ===== Event wiring =====

$('race-select').addEventListener('change', e => {
  const card = currentCard();
  card.race = e.target.value;
  card.raceSubtype = null; // reset — the old subtype belonged to the previous race
  card.tierIndex = clampTierIndex(card.race, card.tierIndex);
  card.govType = 'council';
  // Drop any secondary population entry that now duplicates the new primary.
  card.demographics = (card.demographics || []).filter(d => d.race !== card.race);
  regenerateGovernance(card);
  regenerateTavern(card);
  regenerateMerchants(card);
  regenerateTension(card);
  regenerateLocations(card);
  renderForm();
  saveDeck();
  renderCard();
});

$('race-subtype-select').addEventListener('change', e => {
  const card = currentCard();
  card.raceSubtype = e.target.value || null;
  regenerateGovernance(card);
  regenerateTavern(card);
  regenerateMerchants(card);
  regenerateTension(card);
  saveDeck();
  renderCard();
});

$('tier-select').addEventListener('change', e => {
  const card = currentCard();
  card.tierIndex = parseInt(e.target.value, 10);
  card.govType = 'council';
  regenerateGovernance(card);
  regenerateTavern(card);
  regenerateMerchants(card);
  regenerateTension(card);
  regenerateLocations(card);
  renderForm();
  saveDeck();
  renderCard();
});

$('name-input').addEventListener('input', e => {
  currentCard().name = e.target.value;
  saveDeck(); renderCard(); renderDeckList();
});

$('population-input').addEventListener('input', e => {
  const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
  currentCard().population = Number.isFinite(val) && val > 0 ? val : null;
  saveDeck(); renderCard();
});

$('add-demographic').addEventListener('click', () => {
  const card = currentCard();
  const otherRaces = Object.keys(RACES).filter(k => k !== card.race);
  const defaultRace = otherRaces.find(k => !card.demographics.some(d => d.race === k)) || otherRaces[0];
  card.demographics.push({ race: defaultRace, subtype: null, weight: 5, allowGovernance: true, allowTavern: true, allowMerchants: true });
  regenerateGovernance(card); regenerateTavern(card); regenerateMerchants(card);
  renderForm(); saveDeck(); renderCard();
});

$('vibe-input').addEventListener('input', e => {
  currentCard().vibe = e.target.value;
  saveDeck(); renderCard();
});

$('gov-type-select').addEventListener('change', e => {
  const card = currentCard();
  card.govType = e.target.value;
  regenerateGovernance(card);
  saveDeck(); renderCard();
});

$('food-toggle').addEventListener('change', e => {
  const card = currentCard();
  card.includeFood = e.target.checked;
  regenerateTavern(card);
  saveDeck(); renderCard();
});

$('reroll-name').addEventListener('click', () => { const c = currentCard(); regenerateName(c); renderForm(); saveDeck(); renderCard(); renderDeckList(); });
$('reroll-vibe').addEventListener('click', () => { const c = currentCard(); regenerateVibe(c); renderForm(); saveDeck(); renderCard(); });
$('reroll-locations').addEventListener('click', () => { regenerateLocations(currentCard()); saveDeck(); renderCard(); });
$('reroll-governance').addEventListener('click', () => { regenerateGovernance(currentCard()); saveDeck(); renderCard(); });
$('reroll-tavern').addEventListener('click', () => { regenerateTavern(currentCard()); saveDeck(); renderCard(); });
$('reroll-merchants').addEventListener('click', () => { regenerateMerchants(currentCard()); saveDeck(); renderCard(); });
$('reroll-tension').addEventListener('click', () => { regenerateTension(currentCard()); saveDeck(); renderCard(); });

$('generate-all').addEventListener('click', () => {
  const c = currentCard();
  regenerateAll(c);
  renderForm(); saveDeck(); renderCard(); renderDeckList();
});

$('new-settlement').addEventListener('click', () => {
  const card = starterCard();
  regenerateAll(card);
  deck.push(card);
  currentId = card.id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

$('duplicate-settlement').addEventListener('click', () => {
  const card = JSON.parse(JSON.stringify(currentCard()));
  card.id = 'settlement-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  deck.push(card);
  currentId = card.id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

$('delete-settlement').addEventListener('click', () => {
  if (deck.length <= 1) return;
  deck = deck.filter(c => c.id !== currentId);
  currentId = deck[0].id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

$('export-deck').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'settlements.json'; a.click();
  URL.revokeObjectURL(url);
});

$('import-deck').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (Array.isArray(imported) && imported.length) {
        deck = imported.map(migrateCard);
        currentId = deck[0].id;
        renderDeckList(); renderForm(); renderCard(); saveDeck();
      }
    } catch (err) { alert('Could not read that file as a settlement deck.'); }
  };
  reader.readAsText(file);
});

$('export-png').addEventListener('click', () => {
  const cardEl = $('settlement-card');
  cardEl.classList.add('export-all');
  html2canvas(cardEl, { backgroundColor: '#f3ecd8', scale: 2 }).then(canvas => {
    cardEl.classList.remove('export-all');
    const link = document.createElement('a');
    link.download = (currentCard().name || 'settlement').replace(/[^a-z0-9]/gi, '_') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(() => { cardEl.classList.remove('export-all'); });
});

// ===== XLSX export =====

function govFiguresToRows(gov) {
  if (!gov) return [];
  if (gov.kind === 'none') return [['(No formal leadership)', gov.flavor]];
  const rows = [['Name', 'Title', 'Character']];
  gov.figures.forEach(f => rows.push([f.name, f.title, capitalize(f.desc)]));
  if (gov.houseName) { rows.push([]); rows.push(['Ruling House', gov.houseName]); }
  return rows;
}

function tavernToRows(tav, config) {
  if (!tav) return [];
  if (tav.kind === 'informal') return [[tav.blurb]];
  const rows = [['Name', tav.name], ['Innkeeper', tav.innkeeper], ['History', tav.history]];
  if (tav.menu) {
    rows.push([]);
    rows.push([config.tavernMenuLabel, 'Description']);
    tav.menu.forEach(item => rows.push([item.name, item.desc]));
  }
  if (tav.extras && tav.extras.length) {
    rows.push([]);
    rows.push(['Also here', 'Innkeeper']);
    tav.extras.forEach(ex => rows.push([ex.name, ex.innkeeper]));
  }
  return rows;
}

function merchantsToRows(merch) {
  if (!merch) return [];
  if (merch.kind === 'informal') return [[merch.blurb]];
  const rows = [['Shop', 'Type', 'Proprietor', 'Notes']];
  merch.shops.forEach(s => rows.push([s.shopName, s.type, s.proprietor, s.blurb]));
  if (merch.temple) {
    rows.push([]);
    rows.push([merch.temple.title, 'Dedicated to ' + merch.temple.dedication, 'Caretaker: ' + merch.temple.caretaker]);
  }
  return rows;
}

function tensionToRows(tension) {
  if (!tension) return [];
  if (tension.kind === 'family') return [['Family A', tension.familyA], ['Family B', tension.familyB], ['Reason', tension.reason]];
  if (tension.kind === 'dispute') return [['Party A', tension.partyA], ['Party B', tension.partyB], ['Reason', tension.reason]];
  return [['Group A', tension.groupA], ['Group B', tension.groupB], ['Situation', tension.blurb]];
}

$('export-xlsx').addEventListener('click', () => {
  const card = currentCard();
  const config = POPULATION_CONFIG[card.race];
  const tierLabel = config.tierLadder[card.tierIndex].label;

  const wb = XLSX.utils.book_new();

  const overviewRows = [
    ['Name', card.name],
    ['Population', RACES[card.race].label],
    ['Size', tierLabel],
    ['Character', card.vibe],
    []
  ];
  if (card.locations && card.locations.length) {
    overviewRows.push(['Notable Locations']);
    card.locations.forEach(loc => overviewRows.push([loc]));
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewRows), 'Overview');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(govFiguresToRows(card.governance)), 'Governance');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tavernToRows(card.tavern, config)), config.tavernLabel.slice(0, 31));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(merchantsToRows(card.merchants)), 'Merchants');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tensionToRows(card.tension)), 'Tension');

  const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (card.name || 'settlement').replace(/[^a-z0-9]/gi, '_') + '.xlsx';
  a.click();
  URL.revokeObjectURL(url);
});

// ===== Init =====

populateRaceSelect();
deck = loadDeck();
currentId = deck[0].id;
renderDeckList();
renderForm();
renderCard();
