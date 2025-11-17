// riepilogo.js - Rende il riepilogo con grafici e tabelle

// Carica Chart.js se non è già disponibile
function loadChartJs(callback) {
  if (window.Chart) {
    callback();
    return;
  }
  
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = function() {
    callback();
  };
  script.onerror = function() {
    console.error('Chart.js non raggiungibile');
  };
  document.head.appendChild(script);
}

// Carica i dati da un file JSON
async function loadData(url) {
  try {
    var response = await fetch(url + '?_=' + Date.now(), { cache: 'no-store' });
    var data = await response.json();
    return data;
  } catch (error) {
    console.error('Errore caricamento dati:', error);
    return null;
  }
}

// Estrae gli items dal payload Oracle
function getItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  
  if (payload && payload.results && payload.results[0] && payload.results[0].items) {
    return payload.results[0].items;
  }
  
  return [];
}

// Converte la data Oracle in formato ISO
function convertDate(dateString) {
  if (!dateString) {
    return '';
  }
  
  // Prova a fare il match con formato Oracle DD-MMM-YY
  var match = dateString.match(/(\d{2})-([A-Z]{3})-(\d{2})/);
  if (match) {
    var months = {
      JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
      JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12
    };
    
    var day = match[1];
    var month = String(months[match[2]]).padStart(2, '0');
    var year = Number(match[3]);
    
    if (year < 70) {
      year = 2000 + year;
    } else {
      year = 1900 + year;
    }
    
    return year + '-' + month + '-' + day;
  }
  
  // Prova come data normale
  var date = new Date(dateString);
  if (isNaN(date)) {
    return '';
  }
  
  return date.toISOString().slice(0, 10);
}

// Formatta numero con 2 decimali
function formatNumber(value) {
  var num = Number(value || 0);
  return num.toFixed(2);
}

// Funzione principale per renderizzare il riepilogo
async function renderRiepilogo() {
  // Carica i dati
  var ordersData = await loadData('json/orders.json');
  var productsData = await loadData('json/products.json');
  
  var orders = getItems(ordersData);
  var products = getItems(productsData);
  
  // Calcola metriche per le card
  var today = new Date();
  var currentMonth = today.getMonth() + 1;
  
  var ordersThisMonth = 0;
  for (var i = 0; i < orders.length; i++) {
    var orderDate = convertDate(orders[i].order_date);
    var orderMonth = Number(orderDate.slice(5, 7));
    if (orderMonth === currentMonth) {
      ordersThisMonth = ordersThisMonth + 1;
    }
  }
  
  var totalOrders = orders.length;
  
  // Conta paesi distinti
  var countries = [];
  for (var i = 0; i < orders.length; i++) {
    var country = orders[i].ship_country || 'N/D';
    if (countries.indexOf(country) === -1) {
      countries.push(country);
    }
  }
  var distinctCountries = countries.length;
  
  // Ultimi 10 ordini
  var ordersList = [];
  for (var i = 0; i < orders.length; i++) {
    ordersList.push({
      id: orders[i].order_id,
      date: convertDate(orders[i].order_date),
      name: orders[i].ship_name || '',
      city: orders[i].ship_city || '',
      freight: orders[i].freight || 0
    });
  }
  
  // Ordina per data
  ordersList.sort(function(a, b) {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });
  
  var last10Orders = ordersList.slice(0, 10);
  
  // Riempi tabella ultimi ordini
  var tbody1 = document.querySelector('#tbl-last-orders tbody');
  if (tbody1) {
    var html = '';
    for (var i = 0; i < last10Orders.length; i++) {
      var order = last10Orders[i];
      html += '<tr>';
      html += '<td>' + order.id + '</td>';
      html += '<td>' + order.date + '</td>';
      html += '<td>' + order.name + '</td>';
      html += '<td>' + order.city + '</td>';
      html += '<td class="text-end">' + formatNumber(order.freight) + '</td>';
      html += '</tr>';
    }
    tbody1.innerHTML = html;
  }
  
  var cardLast10 = document.getElementById('card-last10-count');
  if (cardLast10) {
    cardLast10.textContent = String(last10Orders.length);
  }
  
  // Prodotti con stock basso
  var lowStockProducts = [];
  for (var i = 0; i < products.length; i++) {
    var stock = Number(products[i].units_in_stock || 0);
    if (stock < 10) {
      lowStockProducts.push({
        name: products[i].product_name,
        stock: stock,
        reorderLevel: Number(products[i].reorder_level || 0)
      });
    }
  }
  
  // Ordina per stock
  lowStockProducts.sort(function(a, b) {
    return a.stock - b.stock;
  });
  
  lowStockProducts = lowStockProducts.slice(0, 20);
  
  // Riempi tabella stock basso
  var tbody2 = document.querySelector('#tbl-low-stock tbody');
  if (tbody2) {
    var html = '';
    for (var i = 0; i < lowStockProducts.length; i++) {
      var product = lowStockProducts[i];
      html += '<tr>';
      html += '<td>' + product.name + '</td>';
      html += '<td class="text-end">' + product.stock + '</td>';
      html += '<td class="text-end">' + product.reorderLevel + '</td>';
      html += '</tr>';
    }
    tbody2.innerHTML = html;
  }
  
  var cardLowStock = document.getElementById('card-lowstock-count');
  if (cardLowStock) {
    cardLowStock.textContent = String(lowStockProducts.length);
  }
  
  // Grafico a torta: ordini per paese
  var ordersByCountry = {};
  for (var i = 0; i < orders.length; i++) {
    var country = orders[i].ship_country || 'N/D';
    if (ordersByCountry[country]) {
      ordersByCountry[country] = ordersByCountry[country] + 1;
    } else {
      ordersByCountry[country] = 1;
    }
  }
  
  // Converti in array e ordina
  var countriesArray = [];
  for (var country in ordersByCountry) {
    countriesArray.push({
      country: country,
      count: ordersByCountry[country]
    });
  }
  
  countriesArray.sort(function(a, b) {
    return b.count - a.count;
  });
  
  // Prendi i top 5
  var top5 = countriesArray.slice(0, 5);
  var otherCountries = countriesArray.slice(5);
  
  var otherCount = 0;
  for (var i = 0; i < otherCountries.length; i++) {
    otherCount = otherCount + otherCountries[i].count;
  }
  
  var pieLabels = [];
  var pieData = [];
  
  for (var i = 0; i < top5.length; i++) {
    pieLabels.push(top5[i].country);
    pieData.push(top5[i].count);
  }
  
  if (otherCount > 0) {
    pieLabels.push('Altro');
    pieData.push(otherCount);
  }
  
  // Aggiorna le card
  var cardPie = document.getElementById('card-pie-metric');
  if (cardPie) {
    cardPie.textContent = String(distinctCountries);
  }
  
  var cardMonth = document.getElementById('card-orders-month');
  if (cardMonth) {
    cardMonth.textContent = String(ordersThisMonth);
  }
  
  var cardTotal = document.getElementById('card-orders-total');
  if (cardTotal) {
    cardTotal.textContent = String(totalOrders);
  }
  
  // Crea il grafico
  loadChartJs(function() {
    var canvas = document.getElementById('pie-orders-country');
    if (!canvas) {
      return;
    }
    
    var colors = ['#6ea8fe', '#f7b267', '#5cc689', '#c77dff', '#ff6b6b', '#adb5bd'];
    
    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [{
          data: pieData,
          backgroundColor: colors
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false // Disabilita la legenda interna di Chart.js
          }
        }
      }
    });
  });
  
  // --- GESTIONE LEGENDA GRAFICO ---
  var legendContainer = document.getElementById('pie-legend');
  if (legendContainer) {
    var legendHtml = '';
    var legendColors = ['#6ea8fe', '#f7b267', '#5cc689', '#c77dff', '#ff6b6b', '#adb5bd'];
    for (var i = 0; i < pieLabels.length; i++) {
      legendHtml += '<li class="d-flex align-items-center mb-1"><span style="display:inline-block;width:16px;height:16px;background:' + legendColors[i % legendColors.length] + ';border-radius:3px;margin-right:8px;"></span>' + pieLabels[i] + ' <span class="ms-2 text-muted">(' + pieData[i] + ')</span></li>';
    }
    legendContainer.innerHTML = legendHtml;
  }
}

// Ascolta quando la pagina riepilogo viene caricata
document.addEventListener('page:loaded', function(event) {
  var url = '';
  if (event && event.detail && event.detail.url) {
    url = event.detail.url;
  }
  
  if (url.includes('riepilogo.html')) {
    renderRiepilogo();
  }
});
