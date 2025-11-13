// Helper per label più leggibili
window.prettyLabel = (f) => f
  .replace(/_/g, ' ') // underscore -> spazio
  .replace(/\b\w/g, c => c.toUpperCase()); // capitalizza ogni parola

window.loadAndRenderTable = async ({ jsonUrl, labels = {}, tableSelector = '#area-principale .table-container' }) => {
  const mountTarget = document.querySelector(tableSelector);
  if (!mountTarget) return;
  try {
    const r = await fetch(jsonUrl);
    const j = await r.json();
    const result = j.results && j.results[0];
    const items = result ? result.items : [];
    const fields = items[0] ? Object.keys(items[0]) : [];
    if (!items.length) {
      mountTarget.innerHTML = '<div class="gridjs-mount"></div><div class="text-muted mt-2">Nessun dato disponibile</div>';
    }
    if (window.gridjs) {
      const cols = [
        ...fields.map(f => ({ name: labels[f] || prettyLabel(f), id: f })),
        { name: 'Azioni', sort: false, formatter: (_, row) => gridjs.html(`
          <button class="icon-btn btn-modifica" data-row="${row._index}" onclick="modifica(${row._index})" title="Modifica">✏️</button>
          <button class="icon-btn btn-elimina" data-row="${row._index}" onclick="elimina(${row._index})" title="Elimina">🗑️</button>
        `) }
      ];
      mountTarget.innerHTML = '<div class="gridjs-mount"></div>';
      const gridInstance = new gridjs.Grid({
        data: items,
        columns: cols,
        pagination: { enabled: true, limit: 10, summary: true },
        search: true,
        sort: true,
        className: { table: 'gridjs-dark table-dark-striped' }
      });
      gridInstance.render(mountTarget.firstElementChild).then(() => {
        // Conserva riferimento per azioni
        mountTarget.querySelector('.gridjs-mount')._gridjs_instance = gridInstance;
        // Collega bottone "Nuovo" se presente vicino
        const btnNuovo = mountTarget.parentElement?.querySelector('button.btn-success');
        if (btnNuovo) btnNuovo.onclick = () => window.nuovo && window.nuovo();
      });
    } else {
      // Fallback essenziale
  const table = document.createElement('table');
  table.className = 'table table-dark-striped';
      const thead = table.createTHead();
      const hr = thead.insertRow();
  fields.forEach(f => { const th = document.createElement('th'); th.textContent = labels[f] || prettyLabel(f); hr.appendChild(th); });
      const thA = document.createElement('th'); thA.textContent = 'Azioni'; hr.appendChild(thA);
      const tbody = table.createTBody();
      items.slice(0,10).forEach((obj,i) => {
        const tr = tbody.insertRow();
        fields.forEach(f => { const td = tr.insertCell(); td.textContent = obj[f]; });
        const tdAct = tr.insertCell(); tdAct.innerHTML = '<button class="icon-btn btn-modifica" onclick="modifica('+i+')" data-row="'+i+'">✏️</button><button class="icon-btn btn-elimina" onclick="elimina('+i+')" data-row="'+i+'">🗑️</button>';
      });
      mountTarget.innerHTML = '';
      mountTarget.appendChild(table);
      const btnNuovo = mountTarget.parentElement?.querySelector('button.btn-success');
      if (btnNuovo) btnNuovo.onclick = () => window.nuovo && window.nuovo();
    }
  } catch (err) {
    console.error('Errore caricamento', err);
    mountTarget.innerHTML = '<div class="text-danger">Errore caricamento dati</div>';
  }
};
