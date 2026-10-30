import pool from '../database/conexao.js';

export async function listarFavoritos(req, res) {
  const usuarioId = Number(req.usuario.id);

  try {
    const [favoritos] = await pool.execute(
      `SELECT g.id, g.name, g.description, g.image_url
       FROM user_games ug
       INNER JOIN games g ON g.id = ug.game_id
       WHERE ug.user_id = ?
       ORDER BY g.name ASC`,
      [usuarioId]
    );

    return res.status(200).json(favoritos);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível listar os jogos favoritos.' });
  }
}

export async function adicionarFavorito(req, res) {
  const usuarioId = Number(req.usuario.id);
  const gameId = Number(req.params.gameId);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    return res.status(400).json({ mensagem: 'ID do jogo inválido.' });
  }

  try {
    const [jogo] = await pool.execute('SELECT id FROM games WHERE id = ?', [gameId]);
    if (jogo.length === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    const [resultado] = await pool.execute(
      'INSERT INTO user_games (user_id, game_id) VALUES (?, ?)',
      [usuarioId, gameId]
    );

    return res.status(201).json({
      mensagem: 'Jogo adicionado aos favoritos.',
      id: resultado.insertId,
      user_id: usuarioId,
      game_id: gameId,
    });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Este jogo já está na sua lista de favoritos.' });
    }
    return res.status(500).json({ mensagem: 'Não foi possível adicionar o jogo aos favoritos.' });
  }
}

export async function removerFavorito(req, res) {
  const usuarioId = Number(req.usuario.id);
  const gameId = Number(req.params.gameId);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    return res.status(400).json({ mensagem: 'ID do jogo inválido.' });
  }

  try {
    const [resultado] = await pool.execute(
      'DELETE FROM user_games WHERE user_id = ? AND game_id = ?',
      [usuarioId, gameId]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado na sua lista de favoritos.' });
    }

    return res.status(200).json({ mensagem: 'Jogo removido dos favoritos.' });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível remover o jogo dos favoritos.' });
  }
}
