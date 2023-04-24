const sharedWorker = new SharedWorker('auth-sw.js');

let currentToken = null;

sharedWorker.port.onmessage = (event) => {

    console.log('Token obtido do Shared Worker:', event.data);

    currentToken = event.data;

};

sharedWorker.port.postMessage({ action: 'get' });

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Esses dados só devem ser trafegados por conexões seguras (HTTPS)
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const { token } = await response.json();
        console.log('JWT token:', token);

        currentToken = token

        // Instancie o service worker e envie o token
        sharedWorker.port.postMessage({ action: 'set', token });

    } else {
        console.error('Erro na autenticação:', await response.json());
    }
});

document.getElementById('protected-request').addEventListener('click', async (event) => {
    event.preventDefault();

    // Chame a função fetchProtectedData após registrar o Service Worker
    await fetchProtectedData();
});

function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${currentToken}`
    }
}

async function fetchProtectedData() {
    try {
        const response = await fetch('/api/protected', {
            headers: {
                ...getAuthHeaders(),
            }
        });
        const data = await response.json();

        if (response.status === 200) {
            console.log('Dados protegidos:', data.message);
        } else {
            console.error('Erro ao buscar dados protegidos:', data.error);
        }
    } catch (error) {
        console.error('Erro ao buscar dados protegidos:', error);
    }
}