// Vanilla JS: fetch JSON e rendering tabella
console.log('dataLoader.js caricato');
window.fetchJson = async function(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
  return r.json();
};

window.defaultLabelFromField = function(field) {
  return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Paginazione semplice per tabelle
function getTableState(table) {
  if (!table._erpState) {
    table._erpState = {
      items: [],
      filteredItems: null, // null = nessun filtro attivo
      page: 1,
      pageSize: 10
    };
  }
  return table._erpState;
}

function renderPage(table, labels, fieldOrder) {
  const state = getTableState(table);
  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const data = state.filteredItems ?? state.items;
  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.page > pages) state.page = pages;
  const start = (state.page - 1) * state.pageSize;
  const end = start + state.pageSize;
  const slice = data.slice(start, end);

  tbody.innerHTML = '';
  if (slice.length === 0) {
    const colCount = (fieldOrder?.length || (table._fieldOrder?.length || 0)) + 1; // +1 per azioni
    const tr = tbody.insertRow();
    const td = tr.insertCell();
    td.colSpan = Math.max(1, colCount);
    td.className = 'text-muted';
    td.textContent = 'Nessun risultato';
  }

  slice.forEach((obj, i) => {
    const tr = tbody.insertRow();
    tr.dataset.globalIndex = String(start + i);
    fieldOrder.forEach(f => {
      const td = tr.insertCell();
      td.textContent = obj[f] != null ? obj[f] : '';
    });
  const tdAzioni = tr.insertCell();
  tdAzioni.className = 'azioni';
  tdAzioni.innerHTML = '<button class="icon-btn btn-modifica" title="Modifica" aria-label="Modifica">✏️</button><button class="icon-btn btn-elimina" title="Elimina" aria-label="Elimina">🗑️</button>';
  });

  renderPaginationControls(table, total);
}

function renderPaginationControls(table, total) {
  const state = getTableState(table);
  const container = table.closest('.table-container');
  if (!container) return;

  let pager = container.querySelector('.table-pager');
  if (!pager) {
    pager = document.createElement('div');
    pager.className = 'table-pager d-flex align-items-center gap-2 mt-2 justify-content-end';
    const btnPrev = document.createElement('button');
    btnPrev.type = 'button';
    btnPrev.className = 'btn btn-sm btn-outline-light';
    btnPrev.textContent = 'Precedente';
    btnPrev.addEventListener('click', () => {
      if (state.page > 1) { state.page--; renderPage(table, null, getFieldOrder(table)); }
    });
    const info = document.createElement('span');
    info.className = 'pager-info';
    const btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.className = 'btn btn-sm btn-outline-light';
    btnNext.textContent = 'Successiva';
    btnNext.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
      if (state.page < totalPages) { state.page++; renderPage(table, null, getFieldOrder(table)); }
    });
    pager.append(btnPrev, info, btnNext);
    container.appendChild(pager);
  }
  const pages = Math.max(1, Math.ceil(total / state.pageSize));
  const info = pager.querySelector('.pager-info');
  if (info) info.textContent = `Pagina ${state.page} di ${pages} (${total} record)`;
  const buttons = pager.querySelectorAll('button');
  const btnPrev = buttons[0];
  const btnNext = buttons[1];
  if (btnPrev) btnPrev.disabled = (state.page <= 1);
  if (btnNext) btnNext.disabled = (state.page >= pages);
}

function getFieldOrder(table) {
  const thead = table.querySelector('thead');
  const headerCells = thead ? Array.from(thead.querySelectorAll('th')).map(th => th.textContent) : [];
  // Not used to recalc mapping; we'll rely on stored order on table element
  return table._fieldOrder || [];
}

window.loadAndRenderTable = async function({ jsonUrl, labels = {}, tableSelector = '#area-principale .table-container table' }) {
  try {
    const data = await window.fetchJson(jsonUrl);
    const result = data && data.results ? data.results[0] : null;
    const items = (result && result.items) || [];
    const columns = (result && result.columns) || [];

    const table = document.querySelector(tableSelector);
    if (!table) return;
    let thead = table.querySelector('thead');
    let tbody = table.querySelector('tbody');
    if (!thead) thead = table.createTHead();
    if (!tbody) tbody = table.createTBody();

    const fieldOrder = columns.length
      ? columns.map(c => (c.name || '').toLowerCase())
      : (items[0] ? Object.keys(items[0]) : []);
    table._fieldOrder = fieldOrder.slice();

    thead.innerHTML = '';
    const headerRow = thead.insertRow();
    fieldOrder.forEach(f => {
      const th = document.createElement('th');
      th.textContent = labels[f] || window.defaultLabelFromField(f);
      headerRow.appendChild(th);
    });
    // Colonna azioni (modifica/elimina)
    const thAzioni = document.createElement('th');
    thAzioni.className = 'azioni';
    thAzioni.textContent = 'Edit';
    headerRow.appendChild(thAzioni);

    // Inizializza stato e renderizza pagina 1
    const state = getTableState(table);
    state.items = items;
    state.filteredItems = null;
    state.page = 1;
    renderPage(table, labels, fieldOrder);

    // Bind re-render listener una sola volta
    if (!table.dataset.rerenderBound) {
      table.addEventListener('erp-rerender-page', () => {
        renderPage(table, labels, table._fieldOrder);
      });
      table.dataset.rerenderBound = '1';
    }
  } catch (e) {
    console.error('Errore nel caricamento dati', e);
    alert('Errore durante il caricamento dei dati');
  }

  // Espone un API minima per ri-renderizzare una pagina dall'esterno
  window.__erpRenderPage = function(table) {
    if (table && table._fieldOrder) {
      renderPage(table, null, table._fieldOrder);
    }
  };
};
