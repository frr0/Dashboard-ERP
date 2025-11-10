// dashboard.js - entrypoint minimale che orchestra i moduli separati
// Tutta la logica ora vive in /js/*. Questo file deve essere caricato DOPO i moduli.

(function initDashboard(){
    document.addEventListener('DOMContentLoaded', () => {
        if (window.loadHtml) window.loadHtml('html/riepilogo.html', '#area-principale');
        if (window.setupNavigation) window.setupNavigation();
        if (window.initModalAndTableActions) window.initModalAndTableActions();
    });
})();