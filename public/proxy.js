self.addEventListener("activate", (event) => {
  // The promise that skipWaiting() returns can be safely ignored.
  // self.skipWaiting();

  // Perform any other actions required for your
  // service worker to install, potentially inside
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Verifique se a solicitação é para a API que requer autenticação
  if (url.pathname.startsWith("/")) {
    console.log(`Requisição deve ser autenticada: ${url.pathname}`);

    // Clone a solicitação original para que possamos modificá-la
    const modifiedRequest = new Request(event.request, {
      headers: new Headers(event.request.headers),
    });

    // Adicione o header de autorização com o token JWT
    modifiedRequest.headers.set("Authorization", `Bearer ${self.token}`);

    // Enviar a solicitação modificada com o header de autorização
    event.respondWith(fetch(modifiedRequest));
  } else {
    // Se não for uma solicitação de API, deixe-a passar sem modificação
    event.respondWith(fetch(event.request));
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "set") {
    self.token = event.data.token;
  }
});
