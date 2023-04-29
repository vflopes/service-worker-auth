# Service Worker Authentication Relay Proof of Concept

Este repositório contém uma prova de conceito demonstrando como utilizar um Service Worker para injetar headers de autorização em requisições AJAX, mantendo o token de autenticação oculto dos usuários.

## Features de segurança

1. Armazenar de forma segura (em memória) e isolada do contexto da página tokens de acesso para requisições no back-end.
2. Interceptar requisições AJAX para o back-end e injetar condicionalmente (a depender da rota) um header com o token de acesso.

## Tecnologias e conceitos

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [JWT (JSON Web Token)](https://jwt.io/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## Pré-requisitos

- Node.js 14.x ou superior

## Como executar

1. Clone este repositório e entre na pasta do projeto:

```bash
git clone https://github.com/seu_usuario/service-worker-authentication-relay.git
cd service-worker-authentication-relay
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Inicie o servidor:

```bash
npm start
# ou
yarn start
```

4. Acesse a aplicação no navegador em http://localhost:3000. O usuário de teste é `john.doe` e a senha de teste é `123654`. Como é uma prova de conceito, várias informações são disponibilizadas no console do browser, então recomendamos que a navegação seja feita com o console aberto.

5. Lembrando que como o Service Worker funciona em uma thread separada da página, para remover o estado autenticado você deverá atualizar a página limpando o cache do browser (CTRL+F5).

## Como funciona

1. O usuário insere suas credenciais e clica no botão de login.
2. O back-end gera um token JWT e o retorna ao front-end.
3. O front-end registra o Service Worker e passa o token como argumento.
4. O Service Worker intercepta requisições AJAX para rotas protegidas e injeta o header de autorização com o token JWT.
5. O back-end verifica o header de autorização e retorna os dados protegidos.

## Contribuindo

Se você encontrou algum bug ou gostaria de sugerir melhorias, sinta-se à vontade para abrir uma issue ou enviar um pull request.
