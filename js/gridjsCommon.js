// gridjsCommon.js - inizializzazione generica Grid.js per pagine dinamiche
(function(){
  // Fallback dinamico se la CDN di Grid.js non è ancora caricata
  function ensureGridJs(cb){
    if (typeof gridjs !== 'undefined'){ cb(); return; }
    const existing = document.querySelector('script[data-dynamic-gridjs]');
    if(existing){ existing.addEventListener('load', ()=> cb()); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/gridjs/dist/gridjs.umd.js';
    s.async = true; s.defer = true; s.dataset.dynamicGridjs = '1';
    s.onload = ()=> cb();
    s.onerror = ()=> console.error('Grid.js CDN non raggiungibile');
    document.head.appendChild(s);
  }

  async function fetchData(url){
    try {
      const res = await fetch(url + (url.includes('?')?'&':'?') + '_=' + Date.now(), { cache:'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data?.results?.[0]?.items) return data.results[0].items;
      return data || [];
    } catch(e){
      console.error('fetchData error', url, e);
      return [];
    }
  }

  function makeSearcher(inputId, originalData, grid, rowMapper){
    const input = document.getElementById(inputId);
    if(!input) return;
    input.addEventListener('input', function(){
      const term = this.value.toLowerCase().trim();
      const filtered = !term ? originalData : originalData.filter(obj => {
        return Object.values(obj).some(v => v!=null && String(v).toLowerCase().includes(term));
      });
      grid.updateConfig({ data: filtered.map(rowMapper) }).forceRender();
    });
  }

  async function initClienti(){
    const el = document.getElementById('clienti-grid');
    if(!el || el.dataset.gridjsInit) return;
    const data = await fetchData('json/customers.json');
    const columns = [
      { id:'customer_id', name:'ID', width:70 },
      { id:'customer_code', name:'Codice' },
      { id:'company_name', name:'Azienda' },
      { id:'contact_name', name:'Contatto' },
      { id:'contact_title', name:'Titolo' },
      { id:'address', name:'Indirizzo' },
      { id:'city', name:'Città' },
      { id:'region', name:'Regione' },
      { id:'postal_code', name:'CAP' },
      { id:'country', name:'Paese' },
      { id:'phone', name:'Telefono' },
      { id:'fax', name:'Fax' }
    ];
    const rowMapper = c => [
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
    const grid = new gridjs.Grid({
      columns,
      data: data.map(rowMapper),
      pagination:{ enabled:true, limit:15 },
      sort:true,
      resizable:true,
      className:{ table:'table table-dark table-striped mb-0' }
    });
    grid.render(el); el.dataset.gridjsInit = '1';
    makeSearcher('clienti-search', data, grid, rowMapper);
  }

  async function initProdotti(){
    const el = document.getElementById('prodotti-grid');
    if(!el || el.dataset.gridjsInit) return;
    const data = await fetchData('json/products.json');
    const columns = [
      { id:'product_id', name:'ID', width:70 },
      { id:'product_name', name:'Prodotto' },
      { id:'supplier_id', name:'Fornitore', width:90 },
      { id:'category_id', name:'Categoria', width:90 },
      { id:'quantity_per_unit', name:'Formato' },
      { id:'unit_price', name:'Prezzo', width:90 },
      { id:'units_in_stock', name:'Stock', width:80 },
      { id:'units_on_order', name:'In ordine', width:90 },
      { id:'reorder_level', name:'Riordino', width:90 },
      { id:'discontinued', name:'Discontinuato', width:110 }
    ];
    const rowMapper = p => [
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
    const grid = new gridjs.Grid({ columns, data:data.map(rowMapper), pagination:{enabled:true, limit:15}, sort:true, resizable:true, className:{ table:'table table-dark table-striped mb-0' } });
    grid.render(el); el.dataset.gridjsInit='1';
    makeSearcher('prodotti-search', data, grid, rowMapper);
  }

  async function initCategorie(){
    const el = document.getElementById('categorie-grid');
    if(!el || el.dataset.gridjsInit) return;
    const data = await fetchData('json/categories.json');
    const columns = [
      { id:'category_id', name:'ID', width:70 },
      { id:'category_name', name:'Categoria' },
      { id:'description', name:'Descrizione' }
    ];
    const rowMapper = c => [c.category_id, c.category_name, c.description];
    const grid = new gridjs.Grid({ columns, data:data.map(rowMapper), pagination:{enabled:true, limit:15}, sort:true, resizable:true, className:{table:'table table-dark table-striped mb-0'} });
    grid.render(el); el.dataset.gridjsInit='1';
    makeSearcher('categorie-search', data, grid, rowMapper);
  }

  async function initDipendenti(){
    const el = document.getElementById('dipendenti-grid');
    if(!el || el.dataset.gridjsInit) return;
    const data = await fetchData('json/employees.json');
    const columns = [
      { id:'employee_id', name:'ID', width:70 },
      { id:'last_name', name:'Cognome' },
      { id:'first_name', name:'Nome' },
      { id:'title', name:'Titolo' },
      { id:'title_of_courtesy', name:'Titolo cortesia' },
      { id:'birth_date', name:'Nascita' },
      { id:'hire_date', name:'Assunzione' },
      { id:'address', name:'Indirizzo' },
      { id:'city', name:'Città' },
      { id:'region', name:'Regione' },
      { id:'postal_code', name:'CAP' },
      { id:'country', name:'Paese' },
      { id:'home_phone', name:'Telefono' }
    ];
    const rowMapper = e => [
      e.employee_id,
      e.last_name,
      e.first_name,
      e.title,
      e.title_of_courtesy,
      e.birth_date,
      e.hire_date,
      e.address,
      e.city,
      e.region,
      e.postal_code,
      e.country,
      e.home_phone
    ];
    const grid = new gridjs.Grid({ columns, data:data.map(rowMapper), pagination:{enabled:true, limit:15}, sort:true, resizable:true, className:{table:'table table-dark table-striped mb-0'} });
    grid.render(el); el.dataset.gridjsInit='1';
    makeSearcher('dipendenti-search', data, grid, rowMapper);
  }

  async function initSpedizionieri(){
    const el = document.getElementById('spedizionieri-grid');
    if(!el || el.dataset.gridjsInit) return;
    const data = await fetchData('json/shippers.json');
    const columns = [
      { id:'shipper_id', name:'ID', width:70 },
      { id:'company_name', name:'Azienda' },
      { id:'phone', name:'Telefono' }
    ];
    const rowMapper = s => [s.shipper_id, s.company_name, s.phone];
    const grid = new gridjs.Grid({ columns, data:data.map(rowMapper), pagination:{enabled:true, limit:10}, sort:true, resizable:true, className:{table:'table table-dark table-striped mb-0'} });
    grid.render(el); el.dataset.gridjsInit='1';
    makeSearcher('spedizionieri-search', data, grid, rowMapper);
  }

  async function initFornitori(){
    const el = document.getElementById('fornitori-grid');
    if(!el || el.dataset.gridjsInit) return;
    const data = await fetchData('json/suppliers.json');
    const columns = [
      { id:'supplier_id', name:'ID', width:70 },
      { id:'company_name', name:'Azienda' },
      { id:'contact_name', name:'Contatto' },
      { id:'contact_title', name:'Titolo' },
      { id:'address', name:'Indirizzo' },
      { id:'city', name:'Città' },
      { id:'region', name:'Regione' },
      { id:'postal_code', name:'CAP' },
      { id:'country', name:'Paese' },
      { id:'phone', name:'Telefono' }
    ];
    const rowMapper = s => [
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
    const grid = new gridjs.Grid({ columns, data:data.map(rowMapper), pagination:{enabled:true, limit:15}, sort:true, resizable:true, className:{table:'table table-dark table-striped mb-0'} });
    grid.render(el); el.dataset.gridjsInit='1';
    makeSearcher('fornitori-search', data, grid, rowMapper);
  }

  async function initOrdini(){
    const el = document.getElementById('orders-grid');
    if(!el || el.dataset.gridjsInit) return;
    const data = await fetchData('json/orders.json');
    const columns = [
      { id:'order_id', name:'ID', width:70 },
      { id:'customer_id', name:'Cliente', width:85 },
      { id:'employee_id', name:'Dipendente', width:110 },
      { id:'order_date', name:'Data ordine' },
      { id:'required_date', name:'Data richiesta' },
      { id:'shipped_date', name:'Data spedizione' },
      { id:'ship_via', name:'Via Sped.' },
      { id:'freight', name:'Spedizione €' },
      { id:'ship_name', name:'Destinatario' },
      { id:'ship_address', name:'Indirizzo' },
      { id:'ship_city', name:'Città' },
      { id:'ship_region', name:'Regione' },
      { id:'ship_postal_code', name:'CAP' },
      { id:'ship_country', name:'Paese' }
    ];
    const rowMapper = o => [
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
    const grid = new gridjs.Grid({ columns, data:data.map(rowMapper), pagination:{enabled:true, limit:15}, sort:true, resizable:true, className:{table:'table table-dark table-striped mb-0'} });
    grid.render(el); el.dataset.gridjsInit='1';
    // Ricerca ordini
    const input = document.getElementById('order-search');
    if(input){
      input.addEventListener('input', function(){
        const t = this.value.toLowerCase().trim();
        const filtered = !t ? data : data.filter(o => (
          String(o.order_id).includes(t) ||
          String(o.customer_id||'').toLowerCase().includes(t) ||
          String(o.ship_name||'').toLowerCase().includes(t) ||
          String(o.ship_city||'').toLowerCase().includes(t)
        ));
        grid.updateConfig({ data: filtered.map(rowMapper) }).forceRender();
      });
    }
  }

  function initAll(){
    if(typeof gridjs === 'undefined'){ return; }
    initOrdini();
    initClienti();
    initProdotti();
    initCategorie();
    initDipendenti();
    initSpedizionieri();
    initFornitori();
  }

  // Osserva cambi nel container centrale per re-inizializzare
  const area = document.getElementById('area-principale');
  if(area){
    const mo = new MutationObserver(()=> initAll());
    mo.observe(area, { childList:true, subtree:true });
  }

  ensureGridJs(()=>{
    document.addEventListener('DOMContentLoaded', initAll);
    document.addEventListener('page:loaded', initAll);
    setTimeout(initAll, 400); // ulteriore tentativo dopo caricamenti lenti
  });
})();
