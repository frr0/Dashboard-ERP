// // Funzione per assicurarsi che il DOM sia pronto (non serve più gridjs esterno)
// function ensureGridJs(callback) {
//   callback();
// }

// // Questa funzione prende i dati da un url e li restituisce come array
// async function fetchData(url) {
//   try {
//     var response = await fetch(url + (url.indexOf('?') !== -1 ? '&' : '?') + '_=' + Date.now(), { cache: 'no-store' });
//     var data = await response.json();
//     if (Array.isArray(data)) {
//       return data;
//     }
//     if (data && data.results && data.results[0] && data.results[0].items) {
//       return data.results[0].items;
//     }
//     return data || [];
//   } catch (e) {
//     console.error('fetchData error', url, e);
//     return [];
//   }
// }

// // Funzione generica per renderizzare una tabella HTML standard
// function renderTable(containerId, data, columns, rowMapper, entityName, fieldMapping) {
//   var container = document.getElementById(containerId);
//   if (!container) return;

//   container.innerHTML = ''; // Pulisce il contenitore

//   // Crea la struttura della tabella
//   var tableWrapper = document.createElement('div');
//   tableWrapper.className = 'table-responsive';
  
//   var table = document.createElement('table');
//   table.className = 'table table-dark table-hover mb-0 custom-table';
//   table.style.width = '100%';

//   // THEAD
//   var thead = document.createElement('thead');
//   var trHead = document.createElement('tr');
//   columns.forEach(function(col) {
//     var th = document.createElement('th');
//     th.textContent = col.name;
//     if (col.width) {
//       th.style.width = typeof col.width === 'number' ? col.width + 'px' : col.width;
//     }
//     trHead.appendChild(th);
//   });
//   thead.appendChild(trHead);
//   table.appendChild(thead);

//   // TBODY
//   var tbody = document.createElement('tbody');
//   data.forEach(function(item) {
//     var rowValues = rowMapper(item);
//     var tr = document.createElement('tr');
//     tr.style.cursor = 'pointer';
    
//     rowValues.forEach(function(val) {
//       var td = document.createElement('td');
//       td.textContent = val !== null && val !== undefined ? val : '';
//       tr.appendChild(td);
//     });
//     tbody.appendChild(tr);
//   });
//   table.appendChild(tbody);

//   tableWrapper.appendChild(table);
//   container.appendChild(tableWrapper);
//   container.dataset.gridjsInit = '1'; // Flag per evitare re-init

//   // Setup click listener (se detailManager è presente)
//   if (typeof setupRowClick === 'function' && entityName && fieldMapping) {
//     // setupRowClick attacca il listener al container (gridDiv), che è il genitore di tableWrapper
//     setupRowClick(entityName, fieldMapping);
//   }
// }

// // Funzione per aggiungere la ricerca (filtro client-side)
// function makeSearcher(inputId, entityName, grid, rowMapper, fieldMapping) {
//   // Nota: 'grid' qui non è più l'istanza Grid.js, ma passiamo i dati o una funzione di refresh
//   // Per semplicità, rifacciamo la logica di ricerca qui.
//   var input = document.getElementById(inputId);
//   if (!input) return;

//   input.addEventListener('input', function () {
//     var searchTerm = this.value.toLowerCase().trim();
//     var currentData = window.detailManager && window.detailManager.originalData && window.detailManager.originalData[entityName]
//       ? window.detailManager.originalData[entityName]
//       : [];
    
//     var filteredData;
//     if (!searchTerm) {
//       filteredData = currentData;
//     } else {
//       filteredData = currentData.filter(function (obj) {
//         return Object.values(obj).some(function (v) {
//           return v != null && String(v).toLowerCase().indexOf(searchTerm) !== -1;
//         });
//       });
//     }
    
//     // Re-renderizza la tabella con i dati filtrati
//     // Recuperiamo le colonne e il container dalle variabili globali o passate (qui semplifichiamo)
//     // Per farlo pulito, dovremmo salvare le config di ogni tabella.
//     // Ma dato che init... viene chiamato una volta, possiamo salvare le config in window.detailManager
//     var config = window.detailManager.tableConfigs ? window.detailManager.tableConfigs[entityName] : null;
//     if (config) {
//       renderTable(config.containerId, filteredData, config.columns, rowMapper, entityName, fieldMapping);
//     }
//   });
// }

// // Helper per salvare la configurazione della tabella per la ricerca
// function saveTableConfig(entityName, containerId, columns) {
//   if (!window.detailManager.tableConfigs) {
//     window.detailManager.tableConfigs = {};
//   }
//   window.detailManager.tableConfigs[entityName] = {
//     containerId: containerId,
//     columns: columns
//   };
// }

// // tabelle
// ////////////////////////////////////////////////////////////////////////////////////////

// // Inizializza la tabella clienti
// async function initClienti() {
//   var containerId = 'clienti-grid';
//   var clientiDiv = document.getElementById(containerId);
//   if (!clientiDiv || clientiDiv.dataset.gridjsInit) return;
  
//   var clientiData = await fetchData('json/customers.json');
//   var clientiColumns = [
//     { id: 'customer_id', name: 'ID', width: 70 },
//     { id: 'customer_code', name: 'Codice' },
//     { id: 'company_name', name: 'Azienda' },
//     { id: 'contact_name', name: 'Contatto' },
//     { id: 'contact_title', name: 'Titolo' },
//     { id: 'address', name: 'Indirizzo' },
//     { id: 'city', name: 'Città' },
//     { id: 'region', name: 'Regione' },
//     { id: 'postal_code', name: 'CAP' },
//     { id: 'country', name: 'Paese' },
//     { id: 'phone', name: 'Telefono' },
//     { id: 'fax', name: 'Fax' }
//   ];
//   function clientiRowMapper(c) {
//     return [
//       c.customer_id, c.customer_code, c.company_name, c.contact_name, c.contact_title,
//       c.address, c.city, c.region, c.postal_code, c.country, c.phone, c.fax
//     ];
//   }

//   // Renderizza tabella standard
//   renderTable(containerId, clientiData, clientiColumns, clientiRowMapper, 'clienti', null); // null fieldMapping per ora, lo passiamo dopo

//   // Inizializza il detail manager
//   if (typeof initDetailManager === 'function') {
//     var fieldMapping = {
//       customer_id: 'cli-id', customer_code: 'cli-code', company_name: 'cli-azienda',
//       contact_name: 'cli-contatto', contact_title: 'cli-titolo', address: 'cli-indirizzo',
//       city: 'cli-citta', region: 'cli-regione', postal_code: 'cli-cap', country: 'cli-paese',
//       phone: 'cli-telefono', fax: 'cli-fax'
//     };
    
//     // Re-render con fieldMapping corretto per setupRowClick
//     renderTable(containerId, clientiData, clientiColumns, clientiRowMapper, 'clienti', fieldMapping);
    
//     initDetailManager('clienti', clientiData, null, fieldMapping); // null grid instance
//     saveTableConfig('clienti', containerId, clientiColumns);
//     makeSearcher('clienti-search', 'clienti', null, clientiRowMapper, fieldMapping);
//   }
// }

// // Inizializza la tabella prodotti
// async function initProdotti() {
//   var containerId = 'prodotti-grid';
//   var prodottiDiv = document.getElementById(containerId);
//   if (!prodottiDiv || prodottiDiv.dataset.gridjsInit) return;
  
//   var prodottiData = await fetchData('json/products.json');
//   var prodottiColumns = [
//     { id: 'product_id', name: 'ID', width: 70 },
//     { id: 'product_name', name: 'Prodotto' },
//     { id: 'supplier_id', name: 'Fornitore', width: 90 },
//     { id: 'category_id', name: 'Categoria', width: 90 },
//     { id: 'quantity_per_unit', name: 'Formato' },
//     { id: 'unit_price', name: 'Prezzo', width: 90 },
//     { id: 'units_in_stock', name: 'Stock', width: 80 },
//     { id: 'units_on_order', name: 'In ordine', width: 90 },
//     { id: 'reorder_level', name: 'Riordino', width: 90 },
//     { id: 'discontinued', name: 'Discontinuato', width: 110 }
//   ];
//   function prodottiRowMapper(p) {
//     return [
//       p.product_id, p.product_name, p.supplier_id, p.category_id, p.quantity_per_unit,
//       p.unit_price, p.units_in_stock, p.units_on_order, p.reorder_level, p.discontinued
//     ];
//   }

//   if (typeof initDetailManager === 'function') {
//     var fieldMapping = {
//       product_id: 'prod-id', product_name: 'prod-name', supplier_id: 'prod-supplier-id',
//       category_id: 'prod-category-id', quantity_per_unit: 'prod-quantity-per-unit',
//       unit_price: 'prod-unit-price', units_in_stock: 'prod-units-in-stock',
//       units_on_order: 'prod-units-on-order', reorder_level: 'prod-reorder-level',
//       discontinued: 'prod-discontinued'
//     };
//     renderTable(containerId, prodottiData, prodottiColumns, prodottiRowMapper, 'prodotti', fieldMapping);
//     initDetailManager('prodotti', prodottiData, null, fieldMapping);
//     saveTableConfig('prodotti', containerId, prodottiColumns);
//     makeSearcher('prodotti-search', 'prodotti', null, prodottiRowMapper, fieldMapping);
//   }
// }

// // Inizializza la tabella categorie
// async function initCategorie() {
//   var containerId = 'categorie-grid';
//   var categorieDiv = document.getElementById(containerId);
//   if (!categorieDiv || categorieDiv.dataset.gridjsInit) return;
  
//   var categorieData = await fetchData('json/categories.json');
//   var categorieColumns = [
//     { id: 'category_id', name: 'ID', width: 70 },
//     { id: 'category_name', name: 'Categoria' },
//     { id: 'description', name: 'Descrizione' }
//   ];
//   function categorieRowMapper(c) {
//     return [c.category_id, c.category_name, c.description];
//   }

//   if (typeof initDetailManager === 'function') {
//     var fieldMapping = {
//       category_id: 'cat-id', category_name: 'cat-name', description: 'cat-description'
//     };
//     renderTable(containerId, categorieData, categorieColumns, categorieRowMapper, 'categorie', fieldMapping);
//     initDetailManager('categorie', categorieData, null, fieldMapping);
//     saveTableConfig('categorie', containerId, categorieColumns);
//     makeSearcher('categorie-search', 'categorie', null, categorieRowMapper, fieldMapping);
//   }
// }

// // Inizializza la tabella dipendenti
// async function initDipendenti() {
//   var containerId = 'dipendenti-grid';
//   var dipendentiDiv = document.getElementById(containerId);
//   if (!dipendentiDiv || dipendentiDiv.dataset.gridjsInit) return;
  
//   var dipendentiData = await fetchData('json/employees.json');
//   var dipendentiColumns = [
//     { id: 'employee_id', name: 'ID', width: 70 },
//     { id: 'last_name', name: 'Cognome' },
//     { id: 'first_name', name: 'Nome' },
//     { id: 'title', name: 'Titolo' },
//     { id: 'title_of_courtesy', name: 'Titolo cortesia' },
//     { id: 'birth_date', name: 'Nascita' },
//     { id: 'hire_date', name: 'Assunzione' },
//     { id: 'address', name: 'Indirizzo' },
//     { id: 'city', name: 'Città' },
//     { id: 'region', name: 'Regione' },
//     { id: 'postal_code', name: 'CAP' },
//     { id: 'country', name: 'Paese' },
//     { id: 'home_phone', name: 'Telefono' }
//   ];
//   function dipendentiRowMapper(e) {
//     return [
//       e.employee_id, e.last_name, e.first_name, e.title, e.title_of_courtesy,
//       e.birth_date, e.hire_date, e.address, e.city, e.region, e.postal_code,
//       e.country, e.home_phone
//     ];
//   }

//   if (typeof initDetailManager === 'function') {
//     var fieldMapping = {
//       employee_id: 'dip-id', last_name: 'dip-last-name', first_name: 'dip-first-name',
//       title: 'dip-title', title_of_courtesy: 'dip-title-of-courtesy', birth_date: 'dip-birth-date',
//       hire_date: 'dip-hire-date', address: 'dip-address', city: 'dip-city', region: 'dip-region',
//       postal_code: 'dip-postal-code', country: 'dip-country', home_phone: 'dip-home-phone',
//       extension: 'dip-extension', reports_to: 'dip-reports-to', notes: 'dip-notes'
//     };
//     renderTable(containerId, dipendentiData, dipendentiColumns, dipendentiRowMapper, 'dipendenti', fieldMapping);
//     initDetailManager('dipendenti', dipendentiData, null, fieldMapping);
//     saveTableConfig('dipendenti', containerId, dipendentiColumns);
//     makeSearcher('dipendenti-search', 'dipendenti', null, dipendentiRowMapper, fieldMapping);
//   }
// }

// // Inizializza la tabella spedizionieri
// async function initSpedizionieri() {
//   var containerId = 'spedizionieri-grid';
//   var spedizionieriDiv = document.getElementById(containerId);
//   if (!spedizionieriDiv || spedizionieriDiv.dataset.gridjsInit) return;
  
//   var spedizionieriData = await fetchData('json/shippers.json');
//   var spedizionieriColumns = [
//     { id: 'shipper_id', name: 'ID', width: 70 },
//     { id: 'company_name', name: 'Azienda' },
//     { id: 'phone', name: 'Telefono' }
//   ];
//   function spedizionieriRowMapper(s) {
//     return [s.shipper_id, s.company_name, s.phone];
//   }

//   if (typeof initDetailManager === 'function') {
//     var fieldMapping = {
//       shipper_id: 'sped-id', company_name: 'sped-company-name', phone: 'sped-phone'
//     };
//     renderTable(containerId, spedizionieriData, spedizionieriColumns, spedizionieriRowMapper, 'spedizionieri', fieldMapping);
//     initDetailManager('spedizionieri', spedizionieriData, null, fieldMapping);
//     saveTableConfig('spedizionieri', containerId, spedizionieriColumns);
//     makeSearcher('spedizionieri-search', 'spedizionieri', null, spedizionieriRowMapper, fieldMapping);
//   }
// }

// // Inizializza la tabella fornitori
// async function initFornitori() {
//   var containerId = 'fornitori-grid';
//   var fornitoriDiv = document.getElementById(containerId);
//   if (!fornitoriDiv || fornitoriDiv.dataset.gridjsInit) return;
  
//   var fornitoriData = await fetchData('json/suppliers.json');
//   var fornitoriColumns = [
//     { id: 'supplier_id', name: 'ID', width: 70 },
//     { id: 'company_name', name: 'Azienda' },
//     { id: 'contact_name', name: 'Contatto' },
//     { id: 'contact_title', name: 'Titolo' },
//     { id: 'address', name: 'Indirizzo' },
//     { id: 'city', name: 'Città' },
//     { id: 'region', name: 'Regione' },
//     { id: 'postal_code', name: 'CAP' },
//     { id: 'country', name: 'Paese' },
//     { id: 'phone', name: 'Telefono' }
//   ];
//   function fornitoriRowMapper(s) {
//     return [
//       s.supplier_id, s.company_name, s.contact_name, s.contact_title, s.address,
//       s.city, s.region, s.postal_code, s.country, s.phone
//     ];
//   }

//   if (typeof initDetailManager === 'function') {
//     var fieldMapping = {
//       supplier_id: 'forn-id', company_name: 'forn-company-name', contact_name: 'forn-contact-name',
//       contact_title: 'forn-contact-title', address: 'forn-address', city: 'forn-city',
//       region: 'forn-region', postal_code: 'forn-postal-code', country: 'forn-country',
//       phone: 'forn-phone', fax: 'forn-fax', homepage: 'forn-homepage'
//     };
//     renderTable(containerId, fornitoriData, fornitoriColumns, fornitoriRowMapper, 'fornitori', fieldMapping);
//     initDetailManager('fornitori', fornitoriData, null, fieldMapping);
//     saveTableConfig('fornitori', containerId, fornitoriColumns);
//     makeSearcher('fornitori-search', 'fornitori', null, fornitoriRowMapper, fieldMapping);
//   }
// }

// // Inizializza la tabella ordini
// async function initOrdini() {
//   var containerId = 'orders-grid';
//   var ordiniDiv = document.getElementById(containerId);
//   if (!ordiniDiv || ordiniDiv.dataset.gridjsInit) return;
  
//   var ordiniData = await fetchData('json/orders.json');
//   var ordiniColumns = [
//     { id: 'order_id', name: 'ID', width: 70 },
//     { id: 'customer_id', name: 'Cliente', width: 85 },
//     { id: 'employee_id', name: 'Dipendente', width: 110 },
//     { id: 'order_date', name: 'Data ordine' },
//     { id: 'required_date', name: 'Data richiesta' },
//     { id: 'shipped_date', name: 'Data spedizione' },
//     { id: 'ship_via', name: 'Via Sped.' },
//     { id: 'freight', name: 'Spedizione €' },
//     { id: 'ship_name', name: 'Destinatario' },
//     { id: 'ship_address', name: 'Indirizzo' },
//     { id: 'ship_city', name: 'Città' },
//     { id: 'ship_region', name: 'Regione' },
//     { id: 'ship_postal_code', name: 'CAP' },
//     { id: 'ship_country', name: 'Paese' }
//   ];
//   function ordiniRowMapper(o) {
//     return [
//       o.order_id, o.customer_id, o.employee_id, o.order_date, o.required_date,
//       o.shipped_date, o.ship_via, o.freight, o.ship_name, o.ship_address,
//       o.ship_city, o.ship_region, o.ship_postal_code, o.ship_country
//     ];
//   }

//   if (typeof initDetailManager === 'function') {
//     var fieldMapping = {
//       order_id: 'of-order-id', customer_id: 'of-customer-id', employee_id: 'of-employee-id',
//       order_date: 'of-order-date', required_date: 'of-required-date', shipped_date: 'of-shipped-date',
//       ship_name: 'of-ship-name', ship_address: 'of-ship-address', ship_city: 'of-ship-city',
//       ship_region: 'of-ship-region', ship_postal_code: 'of-ship-postal', ship_country: 'of-ship-country',
//       freight: 'of-freight'
//     };
//     renderTable(containerId, ordiniData, ordiniColumns, ordiniRowMapper, 'orders', fieldMapping);
//     initDetailManager('orders', ordiniData, null, fieldMapping);
//     saveTableConfig('orders', containerId, ordiniColumns);
//     makeSearcher('order-search', 'orders', null, ordiniRowMapper, fieldMapping);
//   }
// }

// // Funzione che inizializza tutte le tabelle
// function initAll() {
//   initOrdini();
//   initClienti();
//   initProdotti();
//   initCategorie();
//   initDipendenti();
//   initSpedizionieri();
//   initFornitori();
// }

// // Osserva cambi nel container centrale per re-inizializzare le tabelle
// var mainArea = document.getElementById('area-principale');
// if (mainArea) {
//   var observer = new MutationObserver(function () {
//     initAll();
//   });
//   observer.observe(mainArea, { childList: true, subtree: true });
// }

// // Avvia tutto
// document.addEventListener('DOMContentLoaded', initAll);
// document.addEventListener('page:loaded', initAll);
// setTimeout(initAll, 400);
