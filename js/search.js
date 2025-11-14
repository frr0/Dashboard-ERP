// search.js - Ricerca live nelle tabelle
console.log('search.js caricato');

window.initSearchIn = function(scope) {
  const container = scope || document;
  const inputs = container.querySelectorAll('input.ricerca');
  inputs.forEach(input => {
    if (input.dataset.searchBound) return;
    input.dataset.searchBound = '1';
    input.addEventListener('input', debounce(() => applyFilter(input.value), 150));
  });
};

function debounce(fn, delay) {
  let timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, arguments), delay);
  };
}

function applyFilter(query) {
  const q = (query || '').toLowerCase().trim();
  const tables = document.querySelectorAll('#area-principale table');
  tables.forEach(table => {
    filterTable(table, q);
  });
}

function filterTable(table, q) {
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  const oldNo = tbody.querySelector('tr.no-results');
  if (oldNo) oldNo.remove();
  const rows = tbody.querySelectorAll('tr');
  let visible = 0;
  rows.forEach(tr => {
    const text = tr.textContent.toLowerCase();
    const match = !q || text.includes(q);
    tr.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  if (visible === 0) {
    const colCount = table.querySelectorAll('thead th').length || 1;
    const tr = document.createElement('tr');
    tr.className = 'no-results';
    const td = document.createElement('td');
    td.className = 'text-muted';
    td.colSpan = colCount;
    td.textContent = 'Nessun risultato';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}
