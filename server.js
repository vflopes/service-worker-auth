const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
// Chave utilizada para assinar os tokens JWT.
// Pode ser uma chave única por usuário que nunca será revelada no front-end.
//  - Nesse caso precisará ser compartilhada com o servidor de recurso que deseja validar o JWT.
// Ou então utilizar um par de chave pública-privada, onde a assinatura é feita com a privada no servidor de autorização.
//  - Nesse caso o servidor de recurso só precisa da chave pública para validar a assinatura.
const SECRET_KEY = 'your-secret-key';

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

// Rota de autenticação
app.post('/authenticate', (req, res) => {
    const { username, password } = req.body;

    // Validação de credenciais fictícia (substitua por sua lógica de validação real)
    if (username === 'john.doe' && password === '123654') {
        // Gera o token JWT
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

        // Retorna o token JWT
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// Middleware para validação do token
const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        req.session = jwt.verify(token, SECRET_KEY);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Rota protegida (exemplo)
app.get('/api/protected', validateToken, (req, res) => {
    res.json({ message: 'Access granted' });
});

// Renovação de token
// Idealmente não deve ser feito com o access token, mas sim com o refresh token
// Nesse exemplo, trabalhamos apenas com 1 token
app.get('/renew', validateToken, (req, res) => {

    console.log('Requisição de renovação recebida')

    const token = jwt.sign({ username: req.session.username }, SECRET_KEY, { expiresIn: '1h' });

    // Retorna o token JWT
    res.json({ token });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});