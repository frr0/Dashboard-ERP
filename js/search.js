// search.js compatto
window.initSearchIn=scope=>{
  (scope||document).querySelectorAll('input.ricerca').forEach(i=>{
    if(i.dataset.searchBound)return;i.dataset.searchBound='1';i.addEventListener('input',debounce(()=>applyFilter(i.value),150));
  });
};
function debounce(fn,d){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this,arguments),d);};}
function applyFilter(q){q=(q||'').toLowerCase().trim();document.querySelectorAll('#area-principale table').forEach(tb=>{
  if(tb._erpState){const s=tb._erpState,d=s.items||[];s.filteredItems=q?d.filter(o=>Object.values(o).some(v=>String(v??'').toLowerCase().includes(q))):null;s.page=1;if(typeof window.__erpRenderPage==='function')window.__erpRenderPage(tb);}
  else filterTable(tb,q);
});}
function filterTable(tb,q){const b=tb.querySelector('tbody');if(!b)return;const o=b.querySelector('tr.no-results');if(o)o.remove();let v=0;b.querySelectorAll('tr').forEach(tr=>{const t=tr.textContent.toLowerCase(),m=!q||t.includes(q);tr.style.display=m?'':'none';if(m)v++;});if(v===0){const c=tb.querySelectorAll('thead th').length||1,tr=document.createElement('tr');tr.className='no-results';const td=document.createElement('td');td.colSpan=c;td.className='text-muted';td.textContent='Nessun risultato';tr.appendChild(td);b.appendChild(tr);}}
// Vanilla JS: ricerca live nelle tabelle
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
    // Paginazione-aware filtering: usa lo stato se presente
    if (table._erpState) {
      const state = table._erpState;
      const data = state.items || [];
      state.filteredItems = q
        ? data.filter(obj => Object.values(obj).some(v => String(v ?? '').toLowerCase().includes(q)))
        : null;
      state.page = 1; // reset pagina
      if (typeof window.__erpRenderPage === 'function') {
        window.__erpRenderPage(table);
      }
    } else {
      // Fallback: vecchio filtro row-by-row
      filterTable(table, q);
    }
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
