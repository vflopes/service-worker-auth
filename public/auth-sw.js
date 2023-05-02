self.currentToken = null;

const renewInterval = 5000;

self.onconnect = (event) => {
  const port = event.ports[0];

  port.onmessage = (messageEvent) => {
    switch (messageEvent.data.action) {
      case "set":
        self.currentToken = messageEvent.data.token;
        break;
      case "get":
        port.postMessage({ action: "set", token: self.currentToken });
        break;
      default:
        console.error("Ação desconhecida");
    }
  };

  setInterval(async () => {
    port.postMessage({ action: "set", token: self.currentToken });
  }, 3000);

  setInterval(async () => {
    if (!self.currentToken) {
      return;
    }

    let response;

    try {
      // Lógica de renovação de token deve ser inserida aqui
      response = await fetch("/renew", {
        method: "GET",
        headers: { Authorization: `Bearer ${self.currentToken}` },
      });

      if (response.ok) {
        const { token } = await response.json();

        self.currentToken = token;

        port.postMessage({ action: "set", token });

        return;
      }

      port.postMessage({ action: "error", data: await response.json() });
    } catch (error) {
      port.postMessage({ action: "error", data: error });
    }
  }, renewInterval);
};
