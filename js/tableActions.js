// Azioni per Grid.js: modifica / elimina / nuovo
let gridCurrentIndex = null;
window.initModalAndTableActions = function () {
  window.myModal = new bootstrap.Modal(document.getElementById('popup-modifica'));
  document.getElementById('annulla-modifica')?.addEventListener('click', () => window.myModal.hide());
  document.getElementById('salva-modifica')?.addEventListener('click', salvaModifiche);
};

function getGridInstance() {
  // Cerca ultimo mount gridjs
  const mount = document.querySelector('.gridjs-mount');
  if (!mount) return null;
  // Grid.js non espone direttamente l'istanza: la recuperiamo cercando la proprietà _gridjs_instance sull'elemento (pattern interno)
  return mount._gridjs_instance || null;
}

window.modifica = function (rowIndex) {
  const inst = getGridInstance();
  if (!inst) return;
  const row = inst.config.data[rowIndex];
  if (!row) return;
  gridCurrentIndex = rowIndex;
  const fields = inst.config.columns.filter(c => c.name !== 'Azioni');
  let html = '';
  fields.forEach((col, i) => {
    html += `<div class="mb-2"><label class="form-label">${col.name}</label><input type="text" class="form-control" data-index="${i}" value="${row[col.id] ?? ''}"></div>`;
  });
  const popup = document.getElementById('popup-contenuto');
  if (popup) popup.innerHTML = html;
  window.myModal.show();
};

window.elimina = function (rowIndex) {
  if (!confirm('Vuoi davvero eliminare questa riga?')) return;
  const inst = getGridInstance();
  if (!inst) return;
  const data = inst.config.data.slice();
  if (rowIndex < 0 || rowIndex >= data.length) return;
  data.splice(rowIndex, 1);
  inst.updateConfig({ data }).forceRender();
};

window.nuovo = function () {
  const inst = getGridInstance();
  if (!inst) return;
  const fields = inst.config.columns.filter(c => c.name !== 'Azioni');
  gridCurrentIndex = null;
  let html = '';
  fields.forEach((col, i) => {
    html += `<div class="mb-2"><label class="form-label">${col.name}</label><input type="text" class="form-control" data-index="${i}" value=""></div>`;
  });
  const popup = document.getElementById('popup-contenuto');
  if (popup) popup.innerHTML = html;
  window.myModal.show();
};

function salvaModifiche() {
  const inst = getGridInstance();
  if (!inst) return;
  const inputs = Array.from(document.querySelectorAll('#popup-contenuto input'));
  const fields = inst.config.columns.filter(c => c.name !== 'Azioni');
  const data = inst.config.data.slice();
  const record = {};
  inputs.forEach((inp, i) => { record[fields[i].id] = inp.value; });
  if (gridCurrentIndex == null) {
    data.push(record);
  } else {
    data[gridCurrentIndex] = { ...data[gridCurrentIndex], ...record };
  }
  inst.updateConfig({ data }).forceRender();
  gridCurrentIndex = null;
  window.myModal.hide();
}
