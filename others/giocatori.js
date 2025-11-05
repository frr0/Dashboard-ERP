var selectedRow;

function validateFormGiocatori(fieldDaValidare){
    var form = document.getElementById("formGiocatori");

    var isValid = true;

    function addErrorMessage(element, message){
        var prossimoElemento = element.nextSibling;

        if(prossimoElemento.classList && prossimoElemento.classList.contains("invalid-feedback")){
            prossimoElemento.innerHTML = message;
        }else{
            element.classList.add("invalid");
    
            var errDiv = document.createElement("div");
            errDiv.classList.add("invalid-feedback");
            errDiv.innerHTML = message;
    
            element.parentNode.insertBefore(errDiv, element.nextSibling);
        }
    }
    function removeErrorMessage(element){
        element.classList.remove("invalid");
        var prossimoElemento = element.nextSibling;
        if(prossimoElemento.classList && prossimoElemento.classList.contains("invalid-feedback")){
            prossimoElemento.parentNode.removeChild(prossimoElemento);
        }
    }
    // VALIDAZIONE CAMPI DINAMICA:
    function validateField(fieldDaValidare){

        var isCampoValid = true;
        var fieldElement = form[fieldDaValidare];
        
        var fieldValue = fieldElement.value;

        switch(fieldDaValidare){
            case "NOME":
            case "COGNOME":
            case "DATA_NASCITA":
            case "NAZIONE_NASCITA":
                if(!fieldValue || fieldValue === ""){
                    addErrorMessage(fieldElement, "Campo richiesto");
                    isCampoValid = false;
                } else {
                    removeErrorMessage(fieldElement);
                }
                break;
            case "numero_maglia_abituale":
                if(fieldValue && fieldValue !== ""){
                    if(isInt(fieldValue)){
                        if(fieldValue > 0 && fieldValue < 100){
                            removeErrorMessage(fieldElement);
                        } else {
                            addErrorMessage(fieldElement, "Deve essere compreso tra 1 e 99");
                        }
                    } else {
                        addErrorMessage(fieldElement, "Deve essere un numero valido");
                        isCampoValid = false;
                    }
                } else {
                    removeErrorMessage(fieldElement);
                }
                break;
        }
        return isCampoValid;
    }

    if(fieldDaValidare){
        validateField(fieldDaValidare);
    } else {
        for(var i = 0; i < formGiocatoriFields.length; i++){
            var isCampoValid = validateField(formGiocatoriFields[i].name);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }
    // VALIDAZIONE CAMPI STATICA:
    /* // Validazione NOME
    var nomeFieldElement = form.NOME;
    var nomeFieldValue = nomeFieldElement.value;
    
    if(!nomeFieldValue || nomeFieldValue === ""){
        addErrorMessage(nomeFieldElement, "Campo richiesto");
        isValid = false;
    } else {
        removeErrorMessage(nomeFieldElement);
    }

    // Validazione COGNOME
    var cognomeFieldElement = form.COGNOME;
    var cognomeFiledValue = cognomeFieldElement.value;

    if(!cognomeFiledValue || cognomeFiledValue === ""){
        addErrorMessage(cognomeFieldElement, "Campo richiesto");
        isValid = false;
    } else {
        removeErrorMessage(cognomeFieldElement);
    }
    
    // Validazione DATA NASCITA
    var dataNascitaFieldElement = form.DATA_NASCITA;
    var dataNascitaFieldValue = dataNascitaFieldElement.value;

    if(!dataNascitaFieldValue || dataNascitaFieldValue === ""){
        addErrorMessage(dataNascitaFieldElement, "Campo richiesto");
        isValid = false;
    } else {
        removeErrorMessage(dataNascitaFieldElement);
    }

    // Validazione NUMERO MAGLIA
    var numeroMagliaFieldElement = form.NUMERO_MAGLIA;
    var numeroMagliaFieldValue = numeroMagliaFieldElement.value;

    if(numeroMagliaFieldValue && numeroMagliaFieldValue !== ""){
        if(isInt(numeroMagliaFieldValue)){
            if(numeroMagliaFieldValue > 0 && numeroMagliaFieldValue < 100){
                removeErrorMessage(numeroMagliaFieldElement);
            } else {
                addErrorMessage(numeroMagliaFieldElement, "Deve essere compreso tra 1 e 99");
            }
        } else {
            addErrorMessage(numeroMagliaFieldElement, "Deve essere un numero valido");
            isValid = false;
        }
    } else {
        removeErrorMessage(numeroMagliaFieldElement);
    }

    // Validazione NAZIONE NASCITA
    var nazioneNascitaFieldElement = form.NAZIONE_NASCITA;
    var nazioneNascitaFieldValue = nazioneNascitaFieldElement.value;

    if(!nazioneNascitaFieldValue && nazioneNascitaFieldValue === ""){
        addErrorMessage(nazioneNascitaFieldElement, "Campo richiesto");
        isValid = false;
    } else {
        removeErrorMessage(nazioneNascitaFieldElement);
    }*/

    return isValid;
}

function handlerFormGiocatoriSubmitButtonClick(event){
    event.preventDefault();
    if(validateFormGiocatori()){
        var valori = {};

        for(var i = 0; i < formGiocatoriFields.length; i++){
            var fieldIterato = formGiocatoriFields[i];

            if(fieldIterato.tagName.toUpperCase() === "SELECT"){
                valori[fieldIterato.name] = fieldIterato.options[fieldIterato.selectedIndex].innerText;
            } else if(fieldIterato.type === "date") {
                var dateValue = fieldIterato.valueAsDate;
                if (dateValue) {
                    valori[fieldIterato.name] = formatDate(dateValue);
                } else {
                    valori[fieldIterato.name] = "";
                }
            } else {
                valori[fieldIterato.name] = fieldIterato.value;
            }
        }

        var valoriLowercase = {};
        for (var key in valori) {
            if (valori.hasOwnProperty(key)) {
                valoriLowercase[key.toLowerCase()] = valori[key];
            }
        }

        if(valoriLowercase.id_rec && valoriLowercase.id_rec !== "" && selectedRow){
            aggiornaRigaTableGiocatori(valoriLowercase);
        } else {
            var timestamp = new Date().getTime().toString();
            valoriLowercase.id_rec = timestamp.slice(timestamp.length - 5);
           
            aggiungiRigaTableGiocatori(valoriLowercase);

            document.getElementById("formGiocatori").reset();
        }
    }else{

    }
}
var submitBotton = document.getElementById("formGiocatori").querySelectorAll('input[type="submit"]')[0];

submitBotton.addEventListener("click", handlerFormGiocatoriSubmitButtonClick)

function handlerFormGiocatoriChange(event){
    validateFormGiocatori(this.name);
}

var formGiocatoriFields = document.getElementById("formGiocatori").querySelectorAll('input:not(.btn), select');

for(var indiceFormField = 0; indiceFormField < formGiocatoriFields.length; indiceFormField++){
    formGiocatoriFields[indiceFormField].addEventListener("input", handlerFormGiocatoriChange);
    formGiocatoriFields[indiceFormField].addEventListener("blur", handlerFormGiocatoriChange);
}

function aggiungiRigaTableGiocatori(valori){
    // creo una variabile per aggiungere una riga
    var tr = document.createElement("tr");
    // creo una variabile per aggiungere la tabella stessa nel primo caricamento
    var tableGiocatori = document.getElementById("tableGiocatori");
    // creo riga header
    var headerFieldList = tableGiocatori.tHead.getElementsByTagName("th");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");
        if(fieldName && fieldName !== ""){
            if(valori.hasOwnProperty(fieldName.toLowerCase()) && valori[fieldName.toLowerCase()] !== null){
                td.innerHTML = valori[fieldName.toLowerCase()];
            }
        }else{
            var iEl = document.createElement("i");
            iEl.classList.add("fa");
            iEl.classList.add("fa-trash");
            iEl.style["font-size"] = "16px";
            iEl.addEventListener("click", handlerTableGiocatoriDeleteButtunClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }
    tableGiocatori.tBodies[0].insertBefore(tr, tableGiocatori.tBodies[0].firstElementChild);
}

function handlerTableGiocatoriRowClick(event){
    event.stopPropagation();
    // debugger;

    var target = event.target;

    if(target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableGiocatori").tBodies[0];
    var previousSelectedElement = tBody.querySelectorAll("tr.selected");

    if(previousSelectedElement.length > 0){
        previousSelectedElement[0].classList.remove("selected");
    }

    var tr;

    if(target.tagName.toUpperCase() === "TD"){
        tr = target.parentNode;
    } else {
        tr = target;
    }

    tr.classList.add("selected");
    selectedRow = tr;
    var tDataList = tr.querySelectorAll("td");
    var headerFieldList = tableGiocatori.tHead.getElementsByTagName("th");
    var form = document.getElementById("formGiocatori");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName !== ""){
            var valore = tDataList[i].innerText;
            var formField = form[fieldName];
    
            if(fieldName === "DATA_DI_NASCITA"){
                if(valore !== ""){
                    var splittedStringDate = valore.split("-");
                    var year = parseInt(splittedStringDate[2], 10);
                    if (year < 30) { // Assuming years < 30 are 20xx
                        year += 2000;
                    } else { // Assuming years >= 30 are 19xx
                        year += 1900;
                    }
                    valore = year + "-" + splittedStringDate[1] + "-" + splittedStringDate[0];
                }
            } else if(fieldName === "numero_maglia_abituale"){
                if(!isInt(valore)){
                    valore = "";
                }
            } else if(fieldName === "RUOLO_ABITUALE"){
                if(valore && valore !== ""){
                    var selectOptions = formField.options;
                    for(var j = 0; j < selectOptions.length; j++){
                        if(selectOptions[j].innerText === valore){
                            valore = selectOptions[j].value;
                            break;
                        }
                    }
                }
            }
            form[fieldName].value = valore;
        }
    }
}

document.getElementById("tableGiocatori").tBodies[0].addEventListener("click", handlerTableGiocatoriRowClick);

function aggiornaRigaTableGiocatori(valori){
    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    
    var tableGiocatori = document.getElementById("tableGiocatori");

    var headerFieldList = tableGiocatori.tHead.getElementsByTagName("th");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName !== ""){
            if(valori.hasOwnProperty(fieldName.toLowerCase()) && valori[fieldName.toLowerCase()] !== null){
                tDataList[i].innerHTML = valori[fieldName.toLowerCase()];
            } else {
                tDataList[i].innerHTML = "";
            }
        }
    }
}

function handlerTableGiocatoriDeleteButtunClick(event){
    event.stopPropagation()

    var target = event.target;
    var tr = target.parentNode.parentNode;

    // Since there is no backend to handle DELETE requests for a static JSON file,
    // we will only remove the row from the DOM for client-side deletion.
    tr.parentNode.removeChild(tr);
    console.info("Eliminazione avvenuta con successo (solo lato client)");
}

// NECESSARIO PER VERSIONE PRECEDENTE SENZA FILE JSON:
var iElements = document.getElementById("tableGiocatori").tBodies[0].querySelectorAll("i");
for(var indiceIEl = 0; indiceIEl < iElements.length; indiceIEl++){
    iElements[indiceIEl].addEventListener("click", handlerTableGiocatoriDeleteButtunClick);
}

function ricercaGiocatori(){
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

// NECESSARIO PER VERSIONE SUCCESSIVA CON FILE JSON:
function caricaGiocatori() {
    
    // prendo il file .json e guardo la risposta
    fetch('json/giocatori.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        // Aggiungo alla tabella giocatori
        .then(listaGiocatori => {
            for (var i = listaGiocatori.length; i > 0; i--) {
                aggiungiRigaTableGiocatori(listaGiocatori[i - 1]);
            }
        })
        // controllo errori durante il caricamento
        .catch(error => {
            console.error('Error:', error);
            alert("Errore durante il caricamento");
        });
}
