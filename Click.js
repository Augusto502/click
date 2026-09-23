let validUser = "gpoclick@gmail.com";
let validPass = "click2026";

let clients = JSON.parse(localStorage.getItem("gpoclick_clients")) || [];
let activeFilter = "ALL";
let currentGeneratedCode = "";
let resetMode = "pass";

document.addEventListener("DOMContentLoaded", () => {
  renderTable();
  updateStats();
});

function saveToLocalStorage() {
  localStorage.setItem("gpoclick_clients", JSON.stringify(clients));
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("input-password");
  const icon = document.getElementById("toggle-password-icon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

function handleLogin(e) {
  e.preventDefault();
  const userInput = document.getElementById("input-username").value.trim();
  const passInput = document.getElementById("input-password").value;
  const errorBox = document.getElementById("login-error");

  if (userInput === validUser && passInput === validPass) {
    errorBox.classList.add("hidden");
    document.getElementById("screen-login").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
  } else {
    errorBox.classList.remove("hidden");
    document.getElementById("login-error-msg").textContent = "Usuario o contraseña inválidos.";
  }
}

function handleLogout() {
  document.getElementById("app-container").classList.add("hidden");
  document.getElementById("screen-login").classList.remove("hidden");
}

function openResetModal(mode) {
  resetMode = mode;
  document.getElementById("modal-reset").classList.remove("hidden");
  document.getElementById("reset-step-1").classList.remove("hidden");
  document.getElementById("reset-step-2").classList.add("hidden");

  if (mode === "pass") {
    document.getElementById("reset-title").textContent = "Restablecer Contraseña";
    document.getElementById("new-password-field").classList.remove("hidden");
    document.getElementById("new-email-field").classList.add("hidden");
  } else {
    document.getElementById("reset-title").textContent = "Cambiar Correo Electrónico";
    document.getElementById("new-password-field").classList.add("hidden");
    document.getElementById("new-email-field").classList.remove("hidden");
  }
}

function closeResetModal() {
  document.getElementById("modal-reset").classList.add("hidden");
}

function sendVerificationCode() {
  const emailInput = document.getElementById("reset-email-input").value.trim();
  if (!emailInput) return alert("Ingresa un correo electrónico válido.");

  currentGeneratedCode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById("simulated-code").textContent = currentGeneratedCode;

  document.getElementById("reset-step-1").classList.add("hidden");
  document.getElementById("reset-step-2").classList.remove("hidden");
}

function verifyAndChange() {
  const codeEntered = document.getElementById("reset-code-input").value.trim();

  if (codeEntered !== currentGeneratedCode) {
    return alert("El código ingresado no coincide.");
  }

  if (resetMode === "pass") {
    const newPass = document.getElementById("reset-new-password").value;
    if (!newPass) return alert("Escribe la nueva contraseña.");
    validPass = newPass;
    document.getElementById("input-password").value = newPass;
    alert("¡Contraseña actualizada!");
  } else {
    const newEmail = document.getElementById("reset-new-email").value.trim();
    if (!newEmail) return alert("Escribe el nuevo correo.");
    validUser = newEmail;
    document.getElementById("input-username").value = newEmail;
    alert("¡Correo actualizado!");
  }

  closeResetModal();
}

function showSection(section) {
  document.getElementById("view-list").classList.add("hidden");
  document.getElementById("view-form").classList.add("hidden");
  document.getElementById("view-details").classList.add("hidden");

  if (section === 'list') {
    document.getElementById("view-list").classList.remove("hidden");
    renderTable();
  } else if (section === 'form') {
    document.getElementById("view-form").classList.remove("hidden");
  } else if (section === 'details') {
    document.getElementById("view-details").classList.remove("hidden");
  }
}

function getStatusBadge(status) {
  switch (status) {
    case "Activo":
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Activo</span>`;
    case "Inactivo":
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Inactivo</span>`;
    case "Pendiente":
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Pendiente</span>`;
    case "Pagado":
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300"><span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Pagado</span>`;
    default:
      return status;
  }
}

function calculateTotals() {
  const diag = parseFloat(document.getElementById("cost-diag").value) || 0;
  const repair = parseFloat(document.getElementById("cost-repair").value) || 0;
  const backup = parseFloat(document.getElementById("cost-backup").value) || 0;
  const others = parseFloat(document.getElementById("cost-others").value) || 0;

  const total = diag + repair + backup + others;
  document.getElementById("cost-total").value = total.toFixed(2);

  const advance = parseFloat(document.getElementById("cost-advance").value) || 0;
  const balance = total - advance;
  document.getElementById("cost-balance").value = balance.toFixed(2);
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
}

function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
}

function renderTable() {
  const tbody = document.getElementById("clients-tbody");
  const searchQuery = document.getElementById("global-search").value.toLowerCase();

  let filtered = clients.filter(c => {
    const matchesSearch = c.clientName.toLowerCase().includes(searchQuery) ||
                          c.phone.includes(searchQuery) ||
                          (c.model && c.model.toLowerCase().includes(searchQuery));
    const matchesStatus = activeFilter === "ALL" || c.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-slate-500">
          <i class="fa-solid fa-folder-open text-2xl mb-2 block"></i>
          No hay registros de clientes o reparaciones.
        </td>
      </tr>`;
  } else {
    filtered.forEach(c => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-800/50 transition duration-150";
      row.innerHTML = `
        <td class="py-3 px-4 font-mono font-medium text-orange-400">${c.id}</td>
        <td class="py-3 px-4 font-semibold text-white">${c.clientName}</td>
        <td class="py-3 px-4 text-slate-400">${c.phone}</td>
        <td class="py-3 px-4 text-slate-400">${c.entryDate || '-'}</td>
        <td class="py-3 px-4 text-slate-300">${(c.eqBrands || []).join(", ") || 'Equipo'} ${c.model ? ' - ' + c.model : ''}</td>
        <td class="py-3 px-4 font-semibold text-amber-400">Q. ${c.costTotal || '0.00'}</td>
        <td class="py-3 px-4 text-center">${getStatusBadge(c.status)}</td>
        <td class="py-3 px-4 text-center">
          <div class="flex items-center justify-center gap-1 text-slate-400">
            <button onclick="viewClient('${c.id}')" title="Ver detalle" class="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg"><i class="fa-regular fa-eye"></i></button>
            <button onclick="openEditForm('${c.id}')" title="Editar" class="p-1.5 hover:text-orange-400 hover:bg-slate-800 rounded-lg"><i class="fa-regular fa-pen-to-square"></i></button>
            <button onclick="deleteClient('${c.id}')" title="Eliminar" class="p-1.5 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  updateStats();
}

function updateStats() {
  document.getElementById("stat-activo").textContent = clients.filter(c => c.status === "Activo").length;
  document.getElementById("stat-inactivo").textContent = clients.filter(c => c.status === "Inactivo").length;
  document.getElementById("stat-pendiente").textContent = clients.filter(c => c.status === "Pendiente").length;
  document.getElementById("stat-pagado").textContent = clients.filter(c => c.status === "Pagado").length;
}

function filterByStatus(status) {
  activeFilter = status;
  renderTable();
}

function openCreateForm() {
  document.getElementById("form-title").textContent = "Nueva Boleta de Reparación";
  document.getElementById("client-form").reset();
  document.getElementById("form-client-id").value = "";
  calculateTotals();
  showSection('form');
}

function openEditForm(id) {
  const c = clients.find(item => item.id === id);
  if (!c) return;

  document.getElementById("form-title").textContent = "Editar Boleta (" + c.id + ")";
  document.getElementById("form-client-id").value = c.id;
  document.getElementById("field-status").value = c.status;
  document.getElementById("field-entry-date").value = c.entryDate;
  document.getElementById("field-exit-date").value = c.exitDate;
  document.getElementById("field-phone").value = c.phone;
  document.getElementById("field-client-name").value = c.clientName;
  document.getElementById("field-model").value = c.model;

  document.querySelectorAll('input[name="eq-brand"]').forEach(cb => cb.checked = (c.eqBrands || []).includes(cb.value));
  document.querySelectorAll('input[name="printer"]').forEach(cb => cb.checked = (c.printers || []).includes(cb.value));
  document.getElementById("field-printer-mod").value = c.printerMod;
  document.getElementById("acc-power").checked = c.accPower;
  document.getElementById("acc-datos").checked = c.accDatos;
  document.getElementById("field-acc-otros").value = c.accOtros;
  document.querySelectorAll('input[name="mobile"]').forEach(cb => cb.checked = (c.mobiles || []).includes(cb.value));

  document.getElementById("field-problem").value = c.problem;
  document.getElementById("field-repair").value = c.repair;
  document.getElementById("field-general-desc").value = c.generalDesc || "";

  if (c.cargador) document.querySelector(`input[name="cargador"][value="${c.cargador}"]`)?.click();
  if (c.bateria) document.querySelector(`input[name="bateria"][value="${c.bateria}"]`)?.click();
  if (c.teclado) document.querySelector(`input[name="teclado"][value="${c.teclado}"]`)?.click();
  if (c.mouse) document.querySelector(`input[name="mouse"][value="${c.mouse}"]`)?.click();
  if (c.maletin) document.querySelector(`input[name="maletin"][value="${c.maletin}"]`)?.click();
  document.getElementById("field-otros-accesorios").value = c.otrosAccesorios;

  if (c.cpu) document.querySelector(`input[name="cpu"][value="${c.cpu}"]`)?.click();
  document.getElementById("field-cpu-gen").value = c.cpuGen;
  if (c.ram) document.querySelector(`input[name="ram"][value="${c.ram}"]`)?.click();
  document.getElementById("field-ram-cap").value = c.ramCap;
  if (c.hdd) document.querySelector(`input[name="hdd"][value="${c.hdd}"]`)?.click();
  document.getElementById("field-hdd-cap").value = c.hddCap;

  document.getElementById("cost-diag").value = c.costDiag;
  document.getElementById("cost-repair").value = c.costRepair;
  document.getElementById("cost-backup").value = c.costBackup;
  document.getElementById("cost-others").value = c.costOthers;
  document.getElementById("cost-advance").value = c.costAdvance;

  calculateTotals();
  showSection('form');
}

function saveClient(e) {
  e.preventDefault();
  const id = document.getElementById("form-client-id").value;

  const data = {
    status: document.getElementById("field-status").value,
    entryDate: document.getElementById("field-entry-date").value,
    exitDate: document.getElementById("field-exit-date").value,
    phone: document.getElementById("field-phone").value,
    clientName: document.getElementById("field-client-name").value,
    eqBrands: getCheckedValues("eq-brand"),
    model: document.getElementById("field-model").value,
    printers: getCheckedValues("printer"),
    printerMod: document.getElementById("field-printer-mod").value,
    accPower: document.getElementById("acc-power").checked,
    accDatos: document.getElementById("acc-datos").checked,
    accOtros: document.getElementById("field-acc-otros").value,
    mobiles: getCheckedValues("mobile"),
    problem: document.getElementById("field-problem").value,
    repair: document.getElementById("field-repair").value,
    generalDesc: document.getElementById("field-general-desc").value,
    cargador: getRadioValue("cargador"),
    bateria: getRadioValue("bateria"),
    teclado: getRadioValue("teclado"),
    mouse: getRadioValue("mouse"),
    maletin: getRadioValue("maletin"),
    otrosAccesorios: document.getElementById("field-otros-accesorios").value,
    cpu: getRadioValue("cpu"),
    cpuGen: document.getElementById("field-cpu-gen").value,
    ram: getRadioValue("ram"),
    ramCap: document.getElementById("field-ram-cap").value,
    hdd: getRadioValue("hdd"),
    hddCap: document.getElementById("field-hdd-cap").value,
    costDiag: document.getElementById("cost-diag").value,
    costRepair: document.getElementById("cost-repair").value,
    costBackup: document.getElementById("cost-backup").value,
    costOthers: document.getElementById("cost-others").value,
    costTotal: document.getElementById("cost-total").value,
    costAdvance: document.getElementById("cost-advance").value,
    costBalance: document.getElementById("cost-balance").value
  };

  if (id) {
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data };
    }
  } else {
    const newId = "CLI-" + String(clients.length + 1).padStart(3, '0');
    clients.push({ id: newId, ...data });
  }

  saveToLocalStorage();
  showSection('list');
}

function viewClient(id) {
  const c = clients.find(item => item.id === id);
  if (!c) return;

  document.getElementById("detail-name").textContent = c.clientName;
  document.getElementById("detail-id").textContent = "ID: " + c.id;
  document.getElementById("detail-status-badge").innerHTML = getStatusBadge(c.status);

  document.getElementById("detail-content").innerHTML = `
    <!-- Fechas y Contacto -->
    <div class="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div><span class="block text-[10px] uppercase font-bold text-slate-400">Teléfono</span><span class="font-semibold text-slate-800">${c.phone}</span></div>
      <div><span class="block text-[10px] uppercase font-bold text-slate-400">Ingreso</span><span class="font-semibold text-slate-800">${c.entryDate || '-'}</span></div>
      <div><span class="block text-[10px] uppercase font-bold text-slate-400">Egreso</span><span class="font-semibold text-slate-800">${c.exitDate || '-'}</span></div>
    </div>

    
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
      <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">Especificaciones del Equipo</h4>
      <div class="grid grid-cols-2 gap-2">
        <p><strong class="text-slate-900">Marca/Equipo:</strong> ${(c.eqBrands || []).join(", ") || 'N/A'}</p>
        <p><strong class="text-slate-900">Modelo:</strong> ${c.model || 'N/A'}</p>
        <p><strong class="text-slate-900">Impresora/Móvil:</strong> ${(c.printers || []).concat(c.mobiles || []).join(", ") || 'Ninguno'}</p>
        <p><strong class="text-slate-900">CPU:</strong> ${c.cpu || ''} (${c.cpuGen || 'N/A'})</p>
        <p><strong class="text-slate-900">RAM:</strong> ${c.ram || ''} (${c.ramCap || 'N/A'})</p>
        <p><strong class="text-slate-900">Disco:</strong> ${c.hdd || ''} (${c.hddCap || 'N/A'})</p>
      </div>
    </div>

    <!-- Accesorios -->
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
      <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">Estado Físico / Accesorios</h4>
      <div class="grid grid-cols-3 gap-2 pt-1">
        <p><strong>Cargador:</strong> ${c.cargador || 'N/A'}</p>
        <p><strong>Batería:</strong> ${c.bateria || 'N/A'}</p>
        <p><strong>Teclado:</strong> ${c.teclado || 'N/A'}</p>
        <p><strong>Mouse:</strong> ${c.mouse || 'N/A'}</p>
        <p><strong>Maletín:</strong> ${c.maletin || 'N/A'}</p>
        <p><strong>Otros:</strong> ${c.otrosAccesorios || 'Ninguno'}</p>
      </div>
    </div>

    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
      <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">Diagnóstico y Notas</h4>
      <p><strong class="text-slate-900">Problema reportado:</strong> ${c.problem || 'Sin registrar'}</p>
      <p><strong class="text-slate-900">Reparación realizada:</strong> ${c.repair || 'Sin registrar'}</p>
      <p><strong class="text-orange-600">Observaciones Generales:</strong> ${c.generalDesc || 'Sin registrar'}</p>
    </div>

  
    <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 shadow-sm space-y-3">
      <div class="flex justify-between items-center border-b border-slate-200 pb-2 text-xs">
        <span><strong>Diagnóstico:</strong> Q.${c.costDiag || '0.00'}</span>
        <span><strong>Reparación:</strong> Q.${c.costRepair || '0.00'}</span>
        <span><strong>Backup:</strong> Q.${c.costBackup || '0.00'}</span>
      </div>
      <div class="flex flex-col sm:flex-row justify-between items-end gap-3 pt-1">
        <div class="text-xs space-y-1 w-full">
          <div class="flex justify-between font-bold">
            <span class="text-slate-900">TOTAL: Q.${c.costTotal || '0.00'}</span>
            <span class="text-slate-700">Anticipo: Q.${c.costAdvance || '0.00'}</span>
            <span class="text-emerald-700">Saldo Pendiente: Q.${c.costBalance || '0.00'}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-xs shrink-0 self-end">
          <div class="text-right">
            <p class="text-[9px] font-bold text-slate-700 leading-tight">Pagos sin contacto</p>
            <p class="text-[7px] text-slate-500">Visa y Mastercard</p>
          </div>
          <div class="flex items-center gap-1.5 font-bold text-xs">
            <span class="text-blue-900 tracking-tighter italic font-black text-sm">VISA</span>
            <div class="flex -space-x-1.5 items-center">
              <span class="w-3.5 h-3.5 rounded-full bg-red-600 inline-block opacity-90"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block opacity-90"></span>
            </div>
            <i class="fa-solid fa-wifi text-slate-700 text-xs ml-0.5"></i>

            
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-slate-300 text-[12px] text-slate-900 space-y-1">
  <p class="font-bold text-slate-800 uppercase tracking-wider mb-1">ⓘ IMPORTANTE:</p>
  <p>• No se hacen devoluciones de anticipo ni cancelación luego de confirmada la orden.</p>
  <p>• Toda garantía debe ser reclamada con este documento o con su respectiva factura.</p>
  <p>• Deberá presentar este documento al momento de recoger su equipo.</p>
  <p>• La garantia de los repuestos genericos/originales va desde los 6 meses a 1 año segun politicas de nuestros proveedores.</p>
  <p>• NO nos hacemos responsables por equipo almacenado u olvidado por mas de 3 meses. (Reciclamos equipo electronico).</p>
</div>
  `;

  document.getElementById("btn-download-pdf").onclick = () => downloadPDF(c);
  document.getElementById("btn-edit-detail").onclick = () => openEditForm(c.id);
  document.getElementById("btn-delete-detail").onclick = () => deleteClient(c.id);

  showSection('details');
}

function downloadPDF(client) {
  const element = document.getElementById("pdf-printable-area");
  const options = {
    margin:       [5, 5, 5, 5], // Márgenes superior, izquierdo, inferior y derecho más compactos (en mm)
    filename:     `Boleta_${client.id}_${client.clientName.replace(/\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().from(element).set(options).save();
}

function deleteClient(id) {
  if (confirm(`¿Eliminar la orden ${id}?`)) {
    clients = clients.filter(c => c.id !== id);
    saveToLocalStorage();
    showSection('list');
  }
}

function toggleLegendModal() {
  document.getElementById("modal-legend").classList.toggle("hidden");
}

