import pool from '../database/conexao.js';

export async function listarEquipes(req, res) {
  try {
    const [equipes] = await pool.execute(
      `SELECT t.id, t.name, t.description, t.game_id, g.name AS game_name, t.creator_id, u.name AS creator_name, t.created_at,
              (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count
       FROM teams t
       INNER JOIN games g ON g.id = t.game_id
       INNER JOIN users u ON u.id = t.creator_id
       ORDER BY t.created_at DESC`
    );
    return res.status(200).json(equipes);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível listar as equipes.' });
  }
}

export async function buscarEquipePorId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID da equipe inválido.' });
  }

  try {
    const [equipes] = await pool.execute(
      `SELECT t.id, t.name, t.description, t.game_id, g.name AS game_name, t.creator_id, u.name AS creator_name, t.created_at,
              (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count
       FROM teams t
       INNER JOIN games g ON g.id = t.game_id
       INNER JOIN users u ON u.id = t.creator_id
       WHERE t.id = ?`,
      [id]
    );

    if (equipes.length === 0) {
      return res.status(404).json({ mensagem: 'Equipe não encontrada.' });
    }

    return res.status(200).json(equipes[0]);
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível buscar a equipe.' });
  }
}

export async function criarEquipe(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const game_id = Number(req.body.game_id);

  if (!name || name.length < 3 || name.length > 120) {
    return res.status(400).json({ mensagem: 'O nome da equipe deve ter entre 3 e 120 caracteres.' });
  }

  if (!Number.isInteger(game_id) || game_id <= 0) {
    return res.status(400).json({ mensagem: 'ID do jogo inválido.' });
  }

  try {
    const [jogo] = await pool.execute('SELECT id FROM games WHERE id = ?', [game_id]);
    if (jogo.length === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    const [resultado] = await pool.execute(
      'INSERT INTO teams (name, description, game_id, creator_id) VALUES (?, ?, ?, ?)',
      [name, description, game_id, req.usuario.id]
    );

    return res.status(201).json({
      mensagem: 'Equipe criada com sucesso.',
      equipe: {
        id: resultado.insertId,
        name,
        description,
        game_id,
        creator_id: req.usuario.id,
      },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível criar a equipe.' });
  }
}

export async function atualizarEquipe(req, res) {
  const equipeId = Number(req.params.id);
  if (!Number.isInteger(equipeId) || equipeId <= 0) {
    return res.status(400).json({ mensagem: 'ID da equipe inválido.' });
  }

  try {
    const [equipe] = await pool.execute('SELECT * FROM teams WHERE id = ?', [equipeId]);
    if (equipe.length === 0) {
      return res.status(404).json({ mensagem: 'Equipe não encontrada.' });
    }

    if (Number(equipe[0].creator_id) !== Number(req.usuario.id) && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você só pode alterar suas próprias equipes.' });
    }

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : equipe[0].name;
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : equipe[0].description;
    const game_id = Number(req.body.game_id) || Number(equipe[0].game_id);

    await pool.execute(
      'UPDATE teams SET name = ?, description = ?, game_id = ? WHERE id = ?',
      [name, description, game_id, equipeId]
    );

    return res.status(200).json({ mensagem: 'Equipe atualizada com sucesso.' });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível atualizar a equipe.' });
  }
}

export async function excluirEquipe(req, res) {
  const equipeId = Number(req.params.id);
  if (!Number.isInteger(equipeId) || equipeId <= 0) {
    return res.status(400).json({ mensagem: 'ID da equipe inválido.' });
  }

  try {
    const [equipe] = await pool.execute('SELECT creator_id FROM teams WHERE id = ?', [equipeId]);
    if (equipe.length === 0) {
      return res.status(404).json({ mensagem: 'Equipe não encontrada.' });
    }

    if (Number(equipe[0].creator_id) !== Number(req.usuario.id) && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você só pode excluir suas próprias equipes.' });
    }

    await pool.execute('DELETE FROM teams WHERE id = ?', [equipeId]);
    return res.status(200).json({ mensagem: 'Equipe excluída com sucesso.' });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível excluir a equipe.' });
  }
}

export async function entrarNaEquipe(req, res) {
  const equipeId = Number(req.params.id);
  const usuarioId = Number(req.usuario.id);

  if (!Number.isInteger(equipeId) || equipeId <= 0) {
    return res.status(400).json({ mensagem: 'ID da equipe inválido.' });
  }

  try {
    const [equipe] = await pool.execute('SELECT id FROM teams WHERE id = ?', [equipeId]);
    if (equipe.length === 0) {
      return res.status(404).json({ mensagem: 'Equipe não encontrada.' });
    }

    const [jaMembro] = await pool.execute(
      'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
      [equipeId, usuarioId]
    );

    if (jaMembro.length > 0) {
      return res.status(409).json({ mensagem: 'Você já faz parte desta equipe.' });
    }

    await pool.execute('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [equipeId, usuarioId]);
    return res.status(200).json({ mensagem: 'Você entrou na equipe com sucesso.' });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível entrar na equipe.' });
  }
}

export async function sairDaEquipe(req, res) {
  const equipeId = Number(req.params.id);
  const usuarioId = Number(req.usuario.id);

  if (!Number.isInteger(equipeId) || equipeId <= 0) {
    return res.status(400).json({ mensagem: 'ID da equipe inválido.' });
  }

  try {
    const [resultado] = await pool.execute(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [equipeId, usuarioId]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Você não pertence a esta equipe.' });
    }

    return res.status(200).json({ mensagem: 'Você saiu da equipe com sucesso.' });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível sair da equipe.' });
  }
}
