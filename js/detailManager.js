// Variabili globali 
window.detailManager = {
  selectedRows: {},
  originalData: {},
  grids: {}
};

// Inizializzazione della gestione dei dettagli per una tabella
function initDetailManager(entityName, data, grid, fieldMapping) {
  // Salva i dati originali
  window.detailManager.originalData[entityName] = data;
  window.detailManager.grids[entityName] = grid;
  window.detailManager.selectedRows[entityName] = null;

  // Reset listener flags per permettere re-inizializzazione
  var buttons = ['new', 'save', 'delete', 'refresh', 'export'];
  for (var i = 0; i < buttons.length; i++) {
    var btn = document.getElementById(entityName + '-' + buttons[i]);
    if (btn && btn.dataset.listenerBound) {
      delete btn.dataset.listenerBound;
    }
  }

  // Form detail nascosto all'inizio
  var detailDiv = document.getElementById(entityName + '-detail');
  if (detailDiv) {
    detailDiv.style.display = 'none';
  }

  // click sulle righe
  setupRowClick(entityName, fieldMapping);

  // Configurazione dei pulsanti
  setupButtons(entityName, data, grid, fieldMapping);
}

// ROW CLICK HANDLER
  // ----------------------------------------------------------------------------------
// Configura il listener per il click sulle righe
function setupRowClick(entityName, fieldMapping) {
  var gridDiv = document.getElementById(entityName + '-grid');
  if (!gridDiv) {
    return;
  }

  // aspetto che la tabella sia renderizzata
  setTimeout(function() {
    var table = gridDiv.querySelector('table');
    if (!table) {
      return;
    }

    // cancellazione eventuali vecchi listener
    table.onclick = null;

    // Aggiunta listener per il click
    table.addEventListener('click', function(event) {
      var row = event.target.closest('tr');
      
      // Se non è una riga o è l'header, ignora
      if (!row || row.parentElement.tagName === 'THEAD') {
        return;
      }

      // Rimozione della selezione da tutte le righe
      var allRows = table.querySelectorAll('tr');
      for (var i = 0; i < allRows.length; i++) {
        allRows[i].classList.remove('selected-row');
      }

      // Aggiungo la classe alla riga cliccata
      row.classList.add('selected-row');
      // Leggo i dati dalla riga
      var cells = row.querySelectorAll('td');
      var rowData = {};
      // Il primo campo è l'ID
      var fields = Object.keys(fieldMapping);
      var idField = fields[0];
      
      if (cells[0]) {
        rowData[idField] = cells[0].textContent.trim();
      }

      // dati completi nell'array originale
      var fullData = null;
      var dataArray = window.detailManager.originalData[entityName];
      
      for (var i = 0; i < dataArray.length; i++) {
        if (String(dataArray[i][idField]) === String(rowData[idField])) {
          fullData = dataArray[i];
          break;
        }
      }

      // Se ci sono i dati, popola il form
      if (fullData) {
        //CHIAMO IL FILLFORM
        window.detailManager.selectedRows[entityName] = fullData;
        fillForm(entityName, fullData, fieldMapping);
        
        // Mostra il form di dettaglio
        var detailDiv = document.getElementById(entityName + '-detail');
        if (detailDiv) {
          detailDiv.style.display = 'block';
        }
        
        // Se è un ordine, carica i dettagli dei prodotti acquistati
        if (entityName === 'orders' && fullData.order_id) {
          loadOrderDetails(fullData.order_id);
        }
      }
    });
  }, 500);
}

// FILLFORM
  // ----------------------------------------------------------------------------------

// Riempie il form con i dati della riga
function fillForm(entityName, data, fieldMapping) {
  var fields = Object.keys(fieldMapping);
  
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var inputId = fieldMapping[field];
    var input = document.getElementById(inputId);
    if (input) {
      var value = data[field];
      // Conversione formato data per input type="date"
      if (input.type === 'date' && typeof value === 'string' && value.match(/\d{2}-[A-Z]{3}-\d{2}/)) {
        // Esempio: 09-DEC-96 => 1996-12-09
        var months = {
          'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
          'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
        };
        var parts = value.split('-');
        if (parts.length === 3) {
          var day = parts[0];
          var month = months[parts[1].toUpperCase()] || '01';
          var year = parts[2];
          // Gestione anni 2 cifre: 00-49 => 2000-2049, 50-99 => 1950-1999
          var yearNum = parseInt(year, 10);
          if (yearNum < 50) {
            year = '20' + (yearNum < 10 ? '0' : '') + yearNum;
          } else {
            year = '19' + year;
          }
          value = year + '-' + month + '-' + day;
        }
      }
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

// Configurazione dei pulsanti (Nuovo, Salva, Elimina, Aggiorna, Export)
///////////////////////////////////////////////////////////////////////////////////////////////
function setupButtons(entityName, data, grid, fieldMapping) {
  var fields = Object.keys(fieldMapping);
  var idField = fields[0];

  // Pulsante NUOVO
  // --------------------------------------------------------------------------------
  var btnNew = document.getElementById(entityName + '-new');
  if (btnNew && !btnNew.dataset.listenerBound) {
    btnNew.dataset.listenerBound = '1';
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
  // --------------------------------------------------------------------------------
  var btnSave = document.getElementById(entityName + '-save');
  if (btnSave && !btnSave.dataset.listenerBound) {
    btnSave.dataset.listenerBound = '1';
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
        }
      } else {
        // Nuovo inserimento
        window.detailManager.originalData[entityName].push(formData);
      }

      // Aggiorna la griglia
      updateGrid(entityName, grid, fieldMapping);
      clearForm(entityName, fieldMapping);
    });
  }

  // Pulsante ELIMINA
  // --------------------------------------------------------------------------------
  var btnDelete = document.getElementById(entityName + '-delete');
  if (btnDelete && !btnDelete.dataset.listenerBound) {
    btnDelete.dataset.listenerBound = '1';
    btnDelete.addEventListener('click', function() {
      var selectedRow = window.detailManager.selectedRows[entityName];
      
      if (!selectedRow) {
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
          
          // Nascondi il form
          var detailDiv = document.getElementById(entityName + '-detail');
          if (detailDiv) {
            detailDiv.style.display = 'none';
          }
          
          clearForm(entityName, fieldMapping);
          updateGrid(entityName, grid, fieldMapping);
        }
      }
    });
  }

  // Pulsante AGGIORNA
  // --------------------------------------------------------------------------------
  var btnRefresh = document.getElementById(entityName + '-refresh');
  if (btnRefresh && !btnRefresh.dataset.listenerBound) {
    btnRefresh.dataset.listenerBound = '1';
    btnRefresh.addEventListener('click', function() {
      updateGrid(entityName, grid, fieldMapping);
      clearForm(entityName, fieldMapping);
    });
  }

  // Pulsante EXPORT
  // --------------------------------------------------------------------------------
  var btnExport = document.getElementById(entityName + '-export');
  if (btnExport && !btnExport.dataset.listenerBound) {
    btnExport.dataset.listenerBound = '1';
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
  // --------------------------------------------------------------------------------
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

// Funzione per caricare i dettagli dei prodotti di un ordine
async function loadOrderDetails(orderId) {
  var linesGridDiv = document.getElementById('lines-grid');
  if (!linesGridDiv) {
    return;
  }

  try {
    // Carica i dati dei dettagli ordine
    var response = await fetch('json/orderDetails.json');
    var data = await response.json();
    var orderDetails = [];
    
    if (data && data.results && data.results[0] && data.results[0].items) {
      orderDetails = data.results[0].items;
    }

    // Filtra i dettagli per l'ordine selezionato
    var filteredDetails = orderDetails.filter(function(detail) {
      return detail.order_id === orderId;
    });

    // Carica i dati dei prodotti per ottenere i nomi
    var productsResponse = await fetch('json/products.json');
    var productsData = await productsResponse.json();
    var products = [];
    
    if (productsData && productsData.results && productsData.results[0] && productsData.results[0].items) {
      products = productsData.results[0].items;
    }

    // Crea una mappa prodotto_id -> nome_prodotto
    var productMap = {};
    for (var i = 0; i < products.length; i++) {
      productMap[products[i].product_id] = products[i].product_name;
    }

    // Prepara i dati per la griglia
    var gridData = [];
    for (var i = 0; i < filteredDetails.length; i++) {
      var detail = filteredDetails[i];
      var productName = productMap[detail.product_id] || 'N/A';
      var subtotal = detail.unit_price * detail.quantity * (1 - detail.discount);
      
      gridData.push([
        detail.product_id,
        productName,
        detail.unit_price.toFixed(2),
        detail.quantity,
        (detail.discount * 100).toFixed(0) + '%',
        subtotal.toFixed(2)
      ]);
    }

    // Distruggi la griglia esistente se presente
    if (window.detailManager.orderLinesGrid) {
      window.detailManager.orderLinesGrid.destroy();
    }

    // Crea la nuova griglia
    var linesGrid = new gridjs.Grid({
      columns: [
        { id: 'product_id', name: 'ID Prodotto', width: '100px' },
        { id: 'product_name', name: 'Nome Prodotto' },
        { id: 'unit_price', name: 'Prezzo Unitario', width: '120px' },
        { id: 'quantity', name: 'Quantità', width: '100px' },
        { id: 'discount', name: 'Sconto', width: '100px' },
        { id: 'subtotal', name: 'Subtotale €', width: '120px' }
      ],
      data: gridData,
      pagination: { enabled: true, limit: 10 },
      sort: true,
      resizable: true,
      className: { table: 'table table-dark table-striped mb-0' }
    });

    linesGrid.render(linesGridDiv);
    linesGridDiv.dataset.gridjsInit = '1';
    
    // Salva la griglia per future operazioni
    window.detailManager.orderLinesGrid = linesGrid;

  } catch (error) {
    console.error('Errore nel caricamento dei dettagli ordine:', error);
  }
}
