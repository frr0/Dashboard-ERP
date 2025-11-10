$(document).ready(function () {
    $("#area-principale").load("html/riepilogo.html");

    $("#link-clienti").click(function (event) {
        // Impedisce al browser di ricaricare la pagina
        event.preventDefault();
        //  Carica il contenuto di "clienti.html" dentro il div con id="area-principale" e, al termine, popola la tabella dai JSON
        $("#area-principale").load("html/clienti.html", function () {
            caricaClienti();
        });
        // Chiude il menu offcanvas dopo il click
        $('.btn-close').click();
    });

    $("#link-riepilogo").click(function (event) {
        event.preventDefault();
        $("#area-principale").load("html/riepilogo.html");
        $('.btn-close').click();
    });

    $("#link-ordini").click(function (event) {
        event.preventDefault();
        $("#area-principale").load("html/ordini.html", function() {
            caricaOrdini();
        });
        $('.btn-close').click();
    });

    $("#link-prodotti").click(function (event) {
        event.preventDefault();
        // carica la vista Prodotti (nota: file si chiama Prodotti.html con P maiuscola)
        $("#area-principale").load("html/Prodotti.html", function() {
            // al termine del load popolo la tabella con i dati dal JSON
            caricaProdotti();
        });
        $('.btn-close').click();
    });

    $("#link-dipendenti").click(function (event) {
        event.preventDefault();
        $("#area-principale").load("html/dipendenti.html", function() {
            caricaDipendenti();
        });
        $('.btn-close').click();
    });

    $("#link-spedizionieri").click(function (event) {
        event.preventDefault();
        $("#area-principale").load("html/sped.html", function() {
            // Popola entrambe le tabelle nella vista sped.html
            caricaSpedizionieri();
            caricaFornitori();
        });
        $('.btn-close').click();
    });

    $("#link-categorie").click(function (event) {
        event.preventDefault();
        $("#area-principale").load("html/categorie.html", function() {
            caricaCategorie();
        });
        $('.btn-close').click();
    });

    $("#Gestione-prodotti").click(function (event) {
        event.preventDefault();
        $("#area-principale").load("html/Prodotti.html", function() {
            caricaProdotti();
        });
        $('.btn-close').click();
    });

    $("#Gestione-categorie").click(function (event) {
        event.preventDefault();
        $("#area-principale").load("html/categorie.html", function() {
            caricaCategorie();
        });
        $('.btn-close').click();
    });

    $('a[href="#submenu-prodotti"]').click(function (event) {
        event.preventDefault();
        var target = $(this.hash);
        target.toggleClass('show');
    });
});


// Helper generico per caricare JSON con gestione errori
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Richiesta fallita: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Generatore etichetta di fallback (Company Name -> Company Name, order_date -> Order Date)
function defaultLabelFromField(field) {
    return field.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

// Loader generico con un solo try/catch: carica JSON, costruisce header e righe
async function loadAndRenderTable({ jsonUrl, labels = {}, tableSelector = '#area-principale .table-container table' }) {
    try {
        const data = await fetchJson(jsonUrl);
        // questi sono check
        const result = data ? data.results[0] : null;
        const items = result && result.items ? result.items : [];
        const columns = result && result.columns ? result.columns : [];

        const $table = $(tableSelector);
        if ($table.length === 0) return;

        let $thead = $table.find('thead');
        let $tbody = $table.find('tbody');
        if ($thead.length === 0) { $thead = $('<thead>').appendTo($table); }
        if ($tbody.length === 0) { $tbody = $('<tbody>').appendTo($table); }

        const fieldOrder = columns.length > 0
            ? columns.map(c => (c.name || '').toLowerCase())
            : (items[0] ? Object.keys(items[0]) : []);

        const $headerRow = $('<tr>');
        fieldOrder.forEach(field => {
            const label = labels[field] || defaultLabelFromField(field);
            $headerRow.append($('<th>').text(label));
        });
        $thead.empty().append($headerRow);

        $tbody.empty();
        items.forEach(item => {
            const $tr = $('<tr>');
            fieldOrder.forEach(field => {
                const value = item[field];
                $tr.append($('<td>').text(value != null ? value : ''));
            });

            // in questo punto aggiungo i bottoni di modifica e elimina
                const $azioni = $('<td class="azioni">')
        .append('<button class="btn-modifica">✏️</button>')
        .append('<button class="btn-elimina">🗑️</button>');
    $tr.append($azioni);
            $tbody.append($tr);
        });
    } catch (error) {
        console.error('Errore nel caricamento dati:', error);
        alert('Errore durante il caricamento dei dati');
    }
}

// Wrapper: CLIENTI
async function caricaClienti() {
    const labels = {
        customer_id: 'ID',
        customer_code: 'Codice',
        company_name: 'Azienda',
        contact_name: 'Contatto',
        contact_title: 'Titolo',
        address: 'Indirizzo',
        city: 'Città',
        region: 'Regione',
        postal_code: 'CAP',
        country: 'Paese',
        phone: 'Telefono',
        fax: 'Fax'
    };
    return loadAndRenderTable({ jsonUrl: 'json/customers.json', labels });
}


async function caricaProdotti() {
    const labels = {
        product_id: 'ID',
        product_name: 'Prodotto',
        supplier_id: 'Fornitore',
        category_id: 'Categoria',
        quantity_per_unit: 'Quantità per unità',
        unit_price: 'Prezzo unitario',
        units_in_stock: 'Disponibilità',
        units_on_order: 'Ordinati',
        reorder_level: 'Soglia riordino',
        discontinued: 'Discontinuato'
    };
    return loadAndRenderTable({ jsonUrl: 'json/products.json', labels });
}

async function caricaOrdini() {
    const labels = {
        order_id: 'ID Ordine',
        customer_id: 'ID Cliente',
        employee_id: 'ID Dipendente',
        order_date: 'Data Ordine',
        required_date: 'Data Richiesta',
        shipped_date: 'Data Spedizione',
        ship_name: 'Destinatario',
        ship_city: 'Città Spedizione',
        ship_country: 'Paese Spedizione',
        freight: 'Spedizione'
    };
    return loadAndRenderTable({ jsonUrl: 'json/orders.json', labels });
}

// Wrapper: CATEGORIE
async function caricaCategorie() {
    const labels = {
        category_id: 'ID',
        category_name: 'Nome Categoria',
        description: 'Descrizione',
        picture: 'Immagine'
    };
    return loadAndRenderTable({ jsonUrl: 'json/categories.json', labels });
}

// Wrapper: DIPENDENTI
async function caricaDipendenti() {
    const labels = {
        employee_id: 'ID',
        lastname: 'Cognome',
        firstname: 'Nome',
        title: 'Titolo',
        title_of_courtesy: 'Titolo di cortesia',
        birthdate: 'Data di nascita',
        hiredate: 'Data assunzione',
        address: 'Indirizzo',
        city: 'Città',
        region: 'Regione',
        postal_code: 'CAP',
        country: 'Paese',
        home_phone: 'Telefono',
        extension: 'Interno',
        photo: 'Foto',
        notes: 'Note',
        reports_to: 'Riporta a',
        username: 'Username',
        password: 'Password'
    };
    return loadAndRenderTable({ jsonUrl: 'json/employees.json', labels });
}

// Wrapper: SPEDIZIONIERI
async function caricaSpedizionieri() {
    const labels = {
        shipper_id: 'ID',
        company_name: 'Azienda',
        phone: 'Telefono'
    };
    // Tabella dedicata nella vista sped.html
    return loadAndRenderTable({ jsonUrl: 'json/shippers.json', labels, tableSelector: '#tabella-spedizionieri' });
}

// Wrapper: FORNITORI
async function caricaFornitori() {
    const labels = {
        supplier_id: 'ID',
        company_name: 'Azienda',
        contact_name: 'Contatto',
        contact_title: 'Titolo Contatto',
        address: 'Indirizzo',
        city: 'Città',
        region: 'Regione',
        postal_code: 'CAP',
        country: 'Paese',
        phone: 'Telefono',
        fax: 'Fax',
        home_page: 'Home Page'
    };
    // Tabella dedicata nella vista sped.html
    return loadAndRenderTable({ jsonUrl: 'json/suppliers.json', labels, tableSelector: '#tabella-fornitori' });
}

// === Gestione pulsanti Modifica / Elimina ===
$(document).on('click', '.btn-elimina', function () {
    if (confirm("Vuoi davvero eliminare questa riga?")) {
        $(this).closest('tr').remove();
    }
});

let rigaCorrente = null;
// Devi inizializzare il Modal di Bootstrap (una sola volta!)
const myModal = new bootstrap.Modal(document.getElementById('popup-modifica'));

// Unico handler per il click su MODIFICA
$(document).on('click', '.btn-modifica', function () {
    rigaCorrente = $(this).closest('tr');
    const celle = rigaCorrente.find('td').not('.azioni');
    let htmlCampi = '';
    celle.each(function (i) {
        const valore = $(this).text();
        const label = $("thead th").eq(i).text();
        htmlCampi += `
            <div class="mb-3">
                <label for="input-${i}" class="form-label">${label}</label>
                <input type="text" id="input-${i}" class="form-control" data-index="${i}" value="${valore}">
            </div>
        `;
    });
    $("#popup-contenuto").html(htmlCampi);
    myModal.show();
});

// Salva le modifiche
$("#salva-modifica").click(function () {
    if (rigaCorrente) {
        // Modifica riga esistente
        $("#popup-contenuto input").each(function () {
            const index = $(this).data("index");
            const nuovoValore = $(this).val();
            rigaCorrente.find("td").not('.azioni').eq(index).text(nuovoValore);
        });
    } else {
        // Aggiungi nuova riga
        // Trova la tabella attiva
        const $table = $("#area-principale .table-container:visible table");
        const $tbody = $table.find('tbody');
        let $tr = $('<tr>');
        $("#popup-contenuto input").each(function () {
            $tr.append($('<td>').text($(this).val()));
        });
        // Aggiungi cella azioni
        $tr.append('<td class="azioni"><button class="btn-modifica">✏️</button><button class="btn-elimina">🗑️</button></td>');
        $tbody.append($tr);
    }
    myModal.hide();
});

// Annulla: Ora è gestito anche dal bottone "btn-close" e "data-bs-dismiss"
$("#annulla-modifica").click(function () {
    myModal.hide(); 
});

// $(document).on('click', '.btn-success', function () {
//     rigaCorrente = $(this).closest('tr');
//     const celle = rigaCorrente.find('td').not('.azioni');
//     let htmlCampi = '';
//     celle.each(function (i) {
//         const valore = $(this).text();
//         const label = $("thead th").eq(i).text();
//         htmlCampi += `
//             <div class="mb-3">
//                 <label for="input-${i}" class="form-label">${label}</label>
//                 <input type="text" id="input-${i}" class="form-control" data-index="${i}" value="${valore}">
//             </div>
//         `;
//     });
//     $("#popup-contenuto").html(htmlCampi);
//     myModal.show();
// });