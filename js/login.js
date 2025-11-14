// login.js - Gestione semplice del login demo

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('floatingInput').value.trim();
    const password = document.getElementById('floatingPassword').value;

    // Demo credentials:
    // - Admin: admin@admin.com / 1234
    // - User:  user@user.com   / 1234
    let role = null;
    if (email === 'admin@admin.com' && password === '1234') {
      role = 'admin';
    } else if (email === 'user@user.com' && password === '1234') {
      role = 'user';
    }

    if (role) {
      localStorage.setItem('erp-logged', '1');
      localStorage.setItem('erp-role', role);
      localStorage.setItem('erp-email', email);
      window.location.href = 'dashboard.html';
    } else {
      alert('Credenziali non valide!');
    }
  });
});
