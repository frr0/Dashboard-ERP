// navigation.js - Gestione navigazione tra le varie sezioni
console.log('navigation.js caricato');

window.setupNavigation = function() {
  const routes = {
    '#link-clienti': ['clienti.html'],
    '#link-riepilogo': ['riepilogo.html'],
    '#link-ordini': ['ordini.html'],
    '#link-prodotti': ['Prodotti.html'],
    '#link-dipendenti': ['dipendenti.html'],
    '#link-spedizionieri': ['sped.html'],
    '#link-categorie': ['categorie.html'],
    '#Gestione-prodotti': ['Prodotti.html'],
    '#Gestione-categorie': ['categorie.html']
  };

  Object.keys(routes).forEach(selector => {
    const el = document.querySelector(selector);
    console.log('Binding link:', selector, !!el);
    if (!el) return;
    const [file] = routes[selector];
    el.addEventListener('click', evt => {
      evt.preventDefault();

      // Gestione classe "active"
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      el.classList.add('active');

      // Role guard: prevent users from accessing Dipendenti
      const role = localStorage.getItem('erp-role') || 'admin';
      if (selector === '#link-dipendenti' && role === 'user') {
        alert('Accesso non autorizzato alla sezione Dipendenti.');
        return;
      }
      console.log('Click su', selector, '-> html/' + file);
      window.loadHtml(`html/${file}`, '#area-principale');
      const closeBtn = document.querySelector('.btn-close');
      if (closeBtn) closeBtn.click();
    });
  });

  const submenuLink = document.querySelector('a[href="#submenu-prodotti"]');
  if (submenuLink) {
    submenuLink.addEventListener('click', e => {
      e.preventDefault();
      const submenu = document.querySelector('#submenu-prodotti');
      if (submenu) submenu.classList.toggle('show');
    });
  }
};
