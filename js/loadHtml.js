// Vanilla JS: carica frammenti HTML con fetch e opzionalmente esegue una callback
// Usa anche initSearchIn per collegare la ricerca dopo ogni load
console.log('loadHtml.js caricato');
window.loadHtml = async function(url, targetSelector, callback) {
  console.log(`loadHtml chiamato: ${url} -> ${targetSelector}`);
  try {
    const bust = (url.includes('?') ? '&' : '?') + '_=' + Date.now();
    const response = await fetch(url + bust, { cache: 'no-store' });
    console.log(`Fetch response per ${url}:`, response.status, response.ok);
    const html = await response.text();
    const target = typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector;
    console.log(`Target ${targetSelector}:`, target);
    if (!target) {
      console.warn('loadHtml: target non trovato', targetSelector);
      return;
    }
    target.innerHTML = html;

    console.log(`HTML inserito, callback:`, callback);
    if (typeof callback === 'function') {
      console.log(`Eseguo callback...`);
      callback(target);
    }
    if (typeof window.initSearchIn === 'function') window.initSearchIn(target);
  } catch (err) {
    console.error('Errore caricamento HTML:', err);
  }
};
