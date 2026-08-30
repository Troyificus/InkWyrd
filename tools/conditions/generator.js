function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const SYSTEM_LABELS = { daggerheart: 'Daggerheart', dnd5e: 'D&D 5E', pf2e: 'Pathfinder 2E' };
const SYSTEM_ORDER = ['daggerheart', 'dnd5e', 'pf2e'];

let activeCondition = CONDITION_REFERENCE[0].name;
let searchTerm = '';

// A system's text counts as "no equivalent" for styling purposes when it
// starts with language plainly saying so, so those entries visually read
// as genuinely different from an entry that does exist.
function isNoEquivalent(text) {
  return /^(no formal|not a formal|not a condition|not a named)/i.test(text);
}

function renderList() {
  const listEl = document.getElementById('condition-list');
  listEl.innerHTML = '';
  const filtered = CONDITION_REFERENCE.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!filtered.length) {
    const li = document.createElement('li');
    li.className = 'no-results';
    li.textContent = 'No conditions match that search.';
    listEl.appendChild(li);
    return;
  }

  filtered.forEach(cond => {
    const li = document.createElement('li');
    li.className = 'condition-list-item' + (cond.name === activeCondition ? ' active' : '');
    li.textContent = cond.name;
    if (cond.core) {
      const tag = document.createElement('span');
      tag.className = 'core-tag';
      tag.textContent = 'Daggerheart core';
      li.appendChild(tag);
    }
    li.addEventListener('click', () => {
      activeCondition = cond.name;
      renderList();
      renderComparison();
    });
    listEl.appendChild(li);
  });
}

function renderComparison() {
  const cond = CONDITION_REFERENCE.find(c => c.name === activeCondition);
  const el = document.getElementById('comparison-panel');
  if (!cond) {
    el.innerHTML = '<div class="doc-title">Pick a condition</div><p class="system-block-text">Choose one from the list to see how each system handles it.</p>';
    return;
  }

  let html = `<div class="doc-title">${escapeHtml(cond.name)}</div>`;
  SYSTEM_ORDER.forEach(sysKey => {
    const text = cond.entries[sysKey];
    const noEq = isNoEquivalent(text);
    html += `<div class="system-block">
      <div class="system-block-title">${escapeHtml(SYSTEM_LABELS[sysKey])}</div>
      <div class="system-block-text${noEq ? ' no-equivalent' : ''}">${escapeHtml(text)}</div>
    </div>`;
  });
  html += `<div class="doc-disclaimer">A fan-made summary for quick comparison, not exact rules text. Check the official rulebooks or SRDs for precise current wording.</div>`;
  el.innerHTML = html;
}

document.getElementById('condition-search').addEventListener('input', e => {
  searchTerm = e.target.value;
  renderList();
});

document.getElementById('print-all').addEventListener('click', () => {
  const el = document.getElementById('comparison-panel');
  const savedHtml = el.innerHTML;
  let html = '<div class="doc-title">Cross-System Condition Reference</div>';
  CONDITION_REFERENCE.forEach(cond => {
    html += `<div class="doc-section"><div class="doc-section-title">${escapeHtml(cond.name)}</div>`;
    SYSTEM_ORDER.forEach(sysKey => {
      const text = cond.entries[sysKey];
      const noEq = isNoEquivalent(text);
      html += `<div class="system-block">
        <div class="system-block-title">${escapeHtml(SYSTEM_LABELS[sysKey])}</div>
        <div class="system-block-text${noEq ? ' no-equivalent' : ''}">${escapeHtml(text)}</div>
      </div>`;
    });
    html += `</div>`;
  });
  html += `<div class="doc-disclaimer">A fan-made summary for quick comparison, not exact rules text. Check the official rulebooks or SRDs for precise current wording.</div>`;
  el.innerHTML = html;
  window.print();
  el.innerHTML = savedHtml;
});

// ===== Init =====

renderList();
renderComparison();
