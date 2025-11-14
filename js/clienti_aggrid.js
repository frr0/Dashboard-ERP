// clienti_aggrid.js - Pagina Clienti con helper generico Grid
(function(){
  window.caricaClienti = function(){
    window.initGridPage({
      gridId: 'clienti-grid',
      searchId: 'clienti-search',
      dataUrl: 'json/customers.json',
      keyField: 'customer_id',
      toolbar: {
        refreshId: 'clienti-refresh',
        newId: 'clienti-new',
        deleteId: 'clienti-delete',
        exportId: 'clienti-export'
      },
      detail: {
        paneId: 'clienti-detail',
        formId: 'clienti-form',
        saveBtnId: 'clienti-save',
        newBtnId: 'clienti-detail-new',
        deleteBtnId: 'clienti-detail-delete'
      },
      columns: [
        { headerName:'ID', field:'customer_id', width:100 },
        { headerName:'Codice', field:'customer_code', width:140 },
        { headerName:'Azienda', field:'company_name' },
        { headerName:'Contatto', field:'contact_name', width:180 },
        { headerName:'Titolo', field:'contact_title', width:160 },
        { headerName:'Città', field:'city', width:160 },
        { headerName:'Paese', field:'country', width:140 },
        { headerName:'Telefono', field:'phone', width:160 }
      ]
    });
  };
})();
