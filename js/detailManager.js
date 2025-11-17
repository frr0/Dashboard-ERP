// detailManager.js - Gestisce i dettagli delle tabelle

// Variabili globali per tenere traccia dei dati
window.detailManager = {
  selectedRows: {},
  originalData: {},
  grids: {}
};

// Inizializza la gestione dei dettagli per una tabella
function initDetailManager(entityName, data, grid, fieldMapping) {
  // Salva i dati originali
  window.detailManager.originalData[entityName] = data;
  window.detailManager.grids[entityName] = grid;
  window.detailManager.selectedRows[entityName] = null;

  // Nascondi il form di dettaglio all'inizio
  var detailDiv = document.getElementById(entityName + '-detail');
  if (detailDiv) {
    detailDiv.style.display = 'none';
  }

  // Configura il click sulle righe
  setupRowClick(entityName, fieldMapping);

  // Configura i pulsanti
  setupButtons(entityName, data, grid, fieldMapping);
}

// Configura il listener per il click sulle righe
function setupRowClick(entityName, fieldMapping) {
  var gridDiv = document.getElementById(entityName + '-grid');
  if (!gridDiv) {
    return;
  }

  // Aspetta che la tabella sia renderizzata
  setTimeout(function() {
    var table = gridDiv.querySelector('table');
    if (!table) {
      return;
    }

    // Rimuovi eventuali vecchi listener
    table.onclick = null;

    // Aggiungi il listener per il click
    table.addEventListener('click', function(event) {
      var row = event.target.closest('tr');
      
      // Se non è una riga o è l'header, ignora
      if (!row || row.parentElement.tagName === 'THEAD') {
        return;
      }

      // Rimuovi la selezione da tutte le righe
      var allRows = table.querySelectorAll('tr');
      for (var i = 0; i < allRows.length; i++) {
        allRows[i].classList.remove('selected-row');
        // Rimuovi anche gli stili inline dalle celle
        var cells = allRows[i].querySelectorAll('td');
        for (var j = 0; j < cells.length; j++) {
          cells[j].style.backgroundColor = '';
        }
      }
      
      // Aggiungi la classe alla riga cliccata
      row.classList.add('selected-row');
      
      // Forza il background azzurro su tutte le celle della riga selezionata
      var selectedCells = row.querySelectorAll('td');
      for (var k = 0; k < selectedCells.length; k++) {
        selectedCells[k].style.backgroundColor = '#2196f3';
        selectedCells[k].style.color = '#fff';
      }

      // Leggi i dati dalla riga
      var cells = row.querySelectorAll('td');
      var rowData = {};
      
      // Il primo campo è sempre l'ID
      var fields = Object.keys(fieldMapping);
      var idField = fields[0];
      
      if (cells[0]) {
        rowData[idField] = cells[0].textContent.trim();
      }

      // Trova i dati completi nell'array originale
      var fullData = null;
      var dataArray = window.detailManager.originalData[entityName];
      
      for (var i = 0; i < dataArray.length; i++) {
        if (String(dataArray[i][idField]) === String(rowData[idField])) {
          fullData = dataArray[i];
          break;
        }
      }

      // Se abbiamo trovato i dati, popola il form
      if (fullData) {
        window.detailManager.selectedRows[entityName] = fullData;
        fillForm(entityName, fullData, fieldMapping);
        
        // Mostra il form di dettaglio
        var detailDiv = document.getElementById(entityName + '-detail');
        if (detailDiv) {
          detailDiv.style.display = 'block';
        }
      }
    });

    // Se c'è una riga già selezionata, riselezionala
    var selectedData = window.detailManager.selectedRows[entityName];
    if (selectedData) {
      var fields = Object.keys(fieldMapping);
      var idField = fields[0];
      var rows = table.querySelectorAll('tbody tr');
      
      for (var i = 0; i < rows.length; i++) {
        var cell = rows[i].querySelector('td');
        if (cell && String(cell.textContent.trim()) === String(selectedData[idField])) {
          rows[i].classList.add('selected-row');
          // Forza il background azzurro su tutte le celle
          var cells = rows[i].querySelectorAll('td');
          for (var j = 0; j < cells.length; j++) {
            cells[j].style.backgroundColor = '#2196f3';
            cells[j].style.color = '#fff';
          }
        }
      }
    }
  }, 500);
}

// Riempie il form con i dati della riga
function fillForm(entityName, data, fieldMapping) {
  var fields = Object.keys(fieldMapping);
  
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var inputId = fieldMapping[field];
    var input = document.getElementById(inputId);
    
    if (input) {
      var value = data[field];
      
      if (input.type === 'checkbox') {
        input.checked = (value == 1 || value === true);
      } else {
        if (value !== null && value !== undefined) {
          input.value = value;
        } else {
          input.value = '';
        }
      }
    }
  }
}

// Legge i dati dal form
function getFormData(entityName, fieldMapping) {
  var data = {};
  var fields = Object.keys(fieldMapping);
  
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var inputId = fieldMapping[field];
    var input = document.getElementById(inputId);
    
    if (input) {
      if (input.type === 'checkbox') {
        data[field] = input.checked ? 1 : 0;
      } else if (input.type === 'number') {
        if (input.value) {
          data[field] = parseFloat(input.value);
        } else {
          data[field] = null;
        }
      } else {
        data[field] = input.value || null;
      }
    }
  }
  
  return data;
}

// Pulisce il form
function clearForm(entityName, fieldMapping) {
  var fields = Object.keys(fieldMapping);
  
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var inputId = fieldMapping[field];
    var input = document.getElementById(inputId);
    
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
    }
  }
  
  // Deseleziona la riga
  window.detailManager.selectedRows[entityName] = null;
  
  var gridDiv = document.getElementById(entityName + '-grid');
  if (gridDiv) {
    var selectedRows = gridDiv.querySelectorAll('tr.selected-row');
    for (var i = 0; i < selectedRows.length; i++) {
      selectedRows[i].classList.remove('selected-row');
    }
  }
}

// Configura i pulsanti (Nuovo, Salva, Elimina, Aggiorna, Export)
function setupButtons(entityName, data, grid, fieldMapping) {
  var fields = Object.keys(fieldMapping);
  var idField = fields[0];

  // Pulsante NUOVO
  var btnNew = document.getElementById(entityName + '-new');
  if (btnNew) {
    btnNew.addEventListener('click', function() {
      clearForm(entityName, fieldMapping);
      
      // Mostra il form
      var detailDiv = document.getElementById(entityName + '-detail');
      if (detailDiv) {
        detailDiv.style.display = 'block';
      }
      
      // Genera un nuovo ID
      var maxId = 0;
      var dataArray = window.detailManager.originalData[entityName];
      
      for (var i = 0; i < dataArray.length; i++) {
        var currentId = dataArray[i][idField] || 0;
        if (currentId > maxId) {
          maxId = currentId;
        }
      }
      
      var newId = maxId + 1;
      var idInput = document.getElementById(fieldMapping[idField]);
      if (idInput) {
        idInput.value = newId;
      }
    });
  }

  // Pulsante SALVA
  var btnSave = document.getElementById(entityName + '-save');
  if (btnSave) {
    btnSave.addEventListener('click', function() {
      var formData = getFormData(entityName, fieldMapping);
      var selectedRow = window.detailManager.selectedRows[entityName];

      if (selectedRow) {
        // Modifica esistente
        var dataArray = window.detailManager.originalData[entityName];
        var index = -1;
        
        for (var i = 0; i < dataArray.length; i++) {
          if (dataArray[i][idField] === selectedRow[idField]) {
            index = i;
            break;
          }
        }
        
        if (index !== -1) {
          window.detailManager.originalData[entityName][index] = formData;
          var entityNameCapitalized = entityName.charAt(0).toUpperCase() + entityName.slice(1);
          alert(entityNameCapitalized + ' aggiornato con successo!');
        }
      } else {
        // Nuovo inserimento
        window.detailManager.originalData[entityName].push(formData);
        var itemName = entityName.slice(0, -1);
        alert('Nuovo ' + itemName + ' aggiunto con successo!');
      }

      // Aggiorna la griglia
      updateGrid(entityName, grid, fieldMapping);
      clearForm(entityName, fieldMapping);
    });
  }

  // Pulsante ELIMINA
  var btnDelete = document.getElementById(entityName + '-delete');
  if (btnDelete) {
    btnDelete.addEventListener('click', function() {
      var selectedRow = window.detailManager.selectedRows[entityName];
      
      if (!selectedRow) {
        alert('Seleziona una riga da eliminare');
        return;
      }

      var itemName = entityName.slice(0, -1);
      var confirmDelete = confirm('Sei sicuro di voler eliminare questo ' + itemName + '?');
      
      if (confirmDelete) {
        var dataArray = window.detailManager.originalData[entityName];
        var index = -1;
        
        for (var i = 0; i < dataArray.length; i++) {
          if (dataArray[i][idField] === selectedRow[idField]) {
            index = i;
            break;
          }
        }
        
        if (index !== -1) {
          window.detailManager.originalData[entityName].splice(index, 1);
          var entityNameCapitalized = entityName.charAt(0).toUpperCase() + entityName.slice(1);
          alert(entityNameCapitalized + ' eliminato con successo!');
          
          updateGrid(entityName, grid, fieldMapping);
          clearForm(entityName, fieldMapping);
          
          // Nascondi il form
          var detailDiv = document.getElementById(entityName + '-detail');
          if (detailDiv) {
            detailDiv.style.display = 'none';
          }
        }
      }
    });
  }

  // Pulsante AGGIORNA
  var btnRefresh = document.getElementById(entityName + '-refresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', function() {
      updateGrid(entityName, grid, fieldMapping);
      clearForm(entityName, fieldMapping);
      alert('Dati aggiornati!');
    });
  }

  // Pulsante EXPORT
  var btnExport = document.getElementById(entityName + '-export');
  if (btnExport) {
    btnExport.addEventListener('click', function() {
      exportData(entityName, window.detailManager.originalData[entityName], fieldMapping);
    });
  }
}

// Aggiorna la griglia
function updateGrid(entityName, grid, fieldMapping) {
  var data = window.detailManager.originalData[entityName];
  var mappedData = [];
  
  for (var i = 0; i < data.length; i++) {
    var row = [];
    var fields = Object.keys(fieldMapping);
    
    for (var j = 0; j < fields.length; j++) {
      row.push(data[i][fields[j]]);
    }
    
    mappedData.push(row);
  }
  
  grid.updateConfig({ data: mappedData }).forceRender();
  
  // Riconfigura il listener dopo il refresh
  setTimeout(function() {
    setupRowClick(entityName, fieldMapping);
  }, 300);
}

// Esporta i dati in Excel (CSV)
function exportData(entityName, data, fieldMapping) {
  if (!data || data.length === 0) {
    alert('Nessun dato da esportare');
    return;
  }

  // Crea le intestazioni
  var fields = Object.keys(fieldMapping);
  var headers = fields.join(',');
  
  // Crea le righe
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    var rowValues = [];
    
    for (var j = 0; j < fields.length; j++) {
      var field = fields[j];
      var value = data[i][field];
      
      if (value === null || value === undefined) {
        rowValues.push('');
      } else {
        var strValue = String(value);
        
        // Se contiene virgole o virgolette, racchiudi tra virgolette
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          strValue = '"' + strValue.replace(/"/g, '""') + '"';
        }
        
        rowValues.push(strValue);
      }
    }
    
    rows.push(rowValues.join(','));
  }

  var csv = headers + '\n' + rows.join('\n');
  
  // Crea il file e scaricalo
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  var url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', entityName + '_export_' + Date.now() + '.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Aggiungi lo stile CSS per le righe selezionate
var style = document.createElement('style');
style.textContent = '\n' +
  '  .gridjs-tbody tr.selected-row td.gridjs-td,\n' +
  '  .gridjs-tbody tr.selected-row:nth-child(odd) td.gridjs-td,\n' +
  '  .gridjs-tbody tr.selected-row:nth-child(even) td.gridjs-td,\n' +
  '  .gridjs-tbody tr.selected-row td[class*="gridjs-td"],\n' +
  '  tbody tr.selected-row td {\n' +
  '    background-color: #2196f3 !important;\n' +
  '    background: #2196f3 !important;\n' +
  '    color: #fff !important;\n' +
  '    border-color: #1976d2 !important;\n' +
  '  }\n' +
  '  .gridjs-tbody tr.selected-row,\n' +
  '  .gridjs-tbody tr.selected-row:nth-child(odd),\n' +
  '  .gridjs-tbody tr.selected-row:nth-child(even) {\n' +
  '    background-color: #2196f3 !important;\n' +
  '    background: #2196f3 !important;\n' +
  '  }\n' +
  '  .gridjs-tbody tr.selected-row:hover td.gridjs-td,\n' +
  '  .gridjs-tbody tr.selected-row:hover td {\n' +
  '    background-color: #1e88e5 !important;\n' +
  '    background: #1e88e5 !important;\n' +
  '    color: #fff !important;\n' +
  '  }\n';
document.head.appendChild(style);
