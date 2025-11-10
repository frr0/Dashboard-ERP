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
        if (tr) tr.remove();
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
          tdAzioni.innerHTML = '<button class="btn-modifica">✏️</button><button class="btn-elimina">🗑️</button>';
          tr.appendChild(tdAzioni);
          tbody.appendChild(tr);
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
