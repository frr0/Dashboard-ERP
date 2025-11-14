// pageGrid.js - Struttura generica pagina con Toolbar + AG Grid + Detail
(function(){
  async function fetchJSON(url){ const bust=(url.includes('?')?'&':'?')+'_'+Date.now(); const r=await fetch(url+bust,{cache:'no-store'}); const d=await r.json(); return d?.results?.[0]?.items||[]; }
  function nextId(rows, key){ let m=0; rows.forEach(r=>{ const v=Number(r[key]); if(!isNaN(v) && v>m) m=v; }); return m+1; }

  function buildFormFiller(formId){
    return function fill(data){
      const form = document.getElementById(formId); if(!form) return;
      Array.from(form.elements).forEach(el=>{ if(el.name){ el.value = data[el.name] ?? ''; } });
    };
  }
  function readForm(formId){ const form=document.getElementById(formId); const out={}; if(!form) return out; Array.from(form.elements).forEach(el=>{ if(el.name) out[el.name]=el.value; }); return out; }

  window.initGridPage = async function(config){
    const { gridId, searchId, toolbar={}, detail={}, dataUrl, columns, keyField } = config;
    const gridEl = document.getElementById(gridId);
    if(!gridEl){ console.warn('Grid element not found', gridId); return; }

    // Load data
    let rows = await fetchJSON(dataUrl);

    // Grid setup
    const gridOptions = {
      columnDefs: columns,
      rowData: rows,
      defaultColDef: { sortable:true, filter:true, resizable:true },
      rowSelection: 'single',
      pagination: true,
      paginationPageSize: 50,
      animateRows: true,
      onRowDoubleClicked: (e)=>{
        if(!detail.paneId) return;
        const fill = buildFormFiller(detail.formId);
        fill(e.data);
        document.getElementById(detail.paneId).style.display = '';
        const saveBtn = document.getElementById(detail.saveBtnId);
        if(saveBtn && !saveBtn.dataset.bound){
          saveBtn.dataset.bound = '1';
          saveBtn.addEventListener('click', ()=>{
            const patch = readForm(detail.formId);
            const sel = gridOptions.api.getSelectedNodes()[0] || e.node;
            if(sel){ Object.assign(sel.data, patch); gridOptions.api.refreshCells({force:true}); }
          });
        }
      }
    };
    new agGrid.Grid(gridEl, gridOptions);

    // Search
    if(searchId){
      const input = document.getElementById(searchId);
      if(input){ let t; input.addEventListener('input', ()=>{ clearTimeout(t); t=setTimeout(()=> gridOptions.api.setQuickFilter(input.value), 120); }); }
    }

    // Toolbar handlers
    const { refreshId, newId, deleteId, exportId } = toolbar;
    if(refreshId){ const btn=document.getElementById(refreshId); btn&&btn.addEventListener('click', async ()=>{ rows = await fetchJSON(dataUrl); gridOptions.api.setRowData(rows); }); }
    if(newId){ const btn=document.getElementById(newId); btn&&btn.addEventListener('click', ()=>{ const row = {}; if(keyField){ row[keyField]= nextId(gridOptions.api.getDisplayedRowCount? gridOptions.api.getModel().rowsToDisplay.map(r=>r.data) : rows, keyField);} gridOptions.api.applyTransaction({ add:[row], addIndex:0 }); }); }
    if(deleteId){ const btn=document.getElementById(deleteId); btn&&btn.addEventListener('click', ()=>{ const sel=gridOptions.api.getSelectedRows(); if(!sel.length) return alert('Seleziona un record'); gridOptions.api.applyTransaction({ remove: sel }); }); }
    if(exportId){ const btn=document.getElementById(exportId); btn&&btn.addEventListener('click', ()=> gridOptions.api.exportDataAsCsv({ fileName:'export.csv' }) ); }

    return gridOptions;
  };
})();
