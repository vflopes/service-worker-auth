let registration;

const sharedWorker = new SharedWorker("auth-sw.js");

sharedWorker.port.onmessage = async (event) => {
  switch (event.data.action) {
    case "error":
      console.error("O service worker retornou um erro", event.data);
      break;
    case "set":
      console.log("Token obtido do Shared Worker:", event.data);
      const token = event.data.token;

      if (!registration) {
        await registerServiceWorker(token);
      }

      // Enviar o token JWT para o service worker
      console.log("🚀 ~ file: main.js:19 ~ currentToken:", token);
      registration.active.postMessage({ type: "set", token });
      console.log("🚀 ~ file: main.js:20 ~ registration:", registration);

      break;
    default:
      console.error("Ação desconhecida", event.data);
      break;
  }
};

sharedWorker.port.postMessage({ action: "get" });

if (document.getElementById("login-form")) {
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

        sharedWorker.port.postMessage({ action: "set", token });

        await registerServiceWorker(token);
      } else {
        console.error("Erro na autenticação:", await response.json());
      }
    });
}

document
  .getElementById("protected-request")
  .addEventListener("click", async (event) => {
    event.preventDefault();

    // Chame a função fetchProtectedData após registrar o Service Worker
    await fetchProtectedData();
  });

document.getElementById("logout").addEventListener("click", async (event) => {
  sharedWorker.port.postMessage({ action: "set", token: null });
  registration.active.postMessage({ type: "set", token: null });
  console.log("Token removido da memória");
});

async function fetchProtectedData() {
  try {
    const response = await fetch("/api/protected");
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

async function registerServiceWorker(token) {
  console.log("🚀 ~ file: main.js:92 ~ registerServiceWorker ~ token:", token);
  if ("serviceWorker" in navigator) {
    try {
      registration = await navigator.serviceWorker.register("proxy.js");
      await navigator.serviceWorker.ready;

      registration.active.postMessage({ type: "set", token });

      console.log("Service Worker registrado");
    } catch (error) {
      console.error("Falha ao registrar o Service Worker:", error);
    }
  } else {
    console.warn("Service Workers não são suportados neste navegador");
  }
}
