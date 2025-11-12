// Vanilla JS: gestione Modifica / Elimina / Nuovo e modale
let rigaCorrente = null;
let tabellaPerNuovo = null;

window.initModalAndTableActions = function () {
  window.myModal = new bootstrap.Modal(document.getElementById('popup-modifica'));

  document.addEventListener('click', function (e) {
    const target = e.target;

    // Elimina
    if (target.classList.contains('btn-elimina')) {
      if (confirm('Vuoi davvero eliminare questa riga?')) {
        const tr = target.closest('tr');
        const table = tr && tr.closest('table');
        if (tr && table && table._erpState) {
          const state = table._erpState;
          const globalIdx = parseInt(tr.dataset.globalIndex || '-1', 10);
          if (!isNaN(globalIdx)) {
            if (state.filteredItems) {
              // Ricostruisci filteredItems dopo la rimozione dall'origine
              const toRemove = (state.filteredItems ?? [])[globalIdx - (state.page - 1) * state.pageSize];
              const realIndex = state.items.indexOf(toRemove);
              if (realIndex >= 0) state.items.splice(realIndex, 1);
              // Ricrea filtro in base alla query corrente (non la conosciamo qui, quindi ricalcola mantenendo stessi criteri di search.js sarebbe complesso)
              // Semplice: rimuovi l'elemento anche da filteredItems e lasciala coerente
              state.filteredItems = state.filteredItems.filter(x => x !== toRemove);
            } else {
              state.items.splice(globalIdx, 1);
            }
          }
          // Se la pagina è oltre l'ultima a seguito della rimozione, rientra nei limiti
          const total = (state.filteredItems ?? state.items).length;
          const pages = Math.max(1, Math.ceil(total / state.pageSize));
          if (state.page > pages) state.page = pages;
          if (typeof window.__erpRenderPage === 'function') window.__erpRenderPage(table);
        } else if (tr) {
          tr.remove(); // fallback
        }
      }
      return;
    }

    // Modifica
    if (target.classList.contains('btn-modifica')) {
      rigaCorrente = target.closest('tr');
      if (!rigaCorrente) return;
      const celle = rigaCorrente.querySelectorAll('td:not(.azioni)');
      const table = rigaCorrente.closest('table');
      const ths = table ? table.querySelectorAll('thead th') : [];
      let html = '';
      celle.forEach((td, i) => {
        const valore = td.textContent;
        const label = ths[i] ? ths[i].textContent : `Campo ${i + 1}`;
        html += `<div class="mb-3"><label for="input-${i}" class="form-label">${label}</label><input type="text" id="input-${i}" class="form-control" data-index="${i}" value="${valore}"></div>`;
      });
      const popup = document.getElementById('popup-contenuto');
      if (popup) popup.innerHTML = html;
      window.myModal.show();
      return;
    }

    // Nuovo
    if (target.classList.contains('btn-success')) {
      const table = document.querySelector('#area-principale .table-container table');
      if (!table) return;
      tabellaPerNuovo = table;
      const ths = table.querySelectorAll('thead th');
      let html = '';
      ths.forEach((th, i) => {
        if (th.classList.contains('azioni')) return;
        const label = th.textContent || `Campo ${i + 1}`;
        html += `<div class="mb-3"><label for="input-${i}" class="form-label">${label}</label><input type="text" id="input-${i}" class="form-control" data-index="${i}" value=""></div>`;
      });
      rigaCorrente = null;
      const popup = document.getElementById('popup-contenuto');
      if (popup) popup.innerHTML = html;
      window.myModal.show();
      return;
    }
  });

  // Salva
  const salva = document.getElementById('salva-modifica');
  if (salva) {
    salva.addEventListener('click', function () {
      const inputs = document.querySelectorAll('#popup-contenuto input');
      if (rigaCorrente) {
        const celle = rigaCorrente.querySelectorAll('td:not(.azioni)');
        inputs.forEach(inp => {
          const idx = parseInt(inp.dataset.index);
          if (celle[idx]) celle[idx].textContent = inp.value;
        });
      } else if (tabellaPerNuovo) {
        if (tabellaPerNuovo._erpState) {
          const state = tabellaPerNuovo._erpState;
          const obj = {};
          inputs.forEach((inp, i) => {
            const field = tabellaPerNuovo._fieldOrder[i];
            obj[field] = inp.value;
          });
          state.items.push(obj);
          state.page = Math.ceil((state.filteredItems ? state.filteredItems.length : state.items.length) / state.pageSize);
          tabellaPerNuovo.dispatchEvent(new CustomEvent('erp-rerender-page', { bubbles: true }));
        } else {
          // Fallback: aggiunta diretta alla DOM
          const tbody = tabellaPerNuovo.querySelector('tbody');
          if (tbody) {
            const tr = document.createElement('tr');
            inputs.forEach(inp => {
              const td = document.createElement('td');
              td.textContent = inp.value;
              tr.appendChild(td);
            });
            const tdAzioni = document.createElement('td');
            tdAzioni.className = 'azioni';
            tdAzioni.innerHTML = '<button class="icon-btn btn-modifica" title="Modifica" aria-label="Modifica">✏️</button><button class="icon-btn btn-elimina" title="Elimina" aria-label="Elimina">🗑️</button>';
            tr.appendChild(tdAzioni);
            tbody.appendChild(tr);
          }
        }
      }
      rigaCorrente = null; tabellaPerNuovo = null; window.myModal.hide();
    });
  }

  const annulla = document.getElementById('annulla-modifica');
  if (annulla) {
    annulla.addEventListener('click', function () { window.myModal.hide(); });
  }
};
