// wrappers.js
// Funzioni specifiche per ogni dataset (usano loadAndRenderTable)

window.caricaClienti = function () {
  const labels = {
    customer_id: 'ID', customer_code: 'Codice', company_name: 'Azienda', contact_name: 'Contatto',
    contact_title: 'Titolo', address: 'Indirizzo', city: 'Città', region: 'Regione', postal_code: 'CAP',
    country: 'Paese', phone: 'Telefono', fax: 'Fax'
  };
  return window.loadAndRenderTable({ jsonUrl: 'json/customers.json', labels });
};

window.caricaProdotti = function () {
  const labels = {
    product_id: 'ID', product_name: 'Prodotto', supplier_id: 'Fornitore', category_id: 'Categoria',
    quantity_per_unit: 'Quantità per unità', unit_price: 'Prezzo unitario', units_in_stock: 'Disponibilità',
    units_on_order: 'Ordinati', reorder_level: 'Soglia riordino', discontinued: 'Discontinuato'
  };
  return window.loadAndRenderTable({ jsonUrl: 'json/products.json', labels });
};

window.caricaOrdini = function () {
  const labels = {
    order_id: 'ID Ordine', customer_id: 'ID Cliente', employee_id: 'ID Dipendente', order_date: 'Data Ordine',
    required_date: 'Data Richiesta', shipped_date: 'Data Spedizione', ship_name: 'Destinatario',
    ship_city: 'Città Spedizione', ship_country: 'Paese Spedizione', freight: 'Spedizione'
  };
  return window.loadAndRenderTable({ jsonUrl: 'json/orders.json', labels });
};

window.caricaCategorie = function () {
  const labels = { category_id: 'ID', category_name: 'Nome Categoria', description: 'Descrizione', picture: 'Immagine' };
  return window.loadAndRenderTable({ jsonUrl: 'json/categories.json', labels });
};

window.caricaDipendenti = function () {
  const labels = {
    employee_id: 'ID', lastname: 'Cognome', firstname: 'Nome', title: 'Titolo', title_of_courtesy: 'Titolo di cortesia',
    birthdate: 'Data di nascita', hiredate: 'Data assunzione', address: 'Indirizzo', city: 'Città', region: 'Regione',
    postal_code: 'CAP', country: 'Paese', home_phone: 'Telefono', extension: 'Interno', photo: 'Foto', notes: 'Note',
    reports_to: 'Riporta a', username: 'Username', password: 'Password'
  };
  return window.loadAndRenderTable({ jsonUrl: 'json/employees.json', labels });
};

window.caricaSpedizionieri = function () {
  const labels = { shipper_id: 'ID', company_name: 'Azienda', phone: 'Telefono' };
  return window.loadAndRenderTable({ jsonUrl: 'json/shippers.json', labels, tableSelector: '#tabella-spedizionieri' });
};

window.caricaFornitori = function () {
  const labels = {
    supplier_id: 'ID', company_name: 'Azienda', contact_name: 'Contatto', contact_title: 'Titolo Contatto', address: 'Indirizzo',
    city: 'Città', region: 'Regione', postal_code: 'CAP', country: 'Paese', phone: 'Telefono', fax: 'Fax', home_page: 'Home Page'
  };
  return window.loadAndRenderTable({ jsonUrl: 'json/suppliers.json', labels, tableSelector: '#tabella-fornitori' });
};
