// navigation.js
// Gestione mappa link -> file + callback

window.setupNavigation = function setupNavigation() {
  const linksMap = {
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

  Object.keys(linksMap).forEach(sel => {
    const a = document.querySelector(sel);
    if (!a) return;
    const [file, cb] = linksMap[sel];
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      window.loadHtml(`html/${file}`, '#area-principale', cb);
      const closeBtn = document.querySelector('.btn-close'); if (closeBtn) closeBtn.click();
    });
  });

  const submenuLink = document.querySelector('a[href="#submenu-prodotti"]');
  if (submenuLink) {
    submenuLink.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector('#submenu-prodotti');
      if (target) target.classList.toggle('show');
    });
  }
};
