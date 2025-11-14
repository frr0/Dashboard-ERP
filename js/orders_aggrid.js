// orders_aggrid.js - Gestione Ordini con AG Grid (master/detail)
(function(){
  const LS_ADDED = 'erp-orders-added';
  const LS_DELETED = 'erp-orders-deleted';
  const LS_UPDATED = 'erp-orders-updated';
  const LS_LINES_PREFIX = 'erp-order-lines-';

  function loadLS(key, def){ try{ return JSON.parse(localStorage.getItem(key)||JSON.stringify(def)); }catch{ return def; } }
  function saveLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  async function fetchJSON(url){ const bust=(url.includes('?')?'&':'?')+'_'+Date.now(); const r=await fetch(url+bust,{cache:'no-store'}); const d=await r.json(); return d?.results?.[0]?.items||[]; }

  function parseOracleDateToISO(s){
    if(!s) return '';
    const m = s.match(/(\d{2})-([A-Z]{3})-(\d{2})/);
    if(m){
      const MON = {JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};
      const yyyy = (Number(m[3]) < 70 ? 2000 : 1900) + Number(m[3]);
      return `${yyyy}-${String(MON[m[2]]).padStart(2,'0')}-${m[1]}`;
    }
    const d = new Date(s); return isNaN(d) ? '' : d.toISOString().slice(0,10);
  }
  function mergeOrders(base){
    const added = loadLS(LS_ADDED, []);
    const deleted = new Set(loadLS(LS_DELETED, []));
    const updated = loadLS(LS_UPDATED, {});
    return base.concat(added).filter(o=>!deleted.has(o.order_id)).map(o=> ({...o, ...(updated[o.order_id]||{})}));
  }
  function nextOrderId(all){ let m=0; all.forEach(o=>{ if(Number(o.order_id)>m) m=Number(o.order_id); }); return m+1; }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch])); }

  window.caricaOrdini = async function(){
    const [ordersRaw, products] = await Promise.all([
      fetchJSON('json/orders.json'),
      fetchJSON('json/products.json')
    ]);
    let base = ordersRaw.map(o => ({ ...o, order_date_iso: parseOracleDateToISO(o.order_date), required_date_iso: parseOracleDateToISO(o.required_date), shipped_date_iso: parseOracleDateToISO(o.shipped_date) }));
    let all = mergeOrders(base);
    const productsById = new Map(products.map(p => [p.product_id, p]));

    // Orders grid (master)
    const ordersColDefs = [
      { headerName:'ID', field:'order_id', width:100 },
      { headerName:'Data ordine', field:'order_date_iso', width:160, sort:'desc' },
      { headerName:'Destinatario', field:'ship_name' },
      { headerName:'Città', field:'ship_city', width:160 },
      { headerName:'Paese', field:'ship_country', width:140 },
      { headerName:'Spedizione', field:'freight', width:130, valueFormatter:p=> (p.value==null?'':Number(p.value).toFixed(2)), type:'numericColumn' }
    ];
    const ordersGridOptions = {
      columnDefs: ordersColDefs,
      rowData: all,
      defaultColDef: { sortable:true, filter:true, resizable:true },
      rowSelection: 'single',
      pagination: true,
      paginationPageSize: 50,
      animateRows: true,
      onRowClicked: (e)=>{
        fillHeaderForm(e.data);
        const lines = loadLS(LS_LINES_PREFIX + e.data.order_id, []);
        linesGridOptions.api.setRowData(lines);
      }
    };
    const ordersEl = document.getElementById('orders-grid');
    new agGrid.Grid(ordersEl, ordersGridOptions);

    // Lines grid (detail)
    const linesColDefs = [
      { headerName:'', checkboxSelection:true, headerCheckboxSelection:true, width:40, pinned:'left' },
      { headerName:'Prodotto ID', field:'product_id', editable:true, width:140, valueSetter:(p)=>{ p.data.product_id = Number(p.newValue||0)||''; return true; } },
      { headerName:'Nome', field:'product_name', valueGetter:(p)=>{ const prod=productsById.get(Number(p.data.product_id)); return prod?prod.product_name:''; } },
      { headerName:'Quantità', field:'quantity', editable:true, width:130, type:'numericColumn', valueSetter:(p)=>{ p.data.quantity = Number(p.newValue||0); return true; } },
      { headerName:'Prezzo', field:'unit_price', editable:true, width:140, type:'numericColumn', valueFormatter:p=> (p.value==null?'':Number(p.value).toFixed(2)), valueSetter:(p)=>{ p.data.unit_price = Number(p.newValue||0); return true; } },
      { headerName:'Totale', field:'total', width:140, type:'numericColumn', valueGetter:(p)=>{ const q=Number(p.data.quantity||0), up=Number(p.data.unit_price||0); return (q*up).toFixed(2); } },
    ];
    const linesGridOptions = {
      columnDefs: linesColDefs,
      rowData: [],
      defaultColDef: { sortable:false, filter:false, resizable:true },
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 50,
      animateRows: true,
      onCellValueChanged: persistLines,
    };
    const linesEl = document.getElementById('lines-grid');
    new agGrid.Grid(linesEl, linesGridOptions);

    function setVal(id, v){ const el=document.getElementById(id); if(el) el.value = v??''; }
    function getVal(id){ const el=document.getElementById(id); return el?el.value:''; }
    function fillHeaderForm(o){
      setVal('of-order-id', o.order_id);
      setVal('of-order-date', o.order_date_iso);
      setVal('of-required-date', o.required_date_iso);
      setVal('of-shipped-date', o.shipped_date_iso);
      setVal('of-customer-id', o.customer_id);
      setVal('of-employee-id', o.employee_id);
      setVal('of-ship-name', o.ship_name);
      setVal('of-ship-address', o.ship_address);
      setVal('of-ship-city', o.ship_city);
      setVal('of-ship-region', o.ship_region);
      setVal('of-ship-postal', o.ship_postal_code);
      setVal('of-ship-country', o.ship_country);
      setVal('of-freight', o.freight);
    }
    function selectedOrder(){ const sel=ordersGridOptions.api.getSelectedRows(); return sel && sel[0] ? sel[0] : null; }

    // Search
    const search = document.getElementById('order-search');
    let t; search.addEventListener('input', ()=>{ clearTimeout(t); t=setTimeout(()=> ordersGridOptions.api.setQuickFilter(search.value), 120); });

    // Toolbar
    document.getElementById('btn-refresh').addEventListener('click', async ()=>{
      const fresh = (await fetchJSON('json/orders.json')).map(o=> ({ ...o, order_date_iso: parseOracleDateToISO(o.order_date), required_date_iso: parseOracleDateToISO(o.required_date), shipped_date_iso: parseOracleDateToISO(o.shipped_date) }));
      base = fresh; all = mergeOrders(base); ordersGridOptions.api.setRowData(all);
      document.getElementById('order-form').reset(); linesGridOptions.api.setRowData([]);
    });
    document.getElementById('btn-new-order').addEventListener('click', ()=>{
      const nid = nextOrderId(all); const today = new Date().toISOString().slice(0,10);
      const blank = { order_id:nid, order_date_iso: today, freight:0 };
      const added = loadLS(LS_ADDED, []); added.push(blank); saveLS(LS_ADDED, added);
      all.push(blank); ordersGridOptions.api.applyTransaction({ add:[blank], addIndex:0 });
      ordersGridOptions.api.ensureIndexVisible(0); // top
      // Select new row
      const rowNode = ordersGridOptions.api.getDisplayedRowAtIndex(0); if(rowNode){ rowNode.setSelected(true); }
    });
    document.getElementById('btn-delete').addEventListener('click', ()=>{
      const cur = selectedOrder(); if(!cur){ alert('Seleziona un ordine da eliminare.'); return; }
      if(!confirm(`Eliminare l'ordine ${cur.order_id}?`)) return;
      const deleted = new Set(loadLS(LS_DELETED, [])); deleted.add(cur.order_id); saveLS(LS_DELETED, Array.from(deleted));
      saveLS(LS_ADDED, loadLS(LS_ADDED, []).filter(o=>Number(o.order_id)!==Number(cur.order_id)));
      const upd = loadLS(LS_UPDATED, {}); delete upd[cur.order_id]; saveLS(LS_UPDATED, upd);
      localStorage.removeItem(LS_LINES_PREFIX + cur.order_id);
      ordersGridOptions.api.applyTransaction({ remove:[cur] });
      document.getElementById('order-form').reset(); linesGridOptions.api.setRowData([]);
    });
    document.getElementById('btn-export').addEventListener('click', ()=>{
      ordersGridOptions.api.exportDataAsCsv({ fileName:'orders.csv' });
    });
    document.getElementById('btn-email').addEventListener('click', ()=>{
      const cur = selectedOrder(); if(!cur){ alert('Seleziona un ordine.'); return; }
      const lines = loadLS(LS_LINES_PREFIX + cur.order_id, []);
      const w = window.open('', '_blank');
      w.document.write(`<html><head><title>Ordine ${cur.order_id}</title></head><body>`);
      w.document.write(`<h2>Riepilogo ordine #${cur.order_id}</h2>`);
      w.document.write(`<p>Destinatario: ${escapeHtml(cur.ship_name||'')}<br>Città: ${escapeHtml(cur.ship_city||'')} - ${escapeHtml(cur.ship_country||'')}<br>Spedizione: € ${Number(cur.freight||0).toFixed(2)}</p>`);
      if(lines.length){
        w.document.write('<table border="1" cellspacing="0" cellpadding="6"><tr><th>Prodotto</th><th>Q.tà</th><th>Prezzo</th><th>Totale</th></tr>');
        lines.forEach(ln=>{ const q=Number(ln.quantity||0), p=Number(ln.unit_price||0); w.document.write(`<tr><td>${escapeHtml(String(ln.product_id))}</td><td>${q}</td><td>${p.toFixed(2)}</td><td>${(q*p).toFixed(2)}</td></tr>`); });
        w.document.write('</table>');
      }
      w.document.write('<script>window.print();<\/script></body></html>'); w.document.close(); setTimeout(()=>{ try{w.close();}catch{} }, 1000);
      alert('Invio email simulato: usa Stampa → Salva PDF.');
    });

    // Save header
    document.getElementById('btn-save-order').addEventListener('click', ()=>{
      const cur = selectedOrder(); if(!cur){ alert('Seleziona o crea un ordine.'); return; }
      const patch = {
        order_date_iso: getVal('of-order-date'),
        required_date_iso: getVal('of-required-date'),
        shipped_date_iso: getVal('of-shipped-date'),
        customer_id: Number(getVal('of-customer-id')||0)||null,
        employee_id: Number(getVal('of-employee-id')||0)||null,
        ship_name: getVal('of-ship-name'),
        ship_address: getVal('of-ship-address'),
        ship_city: getVal('of-ship-city'),
        ship_region: getVal('of-ship-region'),
        ship_postal_code: getVal('of-ship-postal'),
        ship_country: getVal('of-ship-country'),
        freight: Number(getVal('of-freight')||0)
      };
      const upd = loadLS(LS_UPDATED, {}); upd[cur.order_id] = patch; saveLS(LS_UPDATED, upd);
      // update row
      const rowNode = ordersGridOptions.api.getSelectedNodes()[0]; if(rowNode){ Object.assign(rowNode.data, patch); ordersGridOptions.api.refreshCells({ force:true }); }
      const s = document.getElementById('order-status'); s.textContent = 'Salvato'; setTimeout(()=> s.textContent = '', 1200);
    });

    // Lines actions
    function persistLines(){ const cur=selectedOrder(); if(!cur) return; saveLS(LS_LINES_PREFIX + cur.order_id, linesGridOptions.api.getDisplayedRowAtIndex ? linesGridOptions.api.getRenderedNodes().map(n=>n.data) : linesGridOptions.api.getModel().rowsToDisplay.map(r=>r.data)); }
    document.getElementById('btn-add-line').addEventListener('click', ()=>{
      const cur = selectedOrder(); if(!cur){ alert('Seleziona un ordine.'); return; }
      linesGridOptions.api.applyTransaction({ add:[{ product_id:'', quantity:1, unit_price:0 }] });
      persistLines();
    });
    document.getElementById('btn-remove-line').addEventListener('click', ()=>{
      const cur = selectedOrder(); if(!cur){ alert('Seleziona un ordine.'); return; }
      const sel = linesGridOptions.api.getSelectedRows(); if(!sel.length){ alert('Seleziona le righe da rimuovere.'); return; }
      linesGridOptions.api.applyTransaction({ remove: sel });
      persistLines();
    });
    document.getElementById('btn-save-lines').addEventListener('click', ()=>{ persistLines(); alert('Righe ordine salvate.'); });
  };
})();
