const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'dhitems.deck.v1';

// ===== Card data model =====
function newCard(overrides = {}) {
  return Object.assign({
    id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
    name: 'New Item',
    tier: 1,
    description: '',
    theme: 'parchment',
    accent: '#7a2020',
    variables: [],
    image: null,
    imageAlign: 'right',
    imageWidth: 170,
    itemCategory: 'weapon',
    itemTypeName: '',
    itemBaseStats: '',
    itemRange: '',
    itemRarity: 'Common',
    itemTrigger: '',
    itemEffect: '',
    itemUsage: 'Always active',
    itemFeatureName: ''
  }, overrides);
}

function starterCard() {
  return newCard({
    name: 'Sunken Longbow',
    tier: 2,
    itemCategory: 'weapon',
    itemTypeName: 'Longbow',
    itemBaseStats: '1d8 piercing',
    itemRange: 'Range 150/600 ft',
    itemRarity: 'Uncommon',
    description: 'Said to have come from a shrine reclaimed by the tide.',
    itemEffect: 'this weapon deals an additional 1d6 cold damage on a hit.',
    itemUsage: 'Always active'
  });
}

// ===== State =====
let deck = [];
let currentId = null;

function loadDeck() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(migrateCard);
    }
  } catch (e) { /* fall through */ }
  return [starterCard()];
}

function migrateCard(card) {
  if (!card.variables) card.variables = [];
  if (card.image === undefined) card.image = null;
  if (!card.imageAlign) card.imageAlign = 'right';
  if (!card.imageWidth) card.imageWidth = 170;
  if (!card.itemCategory) card.itemCategory = 'weapon';
  if (card.itemTypeName === undefined) card.itemTypeName = '';
  if (card.itemBaseStats === undefined) card.itemBaseStats = '';
  if (card.itemRange === undefined) card.itemRange = '';
  if (!card.itemRarity) card.itemRarity = 'Common';
  if (card.itemEffect === undefined) card.itemEffect = '';
  // Older saves used numeric D&D-style charges/recharge; fold those into a
  // single free-text Usage line, matching how Daggerheart items actually read.
  if (card.itemCharges !== undefined || card.itemRecharge !== undefined) {
    if (card.itemUsage === undefined) {
      card.itemUsage = card.itemRecharge || (card.itemCharges ? `${card.itemCharges} uses` : 'Always active');
    }
    delete card.itemCharges;
    delete card.itemRecharge;
  }
  if (card.itemUsage === undefined) card.itemUsage = 'Always active';
  if (card.itemTrigger === undefined) card.itemTrigger = '';
  if (card.itemFeatureName === undefined) card.itemFeatureName = '';
  if (!card.tier) card.tier = 1;
  return card;
}

function saveDeck() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
  } catch (e) {
    const status = $('deck-status');
    if (status) {
      status.textContent = 'Could not autosave (storage full — try Export Deck as a backup).';
      setTimeout(() => { if (status.textContent.startsWith('Could not autosave')) status.textContent = ''; }, 5000);
    }
  }
}

function currentCard() {
  return deck.find(c => c.id === currentId) || deck[0];
}

// ===== Deck list UI =====
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

// ===== Form <-> data binding =====
function renderForm() {
  const card = currentCard();
  document.querySelectorAll('[data-field]').forEach(el => {
    const field = el.dataset.field;
    if (field in card) el.value = card[field];
  });
  renderVariableInputs();
  renderImagePreview();
}

document.getElementById('statblock-form').addEventListener('input', (e) => {
  const el = e.target;
  const field = el.dataset.field;
  if (!field) return;
  const card = currentCard();
  card[field] = el.type === 'number' ? Number(el.value) : el.value;
  if (field === 'name') renderDeckList();
  renderCard();
  saveDeck();
});

const DH_RARITY_TIER = { Common: 1, Uncommon: 2, Rare: 3, Legendary: 4 };

// Daggerheart items rarely track numeric charges — most are either always
// active or gated by a rest/session, so the randomizer picks from that
// instead of the D&D-style charge/recharge pool the shared engine uses.
const DH_USAGE_BY_TIER = {
  1: ['Always active', 'Unlimited'],
  2: ['Always active', 'Once per short rest'],
  3: ['Once per short rest', 'Once per long rest'],
  4: ['Once per long rest', 'Once per session'],
  5: ['Once per session', 'Once per long rest']
};

function pickDHUsage(tier) {
  const pool = DH_USAGE_BY_TIER[Math.max(1, Math.min(5, tier))] || DH_USAGE_BY_TIER[1];
  return pool[Math.floor(Math.random() * pool.length)];
}

$('randomize-item').addEventListener('click', () => {
  const card = currentCard();
  const basePower = DH_RARITY_TIER[card.itemRarity] || 1;
  const tierBoost = Math.floor((card.tier - 1) / 1.3);
  const powerTier = Math.max(1, Math.min(5, basePower + tierBoost));
  const concept = generateItemConcept(card.itemCategory, powerTier, false);
  card.name = concept.name;
  card.description = concept.description;
  card.itemTypeName = concept.itemType;
  card.itemBaseStats = concept.baseStats;
  card.itemRange = concept.range || '';
  card.itemEffect = concept.effect;
  // A weapon's bonus damage or an armor's resistance is always active while
  // worn/wielded — only active-use items (wearable/consumable/wondrous) get
  // a rest/session usage restriction.
  const isPassiveCategory = card.itemCategory === 'weapon' || card.itemCategory === 'armor';
  card.itemUsage = isPassiveCategory ? '' : pickDHUsage(powerTier);
  card.itemTrigger = '';
  card.itemFeatureName = '';
  renderForm();
  renderCard();
  saveDeck();
});

// Auto-fill Base Stats / Range when the user types/picks a recognized weapon or armor name.
document.querySelector('[data-field="itemTypeName"]').addEventListener('input', (e) => {
  const card = currentCard();
  const lookup = card.itemCategory === 'armor' ? lookupArmorStats(e.target.value) : lookupWeaponStats(e.target.value);
  if (lookup) {
    card.itemBaseStats = lookup;
    const baseStatsInput = document.querySelector('[data-field="itemBaseStats"]');
    if (baseStatsInput) baseStatsInput.value = lookup;
  }
  if (card.itemCategory === 'weapon') {
    const rangeLookup = lookupWeaponRange(e.target.value);
    if (rangeLookup) {
      card.itemRange = rangeLookup;
      const rangeInput = document.querySelector('[data-field="itemRange"]');
      if (rangeInput) rangeInput.value = rangeLookup;
    }
  }
  if (lookup) {
    renderCard();
    saveDeck();
  }
});

// ===== Custom Variables list UI =====
function escapeHtml(str) {
  return (str || '').toString().replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function capitalize(str) {
  const s = (str || '').toString();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderVariableInputs() {
  const card = currentCard();
  if (!card.variables) card.variables = [];
  const container = $('variables-list');
  container.innerHTML = '';
  card.variables.forEach((v, i) => {
    const row = document.createElement('div');
    row.className = 'variable-row';
    row.innerHTML = `
      <input type="text" data-idx="${i}" data-key="key" class="variable-input variable-key" placeholder="TOKEN" value="${escapeHtml(v.key)}">
      <input type="text" data-idx="${i}" data-key="value" class="variable-input variable-value" placeholder="Value" value="${escapeHtml(v.value)}">
      <button type="button" class="remove-variable" data-idx="${i}">✕</button>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.variable-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = +e.target.dataset.idx;
      const key = e.target.dataset.key;
      let val = e.target.value;
      if (key === 'key') val = val.toUpperCase().replace(/[^A-Z0-9_]/g, '');
      currentCard().variables[idx][key] = val;
      renderCard();
      saveDeck();
    });
  });
  container.querySelectorAll('.remove-variable').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentCard().variables.splice(+e.target.dataset.idx, 1);
      renderVariableInputs();
      renderCard();
      saveDeck();
    });
  });
}

$('add-variable').addEventListener('click', () => {
  currentCard().variables.push({ key: 'VAR' + (currentCard().variables.length + 1), value: '' });
  renderVariableInputs();
  renderCard();
  saveDeck();
});

// ===== Illustration upload =====
function resizeImageFile(file, maxDim = 700) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

$('image-upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const dataUrl = await resizeImageFile(file);
    currentCard().image = dataUrl;
    renderImagePreview();
    renderCard();
    saveDeck();
  } catch (err) {
    console.error(err);
    $('deck-status').textContent = 'Could not load that image.';
    setTimeout(() => $('deck-status').textContent = '', 3000);
  }
  e.target.value = '';
});

function renderImagePreview() {
  const card = currentCard();
  const wrap = $('image-preview-wrap');
  if (!card.image) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `
    <div class="image-preview">
      <img src="${escapeHtml(card.image)}" alt="Illustration preview">
      <button type="button" id="remove-image">Remove image</button>
    </div>
  `;
  $('remove-image').addEventListener('click', () => {
    currentCard().image = null;
    renderImagePreview();
    renderCard();
    saveDeck();
  });
}

// Replaces [TOKEN] references in text with a custom variable's value, or the
// built-in [TIER] token pulled from the card's own field.
function applySubs(text, card) {
  if (!text) return text;
  const builtins = { TIER: card.tier };
  const custom = {};
  (card.variables || []).forEach(v => { if (v.key) custom[v.key.toUpperCase()] = v.value; });
  const lookup = Object.assign({}, builtins, custom);

  return text.replace(/\[([A-Z0-9_]+)\]/gi, (match, token) => {
    const key = token.toUpperCase();
    return key in lookup && lookup[key] !== '' && lookup[key] !== undefined ? lookup[key] : match;
  });
}

// ===== Card rendering =====
function cardInnerHtml(card) {
  let html = '';
  const sub = (text) => escapeHtml(applySubs(text, card));
  const hasImage = !!card.image && card.imageAlign !== 'none';
  const rowImage = hasImage && card.imageAlign !== 'bottom';
  const bottomImage = hasImage && card.imageAlign === 'bottom';
  const iconSvg = getTypeIcon(card.itemCategory);

  html += `<div class="corner-tag corner-right">
      <div class="corner-tier">T${escapeHtml(card.tier)}</div>
      <div class="corner-type"><span class="corner-icon">${iconSvg}</span>${escapeHtml(card.itemRarity)}</div>
    </div>`;

  html += `<div class="card-name" style="padding-right:70px">${escapeHtml(card.name)}</div>`;
  html += `<div class="trait-chip-row">
      <span class="trait-chip">${capitalize(card.itemCategory)}</span>
      <span class="trait-chip">${escapeHtml(card.itemRarity)}</span>
    </div>`;
  if (card.description) html += `<div class="card-desc">${sub(card.description)}</div>`;

  let statHtml = '';
  if (card.itemTypeName || card.itemBaseStats) {
    statHtml += `<div class="card-line"><b>${escapeHtml(card.itemTypeName) || capitalize(card.itemCategory)}:</b> ${sub(card.itemBaseStats)}</div>`;
  }
  if (card.itemRange) {
    statHtml += `<div class="card-line"><b>Range:</b> ${sub(card.itemRange)}</div>`;
  }

  const effectLine = card.itemTrigger
    ? `<b>When</b> ${sub(card.itemTrigger)}, ${sub(card.itemEffect) || '<i>describe what happens.</i>'}`
    : (sub(card.itemEffect) || '<i>No effect written yet.</i>');

  if (rowImage) {
    // Fold Effect into the same column as the stats, so it fills the space
    // beside the image instead of waiting until below it — the divider is
    // then a child of the narrower column and can never cross the image.
    statHtml += `<div class="section-divider">Effect</div>`;
    if (card.itemFeatureName) {
      statHtml += `<div class="card-feature"><div class="feat-head"><span class="feat-name">${sub(card.itemFeatureName)}</span></div></div>`;
    }
    statHtml += `<div class="card-line">${effectLine}</div>`;
    if (card.itemUsage) {
      statHtml += `<div class="card-line" style="margin-top:10px"><b>Usage:</b> ${sub(card.itemUsage)}</div>`;
    }
    const w = card.imageWidth || 170;
    const img = `<img class="card-illustration" src="${escapeHtml(card.image)}" style="width:${w}px;" alt="">`;
    const statCol = `<div class="stat-col">${statHtml}</div>`;
    html += `<div class="stat-image-row">${card.imageAlign === 'left' ? img + statCol : statCol + img}</div>`;
  } else {
    html += statHtml;
    html += `<div class="section-divider">Effect</div>`;
    if (card.itemFeatureName) {
      html += `<div class="card-feature"><div class="feat-head"><span class="feat-name">${sub(card.itemFeatureName)}</span></div></div>`;
    }
    html += `<div class="card-line">${effectLine}</div>`;
    if (card.itemUsage) {
      html += `<div class="card-line" style="margin-top:10px"><b>Usage:</b> ${sub(card.itemUsage)}</div>`;
    }
  }

  if (bottomImage) {
    html += `<img class="card-illustration card-illustration-bottom" src="${escapeHtml(card.image)}" alt="">`;
  }

  html += `<div class="card-footer">Daggerheart Compatible &middot; original item concept</div>`;
  return html;
}

function renderCard() {
  const card = currentCard();
  const el = $('statblock-card');
  el.className = 'theme-' + card.theme;
  el.style.setProperty('--card-accent', card.accent);
  el.innerHTML = cardInnerHtml(card);
}

// ===== Deck actions =====
$('new-card').addEventListener('click', () => {
  const card = newCard();
  deck.push(card);
  currentId = card.id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

$('duplicate-card').addEventListener('click', () => {
  const src = currentCard();
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = 'c' + Date.now() + Math.floor(Math.random() * 1000);
  copy.name = src.name + ' (copy)';
  deck.push(copy);
  currentId = copy.id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

$('delete-card').addEventListener('click', () => {
  if (deck.length <= 1) {
    $('deck-status').textContent = "Can't delete your only item.";
    setTimeout(() => $('deck-status').textContent = '', 2000);
    return;
  }
  deck = deck.filter(c => c.id !== currentId);
  currentId = deck[0].id;
  renderDeckList(); renderForm(); renderCard(); saveDeck();
});

// ===== JSON export/import =====
$('export-json').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'daggerheart-item-deck.json';
  a.click();
  URL.revokeObjectURL(url);
});

$('import-json').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('Invalid deck file');
      deck = parsed.map(migrateCard);
      currentId = deck[0].id;
      renderDeckList(); renderForm(); renderCard(); saveDeck();
      $('deck-status').textContent = `Imported ${deck.length} item(s).`;
    } catch (err) {
      $('deck-status').textContent = 'Import failed — invalid JSON.';
    }
    setTimeout(() => $('deck-status').textContent = '', 3000);
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ===== PNG export (single) =====
async function renderCardToCanvas(card) {
  const offscreen = document.createElement('div');
  offscreen.id = 'statblock-card';
  offscreen.className = 'theme-' + card.theme;
  offscreen.style.setProperty('--card-accent', card.accent);
  offscreen.style.position = 'fixed';
  offscreen.style.left = '-9999px';
  offscreen.style.top = '0';
  offscreen.innerHTML = cardInnerHtml(card);
  document.body.appendChild(offscreen);
  const canvas = await html2canvas(offscreen, { scale: 2, backgroundColor: null, windowWidth: 1400, windowHeight: 2000 });
  document.body.removeChild(offscreen);
  return canvas;
}

function filenameFor(card) {
  return (card.name || 'item').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'item';
}

$('export-png').addEventListener('click', async () => {
  const status = $('export-status');
  status.textContent = 'Rendering...';
  try {
    const canvas = await renderCardToCanvas(currentCard());
    const link = document.createElement('a');
    link.download = `${filenameFor(currentCard())}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    status.textContent = 'Downloaded.';
    setTimeout(() => status.textContent = '', 2000);
  } catch (err) {
    console.error(err);
    status.textContent = 'Export failed — see console.';
  }
});

// ===== Batch PNG export as ZIP =====
$('export-all-png').addEventListener('click', async () => {
  const status = $('deck-status');
  status.textContent = `Rendering ${deck.length} item(s)...`;
  try {
    const zip = new JSZip();
    const usedNames = new Set();
    for (const card of deck) {
      const canvas = await renderCardToCanvas(card);
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      let name = filenameFor(card);
      let unique = name;
      let n = 2;
      while (usedNames.has(unique)) { unique = `${name}-${n++}`; }
      usedNames.add(unique);
      zip.file(`${unique}.png`, base64, { base64: true });
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daggerheart-item-cards.zip';
    a.click();
    URL.revokeObjectURL(url);
    status.textContent = 'ZIP downloaded.';
  } catch (err) {
    console.error(err);
    status.textContent = 'Batch export failed — see console.';
  }
  setTimeout(() => status.textContent = '', 3000);
});

// ===== Print sheet =====
$('print-sheet').addEventListener('click', () => {
  const win = window.open('', '_blank');
  const styleLink = document.querySelector('link[rel="stylesheet"]').href;
  const cardsHtml = deck.map(card => {
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-' + card.theme;
    wrapper.id = 'statblock-card';
    wrapper.style.setProperty('--card-accent', card.accent);
    wrapper.innerHTML = cardInnerHtml(card);
    return `<div class="print-cell">${wrapper.outerHTML}</div>`;
  }).join('\n');

  win.document.write(`
    <!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>Print Sheet — Daggerheart Items</title>
    <link rel="stylesheet" href="${styleLink}">
    <style>
      body { background: #fff; padding: 20px; }
      .print-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
      #statblock-card { width: 100%; }
      @media print {
        body { padding: 0; }
        .print-grid { gap: 10px; }
      }
    </style>
    </head><body>
    <div class="print-grid">${cardsHtml}</div>
    </body></html>
  `);
  win.document.close();
  win.onload = () => win.print();
});

// ===== Init =====
deck = loadDeck();
currentId = deck[0].id;
renderDeckList();
renderForm();
renderCard();
