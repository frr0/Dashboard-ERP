window.loadHtml = function(url, targetSelector, callback) {
  // un parametro per evitare la cache
  var bust = (url.indexOf('?') !== -1 ? '&' : '?') + '_=' + Date.now();
  fetch(url + bust, { cache: 'no-store' })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text();
    })
    .then(function(html) {
      // Trovo il target dove inserire l'HTML
      var target;
      if (typeof targetSelector === 'string') {
        target = document.querySelector(targetSelector);
      } else {
        target = targetSelector;
      }
      if (!target) return;
      // Inserisce l'HTML
      target.innerHTML = html;
      // Evento custom per altri script
      document.dispatchEvent(new CustomEvent('page:loaded', { detail: { url: url, target: target } }));
      // Richiama le funzioni di setup se esistono
      if (typeof window.setupNavigation === 'function') window.setupNavigation();
      if (typeof window.initSearch === 'function') window.initSearch();
      if (typeof window.initModalAndTableActions === 'function') window.initModalAndTableActions();
      // Se c'è una callback, la esegue
      if (typeof callback === 'function') callback(target);
    })
    .catch(function(err) {
      console.error('Failed to load HTML from ' + url, err);
    });
};
