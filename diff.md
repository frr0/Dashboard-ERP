diff --git a/.gitignore b/.gitignore
index e1bf04c..05b487d 100644
--- a/.gitignore
+++ b/.gitignore
@@ -1,2 +1,3 @@
 .github
-.vscode
\ No newline at end of file
+.vscode
+./html/login.html
\ No newline at end of file
diff --git a/README.md b/README.md
deleted file mode 100644
index 3c99faa..0000000
--- a/README.md
+++ /dev/null
@@ -1,2 +0,0 @@
-# Dashboard-ERP
-Dashboard-ERP
diff --git a/css/dashboard.css b/css/dashboard.css
index d64efbb..aae01fc 100644
--- a/css/dashboard.css
+++ b/css/dashboard.css
@@ -1,9 +1,3 @@
-/* Fix selezione riga Grid.js: forza colore su tutte le celle selezionate */
-.gridjs-tbody .gridjs-tr.selected-row,
-.gridjs-tbody .gridjs-tr.selected-row .gridjs-td {
-    background-color: #2196f3 !important;
-    color: #fff !important;
-}
 .card .card-body .text-muted {
     color: #fff !important;
 }
@@ -202,25 +196,6 @@ main {
 /* Bordi scuri per celle Grid.js */
 .gridjs-tbody .gridjs-td { border-color: #0c0e09 !important; }
 
-/* Tutte le righe Grid.js stesso colore verde - sovrascrivo anche nth-child */
-.gridjs-tbody .gridjs-tr:not(.selected-row) .gridjs-td,
-.gridjs-tbody .gridjs-tr:nth-child(odd):not(.selected-row) .gridjs-td,
-.gridjs-tbody .gridjs-tr:nth-child(even):not(.selected-row) .gridjs-td {
-  background-color: #292936 !important;
-  color: var(--app-text);
-}
-
-/* Hover: NON applicare se la riga è selezionata */
-.gridjs-tbody .gridjs-tr:not(.selected-row):hover .gridjs-td {
-  filter: brightness(1.2);
-}
-
-/* Stile per righe selezionate - azzurro */
-.gridjs-tbody .gridjs-tr.selected-row .gridjs-td {
-  background-color: #2196f3 !important;
-  color: #fff !important;
-}
-
 .gridjs-footer { background: var(--app-surface); border-top: 1px solid var(--app-border); }
 .gridjs-pagination .gridjs-pages button {
   color: #fff !important;
@@ -252,6 +227,37 @@ main {
   border-color: #beb6b6;
 }
 
-.gridjs-tr:nth-child(even) {
-  background-color: inherit;
-}
\ No newline at end of file
+/*
+  Stili aggiornati per tabella scura con righe alternate (zebra) e selezione
+*/
+
+/* 1. Stile base per le righe e le CELLE */
+.gridjs-tbody .gridjs-tr {
+  cursor: pointer;
+}
+
+.gridjs-tbody .gridjs-td {
+  color: #ffffff !important;
+  border-color: #0c0e09 !important; /* Mantiene il bordo scuro */
+}
+
+/* 2. Stile zebra striping per le righe */
+.gridjs-tbody .gridjs-tr:nth-child(odd) .gridjs-td {
+  background-color: #3a3f44 !important;
+}
+
+.gridjs-tbody .gridjs-tr:nth-child(even) .gridjs-td {
+  background-color: #2e3236 !important;
+}
+
+/* 3. Stile per la riga selezionata - Specificità aumentata */
+html body .gridjs-tbody .gridjs-tr.riga-selezionata .gridjs-td {
+  background-color: #4a5a6a !important;
+  color: #ffffff !important;
+  border-color: #6ea8fe !important; /* Aggiungo un bordo colorato per evidenziare meglio */
+}
+
+/* 4. Stile hover per tutte le righe non selezionate */
+.gridjs-tbody .gridjs-tr:not(.riga-selezionata):hover .gridjs-td {
+  background-color: #3a3f44 !important; /* Leggermente più chiaro al passaggio del mouse */
+}
diff --git a/erp.zip b/erp.zip
new file mode 100644
index 0000000..68b1be4
Binary files /dev/null and b/erp.zip differ
diff --git a/html/clienti.html b/html/clienti.html
index 94f8763..8054e7e 100644
--- a/html/clienti.html
+++ b/html/clienti.html
@@ -73,5 +73,3 @@
     </form>
   </div>
 </div>
-
-<!-- Inizializzazione spostata in js/clienti_aggrid.js -->
\ No newline at end of file
diff --git a/html/login.html b/html/login.html
index 708901f..4126cdf 100644
--- a/html/login.html
+++ b/html/login.html
@@ -4,7 +4,7 @@
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>Sign In</title>
-    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
+    <link href="../css/dashboard.css" rel="stylesheet">
     <style>
       body {
         display: flex;
@@ -92,6 +92,6 @@
       </form>
     </main>
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
-  <script src="js/login.js"></script>
+  <script src="../js/login.js"></script>
   </body>
 </html>
diff --git a/dashboard.html b/index.html
similarity index 89%
rename from dashboard.html
rename to index.html
index 202f176..88080a3 100644
--- a/dashboard.html
+++ b/index.html
@@ -54,7 +54,7 @@
         <a class="nav-link" href="#" id="link-ordini">Ordini</a>
       </li>
       <li class="nav-item">
-        <a class="nav-link" href="#submenu-prodotti">
+        <a class="nav-link" href="#submenu-prodotti" data-bs-toggle="collapse">
           Prodotti e categorie
         </a>
         <div class="collapse" id="submenu-prodotti">
@@ -105,11 +105,6 @@
 <script>
 // Auth + UI personalization + logout
 document.addEventListener('DOMContentLoaded', function() {
-  // Redirect to login if not authenticated
-  if (!localStorage.getItem('erp-logged')) {
-    window.location.href = 'login.html';
-    return;
-  }
 
   // Set username and avatar based on email
   const email = localStorage.getItem('erp-email') || 'admin@admin.com';
@@ -128,18 +123,6 @@ document.addEventListener('DOMContentLoaded', function() {
       if (li) li.style.display = 'none';
     }
   }
-
-  // Logout handler
-  var logout = document.getElementById('logout-link');
-  if (logout) {
-    logout.addEventListener('click', function(e) {
-      e.preventDefault();
-      localStorage.removeItem('erp-logged');
-      localStorage.removeItem('erp-role');
-      localStorage.removeItem('erp-email');
-      window.location.href = 'login.html';
-    });
-  }
 });
 </script>
 
diff --git a/js/detailManager.js b/js/detailManager.js
index 73efcb5..fed16d7 100644
--- a/js/detailManager.js
+++ b/js/detailManager.js
@@ -2,24 +2,18 @@
 window.detailManager = {
   selectedRows: {},
   originalData: {},
-  grids: {}
+  grids: {},
+  filteredData: {},
+  rowMappers: {}
 };
 
 // Inizializzazione della gestione dei dettagli per una tabella
-function initDetailManager(entityName, data, grid, fieldMapping) {
+function initDetailManager(entityName, data, grid, fieldMapping, rowMapper) {
   // Salva i dati originali
   window.detailManager.originalData[entityName] = data;
   window.detailManager.grids[entityName] = grid;
   window.detailManager.selectedRows[entityName] = null;
-
-  // Reset listener flags per permettere re-inizializzazione
-  var buttons = ['new', 'save', 'delete', 'refresh', 'export'];
-  for (var i = 0; i < buttons.length; i++) {
-    var btn = document.getElementById(entityName + '-' + buttons[i]);
-    if (btn && btn.dataset.listenerBound) {
-      delete btn.dataset.listenerBound;
-    }
-  }
+  window.detailManager.rowMappers[entityName] = rowMapper;
 
   // Form detail nascosto all'inizio
   var detailDiv = document.getElementById(entityName + '-detail');
@@ -34,83 +28,89 @@ function initDetailManager(entityName, data, grid, fieldMapping) {
   setupButtons(entityName, data, grid, fieldMapping);
 }
 
-// ROW CLICK HANDLER
-  // ----------------------------------------------------------------------------------
-// Configura il listener per il click sulle righe
+// ROW CLICK HANDLER - Implementazione con Event Delegation sul Container
+// ----------------------------------------------------------------------------------
 function setupRowClick(entityName, fieldMapping) {
   var gridDiv = document.getElementById(entityName + '-grid');
-  if (!gridDiv) {
-    return;
-  }
+  if (!gridDiv) return;
 
-  // aspetto che la tabella sia renderizzata
-  setTimeout(function() {
-    var table = gridDiv.querySelector('table');
-    if (!table) {
-      return;
-    }
+  // Evita di attaccare più listener allo stesso div
+  if (gridDiv.dataset.rowClickListenerAttached) return;
+  gridDiv.dataset.rowClickListenerAttached = 'true';
 
-    // cancellazione eventuali vecchi listener
-    table.onclick = null;
+  gridDiv.addEventListener('click', function(event) {
+    // Intercetta il click su una riga (standard table)
+    var clickedRow = event.target.closest('tr');
+    if (!clickedRow) return;
 
-    // Aggiunta listener per il click
-    table.addEventListener('click', function(event) {
-      var row = event.target.closest('tr');
-      
-      // Se non è una riga o è l'header, ignora
-      if (!row || row.parentElement.tagName === 'THEAD') {
-        return;
-      }
+    console.log('Click su riga:', clickedRow); // Debug
 
-      // Rimozione della selezione da tutte le righe
-      var allRows = table.querySelectorAll('tr');
-      for (var i = 0; i < allRows.length; i++) {
-        allRows[i].classList.remove('selected-row');
-      }
+    // Ignora click sull'header
+    if (clickedRow.closest('thead')) return;
+    if (!clickedRow.closest('tbody')) return;
 
-      // Aggiungo la classe alla riga cliccata
-      row.classList.add('selected-row');
-      // Leggo i dati dalla riga
-      var cells = row.querySelectorAll('td');
-      var rowData = {};
-      // Il primo campo è l'ID
-      var fields = Object.keys(fieldMapping);
-      var idField = fields[0];
-      
-      if (cells[0]) {
-        rowData[idField] = cells[0].textContent.trim();
-      }
+    // --- Logica di selezione ---
+    
+    // Trova la riga precedentemente selezionata NEL CONTAINER CORRENTE
+    var previouslySelectedRow = gridDiv.querySelector('tr.riga-selezionata');
+    var isAlreadySelected = clickedRow.classList.contains('riga-selezionata');
+    
+    // Se c'era una riga selezionata e non è quella appena cliccata, deselezionala.
+    if (previouslySelectedRow && previouslySelectedRow !== clickedRow) {
+      previouslySelectedRow.classList.remove('riga-selezionata');
+      previouslySelectedRow.setAttribute('aria-selected', 'false');
+    }
+
+    // Attiva/disattiva la selezione sulla riga corrente
+    if (isAlreadySelected) {
+        // Se era già selezionata, la deselezioniamo (toggle behavior)
+        clickedRow.classList.remove('riga-selezionata');
+        clickedRow.setAttribute('aria-selected', 'false');
+    } else {
+        // Altrimenti la selezioniamo
+        clickedRow.classList.add('riga-selezionata');
+        clickedRow.setAttribute('aria-selected', 'true');
+    }
+    
+    var isNowSelected = clickedRow.classList.contains('riga-selezionata');
+
+    // Gestisci il form dei dettagli
+    var detailDiv = document.getElementById(entityName + '-detail');
+
+    if (isNowSelected) {
+      // La riga è stata selezionata: popola e mostra il form
+      var cells = clickedRow.querySelectorAll('td');
+      var idField = Object.keys(fieldMapping)[0];
+      // Assumiamo che la prima colonna sia l'ID
+      var idValue = cells[0] ? cells[0].textContent.trim() : null;
 
-      // dati completi nell'array originale
       var fullData = null;
-      var dataArray = window.detailManager.originalData[entityName];
-      
-      for (var i = 0; i < dataArray.length; i++) {
-        if (String(dataArray[i][idField]) === String(rowData[idField])) {
-          fullData = dataArray[i];
-          break;
-        }
+      if (idValue) {
+        var dataArray = window.detailManager.originalData[entityName] || [];
+        fullData = dataArray.find(function(item) {
+          return String(item[idField]) === String(idValue);
+        });
       }
 
-      // Se ci sono i dati, popola il form
       if (fullData) {
-        //CHIAMO IL FILLFORM
         window.detailManager.selectedRows[entityName] = fullData;
         fillForm(entityName, fullData, fieldMapping);
-        
-        // Mostra il form di dettaglio
-        var detailDiv = document.getElementById(entityName + '-detail');
-        if (detailDiv) {
-          detailDiv.style.display = 'block';
-        }
-        
-        // Se è un ordine, carica i dettagli dei prodotti acquistati
+        if (detailDiv) detailDiv.style.display = 'block';
+
+        // Logica specifica per ordini
         if (entityName === 'orders' && fullData.order_id) {
-          loadOrderDetails(fullData.order_id);
+          if (typeof loadOrderDetails === 'function') {
+            loadOrderDetails(fullData.order_id);
+          }
         }
       }
-    });
-  }, 500);
+    } else {
+      // La riga è stata deselezionata: pulisci e nascondi il form
+      window.detailManager.selectedRows[entityName] = null;
+      clearForm(entityName, fieldMapping);
+      if (detailDiv) detailDiv.style.display = 'none';
+    }
+  });
 }
 
 // FILLFORM
@@ -289,6 +289,7 @@ function setupButtons(entityName, data, grid, fieldMapping) {
 
       // Aggiorna la griglia
       updateGrid(entityName, grid, fieldMapping);
+      forceSearchbarRefresh(entityName);
       clearForm(entityName, fieldMapping);
     });
   }
@@ -330,6 +331,7 @@ function setupButtons(entityName, data, grid, fieldMapping) {
           
           clearForm(entityName, fieldMapping);
           updateGrid(entityName, grid, fieldMapping);
+          forceSearchbarRefresh(entityName);
         }
       }
     });
@@ -342,6 +344,7 @@ function setupButtons(entityName, data, grid, fieldMapping) {
     btnRefresh.dataset.listenerBound = '1';
     btnRefresh.addEventListener('click', function() {
       updateGrid(entityName, grid, fieldMapping);
+      forceSearchbarRefresh(entityName);
       clearForm(entityName, fieldMapping);
     });
   }
@@ -352,27 +355,63 @@ function setupButtons(entityName, data, grid, fieldMapping) {
   if (btnExport && !btnExport.dataset.listenerBound) {
     btnExport.dataset.listenerBound = '1';
     btnExport.addEventListener('click', function() {
-      exportData(entityName, window.detailManager.originalData[entityName], fieldMapping);
+      var dataToExport = (window.detailManager.filteredData && window.detailManager.filteredData[entityName])
+        ? window.detailManager.filteredData[entityName]
+        : window.detailManager.originalData[entityName];
+      exportData(entityName, dataToExport, fieldMapping);
     });
   }
 }
 
+// Helper per ottenere l'input search corretto per ogni entity
+function getSearchInput(entityName) {
+  const map = {
+    orders: 'order-search',
+    clienti: 'clienti-search',
+    prodotti: 'prodotti-search',
+    categorie: 'categorie-search',
+    dipendenti: 'dipendenti-search',
+    fornitori: 'fornitori-search',
+    spedizionieri: 'spedizionieri-search'
+  };
+  return document.getElementById(map[entityName] || (entityName + '-search'));
+}
+
+// Helper per forzare il refresh tramite searchbar
+function forceSearchbarRefresh(entityName) {
+  var searchInput = getSearchInput(entityName);
+  if (searchInput) {
+    searchInput.value = ' ';
+    searchInput.dispatchEvent(new Event('input'));
+  }
+}
+
 // Aggiorna la griglia
 function updateGrid(entityName, grid, fieldMapping) {
+  // Usa la grid salvata se quella passata è null/undefined
+  var searchInput = document.getElementById(entityName + '-search');
+  if (searchInput) searchInput.value = ' ';
+  searchInput && searchInput.dispatchEvent(new Event('input'));
+  if (!grid && window.detailManager.grids && window.detailManager.grids[entityName]) {
+    grid = window.detailManager.grids[entityName];
+  }
+  
+  if (!grid) {
+    console.error('Grid non disponibile per', entityName);
+    return;
+  }
+  
   var data = window.detailManager.originalData[entityName];
-  var mappedData = [];
+  var rowMapper = window.detailManager.rowMappers[entityName];
   
-  for (var i = 0; i < data.length; i++) {
-    var row = [];
-    var fields = Object.keys(fieldMapping);
-    
-    for (var j = 0; j < fields.length; j++) {
-      row.push(data[i][fields[j]]);
-    }
-    
-    mappedData.push(row);
+  if (!rowMapper) {
+    console.error('rowMapper non disponibile per', entityName);
+    return;
   }
   
+  // Usa lo stesso metodo che funziona nella ricerca: mappa i dati con rowMapper
+  var mappedData = data.map(rowMapper);
+  
   grid.updateConfig({ data: mappedData }).forceRender();
   
   // Riconfigura il listener dopo il refresh
diff --git a/js/gridjs.js b/js/gridjs.js
index ac928d1..e2c9408 100644
--- a/js/gridjs.js
+++ b/js/gridjs.js
@@ -65,6 +65,7 @@ function makeSearcher(inputId, entityName, grid, rowMapper, fieldMapping) {
       });
     }
     grid.updateConfig({ data: filteredData.map(rowMapper) }).forceRender();
+    window.detailManager.filteredData[entityName] = filteredData;
     // Riattiva i listener dopo il render
     if (typeof setupRowClick === 'function' && fieldMapping) {
       setTimeout(function() {
@@ -118,7 +119,7 @@ async function initClienti() {
     pagination: { enabled: true, limit: 15 },
     sort: true,
     resizable: true,
-    className: { table: 'table table-dark table-striped mb-0' }
+    className: { table: 'table table-dark mb-0' }
   });
   clientiGrid.render(clientiDiv);
   clientiDiv.dataset.gridjsInit = '1';
@@ -139,7 +140,7 @@ async function initClienti() {
       phone: 'cli-telefono',
       fax: 'cli-fax'
     };
-    initDetailManager('clienti', clientiData, clientiGrid, fieldMapping);
+    initDetailManager('clienti', clientiData, clientiGrid, fieldMapping, clientiRowMapper);
     makeSearcher('clienti-search', 'clienti', clientiGrid, clientiRowMapper, fieldMapping);
   }
 }
@@ -182,7 +183,7 @@ async function initProdotti() {
     pagination: { enabled: true, limit: 15 },
     sort: true,
     resizable: true,
-    className: { table: 'table table-dark table-striped mb-0' }
+    className: { table: 'table table-dark mb-0' }
   });
   prodottiGrid.render(prodottiDiv);
   prodottiDiv.dataset.gridjsInit = '1';
@@ -201,7 +202,7 @@ async function initProdotti() {
       reorder_level: 'prod-reorder-level',
       discontinued: 'prod-discontinued'
     };
-    initDetailManager('prodotti', prodottiData, prodottiGrid, fieldMapping);
+    initDetailManager('prodotti', prodottiData, prodottiGrid, fieldMapping, prodottiRowMapper);
     makeSearcher('prodotti-search', 'prodotti', prodottiGrid, prodottiRowMapper, fieldMapping);
   }
 }
@@ -226,7 +227,7 @@ async function initCategorie() {
     pagination: { enabled: true, limit: 15 },
     sort: true,
     resizable: true,
-    className: { table: 'table table-dark table-striped mb-0' }
+    className: { table: 'table table-dark mb-0' }
   });
   categorieGrid.render(categorieDiv);
   categorieDiv.dataset.gridjsInit = '1';
@@ -238,7 +239,7 @@ async function initCategorie() {
       category_name: 'cat-name',
       description: 'cat-description'
     };
-    initDetailManager('categorie', categorieData, categorieGrid, fieldMapping);
+    initDetailManager('categorie', categorieData, categorieGrid, fieldMapping, categorieRowMapper);
     makeSearcher('categorie-search', 'categorie', categorieGrid, categorieRowMapper, fieldMapping);
   }
 }
@@ -251,12 +252,12 @@ async function initDipendenti() {
   var dipendentiData = await fetchData('json/employees.json');
   var dipendentiColumns = [
     { id: 'employee_id', name: 'ID', width: 70 },
-    { id: 'last_name', name: 'Cognome' },
-    { id: 'first_name', name: 'Nome' },
+    { id: 'lastname', name: 'Cognome' },
+    { id: 'firstname', name: 'Nome' },
     { id: 'title', name: 'Titolo' },
     { id: 'title_of_courtesy', name: 'Titolo cortesia' },
-    { id: 'birth_date', name: 'Nascita' },
-    { id: 'hire_date', name: 'Assunzione' },
+    { id: 'birthdate', name: 'Nascita' },
+    { id: 'hiredate', name: 'Assunzione' },
     { id: 'address', name: 'Indirizzo' },
     { id: 'city', name: 'Città' },
     { id: 'region', name: 'Regione' },
@@ -267,12 +268,12 @@ async function initDipendenti() {
   function dipendentiRowMapper(e) {
     return [
       e.employee_id,
-      e.last_name,
-      e.first_name,
+      e.lastname,
+      e.firstname,
       e.title,
       e.title_of_courtesy,
-      e.birth_date,
-      e.hire_date,
+      e.birthdate,
+      e.hiredate,
       e.address,
       e.city,
       e.region,
@@ -287,7 +288,7 @@ async function initDipendenti() {
     pagination: { enabled: true, limit: 15 },
     sort: true,
     resizable: true,
-    className: { table: 'table table-dark table-striped mb-0' }
+    className: { table: 'table table-dark mb-0' }
   });
   dipendentiGrid.render(dipendentiDiv);
   dipendentiDiv.dataset.gridjsInit = '1';
@@ -312,7 +313,7 @@ async function initDipendenti() {
       reports_to: 'dip-reports-to',
       notes: 'dip-notes'
     };
-    initDetailManager('dipendenti', dipendentiData, dipendentiGrid, fieldMapping);
+    initDetailManager('dipendenti', dipendentiData, dipendentiGrid, fieldMapping, dipendentiRowMapper);
     makeSearcher('dipendenti-search', 'dipendenti', dipendentiGrid, dipendentiRowMapper, fieldMapping);
   }
 }
@@ -337,7 +338,7 @@ async function initSpedizionieri() {
     pagination: { enabled: true, limit: 10 },
     sort: true,
     resizable: true,
-    className: { table: 'table table-dark table-striped mb-0' }
+    className: { table: 'table table-dark mb-0' }
   });
   spedizionieriGrid.render(spedizionieriDiv);
   spedizionieriDiv.dataset.gridjsInit = '1';
@@ -349,7 +350,7 @@ async function initSpedizionieri() {
       company_name: 'sped-company-name',
       phone: 'sped-phone'
     };
-    initDetailManager('spedizionieri', spedizionieriData, spedizionieriGrid, fieldMapping);
+    initDetailManager('spedizionieri', spedizionieriData, spedizionieriGrid, fieldMapping, spedizionieriRowMapper);
     makeSearcher('spedizionieri-search', 'spedizionieri', spedizionieriGrid, spedizionieriRowMapper, fieldMapping);
   }
 }
@@ -392,7 +393,7 @@ async function initFornitori() {
     pagination: { enabled: true, limit: 15 },
     sort: true,
     resizable: true,
-    className: { table: 'table table-dark table-striped mb-0' }
+    className: { table: 'table table-dark mb-0' }
   });
   fornitoriGrid.render(fornitoriDiv);
   fornitoriDiv.dataset.gridjsInit = '1';
@@ -414,7 +415,7 @@ async function initFornitori() {
       fax: 'forn-fax',
       homepage: 'forn-homepage'
     };
-    initDetailManager('fornitori', fornitoriData, fornitoriGrid, fieldMapping);
+    initDetailManager('fornitori', fornitoriData, fornitoriGrid, fieldMapping, fornitoriRowMapper);
     makeSearcher('fornitori-search', 'fornitori', fornitoriGrid, fornitoriRowMapper, fieldMapping);
   }
 }
@@ -464,7 +465,7 @@ async function initOrdini() {
     pagination: { enabled: true, limit: 15 },
     sort: true,
     resizable: true,
-    className: { table: 'table table-dark table-striped mb-0' }
+    className: { table: 'table table-dark mb-0' }
   });
   ordiniGrid.render(ordiniDiv);
   ordiniDiv.dataset.gridjsInit = '1';
@@ -486,7 +487,7 @@ async function initOrdini() {
       ship_country: 'of-ship-country',
       freight: 'of-freight'
     };
-    initDetailManager('orders', ordiniData, ordiniGrid, fieldMapping);
+    initDetailManager('orders', ordiniData, ordiniGrid, fieldMapping, ordiniRowMapper);
     makeSearcher('order-search', 'orders', ordiniGrid, ordiniRowMapper, fieldMapping);
   }
 }
diff --git a/js/login.js b/js/login.js
index 4abf8b7..f0aa97a 100644
--- a/js/login.js
+++ b/js/login.js
@@ -19,7 +19,7 @@ document.addEventListener('DOMContentLoaded',()=>{
       localStorage.setItem('erp-logged', '1');
       localStorage.setItem('erp-role', role);
       localStorage.setItem('erp-email', email);
-      window.location.href = 'dashboard.html';
+      window.location.href = 'index.html';
     } else {
       alert('Credenziali non valide!');
     }
diff --git a/js/navigation.js b/js/navigation.js
index 8fe7572..6e8312d 100644
--- a/js/navigation.js
+++ b/js/navigation.js
@@ -50,21 +50,7 @@ function setupNavigation() {
     })(el, route);
   }
 
-  // Gestione apertura/chiusura submenu prodotti
-  var submenuLink = document.querySelector('a[href="#submenu-prodotti"]');
-  if (submenuLink) {
-    submenuLink.addEventListener('click', function(e) {
-      e.preventDefault();
-      var submenu = document.querySelector('#submenu-prodotti');
-      if (submenu) {
-        if (submenu.classList.contains('show')) {
-          submenu.classList.remove('show');
-        } else {
-          submenu.classList.add('show');
-        }
-      }
-    });
-  }
+  // Il submenu prodotti ora è gestito da Bootstrap collapse (data-bs-toggle="collapse")
 }
 
 // Inizializza la navigazione quando la pagina è pronta
