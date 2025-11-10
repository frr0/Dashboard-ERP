// dataLoader.js
// Responsabile del caricamento dei JSON e del rendering tabellare generico

window.fetchJson = async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Richiesta fallita: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

window.defaultLabelFromField = function defaultLabelFromField(field) {
  return field.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
};

window.loadAndRenderTable = async function loadAndRenderTable({ jsonUrl, labels = {}, tableSelector = '#area-principale .table-container table' }) {
  try {
    const data = await window.fetchJson(jsonUrl);
    const result = data ? data.results[0] : null;
    const items = result && result.items ? result.items : [];
    const columns = result && result.columns ? result.columns : [];

    const table = document.querySelector(tableSelector);
    if (!table) return;

    let thead = table.querySelector('thead');
    let tbody = table.querySelector('tbody');
    if (!thead) { thead = table.createTHead(); }
    if (!tbody) { tbody = table.createTBody(); }

    const fieldOrder = columns.length > 0
      ? columns.map(c => (c.name || '').toLowerCase())
      : (items[0] ? Object.keys(items[0]) : []);

    // Header
    thead.innerHTML = '';
    const headerRow = thead.insertRow();
    fieldOrder.forEach(field => {
      const th = document.createElement('th');
      th.textContent = labels[field] || window.defaultLabelFromField(field);
      headerRow.appendChild(th);
    });

    // Body
    tbody.innerHTML = '';
    items.forEach(item => {
      const tr = tbody.insertRow();
      fieldOrder.forEach(field => {
        const td = tr.insertCell();
        td.textContent = item[field] != null ? item[field] : '';
      });
      const tdAzioni = tr.insertCell();
      tdAzioni.className = 'azioni';
      tdAzioni.innerHTML = '<button class="btn-modifica">✏️</button><button class="btn-elimina">🗑️</button>';
    });
  } catch (err) {
    console.error('Errore nel caricamento dati:', err);
    alert('Errore durante il caricamento dei dati');
  }
};
