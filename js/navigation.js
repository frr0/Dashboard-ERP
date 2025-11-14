// navigation.js compatto
window.setupNavigation=()=>{
  const r={
    '#link-clienti':['clienti.html',window.caricaClienti],
    '#link-riepilogo':['riepilogo.html'],
    '#link-ordini':['ordini.html',window.caricaOrdini],
    '#link-prodotti':['Prodotti.html',window.caricaProdotti],
    '#link-dipendenti':['dipendenti.html',window.caricaDipendenti],
    '#link-spedizionieri':['sped.html',()=>{window.caricaSpedizionieri();window.caricaFornitori();}],
    '#link-categorie':['categorie.html',window.caricaCategorie],
    '#Gestione-prodotti':['Prodotti.html',window.caricaProdotti],
    '#Gestione-categorie':['categorie.html',window.caricaCategorie]
  };
  Object.keys(r).forEach(s=>{
    const e=document.querySelector(s);if(!e)return;const[f,cb]=r[s];
    e.addEventListener('click',ev=>{
      ev.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
      e.classList.add('active');
      const role=localStorage.getItem('erp-role')||'admin';
      if(s==='#link-dipendenti'&&role==='user'){alert('Accesso non autorizzato alla sezione Dipendenti.');return;}
      window.loadHtml(`html/${f}`,'#area-principale',cb);
      const c=document.querySelector('.btn-close');if(c)c.click();
    });
  });
  const sm=document.querySelector('a[href="#submenu-prodotti"]');
  if(sm)sm.addEventListener('click',e=>{e.preventDefault();const s=document.querySelector('#submenu-prodotti');if(s)s.classList.toggle('show');});
};
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
