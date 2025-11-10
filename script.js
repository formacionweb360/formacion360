const apiUrl = "TU_WEB_APP_URL_AQUI"; // pega aquí el URL de tu Web App

document.getElementById('loginBtn').addEventListener('click', async () => {
  const usuario = document.getElementById('usuario').value;
  const contrasena = document.getElementById('contrasena').value;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena })
    });

    const result = await response.json();
    const msgDiv = document.getElementById('message');
    
    if(result.success){
      msgDiv.style.color = 'green';
      msgDiv.textContent = `Bienvenido ${result.nombre} (${result.rol}) - Campaña: ${result.campaña}`;
    } else {
      msgDiv.style.color = 'red';
      msgDiv.textContent = result.message;
    }

  } catch (error) {
    console.error(error);
  }
});
