// search.js
// Gestione della ricerca live nelle tabelle

window.initSearchIn = function initSearchIn(scope) {
  const container = scope || document;
  const inputs = container.querySelectorAll('input.ricerca');
  inputs.forEach(input => {
    if (input.dataset.searchBound === '1') return;
    input.dataset.searchBound = '1';
    input.addEventListener('input', debounce(() => applyFilter(input), 150));
  });
};

function debounce(fn, delay = 150) {
  let t; return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), delay); };
}

function applyFilter(inputEl) {
  const query = (inputEl.value || '').toLowerCase().trim();
  const area = document.getElementById('area-principale');
  const tables = area ? Array.from(area.querySelectorAll('table')) : [];
  tables.forEach(table => filterTable(table, query));
}

function filterTable(table, query) {
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  const oldNo = tbody.querySelector('tr.no-results'); if (oldNo) oldNo.remove();
  const rows = Array.from(tbody.querySelectorAll('tr'));
  let visible = 0;
  rows.forEach(tr => {
    const text = tr.textContent.toLowerCase();
    const match = query === '' || text.includes(query);
    tr.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  if (visible === 0) {
    const colCount = table.querySelectorAll('thead th').length || (rows[0] ? rows[0].children.length : 1);
    const tr = document.createElement('tr'); tr.className = 'no-results';
    const td = document.createElement('td'); td.colSpan = colCount; td.className='text-muted'; td.textContent='Nessun risultato';
    tr.appendChild(td); tbody.appendChild(tr);
  }
}
