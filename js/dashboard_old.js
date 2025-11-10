async function loadHtml(url, targetSelector, callback) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Caricamento HTML fallito: ${response.status} ${response.statusText}`);
        }
        const htmlContent = await response.text();
		const targetElement = document.querySelector(targetSelector);
		if (targetElement) {
		    targetElement.innerHTML = htmlContent;
		    if (callback) {
			callback();
		    }
		}
	    } catch (error) {
		console.error('Errore nel caricamento del file HTML:', error);
	    }
	}

	// =================================================================
	// 2. Logica di Navigazione Principale
	// =================================================================

	// Funzione di utilità per gestire la navigazione
	function handleNavigation(event, htmlFile, callback) {
	    // 1. Impedisce al browser di ricaricare la pagina
	    event.preventDefault();

	    // 2. Carica il contenuto HTML
	    loadHtml(`html/${htmlFile}`, '#area-principale', callback);

	    // 3. Chiude il menu offcanvas (simula il $('.btn-close').click())
	    const closeButton = document.querySelector('.btn-close');
    if (closeButton) {
        closeButton.click();
    }
}

// =================================================================
// 3. Gestione Eventi e Inizializzazione (Sostituto di $(document).ready())
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Caricamento Iniziale (Sostituto di $(document).ready() + $.load())
    loadHtml("html/riepilogo.html", "#area-principale");

    // 2. Associa i gestori di eventi ai link di navigazione
    const linksMap = {
        '#link-clienti': ['clienti.html', caricaClienti],
        '#link-riepilogo': ['riepilogo.html'],
        '#link-ordini': ['ordini.html', caricaOrdini],
        '#link-prodotti': ['Prodotti.html', caricaProdotti], // Attenzione: Prodotti.html con P maiuscola
        '#link-dipendenti': ['dipendenti.html', caricaDipendenti],
        '#link-spedizionieri': ['sped.html', () => { caricaSpedizionieri(); caricaFornitori(); }],
        '#link-categorie': ['categorie.html', caricaCategorie],
        '#Gestione-prodotti': ['Prodotti.html', caricaProdotti],
        '#Gestione-categorie': ['categorie.html', caricaCategorie]
    };

    for (const selector in linksMap) {
        const link = document.querySelector(selector);
        if (link) {
            const [htmlFile, callback] = linksMap[selector];
            link.addEventListener('click', (event) => {
                handleNavigation(event, htmlFile, callback);
            });
        }
    }

    // 3. Gestione submenu (toggle di Bootstrap o custom)
    const submenuLink = document.querySelector('a[href="#submenu-prodotti"]');
    if (submenuLink) {
        submenuLink.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = submenuLink.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Usa classList.toggle per aggiungere/rimuovere la classe 'show'
                targetElement.classList.toggle('show');
            }
        });
    }

    // 4. Inizializza il Modale di Bootstrap (se non è già fatto altrove)
    window.myModal = new bootstrap.Modal(document.getElementById('popup-modifica'));

    // 5. Aggiungi i gestori di eventi delegati per i bottoni Modifica/Elimina/Salva
    attachTableActions();
});

// =================================================================
// 4. Gestione Azioni Tabella (Delegazione Eventi)
// =================================================================

// Sostituto di $(document).on('click', '.btn-modifica', ...) e $('.btn-elimina', ...)
let rigaCorrente = null; 
let tabellaCorrenteNuovo = null; // tabella destinazione quando si clicca "Nuovo"

function attachTableActions() {
    document.addEventListener('click', (event) => {
        // Gestione Elimina
        if (event.target.classList.contains('btn-elimina')) {
            if (confirm("Vuoi davvero eliminare questa riga?")) {
                // closest() è disponibile in Vanilla JS
                event.target.closest('tr').remove();
            }
        } 
        // Gestione Modifica
        else if (event.target.classList.contains('btn-modifica')) {
            const button = event.target;
            rigaCorrente = button.closest('tr');
            
            // 1. Seleziona le celle dati (esclude l'ultima cella delle azioni)
            const celle = Array.from(rigaCorrente.querySelectorAll('td:not(.azioni)'));
            let htmlCampi = '';
            
            // 2. Trova le intestazioni della tabella per le label
            const table = rigaCorrente.closest('table');
            const headerCells = table ? Array.from(table.querySelectorAll('thead th')) : [];
            
            celle.forEach((td, i) => {
                const valore = td.textContent;
                // Usa il testo dell'intestazione corrispondente come label
                const label = headerCells[i] ? headerCells[i].textContent : `Campo ${i + 1}`;
                
                htmlCampi += `
                    <div class="mb-3">
                        <label for="input-${i}" class="form-label">${label}</label>
                        <input type="text" id="input-${i}" class="form-control" data-index="${i}" value="${valore}">
                    </div>
                `;
            });
            
            // 3. Inserisci i campi nel popup e mostralo
            const popupContenuto = document.getElementById('popup-contenuto');
            if (popupContenuto) {
                popupContenuto.innerHTML = htmlCampi;
            }
            window.myModal.show();
        }
        // Gestione Nuovo (apri popup con campi vuoti)
        else if (event.target.classList.contains('btn-success')) {
            const button = event.target;
            // Prova a prendere la prima tabella della vista corrente
            const area = document.getElementById('area-principale');
            const table = area ? area.querySelector('.table-container table') : null;
            tabellaCorrenteNuovo = table; // memorizza la tabella di destinazione

            if (!table) return;

            const headerCells = Array.from(table.querySelectorAll('thead th'));
            let htmlCampi = '';
            headerCells.forEach((th, i) => {
                if (th.classList.contains('azioni')) return; // salta eventuale colonna azioni
                const label = th.textContent || `Campo ${i + 1}`;
                htmlCampi += `
                    <div class="mb-3">
                        <label for="input-${i}" class="form-label">${label}</label>
                        <input type="text" id="input-${i}" class="form-control" data-index="${i}" value="">
                    </div>
                `;
            });
            const popupContenuto = document.getElementById('popup-contenuto');
            if (popupContenuto) popupContenuto.innerHTML = htmlCampi;
            // segna che non stiamo modificando una riga esistente
            rigaCorrente = null;
            window.myModal.show();
        }
    });

    // Gestione Salva Modifiche (Sostituto di $("#salva-modifica").click())
    const salvaModificaBtn = document.getElementById('salva-modifica');
    if (salvaModificaBtn) {
        salvaModificaBtn.addEventListener('click', handleSave);
    }

    // Gestione Annulla (Sostituto di $("#annulla-modifica").click())
    const annullaModificaBtn = document.getElementById('annulla-modifica');
    if (annullaModificaBtn) {
        annullaModificaBtn.addEventListener('click', () => window.myModal.hide());
    }
}

function handleSave() {
    const inputFields = document.querySelectorAll('#popup-contenuto input');
    
    if (rigaCorrente) {
        // Modifica riga esistente
        inputFields.forEach(input => {
            const index = parseInt(input.getAttribute('data-index'));
            const nuovoValore = input.value;
            
            // Seleziona la cella TD all'indice corretto
            const targetCell = rigaCorrente.querySelectorAll('td:not(.azioni)')[index];
            if (targetCell) {
                targetCell.textContent = nuovoValore;
            }
        });
    } else {
        // Aggiungi nuova riga (Implementazione semplificata, richiede tabella visibile)
        let tbody = null;
        if (tabellaCorrenteNuovo && tabellaCorrenteNuovo.closest('.table-container')) {
            tbody = tabellaCorrenteNuovo.closest('.table-container').querySelector('tbody');
        }
        if (!tbody) {
            const tableContainer = document.querySelector("#area-principale .table-container:not([style*='display: none'])");
            tbody = tableContainer ? tableContainer.querySelector('tbody') : null;
        }
        
        if (tbody) {
            const tr = document.createElement('tr');
            inputFields.forEach(input => {
                const td = document.createElement('td');
                td.textContent = input.value;
                tr.appendChild(td);
            });

            // Aggiungi cella azioni
            const actionsTd = document.createElement('td');
            actionsTd.className = 'azioni';
            actionsTd.innerHTML = '<button class="btn-modifica">✏️</button><button class="btn-elimina">🗑️</button>';
            tr.appendChild(actionsTd);
            
            tbody.appendChild(tr);
        }
    }
    // Resetta la variabile e chiude il modale
    rigaCorrente = null;
    tabellaCorrenteNuovo = null;
    window.myModal.hide();
}

// =================================================================
// 5. Funzioni Loader di Dati (fetchJson rimane invariata)
// =================================================================

// Helper generico per caricare JSON con gestione errori (fetch)
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Richiesta fallita: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Generatore etichetta di fallback
function defaultLabelFromField(field) {
    return field.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

// Loader generico con Vanilla JS (Sostituisce il codice complesso di loadAndRenderTable)
async function loadAndRenderTable({ jsonUrl, labels = {}, tableSelector = '#area-principale .table-container table' }) {
    try {
        const data = await fetchJson(jsonUrl);
        const result = data ? data.results[0] : null;
        const items = result && result.items ? result.items : [];
        const columns = result && result.columns ? result.columns : [];

        // Selezione Tabella con Vanilla JS
        const table = document.querySelector(tableSelector);
        if (!table) return;

        let thead = table.querySelector('thead');
        let tbody = table.querySelector('tbody');
        if (!thead) { thead = table.createTHead(); }
        if (!tbody) { tbody = table.createTBody(); }

        const fieldOrder = columns.length > 0
            ? columns.map(c => (c.name || '').toLowerCase())
            : (items[0] ? Object.keys(items[0]) : []);

        // Creazione Header
        const headerRow = thead.insertRow();
        thead.innerHTML = ''; // Pulisce l'header
        thead.appendChild(headerRow);
        
        fieldOrder.forEach(field => {
            const label = labels[field] || defaultLabelFromField(field);
            const th = document.createElement('th');
            th.textContent = label;
            headerRow.appendChild(th);
        });

        // Creazione Righe Dati
        tbody.innerHTML = ''; // Pulisce il body
        items.forEach(item => {
            const tr = tbody.insertRow();
            
            fieldOrder.forEach(field => {
                const value = item[field];
                const td = tr.insertCell();
                td.textContent = value != null ? value : '';
            });

            // Aggiungi bottoni di modifica e elimina
            const tdAzioni = tr.insertCell();
            tdAzioni.className = 'azioni';
            tdAzioni.innerHTML = '<button class="btn-modifica">✏️</button><button class="btn-elimina">🗑️</button>';
        });

    } catch (error) {
        console.error('Errore nel caricamento dati:', error);
        alert('Errore durante il caricamento dei dati');
    }
}

// Le funzioni Wrapper (caricaClienti, caricaProdotti, ecc.) rimangono le stesse 
// perché richiamano loadAndRenderTable, che ora è in Vanilla JS.

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

function ricercaCliente(){
    var valoreDaRicercare = document.getElementById("searchFieldGiocatori").value.toLowerCase();
    var rows = document.getElementById("tableGiocatori").tBodies[0].querySelectorAll("tr");
    for(var i = 0; i < rows.length; i++){
        var rowContainsSearchTerm = false;
        var cells = rows[i].querySelectorAll("td");
        for(var j = 0; j < cells.length; j++){
            if(cells[j].innerText.toLowerCase().indexOf(valoreDaRicercare) !== -1){
                rowContainsSearchTerm = true;
                break;
            }
        }
        if(!valoreDaRicercare || rowContainsSearchTerm){
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}
