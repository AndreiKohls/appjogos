import pool from '../database/conexao.js';

export async function listarJogos(req, res) {
  try {
    const [jogos] = await pool.execute(
      'SELECT id, name, description, image_url, created_at FROM games ORDER BY name ASC'
    );
    return res.status(200).json(jogos);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível listar os jogos.' });
  }
}

export async function buscarJogoPorId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID do jogo inválido.' });
  }

  try {
    const [jogos] = await pool.execute(
      'SELECT id, name, description, image_url, created_at FROM games WHERE id = ?',
      [id]
    );

    if (jogos.length === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    return res.status(200).json(jogos[0]);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível buscar o jogo.' });
  }
}

export async function criarJogo(req, res) {
  const nome = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const descricao = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const imageUrl = typeof req.body.image_url === 'string' ? req.body.image_url.trim() : '';

  if (!nome || nome.length > 120) {
    return res.status(400).json({ mensagem: 'Informe um nome de jogo válido com até 120 caracteres.' });
  }

  try {
    const [resultado] = await pool.execute(
      'INSERT INTO games (name, description, image_url) VALUES (?, ?, ?)',
      [nome, descricao, imageUrl || null]
    );

    return res.status(201).json({
      mensagem: 'Jogo cadastrado com sucesso.',
      jogo: {
        id: resultado.insertId,
        name: nome,
        description: descricao,
        image_url: imageUrl || null,
      },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível cadastrar o jogo.' });
  }
}

export async function atualizarJogo(req, res) {
  const id = Number(req.params.id);
  const nome = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const descricao = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const imageUrl = typeof req.body.image_url === 'string' ? req.body.image_url.trim() : '';

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID do jogo inválido.' });
  }

  if (!nome || nome.length > 120) {
    return res.status(400).json({ mensagem: 'Informe um nome de jogo válido com até 120 caracteres.' });
  }

  try {
    const [atual] = await pool.execute('SELECT id FROM games WHERE id = ?', [id]);
    if (atual.length === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    await pool.execute(
      'UPDATE games SET name = ?, description = ?, image_url = ? WHERE id = ?',
      [nome, descricao, imageUrl || null, id]
    );

    return res.status(200).json({
      mensagem: 'Jogo atualizado com sucesso.',
      jogo: { id, name: nome, description: descricao, image_url: imageUrl || null },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível atualizar o jogo.' });
  }
}

export async function excluirJogo(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID do jogo inválido.' });
  }

  try {
    const [resultado] = await pool.execute('DELETE FROM games WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Jogo excluído com sucesso.' });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível excluir o jogo.' });
  }
}
