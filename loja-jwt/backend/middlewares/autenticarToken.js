import jwt from 'jsonwebtoken';
import pool from '../database/conexao.js';

export default async function autenticarToken(req, res, next) {
  // O cliente envia duas partes: Authorization: Bearer TOKEN.
  const authorization = req.headers.authorization;
  const partes = typeof authorization === 'string' ? authorization.trim().split(/\s+/) : [];

  if (partes.length !== 2 || partes[0].toLowerCase() !== 'bearer' || !partes[1]) {
    return res.status(401).json({ mensagem: 'Token não informado. Utilize Authorization: Bearer TOKEN.' });
  }

  let payload;
  try {
    // verify confere assinatura e expiração. decode, sozinho, não autentica ninguém.
    payload = jwt.verify(partes[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });

    if (typeof payload !== 'object' || !Number.isInteger(payload.id) || payload.id < 1) {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado. Faça login novamente.' });
    }
  } catch {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado. Faça login novamente.' });
  }

  try {
    const [usuarios] = await pool.execute(
      'SELECT id, nome, email, nivel FROM usuarios WHERE id = ?',
      [payload.id],
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado. Faça login novamente.' });
    }

    // O payload identifica a sessão, mas o banco define o nível ATUAL.
    // Rebaixar um administrador tem efeito imediato, mesmo com um JWT antigo ainda válido.
    req.usuario = { ...payload, ...usuarios[0] };
    next();
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível verificar a sessão. Tente novamente.' });
  }
}
