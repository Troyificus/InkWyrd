// ===== State =====
let cardType = 'adversary'; // or 'environment'
let features = [
  { name: 'Relentless (3) — Passive', text: 'The Burrower can be spotlighted up to three times per GM turn. Spend Fear as usual to spotlight them.' },
  { name: 'Earth Eruption — Action', text: 'Mark a Stress to have the Burrower burst out of the ground. All creatures within Very Close range must succeed on an Agility Reaction Roll or be knocked over, making them Vulnerable until they next act.' }
];

const $ = (id) => document.getElementById(id);

// ===== Type toggle =====
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cardType = btn.dataset.type;
    document.querySelectorAll('.adv-only').forEach(el => el.hidden = cardType !== 'adversary');
    document.querySelectorAll('.env-only').forEach(el => el.hidden = cardType !== 'environment');
    renderCard();
  });
});

// ===== Features list UI =====
function renderFeatureInputs() {
  const container = $('features-list');
  container.innerHTML = '';
  features.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'feature-row';
    row.innerHTML = `
      <div class="feature-row-header">
        <label>Feature Name
          <input type="text" data-idx="${i}" class="feat-name-input" value="${escapeAttr(f.name)}">
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
      features[+e.target.dataset.idx].name = e.target.value;
      renderCard();
    });
  });
  container.querySelectorAll('.feat-text-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      features[+e.target.dataset.idx].text = e.target.value;
      renderCard();
    });
  });
  container.querySelectorAll('.remove-feature').forEach(btn => {
    btn.addEventListener('click', (e) => {
      features.splice(+e.target.dataset.idx, 1);
      renderFeatureInputs();
      renderCard();
    });
  });
}

$('add-feature').addEventListener('click', () => {
  features.push({ name: 'New Feature — Passive', text: 'Describe what it does.' });
  renderFeatureInputs();
  renderCard();
});

// ===== Render card =====
function val(id) { const el = $(id); return el ? el.value : ''; }

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

function renderCard() {
  const card = $('statblock-card');
  const theme = val('f-theme');
  card.className = 'theme-' + theme;
  card.style.setProperty('--card-accent', val('f-accent'));

  const name = val('f-name') || 'Unnamed';
  const tier = val('f-tier') || '1';
  const desc = val('f-description');

  let html = '';

  if (cardType === 'adversary') {
    const type = val('f-type');
    html += `<div class="card-eyebrow">Tier ${escapeHtml(tier)} · ${escapeHtml(type)} · Adversary</div>`;
    html += `<div class="card-name">${escapeHtml(name)}</div>`;
    if (desc) html += `<div class="card-desc">${escapeHtml(desc)}</div>`;
    html += `<div class="card-line"><b>Motives &amp; Tactics:</b> ${escapeHtml(val('f-motives'))}</div>`;
    html += `<div class="card-divider"></div>`;

    html += `<div class="stat-strip">
      <div class="stat-box"><div class="val">${escapeHtml(val('f-difficulty'))}</div><div class="lbl">Difficulty</div></div>
      <div class="stat-box"><div class="val">${escapeHtml(val('f-thresholds'))}</div><div class="lbl">Thresholds</div></div>
      <div class="stat-box"><div class="val">${escapeHtml(val('f-hp'))}</div><div class="lbl">HP</div></div>
      <div class="stat-box"><div class="val">${escapeHtml(val('f-stress'))}</div><div class="lbl">Stress</div></div>
    </div>`;

    html += `<div class="attack-line">
      <b>${escapeHtml(val('f-atk'))}</b> — ${escapeHtml(val('f-attack-name'))} ·
      ${escapeHtml(val('f-range'))} · ${escapeHtml(val('f-damage'))}
    </div>`;

    if (val('f-experience')) {
      html += `<div class="card-line"><b>Experience:</b> ${escapeHtml(val('f-experience'))}</div>`;
    }
  } else {
    const type = val('f-env-type');
    html += `<div class="card-eyebrow">Tier ${escapeHtml(tier)} · ${escapeHtml(type)} · Environment</div>`;
    html += `<div class="card-name">${escapeHtml(name)}</div>`;
    if (desc) html += `<div class="card-desc">${escapeHtml(desc)}</div>`;
    html += `<div class="card-line"><b>Impulses:</b> ${escapeHtml(val('f-impulses'))}</div>`;
    html += `<div class="card-divider"></div>`;

    html += `<div class="stat-strip">
      <div class="stat-box"><div class="val">${escapeHtml(val('f-env-difficulty'))}</div><div class="lbl">Difficulty</div></div>
    </div>`;

    if (val('f-potential')) {
      html += `<div class="card-line"><b>Potential Adversaries:</b> ${escapeHtml(val('f-potential'))}</div>`;
    }
  }

  if (features.length) {
    html += `<div class="card-divider"></div>`;
    features.forEach(f => {
      html += `<div class="card-feature"><span class="feat-name">${escapeHtml(f.name)}:</span> ${escapeHtml(f.text)}</div>`;
    });
  }

  html += `<div class="card-footer">Daggerheart Compatible — built from the SRD under the DPCGL</div>`;

  card.innerHTML = html;
}

// ===== Live updates for all basic fields =====
document.addEventListener('input', (e) => {
  if (e.target.closest('.form-panel')) renderCard();
});

// ===== PNG export =====
$('export-png').addEventListener('click', async () => {
  const status = $('export-status');
  status.textContent = 'Rendering...';
  try {
    const card = $('statblock-card');
    const canvas = await html2canvas(card, { scale: 2, backgroundColor: null });
    const link = document.createElement('a');
    const filename = (val('f-name') || 'statblock').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${filename || 'statblock'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    status.textContent = 'Downloaded.';
    setTimeout(() => status.textContent = '', 2000);
  } catch (err) {
    console.error(err);
    status.textContent = 'Export failed — see console.';
  }
});

// ===== Init =====
renderFeatureInputs();
renderCard();
