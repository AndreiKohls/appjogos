import pool from '../database/conexao.js';
import { criarHashSenha, compararSenhaComHash, gerarToken } from '../services/authService.js';

export async function register(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name || name.length > 100) {
    return res.status(400).json({ mensagem: 'Informe um nome válido.' });
  }

  if (!username || username.length < 3 || username.length > 40) {
    return res.status(400).json({ mensagem: 'Informe um nome de usuário com 3 a 40 caracteres.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }

  if (senha.length < 8 || Buffer.byteLength(senha, 'utf8') > 72) {
    return res.status(400).json({ mensagem: 'A senha deve ter no mínimo 8 caracteres e no máximo 72 bytes.' });
  }

  try {
    const [usuariosExistentes] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(409).json({ mensagem: 'E-mail ou nome de usuário já cadastrado.' });
    }

    const senhaHash = await criarHashSenha(senha);
    const [resultado] = await pool.execute(
      'INSERT INTO users (name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, username, email, senhaHash, 'jogador']
    );

    const usuario = {
      id: resultado.insertId,
      name,
      username,
      email,
      role: 'jogador',
    };

    return res.status(201).json({
      mensagem: 'Conta criada com sucesso.',
      usuario,
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível criar a conta.' });
  }
}

export async function login(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = typeof req.body.password === 'string' ? req.body.password : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !senha) {
    return res.status(400).json({ mensagem: 'Informe e-mail e senha válidos.' });
  }

  try {
    const [usuarios] = await pool.execute(
      'SELECT id, name, username, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    const usuario = usuarios[0];
    if (!usuario || !(await compararSenhaComHash(senha, usuario.password_hash))) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    const token = gerarToken(usuario);

    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        name: usuario.name,
        username: usuario.username,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível realizar o login.' });
  }
}

export async function me(req, res) {
  const usuario = req.usuario;
  return res.status(200).json({
    id: usuario.id,
    name: usuario.name,
    username: usuario.username,
    email: usuario.email,
    role: usuario.role,
  });
}
