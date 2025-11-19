document.addEventListener('DOMContentLoaded',()=>{
  const f=document.querySelector('form');if(!f)return;
  f.addEventListener('submit',e=>{
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
      window.location.href = 'index.html';
    } else {
      alert('Credenziali non valide!');
    }
  });
});
