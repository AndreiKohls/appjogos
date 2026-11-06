import pool from '../database/conexao.js';

export async function listarPartidas(req, res) {
  try {
    const usuarioId = Number(req.usuario?.id || 0);
    const [partidas] = await pool.execute(
      `SELECT m.id, m.title, m.description, m.game_id, g.name AS game_name, m.creator_id, u.name AS creator_name,
              m.match_date, m.max_players, m.status, m.created_at,
              (
                SELECT COUNT(*)
                FROM match_players mp
                WHERE mp.match_id = m.id
              ) AS current_players,
              CASE
                WHEN EXISTS (
                  SELECT 1 FROM match_players mp2 WHERE mp2.match_id = m.id AND mp2.user_id = ?
                ) THEN 1
                ELSE 0
              END AS is_participant
       FROM matches m
       INNER JOIN games g ON g.id = m.game_id
       INNER JOIN users u ON u.id = m.creator_id
       ORDER BY m.match_date ASC`,
      [usuarioId]
    );

    return res.status(200).json(partidas);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível listar as partidas.' });
  }
}

export async function buscarPartidaPorId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID da partida inválido.' });
  }

  try {
    const usuarioId = Number(req.usuario?.id || 0);
    const [partidas] = await pool.execute(
      `SELECT m.id, m.title, m.description, m.game_id, g.name AS game_name, m.creator_id, u.name AS creator_name,
              m.match_date, m.max_players, m.status, m.created_at,
              (
                SELECT COUNT(*)
                FROM match_players mp
                WHERE mp.match_id = m.id
              ) AS current_players,
              CASE
                WHEN EXISTS (
                  SELECT 1 FROM match_players mp2 WHERE mp2.match_id = m.id AND mp2.user_id = ?
                ) THEN 1
                ELSE 0
              END AS is_participant
       FROM matches m
       INNER JOIN games g ON g.id = m.game_id
       INNER JOIN users u ON u.id = m.creator_id
       WHERE m.id = ?`,
      [usuarioId, id]
    );

    if (partidas.length === 0) {
      return res.status(404).json({ mensagem: 'Partida não encontrada.' });
    }

    return res.status(200).json(partidas[0]);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível buscar a partida.' });
  }
}

export async function criarPartida(req, res) {
  const { title, description, game_id, match_date, max_players } = req.body;
  const titulo = typeof title === 'string' ? title.trim() : '';
  const descricao = typeof description === 'string' ? description.trim() : '';
  const jogoId = Number(game_id);
  const maximo = Number(max_players);

  if (!titulo || titulo.length < 3 || titulo.length > 120) {
    return res.status(400).json({ mensagem: 'O título da partida deve ter entre 3 e 120 caracteres.' });
  }

  if (!Number.isInteger(jogoId) || jogoId <= 0) {
    return res.status(400).json({ mensagem: 'ID do jogo inválido.' });
  }

  if (!match_date || Number.isNaN(new Date(match_date).getTime())) {
    return res.status(400).json({ mensagem: 'Informe uma data válida para a partida.' });
  }

  if (!Number.isInteger(maximo) || maximo < 2 || maximo > 50) {
    return res.status(400).json({ mensagem: 'Informe um número de jogadores entre 2 e 50.' });
  }

  try {
    const [jogo] = await pool.execute('SELECT id FROM games WHERE id = ?', [jogoId]);
    if (jogo.length === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    const [resultado] = await pool.execute(
      'INSERT INTO matches (title, description, game_id, creator_id, match_date, max_players, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, descricao, jogoId, req.usuario.id, match_date, maximo, 'aberta']
    );

    await pool.execute(
      'INSERT INTO match_players (match_id, user_id) VALUES (?, ?)',
      [resultado.insertId, req.usuario.id]
    );

    return res.status(201).json({
      mensagem: 'Partida criada com sucesso.',
      partida: {
        id: resultado.insertId,
        title: titulo,
        description: descricao,
        game_id: jogoId,
        creator_id: req.usuario.id,
        match_date,
        max_players: maximo,
        status: 'aberta',
      },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível criar a partida.' });
  }
}

export async function entrarNaPartida(req, res) {
  const partidaId = Number(req.params.id);
  const usuarioId = Number(req.usuario.id);

  if (!Number.isInteger(partidaId) || partidaId <= 0) {
    return res.status(400).json({ mensagem: 'ID da partida inválido.' });
  }

  try {
    const [partida] = await pool.execute(
      'SELECT id, max_players, creator_id FROM matches WHERE id = ?',
      [partidaId]
    );

    if (partida.length === 0) {
      return res.status(404).json({ mensagem: 'Partida não encontrada.' });
    }

    const dados = partida[0];
    const [participantes] = await pool.execute(
      'SELECT COUNT(*) AS total FROM match_players WHERE match_id = ?',
      [partidaId]
    );

    if (Number(participantes[0].total) >= Number(dados.max_players)) {
      return res.status(409).json({ mensagem: 'A partida atingiu o limite de participantes.' });
    }

    const [jaParticipa] = await pool.execute(
      'SELECT id FROM match_players WHERE match_id = ? AND user_id = ?',
      [partidaId, usuarioId]
    );

    if (jaParticipa.length > 0) {
      return res.status(409).json({ mensagem: 'Você já participa desta partida.' });
    }

    await pool.execute(
      'INSERT INTO match_players (match_id, user_id) VALUES (?, ?)',
      [partidaId, usuarioId]
    );

    return res.status(200).json({ mensagem: 'Você entrou na partida com sucesso.' });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível entrar na partida.' });
  }
}
