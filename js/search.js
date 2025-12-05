console.log('search.js caricato');

// // Funzione per inizializzare la ricerca sugli input 
// function initSearch() {
//   var inputs = document.querySelectorAll('input.ricerca');
//   for (var i = 0; i < inputs.length; i++) {
//     // Aggiungo l'evento solo se non già aggiunto
//     if (!inputs[i].dataset.searchBound) {
//       inputs[i].dataset.searchBound = '1';
//       inputs[i].addEventListener('input', function(e) {
//         // Prendo il valore dell'input e filtra le tabelle
//         var value = e.target.value;
//         filterTables(value);
//       });
//     }
//   }
// }

// // Funzione per filtrare tutte le tabelle nell'area principale
// function filterTables(query) {
//   var q = (query || '').toLowerCase();
//   var tables = document.querySelectorAll('#area-principale table');
//   for (var i = 0; i < tables.length; i++) {
//     filterTable(tables[i], q);
//   }
// }

// // Funzione per filtrare una singola tabella
// function filterTable(table, q) {
//   var tbody = table.querySelector('tbody');
//   if (!tbody) return;

//   var rows = tbody.querySelectorAll('tr');
//   var visible = 0;
//   for (var i = 0; i < rows.length; i++) {
//     var tr = rows[i];
//     var text = tr.textContent.toLowerCase();
//     // Mostra o nasconde la riga in base alla ricerca
//     if (!q || text.indexOf(q) !== -1) {
//       tr.style.display = '';
//       visible++;
//     } else {
//       tr.style.display = 'none';
//     }
//   }
// }

// // Inizializza la ricerca quando la pagina è pronta
// document.addEventListener('DOMContentLoaded', function() {
//   initSearch();
// });
