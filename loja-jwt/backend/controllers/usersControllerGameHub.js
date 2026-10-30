import pool from '../database/conexao.js';
import { criarHashSenha } from '../services/authService.js';

function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export async function obterPerfil(req, res) {
  const usuario = req.usuario;
  return res.status(200).json({
    id: usuario.id,
    name: usuario.name,
    username: usuario.username,
    email: usuario.email,
    role: usuario.role,
  });
}

export async function atualizarPerfil(req, res) {
  const usuarioId = Number(req.usuario.id);
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = normalizarEmail(req.body.email);
  const novaSenha = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name || name.length > 100) {
    return res.status(400).json({ mensagem: 'Informe um nome válido com até 100 caracteres.' });
  }

  if (!username || username.length < 3 || username.length > 40) {
    return res.status(400).json({ mensagem: 'Informe um nome de usuário com 3 a 40 caracteres.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }

  if (novaSenha && (novaSenha.length < 8 || Buffer.byteLength(novaSenha, 'utf8') > 72)) {
    return res.status(400).json({ mensagem: 'A nova senha deve ter entre 8 e 72 bytes.' });
  }

  try {
    const [existentes] = await pool.execute(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email, username, usuarioId]
    );

    if (existentes.length > 0) {
      return res.status(409).json({ mensagem: 'E-mail ou nome de usuário já cadastrados por outro usuário.' });
    }

    const senhaHash = novaSenha ? await criarHashSenha(novaSenha) : null;
    await pool.execute(
      `UPDATE users SET name = ?, username = ?, email = ?${senhaHash ? ', password_hash = ?' : ''} WHERE id = ?`,
      senhaHash ? [name, username, email, senhaHash, usuarioId] : [name, username, email, usuarioId]
    );

    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: {
        id: usuarioId,
        name,
        username,
        email,
        role: req.usuario.role,
      },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível atualizar o perfil.' });
  }
}

export async function listarUsuarios(req, res) {
  try {
    const [usuarios] = await pool.execute(
      'SELECT id, name, username, email, role, created_at FROM users ORDER BY id ASC'
    );
    return res.status(200).json(usuarios);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível listar os usuários.' });
  }
}
