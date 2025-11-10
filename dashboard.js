// Inizializzazione semplice senza jQuery: esegue al DOM pronto
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('dashboard.js: DOMContentLoaded');

    if (typeof window.loadHtml === 'function') {
      window.loadHtml('html/riepilogo.html', '#area-principale');
    } else {
      console.warn('window.loadHtml non disponibile');
    }

    if (typeof window.setupNavigation === 'function') {
      window.setupNavigation();
    } else {
      console.warn('window.setupNavigation non disponibile');
    }

    if (typeof window.initModalAndTableActions === 'function') {
      window.initModalAndTableActions();
    } else {
      console.warn('window.initModalAndTableActions non disponibile');
    }
  } catch (error) {
    console.error("Errore critico durante l'inizializzazione dell'app:", error);
    document.body.innerHTML = '<h1 style="color: red; text-align: center;">Errore durante il caricamento dell\'applicazione. Controlla la console.</h1>';
  }
});