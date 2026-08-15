const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'dnd5e.deck.v1';
const FEATURE_CATEGORIES = ['Trait', 'Action', 'Bonus Action', 'Reaction', 'Legendary Action'];

// ===== Card data model =====
function newCard(overrides = {}) {
  return Object.assign({
    id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
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
    damageVulnerabilities: '',
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
    ]
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
      if (Array.isArray(parsed) && parsed.length) {
        const statblocksOnly = parsed.filter(c => c.cardType !== 'item').map(migrateCard);
        if (statblocksOnly.length) return statblocksOnly;
      }
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
  if (card.damageVulnerabilities === undefined) card.damageVulnerabilities = '';
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
  document.querySelectorAll('.type-btn[data-format]').forEach(b => b.classList.toggle('active', b.dataset.format === card.format));
  renderFeatureInputs();
  renderVariableInputs();
  renderImagePreview();
  updateHints();
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
  card[field] = el.type === 'number' ? Number(el.value) : el.value;
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
    builtins[k] = modifier(abilities[k]);
    builtins[k + 'SAVE'] = 8 + pb + mod;
    builtins[k + 'ATK'] = signed(pb + mod);
    builtins[k + 'HIT'] = signed(pb + mod); // alias of ATK — matches "+X to hit" phrasing directly
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

// ===== Card rendering =====
function cardInnerHtml(card) {
  let html = '';
  const sub = (text) => escapeHtml(applySubs(text, card));
  const hasImage = !!card.image && card.imageAlign !== 'none';
  const rowImage = hasImage && card.imageAlign !== 'bottom';
  const bottomImage = hasImage && card.imageAlign === 'bottom';
  const iconSvg = getTypeIcon(card.creatureType);
  const dexMod = Math.floor((Number(card.dex) - 10) / 2);
  const is2024 = card.format !== '2014';

  html += `<div class="corner-tag corner-right">
      <div class="corner-tier" data-source-field="cr">CR ${escapeHtml(card.cr)}</div>
      <div class="corner-type" data-source-field="xp"><span class="corner-icon">${iconSvg}</span>${escapeHtml(card.xp)} XP</div>
    </div>`;

  html += `<div class="card-name" style="padding-right:70px" data-source-field="name">${escapeHtml(card.name)}</div>`;

  if (is2024) {
    html += `<div class="trait-chip-row">
        <span class="trait-chip" data-source-field="size">${escapeHtml(card.size)}</span>
        <span class="trait-chip" data-source-field="creatureType">${escapeHtml(card.creatureType)}</span>
        <span class="trait-chip" data-source-field="alignment">${escapeHtml(card.alignment)}</span>
      </div>`;
  } else {
    html += `<div class="card-kind"><span data-source-field="size">${escapeHtml(card.size)}</span> <span data-source-field="creatureType">${escapeHtml(card.creatureType)}</span>, <span data-source-field="alignment">${escapeHtml(card.alignment)}</span></div>`;
  }

  if (card.description) html += `<div class="card-desc" data-source-field="description">${sub(card.description)}</div>`;

  let coreHtml = '';
  if (is2024) {
    coreHtml += `<div class="core-stat-row">
        <div class="core-stat" data-source-field="ac"><b>AC</b> ${sub(card.ac)}</div>
        <div class="core-stat"><b>Initiative</b> ${modifier(card.dex)} (${10 + dexMod})</div>
        <div class="core-stat" data-source-field="hp"><b>HP</b> ${sub(card.hp)}</div>
        <div class="core-stat" data-source-field="speed"><b>Speed</b> ${sub(card.speed)}</div>
      </div>`;
  } else {
    coreHtml += `<div class="card-line" data-source-field="ac"><b>Armor Class</b> ${sub(card.ac)}</div>`;
    coreHtml += `<div class="card-line" data-source-field="hp"><b>Hit Points</b> ${sub(card.hp)}</div>`;
    coreHtml += `<div class="card-line" data-source-field="speed"><b>Speed</b> ${sub(card.speed)}</div>`;
  }

  coreHtml += `<div class="ability-row">`;
  [['STR', card.str, 'str'], ['DEX', card.dex, 'dex'], ['CON', card.con, 'con'], ['INT', card.int, 'int'], ['WIS', card.wis, 'wis'], ['CHA', card.cha, 'cha']].forEach(([label, score, key]) => {
    coreHtml += `<div class="ability-box" data-source-field="${key}"><div class="ability-lbl">${label}</div><div class="ability-val">${escapeHtml(score)}</div><div class="ability-mod">${modifier(score)}</div></div>`;
  });
  coreHtml += `</div>`;

  const statLines = () => {
    let s = '';
    if (card.savingThrows) s += `<div class="card-line" data-source-field="savingThrows"><b>Saving Throws</b> ${sub(card.savingThrows)}</div>`;
    if (card.skills) s += `<div class="card-line" data-source-field="skills"><b>Skills</b> ${sub(card.skills)}</div>`;
    if (is2024) {
      if (card.damageVulnerabilities) s += `<div class="card-line" data-source-field="damageVulnerabilities"><b>Vulnerabilities</b> ${sub(card.damageVulnerabilities)}</div>`;
      if (card.damageResistances) s += `<div class="card-line" data-source-field="damageResistances"><b>Resistances</b> ${sub(card.damageResistances)}</div>`;
      const combinedImmunities = [card.damageImmunities, card.conditionImmunities].filter(Boolean).map(t => applySubs(t, card)).join(', ');
      if (combinedImmunities) s += `<div class="card-line" data-source-field="damageImmunities"><b>Immunities</b> ${escapeHtml(combinedImmunities)}</div>`;
    } else {
      if (card.damageVulnerabilities) s += `<div class="card-line" data-source-field="damageVulnerabilities"><b>Damage Vulnerabilities</b> ${sub(card.damageVulnerabilities)}</div>`;
      if (card.damageResistances) s += `<div class="card-line" data-source-field="damageResistances"><b>Damage Resistances</b> ${sub(card.damageResistances)}</div>`;
      if (card.damageImmunities) s += `<div class="card-line" data-source-field="damageImmunities"><b>Damage Immunities</b> ${sub(card.damageImmunities)}</div>`;
      if (card.conditionImmunities) s += `<div class="card-line" data-source-field="conditionImmunities"><b>Condition Immunities</b> ${sub(card.conditionImmunities)}</div>`;
    }
    if (card.senses) s += `<div class="card-line" data-source-field="senses"><b>Senses</b> ${sub(card.senses)}</div>`;
    if (card.languages) s += `<div class="card-line" data-source-field="languages"><b>Languages</b> ${sub(card.languages)}</div>`;
    return s;
  };

  const featureBlocks = () => {
    let f = '';
    FEATURE_CATEGORIES.forEach(cat => {
      const items = card.features.filter(x => x.category === cat);
      if (!items.length) return;
      f += `<div class="section-divider col-divider">${cat}s</div>`;
      items.forEach(x => {
        const idx = card.features.indexOf(x);
        f += `<div class="card-feature" data-source-field="feature-${idx}">
          <div class="feat-head"><span class="feat-name">${sub(x.name)}.</span><span class="feat-icon">${getFeatureIcon(cat)}</span></div>
          <div class="feat-text">${sub(x.text)}</div>
        </div>`;
      });
    });
    return f;
  };

  if (rowImage) {
    coreHtml += statLines();
    coreHtml += featureBlocks().replace(/col-divider/g, '');
    const w = card.imageWidth || 170;
    const img = `<img class="card-illustration" src="${escapeHtml(card.image)}" style="width:${w}px;" alt="">`;
    const statCol = `<div class="stat-col">${coreHtml}</div>`;
    html += `<div class="stat-image-row">${card.imageAlign === 'left' ? img + statCol : statCol + img}</div>`;
  } else {
    html += coreHtml;
    if (is2024) {
      html += `<div class="statblock-columns">`;
      html += `<div class="col-left">${statLines()}</div>`;
      html += `<div class="col-right">${featureBlocks()}</div>`;
      html += `</div>`;
    } else {
      html += statLines();
      html += featureBlocks().replace(/col-divider/g, '');
    }
  }

  if (bottomImage) {
    html += `<img class="card-illustration card-illustration-bottom" src="${escapeHtml(card.image)}" alt="">`;
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
      deck = parsed.filter(c => c.cardType !== 'item').map(migrateCard);
      if (!deck.length) throw new Error('No statblock cards in that file');
      currentId = deck[0].id;
      renderDeckList(); renderForm(); renderCard(); saveDeck();
      $('deck-status').textContent = `Imported ${deck.length} card(s).`;
    } catch (err) {
      $('deck-status').textContent = 'Import failed — invalid JSON or no statblock cards.';
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

// ===== Cross-system conversion =====

// PF2E lists Perception as its own dedicated top-line stat, never inside
// Skills — carrying 5E's Skills text straight across would print Perception
// twice with two different (and contradictory) numbers on the same card.
function ccStripPerceptionFromSkills(skillsText) {
  return (skillsText || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s && !/^Perception\b/i.test(s))
    .join(', ');
}

function buildTargetCardPF2E(converted, sourceCard) {
  return {
    id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
    name: converted.name,
    level: converted.level,
    rarity: converted.rarity,
    sizeType: `${sourceCard.size || 'Medium'} ${sourceCard.creatureType || 'Creature'}`,
    traits: '',
    description: converted.description || '',
    perception: converted.perception,
    senses: sourceCard.senses || '', languages: converted.languages, skills: ccStripPerceptionFromSkills(sourceCard.skills), items: '',
    str: converted.str, dex: converted.dex, con: converted.con, int: converted.int, wis: converted.wis, cha: converted.cha,
    ac: converted.ac,
    fort: converted.fort, ref: converted.ref, will: converted.will,
    hp: converted.hp,
    immunities: [sourceCard.damageImmunities, sourceCard.conditionImmunities].filter(Boolean).join(', '),
    resistances: sourceCard.damageResistances || '',
    weaknesses: sourceCard.damageVulnerabilities || '',
    speed: '25 feet',
    attacks: converted.attacks,
    theme: 'parchment', accent: '#7a2020', variables: [], image: sourceCard.image, imageAlign: sourceCard.imageAlign || 'right', imageWidth: sourceCard.imageWidth || 170,
    features: converted.features.map(f => ({ category: f.category, name: f.name, text: f.text }))
  };
}

function pushToTargetDeck(storageKey, card) {
  let targetDeck = [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) targetDeck = JSON.parse(raw);
    if (!Array.isArray(targetDeck)) targetDeck = [];
  } catch (e) { targetDeck = []; }
  targetDeck.push(card);
  localStorage.setItem(storageKey, JSON.stringify(targetDeck));
  // Marks this card so the target page selects it on load instead of
  // defaulting to the first (often oldest) card in its deck.
  localStorage.setItem(storageKey + '.pendingSelect', card.id);
}

function showConvertStatus(targetName, targetUrl, flags) {
  const status = $('deck-status');
  let msg = `Converted and sent to ${targetName}.`;
  if (flags && flags.length) msg += ' Review: ' + flags.join(' ');
  status.innerHTML = `${msg} <a href="${targetUrl}" target="_blank">Open ${targetName} &rarr;</a>`;
}

$('convert-pf2e').addEventListener('click', () => {
  const converted = convertCreatureCard('dnd5e', 'pf2e', currentCard(), applySubs);
  pushToTargetDeck('pf2e.deck.v1', buildTargetCardPF2E(converted, currentCard()));
  showConvertStatus('Pathfinder 2E', '../pathfinder2e/statblock.html', converted.flags);
});

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

$('randomize-stats').addEventListener('click', () => {
  const card = currentCard();
  const g = crGuidance(card.cr);
  card.ac = String(randomInt(g.ac - 1, g.ac + 1));
  card.hp = String(randomInt(g.hpLow, g.hpHigh));
  card.proficiencyBonus = g.pb;
  renderForm();
  renderCard();
  saveDeck();
});

$('reset-stats').addEventListener('click', () => {
  const card = currentCard();
  card.ac = '';
  card.hp = '';
  card.proficiencyBonus = '';
  renderForm();
  renderCard();
  saveDeck();
});

// ===== Init =====
deck = loadDeck();
currentId = deck[0].id;
try {
  const pendingId = localStorage.getItem(STORAGE_KEY + '.pendingSelect');
  if (pendingId && deck.some(c => c.id === pendingId)) {
    currentId = pendingId;
  }
  localStorage.removeItem(STORAGE_KEY + '.pendingSelect');
} catch (e) { /* ignore */ }
renderDeckList();
renderForm();
renderCard();
