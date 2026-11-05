import './config/ambiente.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import authRoutesGameHub from './routes/authRoutesGameHub.js';
import produtosRoutes from './routes/produtosRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import gamesRoutes from './routes/gamesRoutes.js';
import gamehubRoutes from './routes/gamehubRoutes.js';
import usersRoutesGameHub from './routes/usersRoutesGameHub.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import matchesRoutes from './routes/matchesRoutes.js';
import teamsRoutes from './routes/teamsRoutes.js';

const app = express();
app.disable('x-powered-by');
// CORS permite usar o Expo Web em outra porta. Ele não substitui autenticação.
app.use(cors());
app.use(express.json({ limit: '10kb' }));
// Respostas com token ou dados pessoais não devem ser guardadas em caches HTTP.
app.use(function impedirCache(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  // Uma requisição sem JSON continua tendo um objeto seguro para validação nos controllers.
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    req.body = {};
  }
  next();
});

app.get('/', function apresentarApi(req, res) {
  res.json({ mensagem: 'API GameHub', rotas: ['/api', '/auth', '/api/auth', '/games'] });
});
app.use('/api', gamehubRoutes);
app.use('/api/auth', authRoutesGameHub);
app.use('/auth', authRoutes);
app.use('/games', gamesRoutes);
app.use('/produtos', produtosRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/api/users', usersRoutesGameHub);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/teams', teamsRoutes);

app.use(function rotaNaoEncontrada(req, res) {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Quatro parâmetros identificam um tratador de erros do Express.
app.use(function tratarErro(erro, req, res, next) {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'JSON inválido no corpo da requisição.' });
  }
  if (erro.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'Corpo da requisição muito grande.' });
  }
  // Não devolver SQL, credenciais, stack trace ou mensagens internas do banco ao cliente.
  return res.status(500).json({ mensagem: 'Erro interno do servidor. Tente novamente.' });
});

export function iniciarServidor(porta = Number(process.env.PORT || 3000), host = '127.0.0.1') {
  const servidor = app.listen(porta, host, function iniciarServidor() {
    if (process.env.NODE_ENV !== 'test') {
      console.log('API executando em http://' + host + ':' + porta);
    }
  });

  servidor.on('error', function informarErroServidor(erro) {
    console.error(erro.code === 'EADDRINUSE' ? 'A porta da API já está em uso.' : 'Não foi possível iniciar a API.');
    process.exitCode = 1;
  });

  return servidor;
}

if (process.env.NODE_ENV === 'test' || process.argv.some((arg) => /(?:^|[\\/])[^\\/]*\.test\.js$/.test(arg) || arg.includes('node:test') || arg.includes('test_runner'))) {
  globalThis.__gamehub_auto_server ??= iniciarServidor();
}

export default app;
