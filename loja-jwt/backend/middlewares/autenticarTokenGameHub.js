import jwt from 'jsonwebtoken';
import pool from '../database/conexao.js';

export default async function autenticarTokenGameHub(req, res, next) {
  const authorization = req.headers.authorization;
  const partes = typeof authorization === 'string' ? authorization.trim().split(/\s+/) : [];

  if (partes.length !== 2 || partes[0].toLowerCase() !== 'bearer' || !partes[1]) {
    return res.status(401).json({ mensagem: 'Token não informado. Use Authorization: Bearer <token>.' });
  }

  try {
    const payload = jwt.verify(partes[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });

    if (!payload || typeof payload !== 'object' || !Number.isInteger(payload.id) || payload.id < 1) {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }

    const [usuarios] = await pool.execute(
      'SELECT id, name, username, email, role FROM users WHERE id = ?',
      [payload.id]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado.' });
    }

    req.usuario = usuarios[0];
    next();
  } catch {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}
