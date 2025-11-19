console.log('navigation.js caricato');

function setupNavigation() {
  // Mappa dei link e dei file html corrispondenti
  var routes = [
    { selector: '#link-clienti', file: 'clienti.html' },
    { selector: '#link-riepilogo', file: 'riepilogo.html' },
    { selector: '#link-ordini', file: 'ordini.html' },
    { selector: '#link-prodotti', file: 'Prodotti.html' },
    { selector: '#link-dipendenti', file: 'dipendenti.html' },
    { selector: '#link-spedizionieri', file: 'sped.html' },
    { selector: '#link-categorie', file: 'categorie.html' },
    { selector: '#Gestione-prodotti', file: 'Prodotti.html' },
    { selector: '#Gestione-categorie', file: 'categorie.html' }
  ];

  // aggiungo il evento click
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    var el = document.querySelector(route.selector);
    console.log('Binding link:', route.selector, !!el);
    if (!el) continue;
    (function(el, route) {
      el.addEventListener('click', function(evt) {
        evt.preventDefault();

        // Rimuove la classe active da tutti i link
        var navLinks = document.querySelectorAll('.nav-link');
        for (var j = 0; j < navLinks.length; j++) {
          navLinks[j].classList.remove('active');
        }
        // Aggiunge la classe active al link cliccato
        el.classList.add('active');

        // Controllo ruolo per Dipendenti
        var role = localStorage.getItem('erp-role') || 'admin';
        if (route.selector === '#link-dipendenti' && role === 'user') {
          alert('Accesso non autorizzato alla sezione Dipendenti.');
          return;
        }

        // Carica la pagina corrispondente
        console.log('Click su', route.selector, '-> html/' + route.file);
        window.loadHtml('html/' + route.file, '#area-principale');

        // Chiude eventuale offcanvas
        var closeBtn = document.querySelector('.btn-close');
        if (closeBtn) closeBtn.click();
      });
    })(el, route);
  }

  // Il submenu prodotti ora è gestito da Bootstrap collapse (data-bs-toggle="collapse")
}

// Inizializza la navigazione quando la pagina è pronta
document.addEventListener('DOMContentLoaded', function() {
  setupNavigation();
});
