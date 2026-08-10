const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'pf2e.deck.v1';
const FEATURE_CATEGORIES = ['Ability', 'Reaction', 'Free Action'];

function fmtMod(n) {
  const v = Number(n) || 0;
  return v >= 0 ? `+${v}` : `${v}`;
}

// ===== Card data model =====
function newCard(overrides = {}) {
  return Object.assign({
    id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
    name: 'New Creature',
    level: 1,
    rarity: 'Common',
    sizeType: 'Medium Beast',
    traits: '',
    description: '',
    perception: '+8',
    senses: '',
    languages: '—',
    skills: '',
    items: '',
    str: 2, dex: 2, con: 2, int: -4, wis: 1, cha: -1,
    ac: '18',
    fort: '+10', ref: '+8', will: '+6',
    hp: '30',
    immunities: '',
    resistances: '',
    weaknesses: '',
    speed: '25 feet',
    attacks: [{ actionCost: '1 action', type: 'Melee', name: 'Jaws', bonus: '+12', damage: '2d8+5 piercing' }],
    theme: 'parchment',
    accent: '#7a2020',
    variables: [],
    image: null,
    imageAlign: 'right',
    imageWidth: 170,
    features: [
      { category: 'Ability', name: 'Attack of Opportunity', text: 'Reaction triggered by an adjacent enemy using a manipulate action, moving out of a reach, or making a ranged attack.' }
    ]
  }, overrides);
}

function starterCard() {
  return newCard({
    name: 'Cinder Wraith',
    level: 4,
    rarity: 'Uncommon',
    sizeType: 'Medium Undead',
    traits: 'incorporeal, negative',
    description: 'A smoldering ghost bound to the ashes of the home it once burned down.',
    perception: '+11',
    senses: 'darkvision, lifesense 30 feet',
    languages: 'Common',
    skills: 'Intimidation +11, Stealth +13',
    items: '',
    str: 0, dex: 4, con: 2, int: 0, wis: 2, cha: 3,
    ac: '21',
    fort: '+9', ref: '+13', will: '+11',
    hp: '55',
    immunities: 'death effects, disease, paralyzed, poison, unconscious',
    resistances: 'physical 5 (except force, ghost touch, or positive)',
    weaknesses: 'positive 5',
    speed: '0 feet, fly 40 feet',
    attacks: [
      { actionCost: '1 action', type: 'Melee', name: 'Burning Touch', bonus: '+13', damage: '2d6+4 fire plus 1d4 persistent fire' }
    ],
    features: [
      { category: 'Ability', name: 'Incorporeal', text: 'The wraith can pass through solid objects and creatures, and takes half damage from physical attacks unless the attack has the ghost touch trait.' },
      { category: 'Reaction', name: 'Cinder Flare', text: 'Trigger: A creature within 10 feet damages the wraith with a non-fire attack. Effect: The attacker takes 1d6 fire damage.' }
    ]
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
  if (!card.features) card.features = [];
  if (!card.attacks) card.attacks = [{ actionCost: '1 action', type: 'Melee', name: 'Strike', bonus: '+10', damage: '1d8+4' }];
  if (card.image === undefined) card.image = null;
  if (!card.imageAlign) card.imageAlign = 'right';
  if (!card.imageWidth) card.imageWidth = 170;
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
  renderFeatureInputs();
  renderAttackInputs();
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

function escapeHtml(str) {
  return (str || '').toString().replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ===== Strikes (attacks) UI =====
function renderAttackInputs() {
  const card = currentCard();
  if (!card.attacks || !card.attacks.length) {
    card.attacks = [{ actionCost: '1 action', type: 'Melee', name: 'Strike', bonus: '+10', damage: '1d8+4' }];
  }
  const container = $('attacks-list');
  container.innerHTML = '';
  card.attacks.forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'attack-row';
    row.innerHTML = `
      <div class="attack-row-header">
        <span class="attack-row-label">Strike ${i + 1}</span>
        ${card.attacks.length > 1 ? `<button type="button" class="remove-attack" data-idx="${i}">✕</button>` : ''}
      </div>
      <div class="attack-row-grid">
        <label>Action Cost <input type="text" data-idx="${i}" data-key="actionCost" class="attack-input" value="${escapeHtml(a.actionCost)}" placeholder="1 action"></label>
        <label>Type
          <select data-idx="${i}" data-key="type" class="attack-input">
            <option value="Melee" ${a.type === 'Melee' ? 'selected' : ''}>Melee</option>
            <option value="Ranged" ${a.type === 'Ranged' ? 'selected' : ''}>Ranged</option>
          </select>
        </label>
        <label>Name <input type="text" data-idx="${i}" data-key="name" class="attack-input" value="${escapeHtml(a.name)}"></label>
        <label>Bonus <input type="text" data-idx="${i}" data-key="bonus" class="attack-input" value="${escapeHtml(a.bonus)}"></label>
        <label>Damage <input type="text" data-idx="${i}" data-key="damage" class="attack-input" value="${escapeHtml(a.damage)}"></label>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.attack-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = +e.target.dataset.idx;
      const key = e.target.dataset.key;
      currentCard().attacks[idx][key] = e.target.value;
      renderCard();
      saveDeck();
    });
    inp.addEventListener('change', (e) => {
      const idx = +e.target.dataset.idx;
      const key = e.target.dataset.key;
      currentCard().attacks[idx][key] = e.target.value;
      renderCard();
      saveDeck();
    });
  });
  container.querySelectorAll('.remove-attack').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentCard().attacks.splice(+e.target.dataset.idx, 1);
      renderAttackInputs();
      renderCard();
      saveDeck();
    });
  });
}

$('add-attack').addEventListener('click', () => {
  currentCard().attacks.push({ actionCost: '1 action', type: 'Melee', name: 'New Strike', bonus: '+10', damage: '1d8+4' });
  renderAttackInputs();
  renderCard();
  saveDeck();
});

// ===== Features (Abilities/Reactions/Free Actions) UI =====
function renderFeatureInputs() {
  const card = currentCard();
  const container = $('features-list');
  container.innerHTML = '';
  card.features.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'feature-row';
    const options = FEATURE_CATEGORIES.map(c => `<option value="${c}" ${f.category === c ? 'selected' : ''}>${c}</option>`).join('');
    row.innerHTML = `
      <div class="feature-row-header">
        <label class="feat-cat-label">Category
          <select data-idx="${i}" class="feat-cat-input">${options}</select>
        </label>
        <label>Name
          <input type="text" data-idx="${i}" class="feat-name-input" value="${escapeHtml(f.name)}">
        </label>
        <button type="button" class="remove-feature" data-idx="${i}">✕</button>
      </div>
      <label>Text
        <textarea rows="2" data-idx="${i}" class="feat-text-input">${escapeHtml(f.text)}</textarea>
      </label>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.feat-cat-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      currentCard().features[+e.target.dataset.idx].category = e.target.value;
      renderCard();
      saveDeck();
    });
  });
  container.querySelectorAll('.feat-name-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      currentCard().features[+e.target.dataset.idx].name = e.target.value;
      renderCard();
      saveDeck();
    });
  });
  container.querySelectorAll('.feat-text-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      currentCard().features[+e.target.dataset.idx].text = e.target.value;
      renderCard();
      saveDeck();
    });
  });
  container.querySelectorAll('.remove-feature').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentCard().features.splice(+e.target.dataset.idx, 1);
      renderFeatureInputs();
      renderCard();
      saveDeck();
    });
  });
}

$('add-feature').addEventListener('click', () => {
  currentCard().features.push({ category: 'Ability', name: 'New Ability', text: 'Describe what it does.' });
  renderFeatureInputs();
  renderCard();
  saveDeck();
});

// ===== Custom Variables =====
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

function applySubs(text, card) {
  if (!text) return text;
  const builtins = {
    STR: fmtMod(card.str), DEX: fmtMod(card.dex), CON: fmtMod(card.con),
    INT: fmtMod(card.int), WIS: fmtMod(card.wis), CHA: fmtMod(card.cha),
    AC: card.ac, HP: card.hp, LEVEL: card.level
  };
  const custom = {};
  (card.variables || []).forEach(v => { if (v.key) custom[v.key.toUpperCase()] = v.value; });
  const lookup = Object.assign({}, builtins, custom);

  return text.replace(/\[([A-Z0-9_]+)\]/gi, (match, token) => {
    const key = token.toUpperCase();
    return key in lookup && lookup[key] !== '' && lookup[key] !== undefined ? lookup[key] : match;
  });
}

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
      <img src="${card.image}" alt="Illustration preview">
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

// ===== Card rendering =====
function cardInnerHtml(card) {
  let html = '';
  const sub = (text) => escapeHtml(applySubs(text, card));
  const hasImage = !!card.image && card.imageAlign !== 'none';
  const cornerSide = (hasImage && card.imageAlign === 'right') ? 'left' : 'right';
  const iconSvg = getTypeIcon(card.sizeType);

  if (hasImage) {
    const w = card.imageWidth || 170;
    html += `<img class="card-illustration align-${card.imageAlign}" src="${card.image}"
      style="float:${card.imageAlign}; width:${w}px; shape-outside:url('${card.image}');" alt="">`;
  }

  html += `<div class="corner-tag corner-${cornerSide}">
      <div class="corner-tier">LVL ${escapeHtml(card.level)}</div>
      <div class="corner-type"><span class="corner-icon">${iconSvg}</span>${escapeHtml(card.rarity)}</div>
    </div>`;

  html += `<div class="card-name" style="padding-${cornerSide}:70px">${escapeHtml(card.name)}</div>`;
  html += `<div class="card-kind">${escapeHtml(card.sizeType)}${card.traits ? ' — ' + escapeHtml(card.traits) : ''}</div>`;
  if (card.description) html += `<div class="card-desc">${sub(card.description)}</div>`;

  html += `<div class="card-line"><b>Perception</b> ${sub(card.perception)}${card.senses ? '; ' + sub(card.senses) : ''}</div>`;
  if (card.languages) html += `<div class="card-line"><b>Languages</b> ${sub(card.languages)}</div>`;
  if (card.skills) html += `<div class="card-line"><b>Skills</b> ${sub(card.skills)}</div>`;

  html += `<div class="ability-row">`;
  [['STR', card.str], ['DEX', card.dex], ['CON', card.con], ['INT', card.int], ['WIS', card.wis], ['CHA', card.cha]].forEach(([label, mod]) => {
    html += `<div class="ability-box"><div class="ability-lbl">${label}</div><div class="ability-val">${fmtMod(mod)}</div></div>`;
  });
  html += `</div>`;

  if (card.items) html += `<div class="card-line"><b>Items</b> ${sub(card.items)}</div>`;

  html += `<div class="section-divider">Defense</div>`;
  html += `<div class="card-line"><b>AC</b> ${sub(card.ac)}; <b>Fort</b> ${sub(card.fort)}, <b>Ref</b> ${sub(card.ref)}, <b>Will</b> ${sub(card.will)}</div>`;
  html += `<div class="card-line"><b>HP</b> ${sub(card.hp)}</div>`;
  if (card.immunities) html += `<div class="card-line"><b>Immunities</b> ${sub(card.immunities)}</div>`;
  if (card.resistances) html += `<div class="card-line"><b>Resistances</b> ${sub(card.resistances)}</div>`;
  if (card.weaknesses) html += `<div class="card-line"><b>Weaknesses</b> ${sub(card.weaknesses)}</div>`;

  html += `<div class="section-divider">Offense</div>`;
  html += `<div class="card-line"><b>Speed</b> ${sub(card.speed)}</div>`;
  (card.attacks || []).forEach(a => {
    html += `<div class="card-line"><b>${escapeHtml(a.type)}</b> (${escapeHtml(a.actionCost)}) ${sub(a.name)} ${sub(a.bonus)}, <b>Damage</b> ${sub(a.damage)}</div>`;
  });

  FEATURE_CATEGORIES.forEach(cat => {
    const items = card.features.filter(f => f.category === cat);
    if (!items.length) return;
    html += `<div class="section-divider">${cat === 'Ability' ? 'Abilities' : cat + 's'}</div>`;
    items.forEach(f => {
      html += `<div class="card-feature">
        <div class="feat-head"><span class="feat-name">${sub(f.name)}.</span><span class="feat-icon">${getFeatureIcon(cat)}</span></div>
        <div class="feat-text">${sub(f.text)}</div>
      </div>`;
    });
  });

  html += `<div class="card-footer">Pathfinder 2E Compatible &middot; built from rules text under the ORC License</div>`;
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
    $('deck-status').textContent = "Can't delete your only card.";
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
  a.download = 'pathfinder2e-statblock-deck.json';
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
      $('deck-status').textContent = `Imported ${deck.length} card(s).`;
    } catch (err) {
      $('deck-status').textContent = 'Import failed — invalid JSON.';
    }
    setTimeout(() => $('deck-status').textContent = '', 3000);
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ===== PNG export =====
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
  const canvas = await html2canvas(offscreen, { scale: 2, backgroundColor: null });
  document.body.removeChild(offscreen);
  return canvas;
}

function filenameFor(card) {
  return (card.name || 'statblock').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'statblock';
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

$('export-all-png').addEventListener('click', async () => {
  const status = $('deck-status');
  status.textContent = `Rendering ${deck.length} card(s)...`;
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
    a.download = 'pathfinder2e-statblock-cards.zip';
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
    <html><head><meta charset="UTF-8"><title>Print Sheet — Pathfinder 2E Statblock Cards</title>
    <link rel="stylesheet" href="${styleLink}">
    <style>
      body { background: #fff; padding: 20px; }
      .print-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
      #statblock-card { width: 100%; }
      @media print { body { padding: 0; } .print-grid { gap: 10px; } }
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
