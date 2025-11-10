// URL pública del CSV de usuarios
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIgsZoBQjMmvl3iDq6GzMt0gvfyCxy5F7eCPZ6Q04YT52gKDiLQ5P9JflhA4zOFcrRRUjHqaDc08zA/pub?gid=0&single=true&output=csv";

let USERS_DATA = [];

// Cargar usuarios desde CSV
async function loadUsers() {
  try {
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error("Error al cargar el CSV de usuarios");
    const csv = await res.text();
    const lines = csv.trim().split(/\r?\n/).filter(l => l.trim() !== "");
    const headers = lines[0].split(",").map(h => h.trim());
    USERS_DATA = lines.slice(1).map(line => {
      const cells = line.split(",").map(c => c.trim().replace(/^"(.*)"$/, "$1"));
      let obj = {};
      headers.forEach((h, i) => obj[h] = cells[i] || "");
      return obj;
    });
    console.log("Usuarios cargados:", USERS_DATA);
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
    alert("No se pudo cargar la lista de usuarios autorizados");
    throw err;
  }
}

// Mostrar modal login
function showLogin() {
  const modal = document.createElement('div');
  modal.className = 'login-modal fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="login-modal-content bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">🔐 Iniciar Sesión</h2>
      </div>
      <input id="login-user" type="text" placeholder="Usuario" class="w-full mb-4 px-4 py-3 border rounded-lg">
      <input id="login-pass" type="password" placeholder="Contraseña" class="w-full mb-6 px-4 py-3 border rounded-lg">
      <button id="login-btn" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">Ingresar</button>
      <p id="login-error" class="text-red-500 text-sm mt-4 hidden text-center font-medium"></p>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 50);

  modal.querySelector('#login-btn').onclick = () => {
    const usuario = modal.querySelector('#login-user').value.trim();
    const pass = modal.querySelector('#login-pass').value.trim();
    const errorEl = modal.querySelector('#login-error');
    errorEl.classList.add('hidden');

    const row = USERS_DATA.find(r => r["Usuario"] === usuario);
    if (!row) {
      errorEl.textContent = "❌ Usuario no encontrado";
      errorEl.classList.remove('hidden');
      return;
    }

    if (row["Contraseña"] !== pass) {
      errorEl.textContent = "❌ Contraseña incorrecta";
      errorEl.classList.remove('hidden');
      return;
    }

    if (row["Estado"].toLowerCase() !== "activo") {
      errorEl.textContent = "❌ Usuario inactivo";
      errorEl.classList.remove('hidden');
      return;
    }

    // Guardar sesión
    localStorage.setItem('currentUser', JSON.stringify({
      usuario: row["Usuario"],
      nombre: row["Nombre"],
      rol: row["Rol"],
      campaña: row["Campaña"]
    }));

    modal.remove();
    initApp();
  };
}

// Inicializar app después de login
function initApp() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) { showLogin(); return; }

  const container = document.getElementById('app-container');
  container.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">👋 Bienvenido, ${user.nombre}</h1>
      <p class="text-gray-600 mt-1">Rol: ${user.rol} | Campaña: ${user.campaña}</p>
    </div>
  `;
}

// Logout
function logout() {
  localStorage.removeItem('currentUser');
  document.getElementById('app-container').innerHTML = '';
  showLogin();
}

// Ejecutar al cargar
loadUsers().then(() => {
  const user = localStorage.getItem('currentUser');
  if (user) initApp();
  else showLogin();
});

document.getElementById('logout-btn').onclick = logout;
