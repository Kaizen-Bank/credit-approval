/* ---------------------------------------------------------------
   table-engine.js
   One generic, reusable dynamic table.

   Column: { id, label, locked (can't be removed), staticCells
             (default rows show plain, non-editable text in this
             column — e.g. a field name or a fixed role) }
   Row:    { id, custom (true if the user added it), cells: {colId:value} }

   Rules encoded here (per spec):
   - Locked columns can never be removed by the user.
   - User-added columns always get a header "×" to remove them, and
     the header text is editable so the user can name it immediately.
   - A column marked staticCells shows its default-row values as
     plain text (not editable) — that's the "role stays static" rule.
     A user-added row is always fully editable in every column,
     including a staticCells one, so the user can name a brand new
     field/role themselves.
   - All values live in JS state; the DOM is rebuilt from state, so
     add/remove never drops existing data.
------------------------------------------------------------------*/

function uid(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 9); }

function createDynamicTable(mount, state, onChange) {

  function isCellEditable(col, row) {
    if (row.custom) return true;
    return !col.staticCells;
  }

  function render() {
    const table = document.createElement('table');
    table.className = 'dtable' + (state.variant ? ' dtable--' + state.variant : '');

    // header
    const thead = document.createElement('thead');
    const htr = document.createElement('tr');
    const thRow = document.createElement('th');
    thRow.className = 'row-handle';
    htr.appendChild(thRow);

    state.columns.forEach(col => {
      const th = document.createElement('th');
      const label = document.createElement('span');
      label.className = 'cell-text';
      // Header text is editable even for locked (non-removable) columns —
      // "locked" only protects a column from being deleted, not renamed.
      if (!col.labelLocked) {
        label.contentEditable = 'true';
        label.addEventListener('input', () => { col.label = label.textContent; onChange(); });
      }
      label.textContent = col.label;
      th.appendChild(label);
      if (!col.locked) {
        const x = document.createElement('span');
        x.className = 'col-remove';
        x.title = 'Remove column';
        x.textContent = '×';
        x.addEventListener('click', () => {
          state.columns = state.columns.filter(c => c.id !== col.id);
          state.rows.forEach(r => delete r.cells[col.id]);
          onChange(); render();
        });
        th.appendChild(x);
      }
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    // body
    const tbody = document.createElement('tbody');
    state.rows.forEach(row => {
      const tr = document.createElement('tr');
      if (row.total) tr.className = 'total-row';

      const tdHandle = document.createElement('td');
      tdHandle.className = 'row-handle';
      const rm = document.createElement('span');
      rm.className = 'row-remove';
      rm.title = 'Remove row';
      rm.textContent = '×';
      rm.addEventListener('click', () => {
        state.rows = state.rows.filter(r => r.id !== row.id);
        onChange(); render();
      });
      tdHandle.appendChild(rm);
      tr.appendChild(tdHandle);

      state.columns.forEach(col => {
        const td = document.createElement('td');
        const editable = isCellEditable(col, row);
        td.className = editable ? 'fillable' : 'static-cell';
        if (editable) {
          td.contentEditable = 'true';
          td.addEventListener('input', () => { row.cells[col.id] = td.textContent; onChange(); });
          if (!row.cells[col.id]) td.dataset.placeholder = 'Fill in…';
        }
        td.textContent = row.cells[col.id] || '';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // actions
    const actions = document.createElement('div');
    actions.className = 'table-actions no-print';

    const addColBtn = document.createElement('button');
    addColBtn.type = 'button';
    addColBtn.className = 'add-col-btn';
    addColBtn.textContent = '+ Add Column';
    addColBtn.addEventListener('click', () => {
      const newCol = { id: uid('col'), label: 'New Column', locked: false };
      state.columns.push(newCol);
      state.rows.forEach(r => r.cells[newCol.id] = '');
      onChange(); render();
      requestAnimationFrame(() => {
        const heads = mount.querySelectorAll('th .cell-text[contenteditable]');
        const last = heads[heads.length - 1];
        if (last) { last.focus(); document.execCommand('selectAll', false, null); }
      });
    });
    actions.appendChild(addColBtn);

    const addRowBtn = document.createElement('button');
    addRowBtn.type = 'button';
    addRowBtn.className = 'add-row-btn';
    addRowBtn.textContent = '+ Add Row';
    addRowBtn.addEventListener('click', () => {
      const cells = {};
      state.columns.forEach(c => cells[c.id] = '');
      state.rows.push({ id: uid('row'), custom: true, cells });
      onChange(); render();
    });
    actions.appendChild(addRowBtn);

    mount.innerHTML = '';
    mount.appendChild(table);
    mount.appendChild(actions);
  }

  render();
  return { render };
}
