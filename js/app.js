/* ---------------------------------------------------------------
   app.js — builds the sheet from CAM_SECTIONS, wires save/export/
   PDF. All actual content lives in data.js; this file only renders.
------------------------------------------------------------------*/

const STORAGE_KEY = 'cam_form_state_v2';
const state = {}; // section.id -> table state (for field/grid) or lines (for text)

function fieldSectionState(section) {
  return {
    columns: [
      { id: 'field', label: 'Field', locked: true, labelLocked: true, staticCells: true },
      { id: 'value', label: 'Details', locked: true, labelLocked: true }
    ],
    rows: section.fields.map((label, i) => ({
      id: 'row_' + i,
      custom: false,
      cells: { field: label, value: '' }
    }))
  };
}

function gridSectionState(section) {
  const columns = section.columns.map((label, i) => ({
    id: 'col_' + i,
    label,
    locked: true,
    // labelLocked stays false (default) so header text is editable —
    // e.g. renaming "Facility Type" to "Personal Loan" — even though
    // the column itself can't be removed.
    staticCells: (section.staticColumns || []).includes(label)
  }));
  let rows;
  if (section.rows) {
    rows = section.rows.map((vals, ri) => {
      const cells = {};
      columns.forEach((c, ci) => cells[c.id] = vals[ci] || '');
      return { id: 'row_' + ri, custom: false, cells };
    });
  } else {
    const count = section.rowCount || 3;
    rows = [];
    for (let i = 0; i < count; i++) {
      const cells = {};
      columns.forEach(c => cells[c.id] = '');
      rows.push({ id: 'row_' + i, custom: false, cells });
    }
    (section.totalRows || []).forEach((label, i) => {
      const cells = {};
      columns.forEach((c, ci) => cells[c.id] = ci === 0 ? label : '');
      rows.push({ id: 'total_' + i, custom: false, total: true, cells });
    });
  }
  return { columns, rows, variant: section.variant };
}

function buildSheet() {
  const sheet = document.getElementById('sheet');
  sheet.innerHTML = `
    <div class="letterhead">
      <img src="assets/kaizen-logo.png" alt="Kaizen Microfinance Bank" class="logo">
      <div class="title">CREDIT APPROVAL SHEET</div>
      <div class="subtitle">Fill in the details below, then download as PDF.</div>
    </div>
  `;

  CAM_SECTIONS.forEach(section => {
    const block = document.createElement('div');
    block.className = 'section-block';

    if (section.title) {
      const h = document.createElement('h2');
      h.className = 'section-title';
      h.textContent = section.title;
      block.appendChild(h);
    }

    if (section.type === 'text') {
      state[section.id] = state[section.id] || [''];
      const wrap = document.createElement('div');
      wrap.className = 'text-section';
      block.appendChild(wrap);
      sheet.appendChild(block);
      renderTextSection(section, wrap);
      return;
    }

    if (section.type === 'static') {
      const ul = document.createElement('ul');
      ul.className = 'static-list';
      section.lines.forEach(line => {
        const li = document.createElement('li');
        li.textContent = line;
        ul.appendChild(li);
      });
      block.appendChild(ul);
      sheet.appendChild(block);
      return;
    }

    if (section.type === 'signature') {
      if (state[section.id] === undefined) state[section.id] = '';
      const sig = document.createElement('div');
      sig.className = 'signature-block';
      sig.innerHTML = `
        <p class="approve-line">Please kindly approve.</p>
        <div class="sig-role">Account Officer</div>
        <div class="sig-line"></div>
      `;
      const nameField = document.createElement('span');
      nameField.className = 'cell-text sig-name';
      nameField.contentEditable = 'true';
      nameField.textContent = state[section.id];
      if (!state[section.id]) nameField.dataset.placeholder = 'Account officer name';
      nameField.addEventListener('input', () => { state[section.id] = nameField.textContent; save(); });
      sig.appendChild(nameField);
      block.appendChild(sig);
      sheet.appendChild(block);
      return;
    }

    if (section.type === 'narrative') {
      if (!Array.isArray(state[section.id])) {
        state[section.id] = Array.from({ length: section.count || 1 }, () => ({}));
      }
      const wrap = document.createElement('div');
      wrap.className = 'narrative-section';
      block.appendChild(wrap);
      sheet.appendChild(block);
      renderNarrativeSection(section, wrap);
      return;
    }

    const mount = document.createElement('div');
    mount.className = 'dtable-wrap';
    block.appendChild(mount);

    if (section.remarksPlaceholder) {
      const remarksKey = section.id + '_remarks';
      if (state[remarksKey] === undefined) state[remarksKey] = '';
      const remarks = document.createElement('div');
      remarks.className = 'remarks-box';
      remarks.contentEditable = 'true';
      remarks.textContent = state[remarksKey];
      if (!state[remarksKey]) remarks.dataset.placeholder = section.remarksPlaceholder;
      remarks.addEventListener('input', () => { state[remarksKey] = remarks.textContent; save(); });
      block.appendChild(remarks);
    }

    sheet.appendChild(block);

    const existing = state[section.id];
    const looksValid = existing && Array.isArray(existing.columns) && Array.isArray(existing.rows);
    if (!looksValid) {
      state[section.id] = section.type === 'field'
        ? fieldSectionState(section)
        : gridSectionState(section);
    }
    createDynamicTable(mount, state[section.id], save);
  });
}

function renderNarrativeSection(section, wrap) {
  wrap.innerHTML = '';
  const data = state[section.id];

  data.forEach((entry, idx) => {
    const card = document.createElement('div');
    card.className = 'narrative-card';

    const head = document.createElement('div');
    head.className = 'narrative-head';
    const label = document.createElement('span');
    label.className = 'narrative-label';
    label.textContent = 'Guarantor ' + (idx + 1);
    head.appendChild(label);
    if (data.length > 1) {
      const rm = document.createElement('span');
      rm.className = 'row-remove';
      rm.title = 'Remove guarantor';
      rm.textContent = '×';
      rm.addEventListener('click', () => {
        data.splice(idx, 1);
        save(); renderNarrativeSection(section, wrap);
      });
      head.appendChild(rm);
    }
    card.appendChild(head);

    const p = document.createElement('p');
    p.className = 'narrative-text';
    section.template.forEach(seg => {
      if (seg.text) {
        p.appendChild(document.createTextNode(seg.text));
      } else {
        const span = document.createElement('span');
        span.className = 'cell-text narrative-blank';
        span.contentEditable = 'true';
        span.textContent = entry[seg.key] || '';
        if (!entry[seg.key]) span.dataset.placeholder = seg.placeholder;
        span.addEventListener('input', () => { entry[seg.key] = span.textContent; save(); });
        p.appendChild(span);
      }
    });
    card.appendChild(p);
    wrap.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-row-btn no-print';
  addBtn.textContent = '+ Add Guarantor';
  addBtn.addEventListener('click', () => {
    data.push({});
    save(); renderNarrativeSection(section, wrap);
  });
  wrap.appendChild(addBtn);
}

function renderTextSection(section, wrap) {
  wrap.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'text-lines';
  state[section.id].forEach((val, idx) => {
    const row = document.createElement('div');
    row.className = 'text-line';
    const line = document.createElement('span');
    line.className = 'cell-text';
    line.contentEditable = 'true';
    line.textContent = val;
    if (!val) line.dataset.placeholder = section.placeholder;
    line.addEventListener('input', () => { state[section.id][idx] = line.textContent; save(); });
    const rm = document.createElement('span');
    rm.className = 'row-remove';
    rm.title = 'Remove line';
    rm.textContent = '×';
    rm.addEventListener('click', () => {
      state[section.id].splice(idx, 1);
      if (state[section.id].length === 0) state[section.id].push('');
      save(); renderTextSection(section, wrap);
    });
    row.appendChild(rm);
    row.appendChild(line);
    list.appendChild(row);
  });
  wrap.appendChild(list);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-row-btn no-print';
  addBtn.textContent = '+ Add Line';
  addBtn.addEventListener('click', () => {
    state[section.id].push('');
    save(); renderTextSection(section, wrap);
  });
  wrap.appendChild(addBtn);
}

/* ---------------- persistence ---------------- */
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  const status = document.getElementById('saveStatus');
  if (status) status.textContent = 'Saving…';
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (status) status.textContent = 'Saved in this browser.';
    } catch (e) {
      if (status) status.textContent = 'Auto-save unavailable — use "Export data" to keep a copy.';
    }
  }, 250);
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (e) { /* start fresh */ }
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'credit-approval-sheet-data.json';
  a.click();
}

function importJSON(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      Object.keys(state).forEach(k => delete state[k]);
      Object.assign(state, parsed);
      save();
      buildSheet();
    } catch (e) {
      alert('Could not read that file — please choose a valid exported .json file.');
    }
  };
  reader.readAsText(file);
}

function resetForm() {
  if (!confirm('Clear all entered data and start a fresh blank form?')) return;
  Object.keys(state).forEach(k => delete state[k]);
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  buildSheet();
}

/* ---------------- PDF export ---------------- */
function downloadPDF() {
  const btn = document.getElementById('pdfBtn');
  const original = btn.textContent;
  btn.textContent = 'Preparing PDF…';
  btn.disabled = true;

  const sheet = document.getElementById('sheet');
  const opt = {
    margin: 10,
    filename: 'credit-approval-sheet.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      onclone: (doc) => {
        doc.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');
        doc.querySelectorAll('[contenteditable]').forEach(el => {
          el.style.background = 'transparent';
          el.style.borderBottom = 'none';
        });
      }
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(sheet).save().then(() => {
    btn.textContent = original;
    btn.disabled = false;
  }).catch(() => {
    btn.textContent = original;
    btn.disabled = false;
    alert('PDF generation failed — please try Print instead (Ctrl/Cmd+P) and choose "Save as PDF".');
  });
}

/* ---------------- init ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadSaved();
  buildSheet();
  document.getElementById('pdfBtn').addEventListener('click', downloadPDF);
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importJSON);
  document.getElementById('resetBtn').addEventListener('click', resetForm);
});
