const STORAGE_KEY = 'pantheon.deck.v1';
const $ = id => document.getElementById(id);

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// ===== Which race/culture combinations actually have content =====

function availableRaces() {
  return Object.keys(PANTHEON_CULTURES);
}
function availableCultures(raceKey) {
  return PANTHEON_CULTURES[raceKey] ? Object.keys(PANTHEON_CULTURES[raceKey]) : [];
}

// ===== Generation =====

// Weighted pick: mostly draws from a culture's own biased subset, but
// occasionally (25% of the time) draws from the full shared pool, so a
// pantheon still leans strongly toward its culture's established flavor
// without ever being fully deterministic or losing all variety.
function biasedPick(biasList, fullList) {
  if (Math.random() < 0.75 && biasList && biasList.length) return pick(biasList);
  return pick(fullList);
}

function genDeity(raceKey, culture, usedNames) {
  const cultureData = PANTHEON_CULTURES[raceKey][culture];
  const entry = pickUnique(cultureData.deities, usedNames, d => d.name);
  const alignment = biasedPick(cultureData.alignmentBias, PANTHEON_ALIGNMENTS);
  const domainCount = Math.random() < 0.4 ? 2 : 1;
  const domains = [];
  let guard = 0;
  while (domains.length < domainCount && guard < 20) {
    const d = biasedPick(cultureData.domainBias, PANTHEON_DOMAINS);
    if (!domains.includes(d)) domains.push(d);
    guard++;
  }
  const symbolDomain = pick(domains);
  const symbol = pick(DOMAIN_SYMBOLS[symbolDomain] || ['an unadorned circle']);
  const gender = pick(GENDER_PRESENTATIONS);
  return { name: entry.name, epithet: entry.epithet, alignment, domains, symbol, gender };
}

function genPantheonDeities(card) {
  const cultureData = PANTHEON_CULTURES[card.race] && PANTHEON_CULTURES[card.race][card.culture];
  if (!cultureData) return [];
  const maxAvailable = cultureData.deities.length;
  const count = Math.max(1, Math.min(card.count, maxAvailable));
  const usedNames = new Set();
  const deities = [];
  for (let i = 0; i < count; i++) deities.push(genDeity(card.race, card.culture, usedNames));
  return deities;
}

function regenerateAll(card) {
  card.deities = genPantheonDeities(card);
}

function regenerateOneDeity(card, index) {
  const usedNames = new Set(card.deities.filter((d, i) => i !== index).map(d => d.name));
  card.deities[index] = genDeity(card.race, card.culture, usedNames);
}

function genPantheonName(raceKey, culture) {
  const cultureData = PANTHEON_CULTURES[raceKey] && PANTHEON_CULTURES[raceKey][culture];
  const label = cultureData ? cultureData.label : 'Unknown';
  return `${label} Pantheon`;
}

// pickUnique needs a keyFn variant here since deity entries are objects,
// not plain strings — this small wrapper adapts the shared helper.
function pickUnique(pool, usedSet, keyFn) {
  const available = pool.filter(item => !usedSet.has(keyFn ? keyFn(item) : item));
  const chosen = available.length ? pick(available) : pick(pool);
  usedSet.add(keyFn ? keyFn(chosen) : chosen);
  return chosen;
}

// ===== Card data model =====

function starterCard() {
  const race = availableRaces()[0];
  const culture = availableCultures(race)[0];
  return {
    id: 'pantheon-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    race,
    culture,
    name: genPantheonName(race, culture),
    count: 6,
    deities: []
  };
}

// ===== Deck management =====

let deck = [];
let currentId = null;

function migrateCard(card) {
  if (!availableRaces().includes(card.race)) card.race = availableRaces()[0];
  if (!availableCultures(card.race).includes(card.culture)) card.culture = availableCultures(card.race)[0];
  if (!Number.isInteger(card.count) || card.count < 1 || card.count > 12) card.count = 6;
  if (!Array.isArray(card.deities)) card.deities = [];
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
  availableRaces().forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = RACES[key].label;
    sel.appendChild(opt);
  });
}

function populateCultureFormSelect(raceKey, selected) {
  const field = $('culture-field');
  const sel = $('culture-select');
  sel.innerHTML = '';
  const cultures = availableCultures(raceKey);
  if (cultures.length <= 1) {
    field.style.display = 'none';
  } else {
    field.style.display = '';
  }
  cultures.forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = PANTHEON_CULTURES[raceKey][key].label;
    if (key === selected) opt.selected = true;
    sel.appendChild(opt);
  });
}

function renderForm() {
  const card = currentCard();
  $('race-select').value = card.race;
  populateCultureFormSelect(card.race, card.culture);
  $('name-input').value = card.name;
  $('count-input').value = card.count;
}

// ===== Card rendering =====

function renderCard() {
  const card = currentCard();
  const cultureData = PANTHEON_CULTURES[card.race][card.culture];
  const cardEl = $('pantheon-card');

  let html = '';
  html += `<div class="pantheon-culture-tag">${escapeHtml(RACES[card.race].label)} \u2014 ${escapeHtml(cultureData.label)}</div>`;
  html += `<div class="pantheon-name">${escapeHtml(card.name)}</div>`;

  card.deities.forEach((d, i) => {
    html += `<div class="deity-entry">
      <div class="deity-name-row">
        <div class="deity-name">${escapeHtml(d.name)}</div>
        <button type="button" class="deity-reroll-btn" data-index="${i}">🎲 Reroll</button>
      </div>
      <div class="deity-epithet">${escapeHtml(d.epithet)}</div>
      <div class="deity-meta"><b>Alignment</b> ${escapeHtml(d.alignment)} &middot; <b>Domain${d.domains.length > 1 ? 's' : ''}</b> ${escapeHtml(d.domains.join(' & '))} &middot; <b>Presentation</b> ${escapeHtml(d.gender)}</div>
      <div class="deity-symbol"><b>Symbol:</b> ${escapeHtml(capitalize(d.symbol))}</div>
    </div>`;
  });

  html += `<div class="card-footer">Statblock Forge &middot; original pantheon concept</div>`;

  cardEl.innerHTML = html;
  cardEl.querySelectorAll('.deity-reroll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      regenerateOneDeity(currentCard(), idx);
      saveDeck();
      renderCard();
    });
  });
}

// ===== Event wiring =====

$('race-select').addEventListener('change', e => {
  const card = currentCard();
  card.race = e.target.value;
  card.culture = availableCultures(card.race)[0];
  card.name = genPantheonName(card.race, card.culture);
  regenerateAll(card);
  renderForm(); saveDeck(); renderCard(); renderDeckList();
});

$('culture-select').addEventListener('change', e => {
  const card = currentCard();
  card.culture = e.target.value;
  card.name = genPantheonName(card.race, card.culture);
  regenerateAll(card);
  renderForm(); saveDeck(); renderCard(); renderDeckList();
});

$('name-input').addEventListener('input', e => {
  currentCard().name = e.target.value;
  saveDeck(); renderCard(); renderDeckList();
});

$('reroll-name').addEventListener('click', () => {
  const card = currentCard();
  card.name = genPantheonName(card.race, card.culture);
  renderForm(); saveDeck(); renderCard(); renderDeckList();
});

$('count-input').addEventListener('input', e => {
  const card = currentCard();
  const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
  card.count = Number.isFinite(val) ? Math.max(1, Math.min(12, val)) : 6;
  regenerateAll(card);
  saveDeck(); renderCard();
});

$('generate-all').addEventListener('click', () => {
  const card = currentCard();
  card.name = genPantheonName(card.race, card.culture);
  regenerateAll(card);
  renderForm(); saveDeck(); renderCard(); renderDeckList();
});

$('new-pantheon').addEventListener('click', () => {
  const card = starterCard();
  regenerateAll(card);
  deck.push(card);
  currentId = card.id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

$('duplicate-pantheon').addEventListener('click', () => {
  const card = JSON.parse(JSON.stringify(currentCard()));
  card.id = 'pantheon-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  deck.push(card);
  currentId = card.id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

$('delete-pantheon').addEventListener('click', () => {
  if (deck.length <= 1) return;
  deck = deck.filter(c => c.id !== currentId);
  currentId = deck[0].id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

$('export-deck').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pantheons.json'; a.click();
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
    } catch (err) { alert('Could not read that file as a pantheon deck.'); }
  };
  reader.readAsText(file);
});

$('export-png').addEventListener('click', () => {
  const cardEl = $('pantheon-card');
  html2canvas(cardEl, { backgroundColor: '#f3ecd8', scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = (currentCard().name || 'pantheon').replace(/[^a-z0-9]/gi, '_') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

$('export-xlsx').addEventListener('click', () => {
  const card = currentCard();
  const rows = [['Name', 'Epithet', 'Alignment', 'Domains', 'Symbol', 'Presentation']];
  card.deities.forEach(d => rows.push([d.name, d.epithet, d.alignment, d.domains.join(' & '), capitalize(d.symbol), d.gender]));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), card.name.slice(0, 31));
  const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (card.name || 'pantheon').replace(/[^a-z0-9]/gi, '_') + '.xlsx';
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
