
document.addEventListener('DOMContentLoaded', () => {
    const themeButton = document.getElementById('btn-theme');
    const body = document.body;

    // Funzione per applicare il tema salvato
    const applySavedTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.classList.toggle('theme-dark', savedTheme === 'dark');
            themeButton.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    };

    // Applica il tema al caricamento della pagina
    applySavedTheme();

    // Gestore per il click sul pulsante del tema
    themeButton.addEventListener('click', () => {
        body.classList.toggle('theme-dark');
        const isDarkMode = body.classList.contains('theme-dark');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        themeButton.textContent = isDarkMode ? '☀️' : '🌙';
    });
});
