let currentToken = null;

const renewInterval = 5000

self.onconnect = (event) => {

    const port = event.ports[0];

    port.onmessage = (messageEvent) => {
        switch (messageEvent.data.action) {
            case 'set':
                currentToken = messageEvent.data.token;
                break;
            case 'get':
                port.postMessage({ action: 'set', token: currentToken });
                break;
            default:
                console.error('Ação desconhecida');
        }
    };

    setInterval(async () => {

        if (!currentToken) {
            return;
        }

        let response;

        try {
            // Lógica de renovação de token deve ser inserida aqui
            response = await fetch('/renew', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${currentToken}` },
            });

            if (response.ok) {

                const { token } = await response.json();

                currentToken = token

                port.postMessage({ action: 'set', token });

                return;

            }

            port.postMessage({ action: 'error', data: await response.json() });

        } catch (error) {
            port.postMessage({ action: 'error', data: error });
        }





    }, renewInterval);


};