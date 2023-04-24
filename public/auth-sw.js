let token = null;

const renewInterval = 3000

self.onconnect = (event) => {

    const port = event.ports[0];

    port.onmessage = (messageEvent) => {
        switch (messageEvent.data.action) {
            case 'set':
                token = messageEvent.data.token;
                break;
            case 'get':
                port.postMessage(token);
                break;
            default:
                console.error('Ação desconhecida');
        }
    };

    setInterval(function () {

        // Lógica de renovação de token deve ser inserida aqui

        port.postMessage(token);

    }, renewInterval);


};