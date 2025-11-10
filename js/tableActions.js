// tableActions.js
// Gestione bottoni Modifica / Elimina / Nuovo e modale

let rigaCorrente = null;
let tabellaCorrenteNuovo = null;

window.initModalAndTableActions = function initModalAndTableActions() {
  window.myModal = new bootstrap.Modal(document.getElementById('popup-modifica'));
  document.addEventListener('click', onDocumentClick_TableActions);
  const salva = document.getElementById('salva-modifica'); if (salva) salva.addEventListener('click', handleSave);
  const annulla = document.getElementById('annulla-modifica'); if (annulla) annulla.addEventListener('click', () => window.myModal.hide());
};

function onDocumentClick_TableActions(e) {
  const t = e.target;
  if (t.classList.contains('btn-elimina')) {
    if (confirm('Vuoi davvero eliminare questa riga?')) t.closest('tr').remove();
  } else if (t.classList.contains('btn-modifica')) {
    rigaCorrente = t.closest('tr');
    const celle = Array.from(rigaCorrente.querySelectorAll('td:not(.azioni)'));
    const table = rigaCorrente.closest('table');
    const headers = table ? Array.from(table.querySelectorAll('thead th')) : [];
    let html = '';
    celle.forEach((td,i)=>{
      const label = headers[i] ? headers[i].textContent : `Campo ${i+1}`;
      html += `<div class="mb-3"><label for="input-${i}" class="form-label">${label}</label><input type="text" id="input-${i}" class="form-control" data-index="${i}" value="${td.textContent}"></div>`;
    });
    const cont = document.getElementById('popup-contenuto'); if (cont) cont.innerHTML = html; window.myModal.show();
  } else if (t.classList.contains('btn-success')) {
    // NUOVO
    const area = document.getElementById('area-principale');
    const table = area ? area.querySelector('.table-container table') : null;
    if (!table) return;
    tabellaCorrenteNuovo = table;
    const headers = Array.from(table.querySelectorAll('thead th'));
    let html = '';
    headers.forEach((th,i)=>{
      if (th.classList.contains('azioni')) return;
      const label = th.textContent || `Campo ${i+1}`;
      html += `<div class=\"mb-3\"><label for=\"input-${i}\" class=\"form-label\">${label}</label><input type=\"text\" id=\"input-${i}\" class=\"form-control\" data-index=\"${i}\" value=\"\"></div>`;
    });
    rigaCorrente = null;
    const cont = document.getElementById('popup-contenuto'); if (cont) cont.innerHTML = html; window.myModal.show();
  }
}

function handleSave() {
  const inputs = document.querySelectorAll('#popup-contenuto input');
  if (rigaCorrente) {
    inputs.forEach(inp => {
      const idx = parseInt(inp.dataset.index);
      const cell = rigaCorrente.querySelectorAll('td:not(.azioni)')[idx];
      if (cell) cell.textContent = inp.value;
    });
  } else {
    // nuova riga
    let tbody = null;
    if (tabellaCorrenteNuovo && tabellaCorrenteNuovo.closest('.table-container')) {
      tbody = tabellaCorrenteNuovo.closest('.table-container').querySelector('tbody');
    }
    if (!tbody) {
      const container = document.querySelector('#area-principale .table-container');
      tbody = container ? container.querySelector('tbody') : null;
    }
    if (tbody) {
      const tr = document.createElement('tr');
      inputs.forEach(inp => { const td = document.createElement('td'); td.textContent = inp.value; tr.appendChild(td); });
      const act = document.createElement('td'); act.className='azioni'; act.innerHTML='<button class="btn-modifica">✏️</button><button class="btn-elimina">🗑️</button>'; tr.appendChild(act);
      tbody.appendChild(tr);
    }
  }
  rigaCorrente = null; tabellaCorrenteNuovo = null; window.myModal.hide();
}
