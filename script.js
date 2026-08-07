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
    thresholds: '—/—',
    hp: 5,
    stress: 3,
    atk: '+2',
    attackName: 'Strike',
    range: 'Melee',
    damage: '1d8',
    experience: '',
    envType: 'Exploration',
    impulses: '',
    difficultyEnv: 11,
    potential: '',
    theme: 'dark',
    accent: '#8a2727',
    features: [{ name: 'New Feature — Passive', text: 'Describe what it does.' }]
  }, overrides);
}

function starterCard() {
  return newCard({
    name: 'Acid Burrower',
    type: 'Solo',
    description: 'A horse-sized insect with digging claws and acidic blood.',
    motives: 'Burrow, drag away, feed, reposition',
    difficultyAdv: 14,
    thresholds: '8/15',
    hp: 8,
    stress: 3,
    atk: '+3',
    attackName: 'Claws',
    range: 'Very Close',
    damage: '1d12+2 phy',
    experience: 'Tremor Sense +2',
    features: [
      { name: 'Relentless (3) — Passive', text: 'The Burrower can be spotlighted up to three times per GM turn. Spend Fear as usual to spotlight them.' },
      { name: 'Earth Eruption — Action', text: 'Mark a Stress to have the Burrower burst out of the ground. All creatures within Very Close range must succeed on an Agility Reaction Roll or be knocked over, making them Vulnerable until they next act.' }
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
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) { /* fall through */ }
  return [starterCard()];
}

function saveDeck() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deck)); } catch (e) { /* storage full/unavailable */ }
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

function renderFeatureInputs() {
  const card = currentCard();
  const container = $('features-list');
  container.innerHTML = '';
  card.features.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'feature-row';
    row.innerHTML = `
      <div class="feature-row-header">
        <label>Feature Name
          <input type="text" data-idx="${i}" class="feat-name-input" value="${escapeHtml(f.name)}">
        </label>
        <button type="button" class="remove-feature" data-idx="${i}">✕</button>
      </div>
      <label>Feature Text
        <textarea rows="2" data-idx="${i}" class="feat-text-input">${escapeHtml(f.text)}</textarea>
      </label>
    `;
    container.appendChild(row);
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
  currentCard().features.push({ name: 'New Feature — Passive', text: 'Describe what it does.' });
  renderFeatureInputs();
  renderCard();
  saveDeck();
});

// ===== Card rendering (into a given element, so it can be reused for export/print) =====
function cardInnerHtml(card) {
  let html = '';
  const iconSvg = getTypeIcon(card.cardType === 'adversary' ? card.type : card.envType);

  if (card.cardType === 'adversary') {
    html += `<div class="card-eyebrow"><span class="type-icon">${iconSvg}</span>Tier ${escapeHtml(card.tier)} · ${escapeHtml(card.type)} · Adversary</div>`;
    html += `<div class="card-name">${escapeHtml(card.name)}</div>`;
    if (card.description) html += `<div class="card-desc">${escapeHtml(card.description)}</div>`;
    html += `<div class="card-line"><b>Motives &amp; Tactics:</b> ${escapeHtml(card.motives)}</div>`;
    html += `<div class="card-divider"></div>`;

    html += `<div class="stat-strip">
      <div class="stat-box"><div class="val">${escapeHtml(card.difficultyAdv)}</div><div class="lbl">Difficulty</div></div>
      <div class="stat-box"><div class="val">${escapeHtml(card.thresholds)}</div><div class="lbl">Thresholds</div></div>
      <div class="stat-box"><div class="val">${escapeHtml(card.hp)}</div><div class="lbl">HP</div></div>
      <div class="stat-box"><div class="val">${escapeHtml(card.stress)}</div><div class="lbl">Stress</div></div>
    </div>`;

    html += `<div class="attack-line">
      <b>${escapeHtml(card.atk)}</b> — ${escapeHtml(card.attackName)} ·
      ${escapeHtml(card.range)} · ${escapeHtml(card.damage)}
    </div>`;

    if (card.experience) {
      html += `<div class="card-line"><b>Experience:</b> ${escapeHtml(card.experience)}</div>`;
    }
  } else {
    html += `<div class="card-eyebrow"><span class="type-icon">${iconSvg}</span>Tier ${escapeHtml(card.tier)} · ${escapeHtml(card.envType)} · Environment</div>`;
    html += `<div class="card-name">${escapeHtml(card.name)}</div>`;
    if (card.description) html += `<div class="card-desc">${escapeHtml(card.description)}</div>`;
    html += `<div class="card-line"><b>Impulses:</b> ${escapeHtml(card.impulses)}</div>`;
    html += `<div class="card-divider"></div>`;

    html += `<div class="stat-strip">
      <div class="stat-box"><div class="val">${escapeHtml(card.difficultyEnv)}</div><div class="lbl">Difficulty</div></div>
    </div>`;

    if (card.potential) {
      html += `<div class="card-line"><b>Potential Adversaries:</b> ${escapeHtml(card.potential)}</div>`;
    }
  }

  if (card.features.length) {
    html += `<div class="card-divider"></div>`;
    card.features.forEach(f => {
      html += `<div class="card-feature"><span class="feat-name">${escapeHtml(f.name)}:</span> ${escapeHtml(f.text)}</div>`;
    });
  }

  html += `<div class="card-footer">Daggerheart Compatible — built from the SRD under the DPCGL</div>`;
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
      deck = parsed;
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
