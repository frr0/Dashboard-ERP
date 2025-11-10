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

    thead.innerHTML = '';
    const headerRow = thead.insertRow();
    fieldOrder.forEach(f => {
      const th = document.createElement('th');
      th.textContent = labels[f] || window.defaultLabelFromField(f);
      headerRow.appendChild(th);
    });

    tbody.innerHTML = '';
    items.forEach(obj => {
      const tr = tbody.insertRow();
      fieldOrder.forEach(f => {
        const td = tr.insertCell();
        td.textContent = obj[f] != null ? obj[f] : '';
      });
      const tdAzioni = tr.insertCell();
      tdAzioni.className = 'azioni';
      tdAzioni.innerHTML = '<button class="btn-modifica">✏️</button><button class="btn-elimina">🗑️</button>';
    });
  } catch (e) {
    console.error('Errore nel caricamento dati', e);
    alert('Errore durante il caricamento dei dati');
  }
};
