// login.js - Gestione semplice del login demo

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('floatingInput').value.trim();
    const password = document.getElementById('floatingPassword').value;

    // Demo: login hardcoded (admin@example.com / 1234)
    if (email === 'admin@admin.com' && password === '1234') {
      // Salva login (demo, solo localStorage)
      localStorage.setItem('erp-logged', '1');
      window.location.href = 'dashboard.html';
    } else {
      alert('Credenziali non valide!');
    }
  });
});
