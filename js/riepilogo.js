// riepilogo.js - render static summary grids and pie chart on riepilogo.html
(function(){
  function ensureChartJs(cb){ if(window.Chart) return cb(); const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js'; s.onload=cb; s.onerror=()=>console.error('Chart.js non raggiungibile'); document.head.appendChild(s); }
  async function fetchJSON(url){ const r=await fetch(url+(url.includes('?')?'&':'?')+'_'+Date.now(),{cache:'no-store'}); return r.json(); }
  function getItems(payload){ if(Array.isArray(payload)) return payload; const it=payload?.results?.[0]?.items; return it||[]; }
  function parseOracleDateToISO(s){ if(!s) return ''; const m=s.match(/(\d{2})-([A-Z]{3})-(\d{2})/); if(m){ const MON={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12}; const yyyy=(Number(m[3])<70?2000:1900)+Number(m[3]); return `${yyyy}-${String(MON[m[2]]).padStart(2,'0')}-${m[1]}`; } const d=new Date(s); return isNaN(d)?'':d.toISOString().slice(0,10); }
  function fmt2(v){ return Number(v||0).toFixed(2); }

  async function render(){
    const [ordersPayload, productsPayload] = await Promise.all([
      fetchJSON('json/orders.json'),
      fetchJSON('json/products.json')
    ]);
    const orders = getItems(ordersPayload);
    const products = getItems(productsPayload);
    // Cards metrics
    const now=new Date(); const curM=now.getMonth()+1; // 1..12
    const ordersMonth=orders.reduce((n,o)=>{ const d=parseOracleDateToISO(o.order_date); const m=Number(d.slice(5,7)||0); return n+(m===curM?1:0); },0);
    const ordersTotal=orders.length;
    const distinctCountries=new Set(orders.map(o=>o.ship_country||'N/D')).size;

    // Last 10 orders by date
    const last10 = orders
      .map(o=>({
        id:o.order_id,
        date: parseOracleDateToISO(o.order_date),
        name: o.ship_name||'', city: o.ship_city||'', freight: o.freight||0
      }))
      .sort((a,b)=> (a.date<b.date?1:a.date>b.date?-1:0))
      .slice(0,10);
    const tb1=document.querySelector('#tbl-last-orders tbody');
    if(tb1){ tb1.innerHTML = last10.map(r=>`<tr><td>${r.id}</td><td>${r.date}</td><td>${r.name}</td><td>${r.city}</td><td class="text-end">${fmt2(r.freight)}</td></tr>`).join(''); }
    const cLast10=document.getElementById('card-last10-count'); if(cLast10) cLast10.textContent=String(last10.length);

    // Low stock products (<10)
    const low = products.filter(p=> Number(p.units_in_stock||0) < 10)
      .map(p=>({name:p.product_name, stock:Number(p.units_in_stock||0), rl:Number(p.reorder_level||0)}))
      .sort((a,b)=> a.stock-b.stock).slice(0,20);
    const tb2=document.querySelector('#tbl-low-stock tbody');
    if(tb2){ tb2.innerHTML = low.map(r=>`<tr><td>${r.name}</td><td class="text-end">${r.stock}</td><td class="text-end">${r.rl}</td></tr>`).join(''); }
    const cLow=document.getElementById('card-lowstock-count'); if(cLow) cLow.textContent=String(low.length);

    // Pie: Orders per country (top 5 + Other)
    const byCountry = new Map();
    orders.forEach(o=>{ const c=(o.ship_country||'N/D'); byCountry.set(c,(byCountry.get(c)||0)+1); });
    const arr=[...byCountry.entries()].sort((a,b)=>b[1]-a[1]);
    const top=arr.slice(0,5), other=arr.slice(5).reduce((s,[_c,n])=>s+n,0);
    const labels = top.map(x=>x[0]).concat(other?['Altro']:[]);
    const data = top.map(x=>x[1]).concat(other?[other]:[]);
    const cPie=document.getElementById('card-pie-metric'); if(cPie) cPie.textContent=String(distinctCountries);

    const cMonth=document.getElementById('card-orders-month'); if(cMonth) cMonth.textContent=String(ordersMonth);
    const cTot=document.getElementById('card-orders-total'); if(cTot) cTot.textContent=String(ordersTotal);

    ensureChartJs(()=>{
      const ctx=document.getElementById('pie-orders-country'); if(!ctx) return;
      new Chart(ctx,{ type:'pie', data:{ labels, datasets:[{ data, backgroundColor:['#6ea8fe','#f7b267','#5cc689','#c77dff','#ff6b6b','#adb5bd'] }] }, options:{ plugins:{ legend:{ position:'bottom', labels:{ color:'#ddd' } } } } });
    });
  }

  document.addEventListener('page:loaded', (e)=>{
    const u=e?.detail?.url||''; if(u.includes('riepilogo.html')) render();
  });
})();
