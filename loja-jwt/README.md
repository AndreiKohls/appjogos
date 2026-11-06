# GameHub

GameHub é uma plataforma de encontro para jogadores. O objetivo do projeto é conectar pessoas que querem participar de partidas, descobrir jogos populares, formar equipes e acompanhar eventos de jogos em um único ambiente.

A aplicação combina frontend em React Native/Expo com backend em Node.js + Express e autenticação JWT. O resultado é uma experiência didática completa de desenvolvimento full stack, com login, proteção de rotas, persistência em banco e integração entre cliente e API.

## Visão geral

O site permite que o usuário:

- crie uma conta;
- faça login com autenticação segura;
- veja jogos populares;
- visualize partidas em aberto;
- crie uma nova partida;
- participe de uma partida existente;
- veja os detalhes da partida;
- saia do sistema com segurança.

## Fluxo principal

1. O visitante acessa a tela inicial.
2. Cria uma conta com nome, usuário, e-mail e senha.
3. Faz login e recebe um token JWT.
4. O app salva o token localmente para manter a sessão.
5. O usuário entra no dashboard e pode navegar até Partidas.
6. Pode criar uma nova partida ou participar de uma já existente.
7. O backend valida as requisições e protege as rotas que exigem autenticação.

## Funcionalidades

### Autenticação
- cadastro de usuários;
- login com validação de e-mail e senha;
- geração de token JWT;
- proteção de rotas com middleware de autenticação.

### Jogos
- listagem de jogos disponíveis;
- seleção de jogo ao criar partida;
- suporte a jogos populares como Valorant, League of Legends e Minecraft.

### Partidas
- criação de partidas com título, descrição, data, hora e limite de jogadores;
- listagem das partidas em aberto;
- botão para participar da partida;
- botão para visualizar detalhes;
- marcação correta do usuário como criador ou participante.

### Segurança
- senha armazenada como hash;
- validação de dados no backend;
- controle de acesso por perfil;
- mensagens de erro sem expor dados internos do servidor.

## Tecnologias usadas

- React Native + Expo
- React Navigation
- JavaScript ES Modules
- Express
- MySQL
- mysql2
- bcryptjs
- jsonwebtoken
- AsyncStorage

## Estrutura do projeto

- `App.js`: navegação e controle da sessão do usuário
- `screens/`: telas do app
- `components/`: componentes visuais reutilizáveis
- `services/api.js`: comunicação com a API
- `backend/app.js`: inicialização da API
- `backend/controllers/`: lógica dos endpoints
- `backend/routes/`: rotas do sistema
- `backend/middlewares/`: autenticação e autorização
- `backend/database/schema.sql`: estrutura do banco de dados

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Configure o arquivo `backend/.env` com as informações do banco e do JWT.

Exemplo:

```env
JWT_SECRET=seu_token_secreto_muito_seguro
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gamehub
```

3. Inicie a API:

```bash
npm run api
```

4. Inicie o app:

```bash
npm start
```

5. Para testar no navegador, use a opção web do Expo:

```bash
npm start -- --web
```

6. Para testar em celular na mesma rede, troque `http://localhost:3000` por `http://SEU_IP_DA_REDE:3000` no arquivo `services/api.js`.

## Testes de fluxo

Fluxo recomendado para validar o projeto:

1. cadastrar usuário;
2. fazer login;
3. listar jogos;
4. criar partida;
5. visualizar a partida na lista;
6. entrar na partida;
7. abrir detalhes;
8. sair da aplicação.

## Observação importante

Este projeto foi desenvolvido como atividade didática para demonstrar, na prática, como uma aplicação moderna de rede social gamer funciona. Ele reúne autenticação, autorização, banco de dados e integração front-end/backend em um único fluxo coerente.

O foco não é apenas a interface visual, mas entender a lógica real por trás de:

- login seguro;
- persistência de sessão;
- proteção de rotas;
- validação no servidor;
- regras de negócio em backend;
- relacionamento entre usuários, jogos e partidas.

## Conclusão

O GameHub funciona como um projeto completo de estudo, demonstrando como construir uma aplicação real com autenticação JWT, banco de dados e navegação de telas. Além de um produto funcional, ele serve como base para aprender os conceitos fundamentais de desenvolvimento full stack em JavaScript.
