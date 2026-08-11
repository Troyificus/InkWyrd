const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'dnd5e.deck.v1';
const FEATURE_CATEGORIES = ['Trait', 'Action', 'Bonus Action', 'Reaction', 'Legendary Action'];

// ===== Card data model =====
function newCard(overrides = {}) {
  return Object.assign({
    id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
    cardType: 'creature',
    format: '2024',
    name: 'New Creature',
    size: 'Medium',
    creatureType: 'Humanoid',
    alignment: 'unaligned',
    description: '',
    ac: '12',
    hp: '11 (2d8+2)',
    speed: '30 ft.',
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    proficiencyBonus: 2,
    savingThrows: '',
    skills: '',
    damageResistances: '',
    damageImmunities: '',
    conditionImmunities: '',
    senses: 'passive Perception 10',
    languages: '—',
    cr: '1',
    xp: 200,
    theme: 'parchment',
    accent: '#7a2020',
    variables: [],
    image: null,
    imageAlign: 'right',
    imageWidth: 170,
    features: [
      { category: 'Action', name: 'Slam', text: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6+2) bludgeoning damage.' }
    ],
    itemCategory: 'weapon',
    itemRarity: 'Common',
    requiresAttunement: false,
    attunementRequirement: '',
    itemDescription: '',
    itemEffect: '',
    itemCharges: null,
    itemRecharge: ''
  }, overrides);
}

function starterCard() {
  return newCard({
    name: 'Ashfen Prowler',
    size: 'Large',
    creatureType: 'Beast',
    alignment: 'unaligned',
    description: 'A lean, ash-grey predator that hunts in the smoking ruins of old battlefields.',
    ac: '14 (natural armor)',
    hp: '58 (9d10+9)',
    speed: '50 ft.',
    str: 17, dex: 16, con: 13, int: 4, wis: 13, cha: 7,
    proficiencyBonus: 2,
    savingThrows: 'Dex +6, Con +4',
    skills: 'Perception +5, Stealth +8',
    senses: 'darkvision 60 ft., passive Perception 15',
    languages: '—',
    cr: '3',
    xp: 700,
    features: [
      { category: 'Trait', name: 'Keen Smell', text: 'The prowler has advantage on Wisdom (Perception) checks that rely on smell.' },
      { category: 'Trait', name: 'Pounce', text: 'If the prowler moves at least 20 feet straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC [STRSAVE] Strength saving throw or be knocked prone.' },
      { category: 'Action', name: 'Multiattack', text: 'The prowler makes two attacks: one bite and one claw.' },
      { category: 'Action', name: 'Bite', text: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6+3) piercing damage.' },
      { category: 'Action', name: 'Claw', text: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d6+3) slashing damage.' }
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
  if (card.image === undefined) card.image = null;
  if (!card.imageAlign) card.imageAlign = 'right';
  if (!card.imageWidth) card.imageWidth = 170;
  if (card.proficiencyBonus === undefined) card.proficiencyBonus = 2;
  if (!card.format) card.format = '2024';
  if (!card.cardType) card.cardType = 'creature';
  if (!card.itemCategory) card.itemCategory = 'weapon';
  if (!card.itemRarity) card.itemRarity = 'Common';
  if (card.requiresAttunement === undefined) card.requiresAttunement = false;
  if (card.attunementRequirement === undefined) card.attunementRequirement = '';
  if (card.itemDescription === undefined) card.itemDescription = '';
  if (card.itemEffect === undefined) card.itemEffect = '';
  if (card.itemCharges === undefined) card.itemCharges = null;
  if (card.itemRecharge === undefined) card.itemRecharge = '';
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
    if (field in card) {
      if (el.type === 'checkbox') el.checked = !!card[field];
      else el.value = card[field];
    }
  });
  document.querySelectorAll('.type-btn[data-format]').forEach(b => b.classList.toggle('active', b.dataset.format === card.format));
  document.querySelectorAll('.type-btn[data-cardtype]').forEach(b => b.classList.toggle('active', b.dataset.cardtype === card.cardType));
  document.querySelectorAll('.item-only').forEach(el => el.hidden = card.cardType !== 'item');
  document.querySelectorAll('.not-item-only').forEach(el => el.hidden = card.cardType === 'item');
  renderFeatureInputs();
  renderVariableInputs();
  renderImagePreview();
  updateHints();
}

document.querySelectorAll('.type-btn[data-cardtype]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCard().cardType = btn.dataset.cardtype;
    renderForm();
    renderCard();
    saveDeck();
  });
});

const RARITY_TIER_5E = { Common: 1, Uncommon: 2, Rare: 3, 'Very Rare': 4, Legendary: 5, Artifact: 5 };

$('randomize-item').addEventListener('click', () => {
  const card = currentCard();
  const powerTier = RARITY_TIER_5E[card.itemRarity] || 1;
  const chargesLikely = powerTier >= 3 && Math.random() < 0.6;
  const concept = generateItemConcept(card.itemCategory, powerTier, chargesLikely);
  card.name = concept.name;
  card.itemDescription = concept.description;
  card.itemEffect = concept.effect;
  card.itemCharges = chargesLikely ? (powerTier + 1) : null;
  card.itemRecharge = chargesLikely ? concept.charges : '';
  renderForm();
  renderCard();
  saveDeck();
});

function updateHints() {
  const card = currentCard();
  const g = crGuidance(card.cr);

  const acHint = $('hint-ac');
  if (acHint) {
    const acNum = parseInt(card.ac, 10);
    acHint.textContent = `Typical for CR ${escapeHtml(card.cr)}: around AC ${g.ac}`;
    acHint.className = hintClass(acNum, g.ac - 1, g.ac + 1);
  }

  const hpHint = $('hint-hp');
  if (hpHint) {
    const hpNum = parseInt(card.hp, 10);
    hpHint.textContent = `Typical for CR ${escapeHtml(card.cr)}: roughly ${g.hpLow}–${g.hpHigh} HP`;
    hpHint.className = hintClass(hpNum, g.hpLow, g.hpHigh);
  }

  const pbHint = $('hint-pb');
  if (pbHint) {
    pbHint.textContent = `Standard proficiency bonus for CR ${escapeHtml(card.cr)}: +${g.pb}`;
    pbHint.className = hintClass(card.proficiencyBonus, g.pb, g.pb);
  }

  const guidanceBox = $('cr-guidance-box');
  if (guidanceBox) {
    guidanceBox.textContent = `Ballpark guidance for CR ${escapeHtml(card.cr)} — attack bonus around +${g.atk}, save DC around ${g.dc}, ~${g.dmgLow}–${g.dmgHigh} damage per hit. ${g.legendary}`;
  }
}

document.querySelectorAll('.type-btn[data-format]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCard().format = btn.dataset.format;
    document.querySelectorAll('.type-btn[data-format]').forEach(b => b.classList.toggle('active', b === btn));
    renderCard();
    saveDeck();
  });
});

document.getElementById('statblock-form').addEventListener('input', (e) => {
  const el = e.target;
  const field = el.dataset.field;
  if (!field) return;
  const card = currentCard();
  if (el.type === 'checkbox') card[field] = el.checked;
  else card[field] = el.type === 'number' ? Number(el.value) : el.value;
  if (field === 'name') renderDeckList();
  renderCard();
  updateHints();
  saveDeck();
});

function escapeHtml(str) {
  return (str || '').toString().replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ===== Ability modifiers =====
function modifier(score) {
  const m = Math.floor((Number(score) - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function signed(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

// ===== CR-based guidance (approximate ballpark ranges, our own derivation —
// not a reproduction of any publisher's specific monster-building tables) =====
function parseCR(crText) {
  const t = String(crText || '').trim();
  if (t.includes('/')) {
    const [num, den] = t.split('/').map(Number);
    return (den ? num / den : 0);
  }
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 1;
}

function pbForCR(cr) {
  if (cr < 5) return 2;
  if (cr < 9) return 3;
  if (cr < 13) return 4;
  if (cr < 17) return 5;
  if (cr < 21) return 6;
  if (cr < 25) return 7;
  return 8;
}

function crGuidance(crText) {
  const cr = parseCR(crText);
  const pb = pbForCR(cr);
  let ac, hpMid;
  if (cr < 1) { ac = 12; hpMid = Math.max(1, Math.round(cr * 40) + 5); }
  else { ac = Math.min(19, 12 + Math.floor(cr / 3)); hpMid = Math.round(15 * cr + 65); }
  const hpLow = Math.round(hpMid * 0.8);
  const hpHigh = Math.round(hpMid * 1.2);
  const atk = pb + 3;
  const dc = 8 + pb + 3;
  const dmgMid = Math.max(2, Math.round(hpMid / 3.5));
  const dmgLow = Math.round(dmgMid * 0.85);
  const dmgHigh = Math.round(dmgMid * 1.15);
  const legendary = cr >= 11 ? '2–3 Legendary Actions is common for a solo boss at this CR.'
    : cr >= 5 ? '1 Legendary Action is sometimes used for a solo boss at this CR.'
    : 'Legendary Actions are uncommon below CR 5.';
  return { pb, ac, hpLow, hpHigh, atk, dc, dmgLow, dmgHigh, legendary };
}

function hintClass(value, low, high) {
  const v = Number(value);
  if (!Number.isFinite(v)) return '';
  if (v < low || v > high) return 'field-hint warn';
  return 'field-hint';
}

// ===== Features (Traits/Actions/Bonus Actions/Reactions/Legendary Actions) UI =====
let autoOpenFeatureIdx = null;

function renderFeatureInputs() {
  const card = currentCard();
  const container = $('features-list');
  container.innerHTML = '';
  card.features.forEach((f, i) => {
    const row = document.createElement('details');
    row.className = 'feature-row';
    if (i === autoOpenFeatureIdx) row.open = true;
    const options = FEATURE_CATEGORIES.map(c => `<option value="${c}" ${f.category === c ? 'selected' : ''}>${c}</option>`).join('');
    row.innerHTML = `
      <summary>${escapeHtml(f.name) || '(unnamed)'} <span class="summary-type">— ${escapeHtml(f.category)}</span></summary>
      <div class="feature-row-body">
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
      </div>
    `;
    container.appendChild(row);
  });
  autoOpenFeatureIdx = null;

  container.querySelectorAll('.feat-cat-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      currentCard().features[+e.target.dataset.idx].category = e.target.value;
      const summaryEl = e.target.closest('details').querySelector('summary');
      const name = currentCard().features[+e.target.dataset.idx].name;
      summaryEl.innerHTML = `${escapeHtml(name) || '(unnamed)'} <span class="summary-type">— ${escapeHtml(e.target.value)}</span>`;
      renderCard();
      saveDeck();
    });
  });
  container.querySelectorAll('.feat-name-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      currentCard().features[+e.target.dataset.idx].name = e.target.value;
      const summaryEl = e.target.closest('details').querySelector('summary');
      const category = currentCard().features[+e.target.dataset.idx].category;
      summaryEl.innerHTML = `${escapeHtml(e.target.value) || '(unnamed)'} <span class="summary-type">— ${escapeHtml(category)}</span>`;
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

document.querySelectorAll('.quick-add[data-feat-cat]').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.featCat;
    currentCard().features.push({ category, name: 'New ' + category, text: 'Describe what it does.' });
    autoOpenFeatureIdx = currentCard().features.length - 1;
    renderFeatureInputs();
    renderCard();
    saveDeck();
  });
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
  const pb = Number(card.proficiencyBonus) || 0;
  const abilities = { STR: card.str, DEX: card.dex, CON: card.con, INT: card.int, WIS: card.wis, CHA: card.cha };
  const builtins = { AC: card.ac, HP: card.hp, CR: card.cr, PB: signed(pb) };
  Object.keys(abilities).forEach(k => {
    const mod = Math.floor((Number(abilities[k]) - 10) / 2);
    builtins[k] = modifier(abilities[k]);           // e.g. [STR] -> +3
    builtins[k + 'SAVE'] = 8 + pb + mod;             // e.g. [STRSAVE] -> 15 (the DC)
    builtins[k + 'ATK'] = signed(pb + mod);          // e.g. [STRATK] -> +6 (attack/check bonus)
  });
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
function itemCardInnerHtml(card) {
  let html = '';
  const sub = (text) => escapeHtml(applySubs(text, card));
  const hasImage = !!card.image && card.imageAlign !== 'none';
  const cornerSide = (hasImage && card.imageAlign === 'right') ? 'left' : 'right';
  const iconSvg = getTypeIcon(card.itemCategory);

  if (hasImage) {
    const w = card.imageWidth || 170;
    html += `<img class="card-illustration align-${card.imageAlign}" src="${card.image}"
      style="float:${card.imageAlign}; width:${w}px; shape-outside:url('${card.image}');" alt="">`;
  }

  html += `<div class="corner-tag corner-${cornerSide}">
      <div class="corner-tier">${escapeHtml(card.itemRarity)}</div>
      <div class="corner-type"><span class="corner-icon">${iconSvg}</span>${escapeHtml(card.itemCategory)}</div>
    </div>`;

  html += `<div class="card-name" style="padding-${cornerSide}:70px">${escapeHtml(card.name)}</div>`;
  html += `<div class="trait-chip-row">
      <span class="trait-chip">${escapeHtml(card.itemCategory)}</span>
      <span class="trait-chip">${escapeHtml(card.itemRarity)}</span>
      ${card.requiresAttunement ? `<span class="trait-chip">Requires Attunement${card.attunementRequirement ? ' ' + escapeHtml(card.attunementRequirement) : ''}</span>` : ''}
    </div>`;
  if (card.itemDescription) html += `<div class="card-desc">${sub(card.itemDescription)}</div>`;

  html += `<div class="section-divider">Effect</div>`;
  html += `<div class="card-line">${sub(card.itemEffect) || '<i>No effect written yet.</i>'}</div>`;

  if (card.itemCharges) {
    html += `<div class="card-line" style="margin-top:10px"><b>Charges:</b> ${escapeHtml(card.itemCharges)}${card.itemRecharge ? ' — ' + sub(card.itemRecharge) : ''}</div>`;
  }

  html += `<div class="card-footer">D&amp;D 5E Compatible &middot; original item concept</div>`;
  return html;
}

function cardInnerHtml(card) {
  if (card.cardType === 'item') return itemCardInnerHtml(card);
  let html = '';
  const sub = (text) => escapeHtml(applySubs(text, card));
  const hasImage = !!card.image && card.imageAlign !== 'none';
  const cornerSide = (hasImage && card.imageAlign === 'right') ? 'left' : 'right';
  const iconSvg = getTypeIcon(card.creatureType);
  const dexMod = Math.floor((Number(card.dex) - 10) / 2);
  const is2024 = card.format !== '2014';

  if (hasImage) {
    const w = card.imageWidth || 170;
    html += `<img class="card-illustration align-${card.imageAlign}" src="${card.image}"
      style="float:${card.imageAlign}; width:${w}px; shape-outside:url('${card.image}');" alt="">`;
  }

  html += `<div class="corner-tag corner-${cornerSide}">
      <div class="corner-tier">CR ${escapeHtml(card.cr)}</div>
      <div class="corner-type"><span class="corner-icon">${iconSvg}</span>${escapeHtml(card.xp)} XP</div>
    </div>`;

  html += `<div class="card-name" style="padding-${cornerSide}:70px">${escapeHtml(card.name)}</div>`;

  if (is2024) {
    html += `<div class="trait-chip-row">
        <span class="trait-chip">${escapeHtml(card.size)}</span>
        <span class="trait-chip">${escapeHtml(card.creatureType)}</span>
        <span class="trait-chip">${escapeHtml(card.alignment)}</span>
      </div>`;
  } else {
    html += `<div class="card-kind">${escapeHtml(card.size)} ${escapeHtml(card.creatureType)}, ${escapeHtml(card.alignment)}</div>`;
  }

  if (card.description) html += `<div class="card-desc">${sub(card.description)}</div>`;

  if (is2024) {
    html += `<div class="core-stat-row">
        <div class="core-stat"><b>AC</b> ${sub(card.ac)}</div>
        <div class="core-stat"><b>Initiative</b> ${modifier(card.dex)} (${10 + dexMod})</div>
        <div class="core-stat"><b>HP</b> ${sub(card.hp)}</div>
        <div class="core-stat"><b>Speed</b> ${sub(card.speed)}</div>
      </div>`;
  } else {
    html += `<div class="card-line"><b>Armor Class</b> ${sub(card.ac)}</div>`;
    html += `<div class="card-line"><b>Hit Points</b> ${sub(card.hp)}</div>`;
    html += `<div class="card-line"><b>Speed</b> ${sub(card.speed)}</div>`;
  }

  html += `<div class="ability-row">`;
  [['STR', card.str], ['DEX', card.dex], ['CON', card.con], ['INT', card.int], ['WIS', card.wis], ['CHA', card.cha]].forEach(([label, score]) => {
    html += `<div class="ability-box"><div class="ability-lbl">${label}</div><div class="ability-val">${escapeHtml(score)}</div><div class="ability-mod">${modifier(score)}</div></div>`;
  });
  html += `</div>`;

  const statLines = () => {
    let s = '';
    if (card.savingThrows) s += `<div class="card-line"><b>Saving Throws</b> ${sub(card.savingThrows)}</div>`;
    if (card.skills) s += `<div class="card-line"><b>Skills</b> ${sub(card.skills)}</div>`;
    if (is2024) {
      if (card.damageResistances) s += `<div class="card-line"><b>Resistances</b> ${sub(card.damageResistances)}</div>`;
      const combinedImmunities = [card.damageImmunities, card.conditionImmunities].filter(Boolean).map(t => applySubs(t, card)).join(', ');
      if (combinedImmunities) s += `<div class="card-line"><b>Immunities</b> ${escapeHtml(combinedImmunities)}</div>`;
    } else {
      if (card.damageResistances) s += `<div class="card-line"><b>Damage Resistances</b> ${sub(card.damageResistances)}</div>`;
      if (card.damageImmunities) s += `<div class="card-line"><b>Damage Immunities</b> ${sub(card.damageImmunities)}</div>`;
      if (card.conditionImmunities) s += `<div class="card-line"><b>Condition Immunities</b> ${sub(card.conditionImmunities)}</div>`;
    }
    if (card.senses) s += `<div class="card-line"><b>Senses</b> ${sub(card.senses)}</div>`;
    if (card.languages) s += `<div class="card-line"><b>Languages</b> ${sub(card.languages)}</div>`;
    return s;
  };

  const featureBlocks = () => {
    let f = '';
    FEATURE_CATEGORIES.forEach(cat => {
      const items = card.features.filter(x => x.category === cat);
      if (!items.length) return;
      f += `<div class="section-divider col-divider">${cat}s</div>`;
      items.forEach(x => {
        f += `<div class="card-feature">
          <div class="feat-head"><span class="feat-name">${sub(x.name)}.</span><span class="feat-icon">${getFeatureIcon(cat)}</span></div>
          <div class="feat-text">${sub(x.text)}</div>
        </div>`;
      });
    });
    return f;
  };

  if (is2024) {
    html += `<div class="statblock-columns">`;
    html += `<div class="col-left">${statLines()}</div>`;
    html += `<div class="col-right">${featureBlocks()}</div>`;
    html += `</div>`;
  } else {
    html += statLines();
    html += featureBlocks().replace(/col-divider/g, '');
  }

  html += `<div class="card-footer">D&amp;D 5E Compatible &middot; built from the SRD under CC-BY-4.0</div>`;
  return html;
}

function renderCard() {
  const card = currentCard();
  const el = $('statblock-card');
  el.className = 'theme-' + card.theme + ' format-' + (card.format || '2024');
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
  a.download = 'dnd5e-statblock-deck.json';
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
  offscreen.className = 'theme-' + card.theme + ' format-' + (card.format || '2024');
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
    a.download = 'dnd5e-statblock-cards.zip';
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
    wrapper.className = 'theme-' + card.theme + ' format-' + (card.format || '2024');
    wrapper.id = 'statblock-card';
    wrapper.style.setProperty('--card-accent', card.accent);
    wrapper.innerHTML = cardInnerHtml(card);
    return `<div class="print-cell">${wrapper.outerHTML}</div>`;
  }).join('\n');

  win.document.write(`
    <!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>Print Sheet — D&D 5E Statblock Cards</title>
    <link rel="stylesheet" href="${styleLink}">
    <style>
      body { background: #fff; padding: 20px; }
      .print-grid { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 760px; margin: 0 auto; }
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
