// Vanilla JS: wrappers per i vari dataset
(function () {
  function wrap(jsonUrl, labels, tableSelector) {
    return window.loadAndRenderTable({ jsonUrl, labels, tableSelector });
  }

  window.caricaClienti = function () { return wrap('json/customers.json', {
    customer_id: 'ID', customer_code: 'Codice', company_name: 'Azienda', contact_name: 'Contatto',
    contact_title: 'Titolo', address: 'Indirizzo', city: 'Città', region: 'Regione', postal_code: 'CAP',
    country: 'Paese', phone: 'Telefono', fax: 'Fax'
  }); };

  window.caricaProdotti = function () { return wrap('json/products.json', {
    product_id: 'ID', product_name: 'Prodotto', supplier_id: 'Fornitore', category_id: 'Categoria',
    quantity_per_unit: 'Quantità per unità', unit_price: 'Prezzo unitario', units_in_stock: 'Disponibilità',
    units_on_order: 'Ordinati', reorder_level: 'Soglia riordino', discontinued: 'Discontinuato'
  }); };

  window.caricaOrdini = function () { return wrap('json/orders.json', {
    order_id: 'ID Ordine', customer_id: 'ID Cliente', employee_id: 'ID Dipendente', order_date: 'Data Ordine',
    required_date: 'Data Richiesta', shipped_date: 'Data Spedizione', ship_name: 'Destinatario',
    ship_city: 'Città Spedizione', ship_country: 'Paese Spedizione', freight: 'Spedizione'
  }); };

  window.caricaCategorie = function () { return wrap('json/categories.json', {
    category_id: 'ID', category_name: 'Nome Categoria', description: 'Descrizione', picture: 'Immagine'
  }); };

  window.caricaDipendenti = function () { return wrap('json/employees.json', {
    employee_id: 'ID', lastname: 'Cognome', firstname: 'Nome', title: 'Titolo', title_of_courtesy: 'Titolo di cortesia',
    birthdate: 'Data di nascita', hiredate: 'Data assunzione', address: 'Indirizzo', city: 'Città', region: 'Regione',
    postal_code: 'CAP', country: 'Paese', home_phone: 'Telefono', extension: 'Interno', photo: 'Foto', notes: 'Note',
    reports_to: 'Riporta a', username: 'Username', password: 'Password'
  }); };

  window.caricaSpedizionieri = function () { return wrap('json/shippers.json', {
    shipper_id: 'ID', company_name: 'Azienda', phone: 'Telefono'
  }, '#tabella-spedizionieri'); };

  window.caricaFornitori = function () { return wrap('json/suppliers.json', {
    supplier_id: 'ID', company_name: 'Azienda', contact_name: 'Contatto', contact_title: 'Titolo Contatto', address: 'Indirizzo',
    city: 'Città', region: 'Regione', postal_code: 'CAP', country: 'Paese', phone: 'Telefono', fax: 'Fax', home_page: 'Home Page'
  }, '#tabella-fornitori'); };
})();
