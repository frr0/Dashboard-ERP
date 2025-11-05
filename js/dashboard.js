$(document).ready(function() {
    $("#area-principale").load("riepilogo.html");

    $("#link-clienti").click(function(event) {
        // Impedisce al browser di ricaricare la pagina
        event.preventDefault(); 
        //  Carica il contenuto di "clienti.html" dentro il div con id="area-principale"
        $("#area-principale").load("clienti.html");
        // Chiude il menu offcanvas dopo il click
        $('.btn-close').click();
    });

    $("#link-riepilogo").click(function(event) {
        event.preventDefault(); 
        $("#area-principale").load("riepilogo.html");
        $('.btn-close').click();
    });

    $("#link-ordini").click(function(event) {
        event.preventDefault(); 
        $("#area-principale").load("ordini.html");
        $('.btn-close').click();
    });

    $("#link-prodotti").click(function(event) {
        event.preventDefault(); 
        $("#area-principale").load("prodotti.html");
        $('.btn-close').click();
    });

    $("#link-dipendenti").click(function(event) {
        event.preventDefault(); 
        $("#area-principale").load("dipendenti.html");
        $('.btn-close').click();
    });

    $("#link-spedizionieri").click(function(event) {
        event.preventDefault(); 
        $("#area-principale").load("sped.html");
        $('.btn-close').click();
    });

    $("#link-categorie").click(function(event) {
        event.preventDefault(); 
        $("#area-principale").load("categorie.html");
        $('.btn-close').click();
    });

    $("#Gestione-prodotti").click(function(event) {
        event.preventDefault();
        $("#area-principale").load("Prodotti.html");
        $('.btn-close').click();
    });

    $("#Gestione-categorie").click(function(event) {
        event.preventDefault();
        $("#area-principale").load("categorie.html");
        $('.btn-close').click();
    });

    $('a[href="#submenu-prodotti"]').click(function(event) {
        event.preventDefault();
        var target = $(this.hash);
        target.toggleClass('show');
    });
});