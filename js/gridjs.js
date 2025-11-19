// Questa funzione controlla se Grid.js è già caricato
function ensureGridJs(callback) {
  if (typeof gridjs !== 'undefined') {
    callback();
    return;
  }
  var scriptTag = document.querySelector('script[data-dynamic-gridjs]');
  if (scriptTag) {
    scriptTag.addEventListener('load', function () {
      callback();
    });
    return;
  }
  var script = document.createElement('script');
  script.src = 'https://unpkg.com/gridjs/dist/gridjs.umd.js';
  script.async = true;
  script.defer = true;
  script.dataset.dynamicGridjs = '1';
  script.onload = function () {
    callback();
  };
  script.onerror = function () {
    console.error('Grid.js CDN non raggiungibile');
  };
  document.head.appendChild(script);
}

// Questa funzione prende i dati da un url e li restituisce come array
async function fetchData(url) {
  try {
    var response = await fetch(url + (url.indexOf('?') !== -1 ? '&' : '?') + '_=' + Date.now(), { cache: 'no-store' });
    var data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (data && data.results && data.results[0] && data.results[0].items) {
      return data.results[0].items;
    }
    return data || [];
  } catch (e) {
    console.error('fetchData error', url, e);
    return [];
  }
}

// Funzione per aggiungere la ricerca su una tabella
function makeSearcher(inputId, entityName, grid, rowMapper, fieldMapping) {
  var input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', function () {
    var searchTerm = this.value.toLowerCase().trim();
    // Usa i dati aggiornati da detailManager
    var currentData = window.detailManager && window.detailManager.originalData && window.detailManager.originalData[entityName]
      ? window.detailManager.originalData[entityName]
      : [];
    console.log('Ricerca in', entityName, '- Dati correnti:', currentData.length, 'elementi');
    var filteredData;
    if (!searchTerm) {
      filteredData = currentData;
    } else {
      filteredData = currentData.filter(function (obj) {
        return Object.values(obj).some(function (v) {
          return v != null && String(v).toLowerCase().indexOf(searchTerm) !== -1;
        });
      });
    }
    grid.updateConfig({ data: filteredData.map(rowMapper) }).forceRender();
    window.detailManager.filteredData[entityName] = filteredData;
    // Riattiva i listener dopo il render
    if (typeof setupRowClick === 'function' && fieldMapping) {
      setTimeout(function() {
        setupRowClick(entityName, fieldMapping);
      }, 300);
    }
  });
}

// tabelle
////////////////////////////////////////////////////////////////////////////////////////

// Inizializza la tabella clienti
async function initClienti() {
  var clientiDiv = document.getElementById('clienti-grid');
  if (!clientiDiv || clientiDiv.dataset.gridjsInit) return;
  var clientiData = await fetchData('json/customers.json');
  var clientiColumns = [
    { id: 'customer_id', name: 'ID', width: 70 },
    { id: 'customer_code', name: 'Codice' },
    { id: 'company_name', name: 'Azienda' },
    { id: 'contact_name', name: 'Contatto' },
    { id: 'contact_title', name: 'Titolo' },
    { id: 'address', name: 'Indirizzo' },
    { id: 'city', name: 'Città' },
    { id: 'region', name: 'Regione' },
    { id: 'postal_code', name: 'CAP' },
    { id: 'country', name: 'Paese' },
    { id: 'phone', name: 'Telefono' },
    { id: 'fax', name: 'Fax' }
  ];
  function clientiRowMapper(c) {
    return [
      c.customer_id,
      c.customer_code,
      c.company_name,
      c.contact_name,
      c.contact_title,
      c.address,
      c.city,
      c.region,
      c.postal_code,
      c.country,
      c.phone,
      c.fax
    ];
  }
  var clientiGrid = new gridjs.Grid({
    columns: clientiColumns,
    data: clientiData.map(clientiRowMapper),
    pagination: { enabled: true, limit: 15 },
    sort: true,
    resizable: true,
    className: { table: 'table table-dark mb-0' }
  });
  clientiGrid.render(clientiDiv);
  clientiDiv.dataset.gridjsInit = '1';
  
  // Inizializza il detail manager
  if (typeof initDetailManager === 'function') {
    var fieldMapping = {
      customer_id: 'cli-id',
      customer_code: 'cli-code',
      company_name: 'cli-azienda',
      contact_name: 'cli-contatto',
      contact_title: 'cli-titolo',
      address: 'cli-indirizzo',
      city: 'cli-citta',
      region: 'cli-regione',
      postal_code: 'cli-cap',
      country: 'cli-paese',
      phone: 'cli-telefono',
      fax: 'cli-fax'
    };
    initDetailManager('clienti', clientiData, clientiGrid, fieldMapping, clientiRowMapper);
    makeSearcher('clienti-search', 'clienti', clientiGrid, clientiRowMapper, fieldMapping);
  }
}

// Inizializza la tabella prodotti
// ----------------------------------------------------------------------
async function initProdotti() {
  var prodottiDiv = document.getElementById('prodotti-grid');
  if (!prodottiDiv || prodottiDiv.dataset.gridjsInit) return;
  var prodottiData = await fetchData('json/products.json');
  var prodottiColumns = [
    { id: 'product_id', name: 'ID', width: 70 },
    { id: 'product_name', name: 'Prodotto' },
    { id: 'supplier_id', name: 'Fornitore', width: 90 },
    { id: 'category_id', name: 'Categoria', width: 90 },
    { id: 'quantity_per_unit', name: 'Formato' },
    { id: 'unit_price', name: 'Prezzo', width: 90 },
    { id: 'units_in_stock', name: 'Stock', width: 80 },
    { id: 'units_on_order', name: 'In ordine', width: 90 },
    { id: 'reorder_level', name: 'Riordino', width: 90 },
    { id: 'discontinued', name: 'Discontinuato', width: 110 }
  ];
  function prodottiRowMapper(p) {
    return [
      p.product_id,
      p.product_name,
      p.supplier_id,
      p.category_id,
      p.quantity_per_unit,
      p.unit_price,
      p.units_in_stock,
      p.units_on_order,
      p.reorder_level,
      p.discontinued
    ];
  }
  var prodottiGrid = new gridjs.Grid({
    columns: prodottiColumns,
    data: prodottiData.map(prodottiRowMapper),
    pagination: { enabled: true, limit: 15 },
    sort: true,
    resizable: true,
    className: { table: 'table table-dark mb-0' }
  });
  prodottiGrid.render(prodottiDiv);
  prodottiDiv.dataset.gridjsInit = '1';
  
  // Inizializza il detail manager
  if (typeof initDetailManager === 'function') {
    var fieldMapping = {
      product_id: 'prod-id',
      product_name: 'prod-name',
      supplier_id: 'prod-supplier-id',
      category_id: 'prod-category-id',
      quantity_per_unit: 'prod-quantity-per-unit',
      unit_price: 'prod-unit-price',
      units_in_stock: 'prod-units-in-stock',
      units_on_order: 'prod-units-on-order',
      reorder_level: 'prod-reorder-level',
      discontinued: 'prod-discontinued'
    };
    initDetailManager('prodotti', prodottiData, prodottiGrid, fieldMapping, prodottiRowMapper);
    makeSearcher('prodotti-search', 'prodotti', prodottiGrid, prodottiRowMapper, fieldMapping);
  }
}

// Inizializza la tabella categorie
// ----------------------------------------------------------------------
async function initCategorie() {
  var categorieDiv = document.getElementById('categorie-grid');
  if (!categorieDiv || categorieDiv.dataset.gridjsInit) return;
  var categorieData = await fetchData('json/categories.json');
  var categorieColumns = [
    { id: 'category_id', name: 'ID', width: 70 },
    { id: 'category_name', name: 'Categoria' },
    { id: 'description', name: 'Descrizione' }
  ];
  function categorieRowMapper(c) {
    return [c.category_id, c.category_name, c.description];
  }
  var categorieGrid = new gridjs.Grid({
    columns: categorieColumns,
    data: categorieData.map(categorieRowMapper),
    pagination: { enabled: true, limit: 15 },
    sort: true,
    resizable: true,
    className: { table: 'table table-dark mb-0' }
  });
  categorieGrid.render(categorieDiv);
  categorieDiv.dataset.gridjsInit = '1';
  
  // Inizializza il detail manager
  if (typeof initDetailManager === 'function') {
    var fieldMapping = {
      category_id: 'cat-id',
      category_name: 'cat-name',
      description: 'cat-description'
    };
    initDetailManager('categorie', categorieData, categorieGrid, fieldMapping, categorieRowMapper);
    makeSearcher('categorie-search', 'categorie', categorieGrid, categorieRowMapper, fieldMapping);
  }
}

// Inizializza la tabella dipendenti
// ----------------------------------------------------------------------
async function initDipendenti() {
  var dipendentiDiv = document.getElementById('dipendenti-grid');
  if (!dipendentiDiv || dipendentiDiv.dataset.gridjsInit) return;
  var dipendentiData = await fetchData('json/employees.json');
  var dipendentiColumns = [
    { id: 'employee_id', name: 'ID', width: 70 },
    { id: 'lastname', name: 'Cognome' },
    { id: 'firstname', name: 'Nome' },
    { id: 'title', name: 'Titolo' },
    { id: 'title_of_courtesy', name: 'Titolo cortesia' },
    { id: 'birthdate', name: 'Nascita' },
    { id: 'hiredate', name: 'Assunzione' },
    { id: 'address', name: 'Indirizzo' },
    { id: 'city', name: 'Città' },
    { id: 'region', name: 'Regione' },
    { id: 'postal_code', name: 'CAP' },
    { id: 'country', name: 'Paese' },
    { id: 'home_phone', name: 'Telefono' }
  ];
  function dipendentiRowMapper(e) {
    return [
      e.employee_id,
      e.lastname,
      e.firstname,
      e.title,
      e.title_of_courtesy,
      e.birthdate,
      e.hiredate,
      e.address,
      e.city,
      e.region,
      e.postal_code,
      e.country,
      e.home_phone
    ];
  }
  var dipendentiGrid = new gridjs.Grid({
    columns: dipendentiColumns,
    data: dipendentiData.map(dipendentiRowMapper),
    pagination: { enabled: true, limit: 15 },
    sort: true,
    resizable: true,
    className: { table: 'table table-dark mb-0' }
  });
  dipendentiGrid.render(dipendentiDiv);
  dipendentiDiv.dataset.gridjsInit = '1';
  
  // Inizializza il detail manager
  if (typeof initDetailManager === 'function') {
    var fieldMapping = {
      employee_id: 'dip-id',
      last_name: 'dip-last-name',
      first_name: 'dip-first-name',
      title: 'dip-title',
      title_of_courtesy: 'dip-title-of-courtesy',
      birth_date: 'dip-birth-date',
      hire_date: 'dip-hire-date',
      address: 'dip-address',
      city: 'dip-city',
      region: 'dip-region',
      postal_code: 'dip-postal-code',
      country: 'dip-country',
      home_phone: 'dip-home-phone',
      extension: 'dip-extension',
      reports_to: 'dip-reports-to',
      notes: 'dip-notes'
    };
    initDetailManager('dipendenti', dipendentiData, dipendentiGrid, fieldMapping, dipendentiRowMapper);
    makeSearcher('dipendenti-search', 'dipendenti', dipendentiGrid, dipendentiRowMapper, fieldMapping);
  }
}

// Inizializza la tabella spedizionieri
// ----------------------------------------------------------------------
async function initSpedizionieri() {
  var spedizionieriDiv = document.getElementById('spedizionieri-grid');
  if (!spedizionieriDiv || spedizionieriDiv.dataset.gridjsInit) return;
  var spedizionieriData = await fetchData('json/shippers.json');
  var spedizionieriColumns = [
    { id: 'shipper_id', name: 'ID', width: 70 },
    { id: 'company_name', name: 'Azienda' },
    { id: 'phone', name: 'Telefono' }
  ];
  function spedizionieriRowMapper(s) {
    return [s.shipper_id, s.company_name, s.phone];
  }
  var spedizionieriGrid = new gridjs.Grid({
    columns: spedizionieriColumns,
    data: spedizionieriData.map(spedizionieriRowMapper),
    pagination: { enabled: true, limit: 10 },
    sort: true,
    resizable: true,
    className: { table: 'table table-dark mb-0' }
  });
  spedizionieriGrid.render(spedizionieriDiv);
  spedizionieriDiv.dataset.gridjsInit = '1';
  
  // Inizializza il detail manager
  if (typeof initDetailManager === 'function') {
    var fieldMapping = {
      shipper_id: 'sped-id',
      company_name: 'sped-company-name',
      phone: 'sped-phone'
    };
    initDetailManager('spedizionieri', spedizionieriData, spedizionieriGrid, fieldMapping, spedizionieriRowMapper);
    makeSearcher('spedizionieri-search', 'spedizionieri', spedizionieriGrid, spedizionieriRowMapper, fieldMapping);
  }
}

// Inizializza la tabella fornitori
// ----------------------------------------------------------------------
async function initFornitori() {
  var fornitoriDiv = document.getElementById('fornitori-grid');
  if (!fornitoriDiv || fornitoriDiv.dataset.gridjsInit) return;
  var fornitoriData = await fetchData('json/suppliers.json');
  var fornitoriColumns = [
    { id: 'supplier_id', name: 'ID', width: 70 },
    { id: 'company_name', name: 'Azienda' },
    { id: 'contact_name', name: 'Contatto' },
    { id: 'contact_title', name: 'Titolo' },
    { id: 'address', name: 'Indirizzo' },
    { id: 'city', name: 'Città' },
    { id: 'region', name: 'Regione' },
    { id: 'postal_code', name: 'CAP' },
    { id: 'country', name: 'Paese' },
    { id: 'phone', name: 'Telefono' }
  ];
  function fornitoriRowMapper(s) {
    return [
      s.supplier_id,
      s.company_name,
      s.contact_name,
      s.contact_title,
      s.address,
      s.city,
      s.region,
      s.postal_code,
      s.country,
      s.phone
    ];
  }
  var fornitoriGrid = new gridjs.Grid({
    columns: fornitoriColumns,
    data: fornitoriData.map(fornitoriRowMapper),
    pagination: { enabled: true, limit: 15 },
    sort: true,
    resizable: true,
    className: { table: 'table table-dark mb-0' }
  });
  fornitoriGrid.render(fornitoriDiv);
  fornitoriDiv.dataset.gridjsInit = '1';
  
  // Inizializza il detail manager
// ----------------------------------------------------------------------
  if (typeof initDetailManager === 'function') {
    var fieldMapping = {
      supplier_id: 'forn-id',
      company_name: 'forn-company-name',
      contact_name: 'forn-contact-name',
      contact_title: 'forn-contact-title',
      address: 'forn-address',
      city: 'forn-city',
      region: 'forn-region',
      postal_code: 'forn-postal-code',
      country: 'forn-country',
      phone: 'forn-phone',
      fax: 'forn-fax',
      homepage: 'forn-homepage'
    };
    initDetailManager('fornitori', fornitoriData, fornitoriGrid, fieldMapping, fornitoriRowMapper);
    makeSearcher('fornitori-search', 'fornitori', fornitoriGrid, fornitoriRowMapper, fieldMapping);
  }
}

// Inizializza la tabella ordini
async function initOrdini() {
  var ordiniDiv = document.getElementById('orders-grid');
  if (!ordiniDiv || ordiniDiv.dataset.gridjsInit) return;
  var ordiniData = await fetchData('json/orders.json');
  var ordiniColumns = [
    { id: 'order_id', name: 'ID', width: 70 },
    { id: 'customer_id', name: 'Cliente', width: 85 },
    { id: 'employee_id', name: 'Dipendente', width: 110 },
    { id: 'order_date', name: 'Data ordine' },
    { id: 'required_date', name: 'Data richiesta' },
    { id: 'shipped_date', name: 'Data spedizione' },
    { id: 'ship_via', name: 'Via Sped.' },
    { id: 'freight', name: 'Spedizione €' },
    { id: 'ship_name', name: 'Destinatario' },
    { id: 'ship_address', name: 'Indirizzo' },
    { id: 'ship_city', name: 'Città' },
    { id: 'ship_region', name: 'Regione' },
    { id: 'ship_postal_code', name: 'CAP' },
    { id: 'ship_country', name: 'Paese' }
  ];
  function ordiniRowMapper(o) {
    return [
      o.order_id,
      o.customer_id,
      o.employee_id,
      o.order_date,
      o.required_date,
      o.shipped_date,
      o.ship_via,
      o.freight,
      o.ship_name,
      o.ship_address,
      o.ship_city,
      o.ship_region,
      o.ship_postal_code,
      o.ship_country
    ];
  }
  var ordiniGrid = new gridjs.Grid({
    columns: ordiniColumns,
    data: ordiniData.map(ordiniRowMapper),
    pagination: { enabled: true, limit: 15 },
    sort: true,
    resizable: true,
    className: { table: 'table table-dark mb-0' }
  });
  ordiniGrid.render(ordiniDiv);
  ordiniDiv.dataset.gridjsInit = '1';
  
  // Inizializza il detail manager per ordini
  if (typeof initDetailManager === 'function') {
    var fieldMapping = {
      order_id: 'of-order-id',
      customer_id: 'of-customer-id',
      employee_id: 'of-employee-id',
      order_date: 'of-order-date',
      required_date: 'of-required-date',
      shipped_date: 'of-shipped-date',
      ship_name: 'of-ship-name',
      ship_address: 'of-ship-address',
      ship_city: 'of-ship-city',
      ship_region: 'of-ship-region',
      ship_postal_code: 'of-ship-postal',
      ship_country: 'of-ship-country',
      freight: 'of-freight'
    };
    initDetailManager('orders', ordiniData, ordiniGrid, fieldMapping, ordiniRowMapper);
    makeSearcher('order-search', 'orders', ordiniGrid, ordiniRowMapper, fieldMapping);
  }
}

// Funzione che inizializza tutte le tabelle
function initAll() {
  if (typeof gridjs === 'undefined') {
    return;
  }
  initOrdini();
  initClienti();
  initProdotti();
  initCategorie();
  initDipendenti();
  initSpedizionieri();
  initFornitori();
}

// Osserva cambi nel container centrale per re-inizializzare le tabelle
var mainArea = document.getElementById('area-principale');
if (mainArea) {
  var observer = new MutationObserver(function () {
    initAll();
  });
  observer.observe(mainArea, { childList: true, subtree: true });
}

// Carica Grid.js e inizializza le tabelle quando la pagina è pronta
ensureGridJs(function () {
  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('page:loaded', initAll);
  setTimeout(initAll, 400); // ulteriore tentativo dopo caricamenti lenti
});
