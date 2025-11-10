// Nueva función para enviar credenciales al backend de Google Apps Script
async function validateCredentials(usuario, contrasena) {
  // Reemplaza ESTA_URL con la URL de publicación de tu script de Google Apps Script
  const BACKEND_URL = "AKfycbwLTtDsoygsffAfKn26sefFsNq_64PA_VHbCwmczpuGQEa-T8Bt5KKcW840T9ZeY3l1"; // <--- PON AQUÍ LA URL DE TU SCRIPT

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: usuario,
        contrasena: contrasena
      })
    });

    if (!response.ok) {
      throw new Error(`Error de red o HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Respuesta del backend:", data);
    return data; // Devuelve el objeto de respuesta del backend

  } catch (error) {
    console.error("Error al comunicarse con el backend:", error);
    return { success: false, message: "Error de conexión con el servidor de autenticación." };
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

  modal.querySelector('#login-btn').onclick = async () => { // Hacer la función onclick asincrónica
    const usuario = modal.querySelector('#login-user').value.trim();
    const contrasena = modal.querySelector('#login-pass').value.trim(); // Cambiar nombre de variable para claridad
    const errorEl = modal.querySelector('#login-error');
    errorEl.classList.add('hidden');

    // Validar usando el backend
    const result = await validateCredentials(usuario, contrasena);

    if (!result.success) {
      errorEl.textContent = `❌ ${result.message}`;
      errorEl.classList.remove('hidden');
      return;
    }

    // Si el backend devuelve éxito, guardar sesión
    localStorage.setItem('currentUser', JSON.stringify({
      usuario: result.usuario,
      nombre: result.nombre,
      rol: result.rol,
      campaña: result.campaña
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
// Iniciar directamente con la lógica de login/sesión
const user = localStorage.getItem('currentUser');
if (user) initApp();
else showLogin();

// Asignar la función logout al botón (esto debería estar afuera del bloque de inicialización)
document.getElementById('logout-btn').onclick = logout;
