// Inizializzazione applicazione ERP Dashboard
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('dashboard.js: DOMContentLoaded');

    // Carica la vista iniziale (riepilogo)
    if (typeof window.loadHtml === 'function') {
      window.loadHtml('html/riepilogo.html', '#area-principale');
    } else {
      console.warn('window.loadHtml non disponibile');
    }

    // Inizializza la navigazione
    if (typeof window.setupNavigation === 'function') {
      window.setupNavigation();
    } else {
      console.warn('window.setupNavigation non disponibile');
    }
  } catch (error) {
    console.error("Errore critico durante l'inizializzazione dell'app:", error);
    document.body.innerHTML = '<h1 style="color: red; text-align: center;">Errore durante il caricamento dell\'applicazione. Controlla la console.</h1>';
  }
});