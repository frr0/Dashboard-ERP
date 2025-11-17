// detailManager.js - Gestione dettagli e operazioni CRUD per tutte le pagine

// Stato globale per tracciare la riga selezionata
window.detailManager = {
  selectedRows: {},
  originalData: {},
  grids: {}
};

/**
 * Inizializza la gestione dei dettagli per una pagina specifica
 * @param {string} entityName - Nome dell'entità (es. 'clienti', 'prodotti', etc.)
 * @param {Array} data - Array di dati
 * @param {Object} grid - Istanza Grid.js
 * @param {Object} fieldMapping - Mapping tra campi del form e campi dei dati
 */
function initDetailManager(entityName, data, grid, fieldMapping) {
  window.detailManager.originalData[entityName] = data;
  window.detailManager.grids[entityName] = grid;
  window.detailManager.selectedRows[entityName] = null;

  // Nascondi il form di dettaglio all'inizio
  const detailDiv = document.getElementById(`${entityName}-detail`);
  if (detailDiv) {
    detailDiv.style.display = 'none';
  }

  // Aggiungi listener per il click sulle righe della tabella
  setupRowClickListener(entityName, fieldMapping);

  // Setup pulsanti
  setupButtons(entityName, data, grid, fieldMapping);
}

/**
 * Configura il listener per il click sulle righe
 */
function setupRowClickListener(entityName, fieldMapping) {
  const gridDiv = document.getElementById(`${entityName}-grid`);
  if (!gridDiv) return;

  // Usa event delegation per gestire i click sulle righe
  setTimeout(() => {
    const table = gridDiv.querySelector('table');
    if (!table) return;

    // Rimuovi eventuali vecchi listener
    table.onclick = null;

    table.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      if (!row || row.parentElement.tagName === 'THEAD') return;

      // Rimuovi selezione precedente
      table.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
      row.classList.add('selected-row');

      // Estrai i dati dalla riga
      const cells = row.querySelectorAll('td');
      const rowData = {};
      // Il primo campo è sempre l'ID
      const idField = Object.keys(fieldMapping)[0];
      rowData[idField] = cells[0]?.textContent.trim();

      // Trova i dati completi dall'array originale
      const fullData = window.detailManager.originalData[entityName].find(
        item => String(item[idField]) === String(rowData[idField])
      );

      if (fullData) {
        window.detailManager.selectedRows[entityName] = fullData;
        populateForm(entityName, fullData, fieldMapping);
        // Mostra il form di dettaglio
        const detailDiv = document.getElementById(`${entityName}-detail`);
        if (detailDiv) {
          detailDiv.style.display = 'block';
        }
      }
    });

    // Se c'è una selezione, riseleziona la riga dopo il refresh
    const selected = window.detailManager.selectedRows[entityName];
    if (selected) {
      const idField = Object.keys(fieldMapping)[0];
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cell = row.querySelector('td');
        if (cell && String(cell.textContent.trim()) === String(selected[idField])) {
          row.classList.add('selected-row');
        }
      });
    }
  }, 500);
}

/**
 * Popola il form con i dati della riga selezionata
 */
function populateForm(entityName, data, fieldMapping) {
  Object.keys(fieldMapping).forEach(field => {
    const inputId = fieldMapping[field];
    const input = document.getElementById(inputId);
    if (input) {
      const value = data[field];
      if (input.type === 'checkbox') {
        input.checked = value == 1 || value === true;
      } else {
        input.value = value !== null && value !== undefined ? value : '';
      }
    }
  });
}

/**
 * Raccoglie i dati dal form
 */
function collectFormData(entityName, fieldMapping) {
  const data = {};
  Object.keys(fieldMapping).forEach(field => {
    const inputId = fieldMapping[field];
    const input = document.getElementById(inputId);
    if (input) {
      if (input.type === 'checkbox') {
        data[field] = input.checked ? 1 : 0;
      } else if (input.type === 'number') {
        data[field] = input.value ? parseFloat(input.value) : null;
      } else {
        data[field] = input.value || null;
      }
    }
  });
  return data;
}

/**
 * Pulisce il form
 */
function clearForm(entityName, fieldMapping) {
  Object.keys(fieldMapping).forEach(field => {
    const inputId = fieldMapping[field];
    const input = document.getElementById(inputId);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else if (input.hasAttribute('readonly')) {
        input.value = '';
      } else {
        input.value = '';
      }
    }
  });
  
  // Deseleziona riga
  window.detailManager.selectedRows[entityName] = null;
  const gridDiv = document.getElementById(`${entityName}-grid`);
  if (gridDiv) {
    gridDiv.querySelectorAll('tr.selected-row').forEach(r => r.classList.remove('selected-row'));
  }
}

/**
 * Configura i pulsanti (Nuovo, Salva, Elimina, Aggiorna, Export)
 */
function setupButtons(entityName, data, grid, fieldMapping) {
  const idField = Object.keys(fieldMapping)[0];

  // Pulsante NUOVO
  const btnNew = document.getElementById(`${entityName}-new`);
  if (btnNew) {
    btnNew.addEventListener('click', () => {
      clearForm(entityName, fieldMapping);
      
      // Mostra il form di dettaglio
      const detailDiv = document.getElementById(`${entityName}-detail`);
      if (detailDiv) {
        detailDiv.style.display = 'block';
      }
      
      // Genera un nuovo ID
      const maxId = Math.max(...window.detailManager.originalData[entityName].map(item => item[idField] || 0), 0);
      const idInput = document.getElementById(fieldMapping[idField]);
      if (idInput) {
        idInput.value = maxId + 1;
      }
    });
  }

  // Pulsante SALVA
  const btnSave = document.getElementById(`${entityName}-save`);
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const formData = collectFormData(entityName, fieldMapping);
      const selectedRow = window.detailManager.selectedRows[entityName];

      if (selectedRow) {
        // Modifica esistente
        const index = window.detailManager.originalData[entityName].findIndex(
          item => item[idField] === selectedRow[idField]
        );
        if (index !== -1) {
          window.detailManager.originalData[entityName][index] = { ...formData };
          alert(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} aggiornato con successo!`);
        }
      } else {
        // Nuovo inserimento
        window.detailManager.originalData[entityName].push(formData);
        alert(`Nuovo ${entityName.slice(0, -1)} aggiunto con successo!`);
      }

      // Aggiorna la griglia
      refreshGrid(entityName, grid, fieldMapping);
      clearForm(entityName, fieldMapping);
    });
  }

  // Pulsante ELIMINA
  const btnDelete = document.getElementById(`${entityName}-delete`);
  if (btnDelete) {
    btnDelete.addEventListener('click', () => {
      const selectedRow = window.detailManager.selectedRows[entityName];
      if (!selectedRow) {
        alert('Seleziona una riga da eliminare');
        return;
      }

      if (confirm(`Sei sicuro di voler eliminare questo ${entityName.slice(0, -1)}?`)) {
        const index = window.detailManager.originalData[entityName].findIndex(
          item => item[idField] === selectedRow[idField]
        );
        if (index !== -1) {
          window.detailManager.originalData[entityName].splice(index, 1);
          alert(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} eliminato con successo!`);
          refreshGrid(entityName, grid, fieldMapping);
          clearForm(entityName, fieldMapping);
          
          // Nascondi il form dopo l'eliminazione
          const detailDiv = document.getElementById(`${entityName}-detail`);
          if (detailDiv) {
            detailDiv.style.display = 'none';
          }
        }
      }
    });
  }

  // Pulsante AGGIORNA
  const btnRefresh = document.getElementById(`${entityName}-refresh`);
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      refreshGrid(entityName, grid, fieldMapping);
      clearForm(entityName, fieldMapping);
      alert('Dati aggiornati!');
    });
  }

  // Pulsante EXPORT
  const btnExport = document.getElementById(`${entityName}-export`);
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      exportToExcel(entityName, window.detailManager.originalData[entityName], fieldMapping);
    });
  }
}

/**
 * Aggiorna la griglia
 */
function refreshGrid(entityName, grid, fieldMapping) {
  const data = window.detailManager.originalData[entityName];
  const rowMapper = createRowMapper(fieldMapping);
  grid.updateConfig({ data: data.map(rowMapper) }).forceRender();
  
  // Ri-configura il listener dopo il refresh
  setTimeout(() => setupRowClickListener(entityName, fieldMapping), 300);
}

/**
 * Crea una funzione mapper per le righe
 */
function createRowMapper(fieldMapping) {
  return function(item) {
    return Object.keys(fieldMapping).map(field => item[field]);
  };
}

/**
 * Esporta i dati in Excel (CSV)
 */
function exportToExcel(entityName, data, fieldMapping) {
  if (!data || data.length === 0) {
    alert('Nessun dato da esportare');
    return;
  }

  // Crea intestazioni
  const headers = Object.keys(fieldMapping).join(',');
  
  // Crea righe
  const rows = data.map(item => {
    return Object.keys(fieldMapping).map(field => {
      const value = item[field];
      // Gestisci valori con virgole o virgolette
      if (value === null || value === undefined) return '';
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',');
  }).join('\n');

  const csv = headers + '\n' + rows;
  
  // Download del file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${entityName}_export_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Aggiungi stile CSS per la riga selezionata (più forte - sovrascrive tutti gli stili di Grid.js)
const style = document.createElement('style');
style.textContent = `
  .gridjs-tbody tr.selected-row td.gridjs-td,
  .gridjs-tbody tr.selected-row:nth-child(odd) td.gridjs-td,
  .gridjs-tbody tr.selected-row:nth-child(even) td.gridjs-td,
  .gridjs-tbody tr.selected-row td[class*="gridjs-td"],
  tbody tr.selected-row td {
    background-color: #2196f3 !important;
    background: #2196f3 !important;
    color: #fff !important;
    border-color: #1976d2 !important;
  }
  .gridjs-tbody tr.selected-row,
  .gridjs-tbody tr.selected-row:nth-child(odd),
  .gridjs-tbody tr.selected-row:nth-child(even) {
    background-color: #2196f3 !important;
    background: #2196f3 !important;
  }
  .gridjs-tbody tr.selected-row:hover td.gridjs-td,
  .gridjs-tbody tr.selected-row:hover td {
    background-color: #1e88e5 !important;
    background: #1e88e5 !important;
    color: #fff !important;
  }
`;
document.head.appendChild(style);
