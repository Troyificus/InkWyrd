const STORAGE_KEY = 'sessionzero.state.v1';

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ===== State =====

function defaultState() {
  const core = {};
  SESSION_ZERO_SECTIONS.forEach(section => {
    core[section.key] = {};
    section.questions.forEach(q => { core[section.key][q.id] = true; });
  });
  const systems = {};
  Object.keys(SESSION_ZERO_SYSTEM_NOTES).forEach(sysKey => {
    systems[sysKey] = { enabled: false, questions: {} };
    SESSION_ZERO_SYSTEM_NOTES[sysKey].questions.forEach(q => { systems[sysKey].questions[q.id] = true; });
  });
  return { core, systems };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.core && parsed.systems) return migrateState(parsed);
    }
  } catch (e) { /* fall through */ }
  return defaultState();
}

// Fills in any section/question/system added to the data file since a
// user's state was last saved, defaulting new items the same way a
// fresh state would (selected for core questions, off for a whole new
// system) rather than silently dropping them from the saved state.
function migrateState(state) {
  SESSION_ZERO_SECTIONS.forEach(section => {
    if (!state.core[section.key]) state.core[section.key] = {};
    section.questions.forEach(q => {
      if (state.core[section.key][q.id] === undefined) state.core[section.key][q.id] = true;
    });
  });
  Object.keys(SESSION_ZERO_SYSTEM_NOTES).forEach(sysKey => {
    if (!state.systems[sysKey]) state.systems[sysKey] = { enabled: false, questions: {} };
    SESSION_ZERO_SYSTEM_NOTES[sysKey].questions.forEach(q => {
      if (state.systems[sysKey].questions[q.id] === undefined) state.systems[sysKey].questions[q.id] = true;
    });
  });
  return state;
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* best effort */ }
}

let state = loadState();

// ===== Form rendering =====

function renderFormSections() {
  const container = document.getElementById('core-sections');
  container.innerHTML = '';

  SESSION_ZERO_SECTIONS.forEach(section => {
    const wrap = document.createElement('fieldset');
    wrap.className = 'form-section';

    const header = document.createElement('div');
    header.className = 'form-section-header';
    const h3 = document.createElement('h3');
    h3.textContent = section.label;
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'section-toggle-btn';
    const allOn = section.questions.every(q => state.core[section.key][q.id]);
    toggleBtn.textContent = allOn ? 'Deselect All' : 'Select All';
    toggleBtn.addEventListener('click', () => {
      const newVal = !allOn;
      section.questions.forEach(q => { state.core[section.key][q.id] = newVal; });
      saveState(); renderFormSections(); renderDocument();
    });
    header.appendChild(h3);
    header.appendChild(toggleBtn);
    wrap.appendChild(header);

    section.questions.forEach(q => {
      const row = document.createElement('div');
      row.className = 'question-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `q-${section.key}-${q.id}`;
      checkbox.checked = !!state.core[section.key][q.id];
      checkbox.addEventListener('change', e => {
        state.core[section.key][q.id] = e.target.checked;
        saveState(); renderFormSections(); renderDocument();
      });
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = q.text;
      row.appendChild(checkbox);
      row.appendChild(label);
      wrap.appendChild(row);
    });

    container.appendChild(wrap);
  });
}

function renderSystemSections() {
  const container = document.getElementById('system-sections');
  container.innerHTML = '';

  Object.keys(SESSION_ZERO_SYSTEM_NOTES).forEach(sysKey => {
    const sys = SESSION_ZERO_SYSTEM_NOTES[sysKey];
    const wrap = document.createElement('fieldset');
    wrap.className = 'form-section';

    const header = document.createElement('div');
    header.className = 'form-section-header';
    const h3 = document.createElement('h3');
    h3.textContent = sys.label;
    const enableCheckbox = document.createElement('input');
    enableCheckbox.type = 'checkbox';
    enableCheckbox.checked = !!state.systems[sysKey].enabled;
    enableCheckbox.style.marginLeft = '8px';
    enableCheckbox.addEventListener('change', e => {
      state.systems[sysKey].enabled = e.target.checked;
      saveState(); renderSystemSections(); renderDocument();
    });
    const enableLabel = document.createElement('label');
    enableLabel.style.display = 'flex';
    enableLabel.style.alignItems = 'center';
    enableLabel.style.gap = '6px';
    enableLabel.style.fontSize = '0.8rem';
    enableLabel.appendChild(enableCheckbox);
    enableLabel.appendChild(document.createTextNode('Include'));
    header.appendChild(h3);
    header.appendChild(enableLabel);
    wrap.appendChild(header);

    if (state.systems[sysKey].enabled) {
      sys.questions.forEach(q => {
        const row = document.createElement('div');
        row.className = 'question-row';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `q-sys-${sysKey}-${q.id}`;
        checkbox.checked = !!state.systems[sysKey].questions[q.id];
        checkbox.addEventListener('change', e => {
          state.systems[sysKey].questions[q.id] = e.target.checked;
          saveState(); renderDocument();
        });
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = q.text;
        row.appendChild(checkbox);
        row.appendChild(label);
        wrap.appendChild(row);
      });
    }

    container.appendChild(wrap);
  });
}

// ===== Document preview =====

function renderDocument() {
  const el = document.getElementById('document-preview');
  let html = '<div class="doc-title">Session Zero</div>';
  let hasAnyContent = false;

  SESSION_ZERO_SECTIONS.forEach(section => {
    const selected = section.questions.filter(q => state.core[section.key][q.id]);
    if (!selected.length) return;
    hasAnyContent = true;
    html += `<div class="doc-section"><div class="doc-section-title">${escapeHtml(section.label)}</div>`;
    selected.forEach(q => {
      html += `<div class="doc-question">${escapeHtml(q.text)}</div>`;
    });
    html += `</div>`;
  });

  Object.keys(SESSION_ZERO_SYSTEM_NOTES).forEach(sysKey => {
    if (!state.systems[sysKey].enabled) return;
    const sys = SESSION_ZERO_SYSTEM_NOTES[sysKey];
    const selected = sys.questions.filter(q => state.systems[sysKey].questions[q.id]);
    if (!selected.length) return;
    hasAnyContent = true;
    html += `<div class="doc-section"><div class="doc-section-title">${escapeHtml(sys.label)} Notes</div>`;
    selected.forEach(q => {
      html += `<div class="doc-question">${escapeHtml(q.text)}</div>`;
    });
    html += `</div>`;
  });

  if (!hasAnyContent) {
    html += '<div class="doc-question" style="font-style:italic; color:var(--text-dim);">Nothing selected yet, toggle some questions on the left to build your questionnaire.</div>';
  }

  html += `<div class="card-footer">Statblock Forge &middot; original session zero content</div>`;
  el.innerHTML = html;
}

// ===== Export =====

document.getElementById('select-all').addEventListener('click', () => {
  SESSION_ZERO_SECTIONS.forEach(section => {
    section.questions.forEach(q => { state.core[section.key][q.id] = true; });
  });
  saveState(); renderFormSections(); renderDocument();
});

document.getElementById('select-none').addEventListener('click', () => {
  SESSION_ZERO_SECTIONS.forEach(section => {
    section.questions.forEach(q => { state.core[section.key][q.id] = false; });
  });
  saveState(); renderFormSections(); renderDocument();
});

document.getElementById('print-doc').addEventListener('click', () => {
  window.print();
});

document.getElementById('copy-text').addEventListener('click', () => {
  let text = 'SESSION ZERO\n\n';
  SESSION_ZERO_SECTIONS.forEach(section => {
    const selected = section.questions.filter(q => state.core[section.key][q.id]);
    if (!selected.length) return;
    text += `${section.label.toUpperCase()}\n`;
    selected.forEach(q => { text += `- ${q.text}\n`; });
    text += '\n';
  });
  Object.keys(SESSION_ZERO_SYSTEM_NOTES).forEach(sysKey => {
    if (!state.systems[sysKey].enabled) return;
    const sys = SESSION_ZERO_SYSTEM_NOTES[sysKey];
    const selected = sys.questions.filter(q => state.systems[sysKey].questions[q.id]);
    if (!selected.length) return;
    text += `${sys.label.toUpperCase()} NOTES\n`;
    selected.forEach(q => { text += `- ${q.text}\n`; });
    text += '\n';
  });
  navigator.clipboard.writeText(text.trim()).then(() => {
    const btn = document.getElementById('copy-text');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
  }).catch(() => {
    alert('Could not copy automatically, your browser may be blocking clipboard access.');
  });
});

// ===== Init =====

renderFormSections();
renderSystemSections();
renderDocument();
