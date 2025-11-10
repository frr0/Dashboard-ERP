// loadHtml.js
// Caricamento di frammenti HTML e callback + inizializzazione ricerca

window.loadHtml = async function loadHtml(url, targetSelector, callback) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Caricamento HTML fallito: ${resp.status}`);
    const html = await resp.text();
    const target = document.querySelector(targetSelector);
    if (!target) return;
    target.innerHTML = html;
    if (callback) {
      const maybe = callback();
      if (maybe && typeof maybe.then === 'function') await maybe;
    }
    if (window.initSearchIn) window.initSearchIn(target);
  } catch (e) {
    console.error('Errore loadHtml', e);
  }
};
