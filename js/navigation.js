// Vanilla JS: navigazione tra viste e callback dati
console.log('navigation.js caricato');
window.setupNavigation = function() {
  const routes = {
    '#link-clienti': ['clienti.html', window.caricaClienti],
    '#link-riepilogo': ['riepilogo.html'],
    '#link-ordini': ['ordini.html', window.caricaOrdini],
    '#link-prodotti': ['Prodotti.html', window.caricaProdotti],
    '#link-dipendenti': ['dipendenti.html', window.caricaDipendenti],
    '#link-spedizionieri': ['sped.html', () => { window.caricaSpedizionieri(); window.caricaFornitori(); }],
    '#link-categorie': ['categorie.html', window.caricaCategorie],
    '#Gestione-prodotti': ['Prodotti.html', window.caricaProdotti],
    '#Gestione-categorie': ['categorie.html', window.caricaCategorie]
  };

  Object.keys(routes).forEach(selector => {
    const el = document.querySelector(selector);
    console.log('Binding link:', selector, !!el);
    if (!el) return;
    const [file, cb] = routes[selector];
    el.addEventListener('click', evt => {
      evt.preventDefault();
      console.log('Click su', selector, '-> html/' + file);
      window.loadHtml(`html/${file}`, '#area-principale', cb);
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
