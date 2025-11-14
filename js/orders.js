// orders.js - Gestione pagina Ordini (master/detail)
(function(){
  const LS_ADDED = 'erp-orders-added';
  const LS_DELETED = 'erp-orders-deleted';
  const LS_UPDATED = 'erp-orders-updated'; // map order_id -> fields
  const LS_LINES_PREFIX = 'erp-order-lines-';

  const MONTHS = {
    JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5,
    JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11
  };

  function tryParseDate(s){
    if(!s) return null;
    // accepts formats: 09-DEC-96 or ISO yyyy-mm-dd
    if(/\d{2}-[A-Z]{3}-\d{2}/.test(s)){
      const [dd,mon,yy] = s.split('-');
      const year = parseInt(yy,10) + 1900 + (parseInt(yy,10) < 70 ? 2000-1900 : 0);
      return new Date(year, MONTHS[mon.toUpperCase()], parseInt(dd,10));
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  function toInputDate(d){
    if(!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }
  function fromInputDate(s){
    if(!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  function fmtCurrency(n){
    if(n==null || n==='') return '';
    return Number(n).toFixed(2);
  }

  function loadLS(key, def){
    try{ return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); }catch{ return def; }
  }
  function saveLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  async function fetchJSON(url){
    const bust = (url.includes('?')?'&':'?') + '_=' + Date.now();
    const res = await fetch(url + bust, { cache:'no-store' });
    const data = await res.json();
    return data?.results?.[0]?.items || [];
  }

  async function loadDatasets(){
    const [orders, customers, products] = await Promise.all([
      fetchJSON('json/orders.json'),
      fetchJSON('json/customers.json'),
      fetchJSON('json/products.json')
    ]);
    const productsById = new Map(products.map(p => [p.product_id, p]));
    const customersById = new Map(customers.map(c => [c.customer_id, c]));
    return { orders, customersById, productsById };
  }

  function mergeOrders(base){
    const added = loadLS(LS_ADDED, []);
    const deleted = new Set(loadLS(LS_DELETED, []));
    const updated = loadLS(LS_UPDATED, {});
    const all = base.concat(added).filter(o => !deleted.has(o.order_id));
    return all.map(o => ({ ...o, ...(updated[o.order_id]||{}) }));
  }

  function sortByDateDesc(orders){
    return orders.slice().sort((a,b)=>{
      const da = tryParseDate(a.order_date) || new Date(0);
      const db = tryParseDate(b.order_date) || new Date(0);
      return db - da;
    });
  }

  function renderOrdersTable(orders){
    const tbody = document.querySelector('#orders-table tbody');
    if(!tbody) return;
    if(!orders.length){
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Nessun ordine trovato</td></tr>';
      return;
    }
    const rows = orders.map(o=>{
      const date = tryParseDate(o.order_date);
      const fmt = date ? toInputDate(date) : '';
      return `<tr data-id="${o.order_id}">`+
        `<td>${o.order_id}</td>`+
        `<td>${fmt}</td>`+
        `<td>${escapeHtml(o.ship_name||'')}</td>`+
        `<td>${escapeHtml(o.ship_city||'')}</td>`+
        `<td>${escapeHtml(o.ship_country||'')}</td>`+
        `<td class="text-end">${fmtCurrency(o.freight)}</td>`+
      `</tr>`;
    }).join('');
    tbody.innerHTML = rows;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
  }

  function getSelectedOrderId(){
    const tr = document.querySelector('#orders-table tbody tr.selected');
    return tr ? Number(tr.dataset.id) : null;
  }

  function selectRowById(id){
    document.querySelectorAll('#orders-table tbody tr').forEach(tr=>{
      tr.classList.toggle('selected', Number(tr.dataset.id)===id);
    });
  }

  function loadLines(orderId){
    return loadLS(LS_LINES_PREFIX + orderId, []);
  }
  function saveLines(orderId, lines){
    saveLS(LS_LINES_PREFIX + orderId, lines);
  }

  function fillOrderForm(order){
    const byId = id => document.getElementById(id);
    byId('of-order-id').value = order.order_id ?? '';
    byId('of-order-date').value = toInputDate(tryParseDate(order.order_date));
    byId('of-required-date').value = toInputDate(tryParseDate(order.required_date));
    byId('of-shipped-date').value = toInputDate(tryParseDate(order.shipped_date));
    byId('of-customer-id').value = order.customer_id ?? '';
    byId('of-employee-id').value = order.employee_id ?? '';
    byId('of-ship-name').value = order.ship_name ?? '';
    byId('of-ship-address').value = order.ship_address ?? '';
    byId('of-ship-city').value = order.ship_city ?? '';
    byId('of-ship-region').value = order.ship_region ?? '';
    byId('of-ship-postal').value = order.ship_postal_code ?? '';
    byId('of-ship-country').value = order.ship_country ?? '';
    byId('of-freight').value = order.freight ?? '';
  }

  function readOrderForm(){
    const byId = id => document.getElementById(id).value;
    return {
      order_id: Number(document.getElementById('of-order-id').value),
      order_date: byId('of-order-date'),
      required_date: byId('of-required-date'),
      shipped_date: byId('of-shipped-date'),
      customer_id: Number(byId('of-customer-id')||0)||null,
      employee_id: Number(byId('of-employee-id')||0)||null,
      ship_name: byId('of-ship-name'),
      ship_address: byId('of-ship-address'),
      ship_city: byId('of-ship-city'),
      ship_region: byId('of-ship-region'),
      ship_postal_code: byId('of-ship-postal'),
      ship_country: byId('of-ship-country'),
      freight: Number(byId('of-freight')||0)
    };
  }

  function renderLinesTable(lines, productsById){
    const tbody = document.querySelector('#lines-table tbody');
    if(!tbody) return;
    if(!lines.length){
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Nessuna riga. Usa "Aggiungi riga".</td></tr>';
      return;
    }
    const html = lines.map((ln, idx)=>{
      const prod = productsById.get(Number(ln.product_id));
      const name = prod ? prod.product_name : '';
      const qty = Number(ln.quantity||0);
      const price = Number(ln.unit_price||0);
      const total = qty*price;
      return `<tr data-index="${idx}">`+
        `<td><input type="checkbox" class="ln-select" aria-label="seleziona riga"></td>`+
        `<td><input type="number" class="form-control form-control-sm ln-product" value="${ln.product_id??''}"></td>`+
        `<td class="ln-name">${escapeHtml(name)}</td>`+
        `<td class="text-end"><input type="number" class="form-control form-control-sm ln-qty" value="${qty}" step="1" min="0"></td>`+
        `<td class="text-end"><input type="number" class="form-control form-control-sm ln-price" value="${price}" step="0.01" min="0"></td>`+
        `<td class="text-end ln-total">${fmtCurrency(total)}</td>`+
      `</tr>`;
    }).join('');
    tbody.innerHTML = html;
  }

  function computeNewOrderId(allOrders){
    let maxId = 0;
    allOrders.forEach(o=>{ if(Number(o.order_id)>maxId) maxId = Number(o.order_id); });
    return maxId+1;
  }

  function exportCsv(filename, rows){
    const csv = rows.map(r=>r.map(v => {
      const s = String(v ?? '');
      if(/[";,\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
      return s;
    }).join(';')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function setupEvents(state){
    const tbody = document.querySelector('#orders-table tbody');
    tbody.addEventListener('click', (e)=>{
      const tr = e.target.closest('tr');
      if(!tr || !tr.dataset.id) return;
      const id = Number(tr.dataset.id);
      selectRowById(id);
      const order = state.all.find(o=>Number(o.order_id)===id);
      state.currentId = id;
      fillOrderForm(order);
      const lines = loadLines(id);
      renderLinesTable(lines, state.productsById);
    });

    const q = document.getElementById('order-search');
    q.addEventListener('input', ()=>{
      const term = q.value.toLowerCase().trim();
      const filtered = state.sorted.filter(o=>{
        return String(o.order_id).includes(term)
          || (o.ship_name||'').toLowerCase().includes(term)
          || (o.ship_city||'').toLowerCase().includes(term)
          || (o.ship_country||'').toLowerCase().includes(term);
      });
      renderOrdersTable(filtered);
    });

    document.getElementById('btn-refresh').addEventListener('click', async ()=>{
      await init();
    });

    document.getElementById('btn-new-order').addEventListener('click', ()=>{
      const newId = computeNewOrderId(state.all);
      const today = toInputDate(new Date());
      const blank = { order_id:newId, order_date: today, freight:0 };
      const added = loadLS(LS_ADDED, []);
      added.push(blank);
      saveLS(LS_ADDED, added);
      state.all.push(blank);
      state.sorted = sortByDateDesc(state.all);
      renderOrdersTable(state.sorted);
      selectRowById(newId);
      state.currentId = newId;
      fillOrderForm(blank);
      renderLinesTable([], state.productsById);
    });

    document.getElementById('btn-delete').addEventListener('click', ()=>{
      const id = getSelectedOrderId();
      if(!id){ alert('Seleziona un ordine da eliminare.'); return; }
      if(!confirm('Eliminare l\'ordine '+id+'?')) return;
      const deleted = new Set(loadLS(LS_DELETED, []));
      deleted.add(id);
      saveLS(LS_DELETED, Array.from(deleted));
      // Also remove added if present
      const added = loadLS(LS_ADDED, []).filter(o=>Number(o.order_id)!==id);
      saveLS(LS_ADDED, added);
      localStorage.removeItem(LS_LINES_PREFIX + id);
      const upd = loadLS(LS_UPDATED, {});
      delete upd[id]; saveLS(LS_UPDATED, upd);
      // refresh view
      state.all = mergeOrders(state.base);
      state.sorted = sortByDateDesc(state.all);
      renderOrdersTable(state.sorted);
      document.querySelector('#order-form').reset();
      renderLinesTable([], state.productsById);
    });

    document.getElementById('btn-export').addEventListener('click', ()=>{
      const rows = [['ID','Data','Destinatario','Città','Paese','Spedizione']]
        .concat(state.sorted.map(o=>[
          o.order_id,
          toInputDate(tryParseDate(o.order_date))||'',
          o.ship_name||'',
          o.ship_city||'',
          o.ship_country||'',
          String(o.freight||'')
        ]));
      exportCsv('orders.csv', rows);
    });

    document.getElementById('btn-email').addEventListener('click', ()=>{
      const id = getSelectedOrderId();
      if(!id){ alert('Seleziona un ordine.'); return; }
      const o = state.all.find(x=>Number(x.order_id)===id);
      const lines = loadLines(id);
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>Ordine ${id}</title></head><body>`);
      win.document.write(`<h2>Riepilogo ordine #${id}</h2>`);
      win.document.write(`<p>Destinatario: ${escapeHtml(o.ship_name||'')}<br>Città: ${escapeHtml(o.ship_city||'')} - ${escapeHtml(o.ship_country||'')}<br>Spedizione: € ${fmtCurrency(o.freight)}</p>`);
      if(lines.length){
        win.document.write('<table border="1" cellspacing="0" cellpadding="6"><tr><th>Prodotto</th><th>Q.tà</th><th>Prezzo</th><th>Totale</th></tr>');
        lines.forEach(ln=>{
          const qty=Number(ln.quantity||0), price=Number(ln.unit_price||0);
          win.document.write(`<tr><td>${escapeHtml(String(ln.product_id))}</td><td>${qty}</td><td>${price.toFixed(2)}</td><td>${(qty*price).toFixed(2)}</td></tr>`);
        });
        win.document.write('</table>');
      }
      win.document.write('<script>window.print();<\/script></body></html>');
      win.document.close();
      setTimeout(()=>{ try{win.close();}catch{} }, 1000);
      alert('Invio email simulato: PDF generabile con Stampa > Salva PDF.');
    });

    function saveHeader(){
      const data = readOrderForm();
      const map = loadLS(LS_UPDATED, {});
      map[data.order_id] = {
        order_date: data.order_date,
        required_date: data.required_date,
        shipped_date: data.shipped_date,
        customer_id: data.customer_id,
        employee_id: data.employee_id,
        ship_name: data.ship_name,
        ship_address: data.ship_address,
        ship_city: data.ship_city,
        ship_region: data.ship_region,
        ship_postal_code: data.ship_postal_code,
        ship_country: data.ship_country,
        freight: data.freight
      };
      saveLS(LS_UPDATED, map);
      document.getElementById('order-status').textContent = 'Salvato';
      setTimeout(()=>{ const s=document.getElementById('order-status'); if(s) s.textContent=''; }, 1500);
      // refresh table row
      const idx = state.all.findIndex(o=>Number(o.order_id)===data.order_id);
      if(idx>=0){ state.all[idx] = { ...state.all[idx], ...map[data.order_id] }; }
      state.sorted = sortByDateDesc(state.all);
      renderOrdersTable(state.sorted);
      selectRowById(data.order_id);
    }
    document.getElementById('btn-save-order').addEventListener('click', saveHeader);

    function recalcLineRow(tr){
      const qty = Number(tr.querySelector('.ln-qty').value||0);
      const price = Number(tr.querySelector('.ln-price').value||0);
      tr.querySelector('.ln-total').textContent = fmtCurrency(qty*price);
    }

    document.getElementById('lines-table').addEventListener('input', (e)=>{
      const tr = e.target.closest('tr');
      if(!tr || !tr.dataset.index) return;
      const idx = Number(tr.dataset.index);
      const id = state.currentId; if(!id) return;
      const lines = loadLines(id);
      if(e.target.classList.contains('ln-product')){
        lines[idx].product_id = Number(e.target.value||0) || '';
        const nameCell = tr.querySelector('.ln-name');
        const prod = state.productsById.get(Number(lines[idx].product_id));
        nameCell.textContent = prod ? prod.product_name : '';
        if(prod && !lines[idx].unit_price){
          lines[idx].unit_price = Number(prod.unit_price||0);
          tr.querySelector('.ln-price').value = lines[idx].unit_price;
        }
      }
      if(e.target.classList.contains('ln-qty')){
        lines[idx].quantity = Number(e.target.value||0);
      }
      if(e.target.classList.contains('ln-price')){
        lines[idx].unit_price = Number(e.target.value||0);
      }
      saveLines(id, lines);
      recalcLineRow(tr);
    });

    document.getElementById('btn-add-line').addEventListener('click', ()=>{
      const id = state.currentId; if(!id){ alert('Seleziona un ordine.'); return; }
      const lines = loadLines(id);
      lines.push({ product_id:'', quantity:1, unit_price:0 });
      saveLines(id, lines);
      renderLinesTable(lines, state.productsById);
    });

    document.getElementById('btn-remove-line').addEventListener('click', ()=>{
      const id = state.currentId; if(!id){ alert('Seleziona un ordine.'); return; }
      const lines = loadLines(id);
      const keep = [];
      document.querySelectorAll('#lines-table tbody tr').forEach((tr, i)=>{
        const chk = tr.querySelector('.ln-select');
        if(chk && !chk.checked){ keep.push(lines[i]); }
      });
      saveLines(id, keep);
      renderLinesTable(keep, state.productsById);
    });

    document.getElementById('select-all-lines').addEventListener('change', (e)=>{
      const on = e.target.checked;
      document.querySelectorAll('.ln-select').forEach(chk=> chk.checked = on);
    });

    document.getElementById('btn-save-lines').addEventListener('click', ()=>{
      const id = state.currentId; if(!id){ alert('Seleziona un ordine.'); return; }
      // Already saved on input; just give feedback
      alert('Righe ordine salvate.');
    });
  }

  async function init(){
    const { orders, customersById, productsById } = await loadDatasets();
    const base = orders;
    const all = mergeOrders(base);
    const sorted = sortByDateDesc(all);
    renderOrdersTable(sorted);
    const state = { base, all, sorted, customersById, productsById, currentId: null };
    setupEvents(state);
    return state;
  }

  // Override wrapper with full-featured version
  window.caricaOrdini = async function(){
    await init();
  };
})();
