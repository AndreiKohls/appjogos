import pool from '../database/conexao.js';
import { idValido } from '../utils/validacoes.js';

export async function listarUsuarios(req, res) {
  try {
    // Escolhemos as colunas explicitamente: senha e hash nunca saem da API.
    const [usuarios] = await pool.execute('SELECT id, nome, email, nivel, criado_em FROM usuarios ORDER BY id');
    return res.status(200).json(usuarios);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível listar os usuários.' });
  }
}

export async function alterarNivelUsuario(req, res) {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ mensagem: 'ID do usuário inválido.' });
  }

  const id = Number(req.params.id);
  const nivel = req.body.nivel;
  if (id === Number(req.usuario.id)) {
    return res.status(400).json({ mensagem: 'Não é possível alterar o próprio nível' });
  }
  if (nivel !== 'usuario' && nivel !== 'admin') {
    return res.status(400).json({ mensagem: 'O nível deve ser usuario ou admin.' });
  }

  try {
    const [usuarios] = await pool.execute('SELECT id, nome, email, nivel FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    await pool.execute('UPDATE usuarios SET nivel = ? WHERE id = ?', [nivel, id]);
    return res.status(200).json({
      mensagem: 'Nível do usuário atualizado com sucesso.',
      usuario: { ...usuarios[0], nivel },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível alterar o nível do usuário.' });
  }
}
