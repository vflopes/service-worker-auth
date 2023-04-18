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

        // Instancie o service worker e envie o token
        await registerServiceWorker(token);

    } else {
        console.error('Erro na autenticação:', await response.json());
    }
});

document.getElementById('protected-request').addEventListener('click', async (event) => {
    event.preventDefault();

    // Chame a função fetchProtectedData após registrar o Service Worker
    await fetchProtectedData();
});

// Adicione esta função no final do arquivo, após o evento de envio do formulário
async function registerServiceWorker(token) {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('auth-sw.js');
            await navigator.serviceWorker.ready;

            // Enviar o token JWT para o service worker
            registration.active.postMessage({ type: 'SET_TOKEN', token });

            console.log('Service Worker registrado e token enviado');
        } catch (error) {
            console.error('Falha ao registrar o Service Worker:', error);
        }
    } else {
        console.warn('Service Workers não são suportados neste navegador');
    }
}

async function fetchProtectedData() {
    try {
        const response = await fetch('/api/protected');
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