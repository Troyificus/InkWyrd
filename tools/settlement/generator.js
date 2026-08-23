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

function genPersonName(raceKey) {
  const race = RACES[raceKey];
  const sub = race.subtypes[pickRaceSubtype(raceKey)];
  const first = pick(sub.masc.concat(sub.fem));
  const sur = pick(sub.surnames);
  return race.pattern(first, sur);
}

function genGovernance(tier, raceKey, govType) {
  if (tier === 'hamlet') {
    if (Math.random() < 0.5) {
      return { kind: 'none', flavor: pick(GOVERNANCE.hamlet.noLeaderFlavor) };
    }
    return {
      kind: 'named',
      figures: [{ name: genPersonName(raceKey), title: capitalize(GOVERNANCE.hamlet.namedTitle), desc: pick(GOVERNANCE_DESCRIPTORS) }]
    };
  }
  if (tier === 'village') {
    return {
      kind: 'named',
      figures: [{ name: genPersonName(raceKey), title: pick(GOVERNANCE.village.titles), desc: pick(GOVERNANCE_DESCRIPTORS) }]
    };
  }
  // town or city
  const cfg = GOVERNANCE[tier];
  if (govType === 'solo') {
    const result = {
      kind: 'solo',
      figures: [{ name: genPersonName(raceKey), title: pick(cfg.soloTitles), desc: pick(GOVERNANCE_DESCRIPTORS) }]
    };
    if (tier === 'city') result.houseName = pick(cfg.houseNames);
    return result;
  }
  const [lo, hi] = cfg.councilSize;
  const size = randomInt(lo, hi);
  const usedNames = new Set();
  const usedDescs = new Set();
  const figures = [];
  for (let i = 0; i < size; i++) {
    let name = genPersonName(raceKey);
    let guard = 0;
    while (usedNames.has(name) && guard < 10) { name = genPersonName(raceKey); guard++; }
    usedNames.add(name);
    figures.push({ name, title: i === 0 ? cfg.councilTitle : 'Council Member', desc: pickUnique(GOVERNANCE_DESCRIPTORS, usedDescs) });
  }
  return { kind: 'council', figures };
}

function genTavernEntry(raceKey) {
  return { name: `The ${pick(TAVERN_NAME_ADJECTIVES)} ${pick(TAVERN_NAME_NOUNS)}`, innkeeper: genPersonName(raceKey) };
}

function genTavern(tier, raceKey, includeFood) {
  if (tier === 'hamlet') {
    return { kind: 'informal' };
  }
  const usedTavernNames = new Set();
  const usedInnkeepers = new Set();
  function genUniqueTavernEntry() {
    let entry = genTavernEntry(raceKey);
    let guard = 0;
    while ((usedTavernNames.has(entry.name) || usedInnkeepers.has(entry.innkeeper)) && guard < 10) {
      entry = genTavernEntry(raceKey);
      guard++;
    }
    usedTavernNames.add(entry.name);
    usedInnkeepers.add(entry.innkeeper);
    return entry;
  }
  const main = genUniqueTavernEntry();
  const history = pick(TAVERN_HISTORY);
  let menu = null;
  if (includeFood) {
    const count = tier === 'city' ? 4 : 3;
    menu = [...TAVERN_MENU_ITEMS].sort(() => Math.random() - 0.5).slice(0, count);
  }
  const extraCount = tier === 'town' ? 1 : tier === 'city' ? randomInt(2, 3) : 0;
  const extras = [];
  for (let i = 0; i < extraCount; i++) extras.push(genUniqueTavernEntry());
  return { kind: 'real', name: main.name, innkeeper: main.innkeeper, history, includeFood, menu, extras };
}

function genShopkeeperAndName(raceKey, shopType) {
  const race = RACES[raceKey];
  const sub = race.subtypes[pickRaceSubtype(raceKey)];
  const first = pick(sub.masc.concat(sub.fem));
  const sur = pick(sub.surnames);
  return { proprietor: race.pattern(first, sur), shopName: `${sur}\u2019s ${shopType}` };
}

function genMerchants(tier, raceKey) {
  if (tier === 'hamlet') {
    return { kind: 'informal', blurb: pick(HAMLET_TRADE_BLURBS) };
  }
  const availableTypes = SHOP_TYPES.filter(s => TIER_ORDER.indexOf(s.minTier) <= TIER_ORDER.indexOf(tier));
  const counts = { village: [1, 2], town: [3, 4], city: [5, 7] };
  const [lo, hi] = counts[tier];
  const count = Math.min(randomInt(lo, hi), availableTypes.length);
  const usedTypes = new Set();
  const shops = [];
  for (let i = 0; i < count; i++) {
    const pool = availableTypes.filter(s => !usedTypes.has(s.type));
    const typeEntry = pool.length ? pick(pool) : pick(availableTypes);
    usedTypes.add(typeEntry.type);
    const { proprietor, shopName } = genShopkeeperAndName(raceKey, typeEntry.type);
    shops.push({ shopName, type: typeEntry.type, proprietor, blurb: pick(typeEntry.blurbs) });
  }
  let temple = null;
  if ((tier === 'town' || tier === 'city') && Math.random() < 0.6) {
    temple = { caretaker: genPersonName(raceKey), dedication: pick(TEMPLE_DEDICATIONS) };
  }
  return { kind: 'shops', shops, temple };
}

function genTension(tier, raceKey) {
  if (tier === 'hamlet' || tier === 'village') {
    const sub = RACES[raceKey].subtypes[pickRaceSubtype(raceKey)];
    let famA = pick(sub.surnames);
    let famB = pick(sub.surnames);
    let guard = 0;
    while (famB === famA && guard < 10) { famB = pick(sub.surnames); guard++; }
    return { kind: 'family', familyA: famA, familyB: famB, reason: pick(FAMILY_GRUDGE_REASONS) };
  }
  if (tier === 'town') {
    const partyA = genPersonName(raceKey);
    let partyB = genPersonName(raceKey);
    let guard = 0;
    while (partyB === partyA && guard < 10) { partyB = genPersonName(raceKey); guard++; }
    return { kind: 'dispute', partyA, partyB, reason: pick(DISPUTE_REASONS) };
  }
  let gangA = pick(GANG_NAMES);
  let gangB = pick(GANG_NAMES);
  let guard = 0;
  while (gangB === gangA && guard < 10) { gangB = pick(GANG_NAMES); guard++; }
  return { kind: 'gangs', gangA, gangB, blurb: pick(GANG_RIVALRY_BLURBS) };
}

function genLocations(tier) {
  const counts = { hamlet: [0, 1], village: [1, 1], town: [2, 2], city: [3, 4] };
  const [lo, hi] = counts[tier];
  const count = randomInt(lo, hi);
  const used = new Set();
  const locations = [];
  for (let i = 0; i < count; i++) locations.push(pickUnique(NOTABLE_LOCATIONS, used));
  return locations;
}

function regenerateName(card) { card.name = genSettlementName(); }
function regenerateVibe(card) { card.vibe = genVibe(); }
function regenerateGovernance(card) { card.governance = genGovernance(card.tier, card.race, card.govType); }
function regenerateTavern(card) { card.tavern = genTavern(card.tier, card.race, card.includeFood); }
function regenerateMerchants(card) { card.merchants = genMerchants(card.tier, card.race); }
function regenerateTension(card) { card.tension = genTension(card.tier, card.race); }
function regenerateLocations(card) { card.locations = genLocations(card.tier); }
function regenerateAll(card) {
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
    tier: 'village',
    name: '',
    vibe: '',
    govType: 'council',
    includeFood: true,
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

function loadDeck() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
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
  Object.keys(RACES).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = RACES[key].label;
    sel.appendChild(opt);
  });
}

function renderForm() {
  const card = currentCard();
  $('race-select').value = card.race;
  $('tier-select').value = card.tier;
  $('name-input').value = card.name;
  $('vibe-input').value = card.vibe;
  $('food-toggle').checked = card.includeFood;
  const govField = $('gov-type-field');
  const showGovType = card.tier === 'town' || card.tier === 'city';
  govField.hidden = !showGovType;
  if (showGovType) $('gov-type-select').value = card.govType;
}

// ===== Card rendering =====

let activeTab = 'overview';

function renderGovernanceHtml(gov) {
  if (!gov) return '';
  if (gov.kind === 'none') {
    return `<div class="card-line">${escapeHtml(gov.flavor)}</div>`;
  }
  let html = '';
  if (gov.houseName) html += `<div class="card-line"><b>Ruling House</b> ${escapeHtml(gov.houseName)}</div>`;
  gov.figures.forEach(f => {
    html += `<div class="gov-figure">
      <div class="gov-figure-name">${escapeHtml(f.name)}</div>
      <div class="gov-figure-title">${escapeHtml(f.title)}</div>
      <div class="gov-figure-desc">${escapeHtml(capitalize(f.desc))}</div>
    </div>`;
  });
  return html;
}

function renderTavernHtml(tav) {
  if (!tav) return '';
  if (tav.kind === 'informal') {
    return `<div class="card-line">No real tavern here \u2014 folks gather at whichever house has the biggest hearth.</div>`;
  }
  let html = `<div class="tavern-name">${escapeHtml(tav.name)}</div>`;
  html += `<div class="tavern-meta">Innkeeper: ${escapeHtml(tav.innkeeper)}</div>`;
  html += `<div class="card-line">${escapeHtml(tav.history)}</div>`;
  if (tav.menu) {
    html += `<ul class="menu-list">`;
    tav.menu.forEach(item => {
      html += `<li><span class="menu-item-name">${escapeHtml(item.name)}</span> \u2014 ${escapeHtml(item.desc)}</li>`;
    });
    html += `</ul>`;
  } else {
    html += `<div class="card-line" style="font-style:italic; color:#8a8264;">Drinks only \u2014 no kitchen here.</div>`;
  }
  if (tav.extras && tav.extras.length) {
    html += `<div class="card-line" style="margin-top:12px;"><b>Also in town:</b></div>`;
    tav.extras.forEach(ex => {
      html += `<div class="card-line">${escapeHtml(ex.name)}, run by ${escapeHtml(ex.innkeeper)}</div>`;
    });
  }
  return html;
}

function renderMerchantsHtml(merch) {
  if (!merch) return '';
  if (merch.kind === 'informal') {
    return `<div class="card-line">${escapeHtml(merch.blurb)}</div>`;
  }
  let html = '';
  merch.shops.forEach(s => {
    html += `<div class="gov-figure">
      <div class="gov-figure-name">${escapeHtml(s.shopName)}</div>
      <div class="gov-figure-title">${escapeHtml(s.type)} \u2014 ${escapeHtml(s.proprietor)}</div>
      <div class="gov-figure-desc">${escapeHtml(s.blurb)}</div>
    </div>`;
  });
  if (merch.temple) {
    html += `<div class="gov-figure">
      <div class="gov-figure-name">Shrine, dedicated to ${escapeHtml(merch.temple.dedication)}</div>
      <div class="gov-figure-title">Caretaker: ${escapeHtml(merch.temple.caretaker)}</div>
    </div>`;
  }
  return html;
}

function renderTensionHtml(tension) {
  if (!tension) return '';
  if (tension.kind === 'family') {
    return `<div class="card-line"><b>${escapeHtml(tension.familyA)}</b> and <b>${escapeHtml(tension.familyB)}</b> \u2014 ${escapeHtml(tension.reason)}.</div>`;
  }
  if (tension.kind === 'dispute') {
    return `<div class="card-line"><b>${escapeHtml(tension.partyA)}</b> and <b>${escapeHtml(tension.partyB)}</b>, over ${escapeHtml(tension.reason)}.</div>`;
  }
  return `<div class="card-line"><b>${escapeHtml(tension.gangA)}</b> and <b>${escapeHtml(tension.gangB)}</b> are ${escapeHtml(tension.blurb)}</div>`;
}

function renderLocationsHtml(locations) {
  if (!locations || !locations.length) return '';
  let html = '<div class="card-line" style="margin-top:14px;"><b>Notable locations</b></div>';
  locations.forEach(loc => { html += `<div class="card-line">${escapeHtml(loc)}</div>`; });
  return html;
}

function renderCard() {
  const card = currentCard();
  const cardEl = $('settlement-card');

  let html = '';
  html += `<div class="settlement-tier-tag">${capitalize(card.tier)}</div>`;
  html += `<div class="settlement-name">${escapeHtml(card.name)}</div>`;
  html += `<div class="settlement-vibe">${escapeHtml(card.vibe)}</div>`;

  html += `<div class="card-tabs">
    <button type="button" class="card-tab-btn${activeTab === 'overview' ? ' active' : ''}" data-tab="overview">Overview</button>
    <button type="button" class="card-tab-btn${activeTab === 'governance' ? ' active' : ''}" data-tab="governance">Governance</button>
    <button type="button" class="card-tab-btn${activeTab === 'tavern' ? ' active' : ''}" data-tab="tavern">Tavern</button>
    <button type="button" class="card-tab-btn${activeTab === 'merchants' ? ' active' : ''}" data-tab="merchants">Merchants</button>
    <button type="button" class="card-tab-btn${activeTab === 'tension' ? ' active' : ''}" data-tab="tension">Tension</button>
  </div>`;

  html += `<div class="card-tab-panel${activeTab === 'overview' ? ' active' : ''}" data-panel="overview">
    <div class="card-line"><b>Population</b> ${escapeHtml(RACES[card.race].label)}</div>
    <div class="card-line"><b>Size</b> ${capitalize(card.tier)}</div>
    ${renderLocationsHtml(card.locations)}
  </div>`;

  html += `<div class="card-tab-panel${activeTab === 'governance' ? ' active' : ''}" data-panel="governance">${renderGovernanceHtml(card.governance)}</div>`;
  html += `<div class="card-tab-panel${activeTab === 'tavern' ? ' active' : ''}" data-panel="tavern">${renderTavernHtml(card.tavern)}</div>`;
  html += `<div class="card-tab-panel${activeTab === 'merchants' ? ' active' : ''}" data-panel="merchants">${renderMerchantsHtml(card.merchants)}</div>`;
  html += `<div class="card-tab-panel${activeTab === 'tension' ? ' active' : ''}" data-panel="tension">${renderTensionHtml(card.tension)}</div>`;

  html += `<div class="card-footer">Statblock Forge &middot; original settlement concept</div>`;

  cardEl.innerHTML = html;

  cardEl.querySelectorAll('.card-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      renderCard();
    });
  });
}

// ===== Event wiring =====

$('race-select').addEventListener('change', e => {
  const card = currentCard();
  card.race = e.target.value;
  regenerateGovernance(card);
  regenerateTavern(card);
  regenerateMerchants(card);
  regenerateTension(card);
  saveDeck();
  renderCard();
});

$('tier-select').addEventListener('change', e => {
  const card = currentCard();
  card.tier = e.target.value;
  renderForm();
  regenerateGovernance(card);
  regenerateTavern(card);
  regenerateMerchants(card);
  regenerateTension(card);
  regenerateLocations(card);
  saveDeck();
  renderCard();
});

$('name-input').addEventListener('input', e => {
  currentCard().name = e.target.value;
  saveDeck();
  renderCard();
  renderDeckList();
});

$('vibe-input').addEventListener('input', e => {
  currentCard().vibe = e.target.value;
  saveDeck();
  renderCard();
});

$('gov-type-select').addEventListener('change', e => {
  const card = currentCard();
  card.govType = e.target.value;
  regenerateGovernance(card);
  saveDeck();
  renderCard();
});

$('food-toggle').addEventListener('change', e => {
  const card = currentCard();
  card.includeFood = e.target.checked;
  regenerateTavern(card);
  saveDeck();
  renderCard();
});

$('reroll-name').addEventListener('click', () => {
  const c = currentCard();
  regenerateName(c);
  renderForm(); saveDeck(); renderCard(); renderDeckList();
});
$('reroll-vibe').addEventListener('click', () => {
  const c = currentCard();
  regenerateVibe(c);
  renderForm(); saveDeck(); renderCard();
});
$('reroll-governance').addEventListener('click', () => {
  regenerateGovernance(currentCard());
  saveDeck(); renderCard();
});
$('reroll-tavern').addEventListener('click', () => {
  regenerateTavern(currentCard());
  saveDeck(); renderCard();
});
$('reroll-merchants').addEventListener('click', () => {
  regenerateMerchants(currentCard());
  saveDeck(); renderCard();
});
$('reroll-tension').addEventListener('click', () => {
  regenerateTension(currentCard());
  saveDeck(); renderCard();
});
$('reroll-locations').addEventListener('click', () => {
  regenerateLocations(currentCard());
  saveDeck(); renderCard();
});

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
  a.href = url;
  a.download = 'settlements.json';
  a.click();
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
        deck = imported;
        currentId = deck[0].id;
        renderDeckList(); renderForm(); renderCard(); saveDeck();
      }
    } catch (err) {
      alert('Could not read that file as a settlement deck.');
    }
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
  }).catch(() => {
    cardEl.classList.remove('export-all');
  });
});

// ===== Init =====

populateRaceSelect();
deck = loadDeck();
currentId = deck[0].id;
renderDeckList();
renderForm();
renderCard();
