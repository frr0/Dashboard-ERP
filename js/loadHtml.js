// Vanilla JS: carica frammenti HTML con fetch e opzionalmente esegue una callback
// Usa anche initSearchIn per collegare la ricerca dopo ogni load
console.log('loadHtml.js caricato');
window.loadHtml = async function(url, targetSelector, callback) {
  console.log(`loadHtml chiamato: ${url} -> ${targetSelector}`);
  try {
    const response = await fetch(url);
    console.log(`Fetch response per ${url}:`, response.status, response.ok);
    const html = await response.text();
    const target = document.querySelector(targetSelector);
    console.log(`Target ${targetSelector}:`, target);
    if (target) {
      target.innerHTML = html;
      console.log(`HTML inserito, callback:`, callback);
      if (callback) {
        console.log(`Eseguo callback...`);
        callback();
      }
      if (window.initSearchIn) window.initSearchIn(target);
    }
  } catch (err) {
    console.error('Errore caricamento HTML:', err);
  }
};
