// pageGrid.js - Struttura generica pagina con Toolbar + AG Grid + Detail
(function(){
  async function fetchJSON(url){ const bust=(url.includes('?')?'&':'?')+'_'+Date.now(); const r=await fetch(url+bust,{cache:'no-store'}); const d=await r.json(); return d?.results?.[0]?.items||[]; }
  function nextId(rows, key){ let m=0; rows.forEach(r=>{ const v=Number(r[key]); if(!isNaN(v) && v>m) m=v; }); return m+1; }

  function buildFormFiller(formId){
    return function fill(data){
      const form = document.getElementById(formId); if(!form) return;
      Array.from(form.elements).forEach(el=>{ if(el.name){ el.value = data?.[el.name] ?? ''; } });
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
      onRowClicked: (e)=> handleSelect(e),
      onRowDoubleClicked: (e)=> handleSelect(e)
    };
    new agGrid.Grid(gridEl, gridOptions);

    // Detail handlers (edit like giocatori.js)
    const paneEl = detail.paneId ? document.getElementById(detail.paneId) : null;
    const fill = buildFormFiller(detail.formId);
    let creatingNew = false;

    function handleSelect(e){
      if(!paneEl) return;
      creatingNew = false;
      fill(e.data);
      paneEl.style.display = '';
    }

    function getSelectedNode(){ const n=gridOptions.api.getSelectedNodes(); return n && n[0] ? n[0] : null; }
    function allRows(){ return gridOptions.api.getModel().rowsToDisplay.map(r=>r.data); }

    const saveBtn = detail.saveBtnId ? document.getElementById(detail.saveBtnId) : null;
    if(saveBtn && !saveBtn.dataset.bound){
      saveBtn.dataset.bound='1';
      saveBtn.addEventListener('click', ()=>{
        const data = readForm(detail.formId);
        const node = getSelectedNode();
        if(creatingNew || !node){
          if(keyField && (data[keyField]==null || data[keyField]==='')) data[keyField]= nextId(allRows(), keyField);
          gridOptions.api.applyTransaction({ add:[data], addIndex:0 });
          setTimeout(()=>{ const rn=gridOptions.api.getDisplayedRowAtIndex(0); if(rn) rn.setSelected(true); },0);
          creatingNew=false;
        }else{
          Object.assign(node.data, data); gridOptions.api.refreshCells({force:true});
        }
      });
    }

    const newBtn = detail.newBtnId ? document.getElementById(detail.newBtnId) : null;
    if(newBtn && !newBtn.dataset.bound){
      newBtn.dataset.bound='1';
      newBtn.addEventListener('click', ()=>{
        if(!paneEl) return; creatingNew=true; fill({}); paneEl.style.display='';
      });
    }

    const delBtn = detail.deleteBtnId ? document.getElementById(detail.deleteBtnId) : null;
    if(delBtn && !delBtn.dataset.bound){
      delBtn.dataset.bound='1';
      delBtn.addEventListener('click', ()=>{
        const sel = gridOptions.api.getSelectedRows(); if(!sel.length) return alert('Seleziona un record');
        if(!confirm('Eliminare il record selezionato?')) return;
        gridOptions.api.applyTransaction({ remove: sel });
      });
    }

    // Search
    if(searchId){
      const input = document.getElementById(searchId);
      if(input){ let t; input.addEventListener('input', ()=>{ clearTimeout(t); t=setTimeout(()=> gridOptions.api.setQuickFilter(input.value), 120); }); }
    }

    // Toolbar handlers
    const { refreshId, newId, deleteId, exportId } = toolbar;
    if(refreshId){ const btn=document.getElementById(refreshId); btn&&btn.addEventListener('click', async ()=>{ rows = await fetchJSON(dataUrl); gridOptions.api.setRowData(rows); }); }
    if(newId){ const btn=document.getElementById(newId); btn&&btn.addEventListener('click', ()=>{ const row = {}; if(keyField){ row[keyField]= nextId(gridOptions.api.getModel().rowsToDisplay.map(r=>r.data), keyField);} gridOptions.api.applyTransaction({ add:[row], addIndex:0 }); }); }
    if(deleteId){ const btn=document.getElementById(deleteId); btn&&btn.addEventListener('click', ()=>{ const sel=gridOptions.api.getSelectedRows(); if(!sel.length) return alert('Seleziona un record'); gridOptions.api.applyTransaction({ remove: sel }); }); }
    if(exportId){ const btn=document.getElementById(exportId); btn&&btn.addEventListener('click', ()=> gridOptions.api.exportDataAsCsv({ fileName:'export.csv' }) ); }

    return gridOptions;
  };
})();
