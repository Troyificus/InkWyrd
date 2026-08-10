const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'dhcard.deck.v1';

// ===== Card data model =====
function newCard(overrides = {}) {
  return Object.assign({
    id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
    cardType: 'adversary',
    name: 'New Adversary',
    tier: 1,
    type: 'Standard',
    description: '',
    motives: '',
    difficultyAdv: 12,
    thresholdMajor: 7,
    thresholdSevere: 12,
    hp: 5,
    stress: 3,
    attacks: [{ atk: '+2', name: 'Strike', range: 'Melee', damage: '1d8' }],
    experience: '',
    envType: 'Exploration',
    impulses: '',
    difficultyEnv: 11,
    potential: '',
    theme: 'parchment',
    accent: '#7a2020',
    variables: [],
    image: null,
    imageAlign: 'right',
    imageWidth: 170,
    features: [{ type: 'Passive', name: 'New Feature', text: 'Describe what it does.' }]
  }, overrides);
}

function starterCard() {
  return newCard({
    name: 'Acid Burrower',
    type: 'Solo',
    description: 'A horse-sized insect with digging claws and acidic blood.',
    motives: 'Burrow, drag away, feed, reposition',
    difficultyAdv: 14,
    thresholdMajor: 8,
    thresholdSevere: 15,
    hp: 8,
    stress: 3,
    attacks: [
      { atk: '+3', name: 'Claws', range: 'Very Close', damage: '1d12+2 phy' }
    ],
    experience: 'Tremor Sense +2',
    features: [
      { type: 'Passive', name: 'Relentless (3)', text: 'The Burrower can be spotlighted up to three times per GM turn. Spend Fear as usual to spotlight them.' },
      { type: 'Action', name: 'Earth Eruption', text: 'Mark a Stress to have the Burrower burst out of the ground. All creatures within Very Close range must succeed on an Agility Reaction Roll or be knocked over, making them Vulnerable until they next act.' }
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

// Migrates cards saved under older schemas (single-attack fields, or the old
// combined "thresholds" text field) to the current schema.
function migrateCard(card) {
  if (!card.attacks) {
    card.attacks = [{
      atk: card.atk || '+2',
      name: card.attackName || 'Strike',
      range: card.range || 'Melee',
      damage: card.damage || '1d8'
    }];
    delete card.atk;
    delete card.attackName;
    delete card.range;
    delete card.damage;
  }
  if (card.thresholds !== undefined && (card.thresholdMajor === undefined)) {
    const parts = String(card.thresholds).split('/').map(s => parseInt(s, 10));
    card.thresholdMajor = Number.isFinite(parts[0]) ? parts[0] : 7;
    card.thresholdSevere = Number.isFinite(parts[1]) ? parts[1] : 12;
    delete card.thresholds;
  }
  if (card.features) {
    card.features = card.features.map(f => {
      if (f.type) return f;
      // Old format embedded the type in the name, e.g. "Relentless (3) — Passive".
      const match = /^(.*?)\s*[—-]\s*(Passive|Action|Reaction)\s*$/i.exec(f.name || '');
      if (match) {
        return { type: match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase(), name: match[1], text: f.text };
      }
      return { type: 'Passive', name: f.name, text: f.text };
    });
  }
  if (!card.variables) card.variables = [];
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
  document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === card.cardType));
  document.querySelectorAll('.adv-only').forEach(el => el.hidden = card.cardType !== 'adversary');
  document.querySelectorAll('.env-only').forEach(el => el.hidden = card.cardType !== 'environment');

  document.querySelectorAll('[data-field]').forEach(el => {
    const field = el.dataset.field;
    if (field in card) el.value = card[field];
  });

  renderFeatureInputs();
  renderAttackInputs();
  renderVariableInputs();
  renderImagePreview();
}

document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCard().cardType = btn.dataset.type;
    renderForm();
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
  saveDeck();
});

// ===== Features list UI =====
function escapeHtml(str) {
  return (str || '').toString().replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

let autoOpenFeatureIdx = null;

function renderFeatureInputs() {
  const card = currentCard();
  const container = $('features-list');
  container.innerHTML = '';
  card.features.forEach((f, i) => {
    const row = document.createElement('details');
    row.className = 'feature-row';
    if (i === autoOpenFeatureIdx) row.open = true;
    row.innerHTML = `
      <summary>${escapeHtml(f.name) || '(unnamed)'} <span class="summary-type">— ${escapeHtml(f.type)}</span></summary>
      <div class="feature-row-body">
        <div class="feature-row-header">
          <label>Feature Name
            <input type="text" data-idx="${i}" class="feat-name-input" value="${escapeHtml(f.name)}">
          </label>
          <button type="button" class="remove-feature" data-idx="${i}">✕</button>
        </div>
        <label>Feature Text
          <textarea rows="2" data-idx="${i}" class="feat-text-input">${escapeHtml(f.text)}</textarea>
        </label>
      </div>
    `;
    container.appendChild(row);
  });
  autoOpenFeatureIdx = null;

  container.querySelectorAll('.feat-name-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      currentCard().features[+e.target.dataset.idx].name = e.target.value;
      const summaryEl = e.target.closest('details').querySelector('summary');
      const type = currentCard().features[+e.target.dataset.idx].type;
      summaryEl.innerHTML = `${escapeHtml(e.target.value) || '(unnamed)'} <span class="summary-type">— ${escapeHtml(type)}</span>`;
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

document.querySelectorAll('.quick-add[data-feat-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.featType;
    currentCard().features.push({ type, name: 'New ' + type, text: 'Describe what it does.' });
    autoOpenFeatureIdx = currentCard().features.length - 1;
    renderFeatureInputs();
    renderCard();
    saveDeck();
  });
});

// ===== Attacks list UI =====
function renderAttackInputs() {
  const card = currentCard();
  if (!card.attacks || !card.attacks.length) {
    card.attacks = [{ atk: '+2', name: 'Strike', range: 'Melee', damage: '1d8' }];
  }
  const container = $('attacks-list');
  container.innerHTML = '';
  card.attacks.forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'attack-row';
    row.innerHTML = `
      <div class="attack-row-header">
        <span class="attack-row-label">Attack ${i + 1}</span>
        ${card.attacks.length > 1 ? `<button type="button" class="remove-attack" data-idx="${i}">✕</button>` : ''}
      </div>
      <div class="attack-row-grid">
        <label>ATK <input type="text" data-idx="${i}" data-key="atk" class="attack-input" value="${escapeHtml(a.atk)}"></label>
        <label>Name <input type="text" data-idx="${i}" data-key="name" class="attack-input" value="${escapeHtml(a.name)}"></label>
        <label>Range <input type="text" data-idx="${i}" data-key="range" class="attack-input" value="${escapeHtml(a.range)}"></label>
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
  currentCard().attacks.push({ atk: '+2', name: 'New Attack', range: 'Melee', damage: '1d8' });
  renderAttackInputs();
  renderCard();
  saveDeck();
});

// ===== Custom Variables list UI =====
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
// Downscales the uploaded image (preserving transparency) before storing it,
// to keep localStorage usage and export size reasonable.
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
  if (!card.image) {
    wrap.innerHTML = '';
    return;
  }
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

// Replaces [TOKEN] references in text with a custom variable's value, or a
// built-in stat token (TIER, DIFFICULTY, HP, STRESS, MAJOR, SEVERE) pulled
// straight from the card's own fields. Custom variables take priority if a
// name collides with a built-in token.
function applySubs(text, card) {
  if (!text) return text;
  const builtins = card.cardType === 'adversary' ? {
    TIER: card.tier, DIFFICULTY: card.difficultyAdv, HP: card.hp,
    STRESS: card.stress, MAJOR: card.thresholdMajor, SEVERE: card.thresholdSevere
  } : {
    TIER: card.tier, DIFFICULTY: card.difficultyEnv
  };
  const custom = {};
  (card.variables || []).forEach(v => { if (v.key) custom[v.key.toUpperCase()] = v.value; });
  const lookup = Object.assign({}, builtins, custom);

  return text.replace(/\[([A-Z0-9_]+)\]/gi, (match, token) => {
    const key = token.toUpperCase();
    return key in lookup && lookup[key] !== '' && lookup[key] !== undefined ? lookup[key] : match;
  });
}

// ===== Card rendering (into a given element, so it can be reused for export/print) =====
function featureIconFor(type) {
  const t = (type || '').toLowerCase();
  return FEATURE_ICONS[t] || FEATURE_ICONS.passive;
}

function cardInnerHtml(card) {
  let html = '';
  const isAdv = card.cardType === 'adversary';
  const iconSvg = getTypeIcon(isAdv ? card.type : card.envType);
  const typeLabel = isAdv ? card.type : card.envType;
  const sub = (text) => escapeHtml(applySubs(text, card));

  const hasImage = !!card.image && card.imageAlign !== 'none';
  // Keep the corner tag on whichever side the illustration isn't floating on.
  const cornerSide = (hasImage && card.imageAlign === 'right') ? 'left' : 'right';

  if (hasImage) {
    const w = card.imageWidth || 170;
    html += `<img class="card-illustration align-${card.imageAlign}" src="${card.image}"
      style="float:${card.imageAlign}; width:${w}px; shape-outside:url('${card.image}');" alt="">`;
  }

  html += `<div class="corner-tag corner-${cornerSide}">
      <div class="corner-tier">T${escapeHtml(card.tier)}</div>
      <div class="corner-type"><span class="corner-icon">${iconSvg}</span>${escapeHtml(typeLabel)}</div>
    </div>`;

  html += `<div class="card-name" style="padding-${cornerSide}:70px">${escapeHtml(card.name)}</div>`;
  html += `<div class="card-kind">${isAdv ? 'Adversary' : 'Environment'}</div>`;
  if (card.description) html += `<div class="card-desc">${sub(card.description)}</div>`;

  if (isAdv) {
    html += `<div class="card-line"><b>Difficulty:</b> ${escapeHtml(card.difficultyAdv)}</div>`;
    (card.attacks || []).forEach(a => {
      html += `<div class="card-line"><b>Attack (${sub(a.atk)}):</b> ${sub(a.name)} — ${sub(a.range)}, ${sub(a.damage)}</div>`;
    });

    html += `<div class="two-col">
      <div class="two-col-item">
        <div class="two-col-head">Experience</div>
        <div class="two-col-body">${card.experience ? sub(card.experience) : '—'}</div>
      </div>
      <div class="two-col-item">
        <div class="two-col-head">Motives &amp; Tactics</div>
        <div class="two-col-body italic">${card.motives ? sub(card.motives) : '—'}</div>
      </div>
    </div>`;
  } else {
    html += `<div class="card-line"><b>Difficulty:</b> ${escapeHtml(card.difficultyEnv)}</div>`;
    html += `<div class="two-col two-col-single">
      <div class="two-col-item">
        <div class="two-col-head">Impulses</div>
        <div class="two-col-body italic">${card.impulses ? sub(card.impulses) : '—'}</div>
      </div>
    </div>`;
    if (card.potential) {
      html += `<div class="card-line"><b>Potential Adversaries:</b> ${sub(card.potential)}</div>`;
    }
  }

  if (card.features.length) {
    html += `<div class="section-divider">Features</div>`;
    card.features.forEach(f => {
      html += `<div class="card-feature">
        <div class="feat-head"><span class="feat-name">${sub(f.name)}</span><span class="feat-type-tag">— ${escapeHtml(f.type)}</span><span class="feat-icon">${featureIconFor(f.type)}</span></div>
        <div class="feat-text">${sub(f.text)}</div>
      </div>`;
    });
  }

  if (isAdv) {
    html += `<div class="section-divider">Vitals</div>`;
    html += `<div class="vitals-row">
      <div class="vital-box"><div class="vital-val">${escapeHtml(card.hp)}</div><div class="vital-lbl">HP</div></div>
      <div class="vital-box"><div class="vital-val">${escapeHtml(card.stress)}</div><div class="vital-lbl">Stress</div></div>
      <div class="vital-thresholds">
        <div class="vital-lbl">Thresholds</div>
        <div class="vital-thresh-val">Major ${escapeHtml(card.thresholdMajor)} &middot; Severe ${escapeHtml(card.thresholdSevere)}</div>
      </div>
    </div>`;
  }

  html += `<div class="card-footer">Daggerheart Compatible &middot; built from the SRD under the DPCGL</div>`;
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
  a.download = 'adversary-card-forge-deck.json';
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

// ===== PNG export (single) =====
async function renderCardToCanvas(card) {
  // Render into a hidden offscreen node so it doesn't disturb the live preview.
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

// ===== Batch PNG export as ZIP =====
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
    a.download = 'adversary-card-forge-cards.zip';
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
    <html><head><meta charset="UTF-8"><title>Print Sheet — Adversary Card Forge</title>
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
