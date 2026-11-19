# Apresentação — Entrega 4: GameHub

## 1. Problema
Jogadores precisam de uma forma prática de encontrar partidas, organizar equipes e controlar a participação em jogos.

## 2. Solução
O GameHub integra aplicativo mobile, API REST, banco MySQL e autenticação JWT para cadastro, login, jogos, partidas, equipes e favoritos.

## 3. Arquitetura

- Frontend: React Native e Expo.
- Navegação: React Navigation Native Stack.
- API: Node.js e Express.
- Banco: MySQL.
- Segurança: bcrypt, JWT, Bearer Token e middlewares.
- Persistência da sessão: AsyncStorage.

## 4. Fluxo demonstrado

1. Abrir o aplicativo.
2. Criar uma conta.
3. Fazer login.
4. Abrir a tela de partidas.
5. Selecionar um jogo.
6. Criar uma partida com data, hora e limite de jogadores.
7. Participar ou sair da partida.
8. Demonstrar os detalhes da partida.
9. Fazer logout.

## 5. JWT e permissões

- O login verifica e-mail e senha.
- A senha é comparada com o hash bcrypt armazenado no banco.
- A API gera um JWT assinado com o segredo configurado no `.env`.
- O aplicativo salva o token no AsyncStorage.
- As requisições protegidas enviam `Authorization: Bearer <token>`.
- O middleware valida assinatura, expiração e existência do usuário.
- Funcionalidades administrativas verificam novamente o perfil no banco.

## 6. Banco de dados

Mostrar:

- tabela `users`;
- tabela `games`;
- tabela `matches`;
- tabela `match_players`;
- tabela `teams`;
- tabela `team_members`;
- tabela `favorites`.

Explicar os relacionamentos, chaves estrangeiras e operações de exclusão em cascata.

## 7. CRUD demonstrado

Demonstre pelo menos:

- cadastro de usuário;
- consulta de partidas;
- criação de partida;
- atualização ou exclusão permitida pelo criador ou administrador;
- entrada e saída de partidas;
- bloqueio de operação sem token;
- bloqueio de operação administrativa por usuário comum.

## 8. Testes

Mostrar os resultados dos comandos:

```bash
npm test
npm run lint
npm run typecheck
npm run test:web
```

## 9. Repositório e APK

Mostrar:

- histórico de commits;
- README atualizado;
- SQL da estrutura;
- arquivos de API e aplicativo;
- APK final instalado em dispositivo compatível.

## 10. Conclusão

A solução atende ao problema integrando interface mobile, autenticação JWT, regras de autorização, API REST, banco de dados, testes e versionamento.
