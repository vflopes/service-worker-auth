const CACHE_NAME = "my-cache";

// Salvar o token no cache
async function setToken(token) {
  const cache = await caches.open(CACHE_NAME);
  const response = new Response(token);
  return cache.put("SET_TOKEN", response);
}

document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    // Esses dados só devem ser trafegados por conexões seguras (HTTPS)
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const { token } = await response.json();
      console.log("JWT token:", token);

      // Instancie o service worker e envie o token
      await registerServiceWorker(token);
    } else {
      console.error("Erro na autenticação:", await response.json());
    }
  });

document
  .getElementById("protected-request")
  .addEventListener("click", async (event) => {
    event.preventDefault();

    // Chame a função fetchProtectedData após registrar o Service Worker
    await fetchProtectedData();
  });

// Adicione esta função no final do arquivo, após o evento de envio do formulário
async function registerServiceWorker(token) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("Service Worker registrado"));

    await setToken(token);
  } else {
    console.warn("Service Workers não são suportados neste navegador");
  }
}

// middleware do fetch
function withAuthHeader(fetch) {
  return async function (url, options) {
    // recupera o token do cache
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match("SET_TOKEN");
    const token = await response.text();

    if (token) {
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);
      options = { ...options, headers };
    }
    return fetch(url, options);
  };
}

const fetchWithAuthHeader = withAuthHeader(fetch);

async function fetchProtectedData() {
  try {
    const response = await fetchWithAuthHeader("/api/protected");

    const data = await response.json();

    if (response.status === 200) {
      console.log("Dados protegidos:", data.message);
    } else {
      console.error("Erro ao buscar dados protegidos:", data.error);
    }
  } catch (error) {
    console.error("Erro ao buscar dados protegidos:", error);
  }
}
