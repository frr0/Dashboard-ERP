// Variabili globali 
window.detailManager = {
  selectedRows: {},
  originalData: {},
  grids: {},
  filteredData: {},
  rowMappers: {}
};

// Inizializzazione della gestione dei dettagli per una tabella
function initDetailManager(entityName, data, grid, fieldMapping, rowMapper) {
  // Salva i dati originali
  window.detailManager.originalData[entityName] = data;
  window.detailManager.grids[entityName] = grid;
  window.detailManager.selectedRows[entityName] = null;
  window.detailManager.rowMappers[entityName] = rowMapper;

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
function setupRowClick(entityName, fieldMapping) {
  var gridDiv = document.getElementById(entityName + '-grid');
  if (!gridDiv) return;

  // Evita di attaccare più listener allo stesso div
  if (gridDiv.dataset.rowClickListenerAttached) return;
  gridDiv.dataset.rowClickListenerAttached = 'true';

  gridDiv.addEventListener('click', function(event) {
    // Intercetta il click su una riga (standard table)
    var clickedRow = event.target.closest('tr');
    if (!clickedRow) return;

    console.log('Click su riga:', clickedRow); // Debug

    // Ignora click sull'header
    if (clickedRow.closest('thead')) return;
    if (!clickedRow.closest('tbody')) return;

    // --- Logica di selezione ---
    
    // Trova la riga precedentemente selezionata NEL CONTAINER CORRENTE
    var previouslySelectedRow = gridDiv.querySelector('tr.riga-selezionata');
    var isAlreadySelected = clickedRow.classList.contains('riga-selezionata');
    
    // Se c'era una riga selezionata e non è quella appena cliccata, deselezionala.
    if (previouslySelectedRow && previouslySelectedRow !== clickedRow) {
      previouslySelectedRow.classList.remove('riga-selezionata');
      previouslySelectedRow.setAttribute('aria-selected', 'false');
    }

    // Attiva/disattiva la selezione sulla riga corrente
    if (isAlreadySelected) {
        // Se era già selezionata, la deselezioniamo (toggle behavior)
        clickedRow.classList.remove('riga-selezionata');
        clickedRow.setAttribute('aria-selected', 'false');
    } else {
        // Altrimenti la selezioniamo
        clickedRow.classList.add('riga-selezionata');
        clickedRow.setAttribute('aria-selected', 'true');
    }
    
    var isNowSelected = clickedRow.classList.contains('riga-selezionata');

    // Gestisci il form dei dettagli
    var detailDiv = document.getElementById(entityName + '-detail');

    if (isNowSelected) {
      // La riga è stata selezionata: popola e mostra il form
      var cells = clickedRow.querySelectorAll('td');
      var idField = Object.keys(fieldMapping)[0];
      // Assumiamo che la prima colonna sia l'ID
      var idValue = cells[0] ? cells[0].textContent.trim() : null;

      var fullData = null;
      if (idValue) {
        var dataArray = window.detailManager.originalData[entityName] || [];
        fullData = dataArray.find(function(item) {
          return String(item[idField]) === String(idValue);
        });
      }

      if (fullData) {
        window.detailManager.selectedRows[entityName] = fullData;
        fillForm(entityName, fullData, fieldMapping);
        if (detailDiv) detailDiv.style.display = 'block';

        // Logica specifica per ordini
        if (entityName === 'orders' && fullData.order_id) {
          if (typeof loadOrderDetails === 'function') {
            loadOrderDetails(fullData.order_id);
          }
        }
      }
    } else {
      // La riga è stata deselezionata: pulisci e nascondi il form
      window.detailManager.selectedRows[entityName] = null;
      clearForm(entityName, fieldMapping);
      if (detailDiv) detailDiv.style.display = 'none';
    }
  });
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
      forceSearchbarRefresh(entityName);
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
          forceSearchbarRefresh(entityName);
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
      forceSearchbarRefresh(entityName);
      clearForm(entityName, fieldMapping);
    });
  }

  // Pulsante EXPORT
  // --------------------------------------------------------------------------------
  var btnExport = document.getElementById(entityName + '-export');
  if (btnExport && !btnExport.dataset.listenerBound) {
    btnExport.dataset.listenerBound = '1';
    btnExport.addEventListener('click', function() {
      var dataToExport = (window.detailManager.filteredData && window.detailManager.filteredData[entityName])
        ? window.detailManager.filteredData[entityName]
        : window.detailManager.originalData[entityName];
      exportData(entityName, dataToExport, fieldMapping);
    });
  }
}

// Helper per ottenere l'input search corretto per ogni entity
function getSearchInput(entityName) {
  const map = {
    orders: 'order-search',
    clienti: 'clienti-search',
    prodotti: 'prodotti-search',
    categorie: 'categorie-search',
    dipendenti: 'dipendenti-search',
    fornitori: 'fornitori-search',
    spedizionieri: 'spedizionieri-search'
  };
  return document.getElementById(map[entityName] || (entityName + '-search'));
}

// Helper per forzare il refresh tramite searchbar
function forceSearchbarRefresh(entityName) {
  var searchInput = getSearchInput(entityName);
  if (searchInput) {
    searchInput.value = ' ';
    searchInput.dispatchEvent(new Event('input'));
  }
}

// Aggiorna la griglia
function updateGrid(entityName, grid, fieldMapping) {
  // Usa la grid salvata se quella passata è null/undefined
  var searchInput = document.getElementById(entityName + '-search');
  if (searchInput) searchInput.value = ' ';
  searchInput && searchInput.dispatchEvent(new Event('input'));
  if (!grid && window.detailManager.grids && window.detailManager.grids[entityName]) {
    grid = window.detailManager.grids[entityName];
  }
  
  if (!grid) {
    console.error('Grid non disponibile per', entityName);
    return;
  }
  
  var data = window.detailManager.originalData[entityName];
  var rowMapper = window.detailManager.rowMappers[entityName];
  
  if (!rowMapper) {
    console.error('rowMapper non disponibile per', entityName);
    return;
  }
  
  // Usa lo stesso metodo che funziona nella ricerca: mappa i dati con rowMapper
  var mappedData = data.map(rowMapper);
  
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
