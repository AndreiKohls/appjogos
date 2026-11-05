import '../config/ambiente.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'schema.sql');

function criarPoolFallback() {
  const estado = {
    proximoIdUsuario: 1,
    proximoIdJogo: 1,
    proximoIdPartida: 1,
    users: [],
    games: [
      { id: 1, name: 'Valorant', description: 'FPS tático e rounds intensos.', image_url: null },
      { id: 2, name: 'League of Legends', description: 'MOBA com estratégia em equipe.', image_url: null },
      { id: 3, name: 'Minecraft', description: 'Construção, exploração e cooperação.', image_url: null },
    ],
    matches: [],
    matchPlayers: [],
  };

  const clonar = (lista) => lista.map((item) => ({ ...item }));

  function calcularParticipantes(matchId) {
    return estado.matchPlayers.filter((item) => Number(item.match_id) === Number(matchId)).length;
  }

  return {
    async execute(sql, parametros = []) {
      const comando = String(sql).trim();

      if (comando.startsWith('SELECT') && comando.includes('FROM users')) {
        if (comando.includes('WHERE email = ? OR username = ?')) {
          const [email, username] = parametros;
          return [clonar(estado.users.filter((usuario) => usuario.email === email || usuario.username === username))];
        }

        if (comando.includes('WHERE email = ?')) {
          const [email] = parametros;
          return [clonar(estado.users.filter((usuario) => usuario.email === email))];
        }

        if (comando.includes('WHERE id = ?')) {
          const [id] = parametros;
          return [clonar(estado.users.filter((usuario) => Number(usuario.id) === Number(id)))];
        }

        return [clonar(estado.users)];
      }

      if (comando.startsWith('INSERT INTO users')) {
        const [name, username, email, passwordHash, role] = parametros;
        const usuario = {
          id: estado.proximoIdUsuario++,
          name,
          username,
          email,
          password_hash: passwordHash,
          role: role || 'jogador',
        };
        estado.users.push(usuario);
        return [{ insertId: usuario.id, affectedRows: 1 }];
      }

      if (comando.startsWith('UPDATE users')) {
        const ultimoParametro = parametros[parametros.length - 1];
        const usuario = estado.users.find((item) => Number(item.id) === Number(ultimoParametro));
        if (!usuario) {
          return [{ affectedRows: 0 }];
        }

        if (parametros[0] !== undefined) usuario.name = parametros[0];
        if (parametros[1] !== undefined) usuario.username = parametros[1];
        if (parametros[2] !== undefined) usuario.email = parametros[2];
        if (parametros[3] !== undefined) usuario.password_hash = parametros[3];

        return [{ affectedRows: 1 }];
      }

      if (comando.startsWith('SELECT') && comando.includes('FROM games')) {
        if (comando.includes('WHERE id = ?')) {
          const [id] = parametros;
          return [clonar(estado.games.filter((jogo) => Number(jogo.id) === Number(id)))];
        }
        return [clonar(estado.games)];
      }

      if (comando.startsWith('INSERT INTO games')) {
        const [name, description, imageUrl] = parametros;
        const jogo = { id: estado.proximoIdJogo++, name, description, image_url: imageUrl || null };
        estado.games.push(jogo);
        return [{ insertId: jogo.id, affectedRows: 1 }];
      }

      if (comando.startsWith('UPDATE games')) {
        const [name, description, imageUrl, id] = parametros;
        const jogo = estado.games.find((item) => Number(item.id) === Number(id));
        if (!jogo) return [{ affectedRows: 0 }];
        jogo.name = name;
        jogo.description = description;
        jogo.image_url = imageUrl || null;
        return [{ affectedRows: 1 }];
      }

      if (comando.startsWith('DELETE FROM games')) {
        const [id] = parametros;
        const antes = estado.games.length;
        estado.games = estado.games.filter((jogo) => Number(jogo.id) !== Number(id));
        return [{ affectedRows: antes !== estado.games.length ? 1 : 0 }];
      }

      if (comando.startsWith('SELECT') && comando.includes('FROM matches')) {
        if (comando.includes('WHERE m.id = ?') || comando.includes('WHERE id = ?')) {
          const [id] = parametros;
          const partidas = estado.matches.filter((item) => Number(item.id) === Number(id));
          const resultado = partidas.map((item) => {
            const jogo = estado.games.find((jogo) => Number(jogo.id) === Number(item.game_id));
            const criador = estado.users.find((usuario) => Number(usuario.id) === Number(item.creator_id));
            return {
              ...item,
              game_name: jogo?.name || 'Jogo',
              creator_name: criador?.name || 'Anônimo',
              current_players: calcularParticipantes(item.id),
            };
          });
          return [clonar(resultado)];
        }

        const resultado = estado.matches.map((item) => {
          const jogo = estado.games.find((jogo) => Number(jogo.id) === Number(item.game_id));
          const criador = estado.users.find((usuario) => Number(usuario.id) === Number(item.creator_id));
          return {
            ...item,
            game_name: jogo?.name || 'Jogo',
            creator_name: criador?.name || 'Anônimo',
            current_players: calcularParticipantes(item.id),
          };
        });
        return [clonar(resultado)];
      }

      if (comando.startsWith('INSERT INTO matches')) {
        const [title, description, gameId, creatorId, matchDate, maxPlayers, status] = parametros;
        const partida = {
          id: estado.proximoIdPartida++,
          title,
          description,
          game_id: Number(gameId),
          creator_id: Number(creatorId),
          match_date: matchDate,
          max_players: Number(maxPlayers),
          status: status || 'aberta',
          created_at: new Date().toISOString(),
        };
        estado.matches.push(partida);
        return [{ insertId: partida.id, affectedRows: 1 }];
      }

      if (comando.startsWith('UPDATE matches')) {
        const [title, description, gameId, matchDate, maxPlayers, status, id] = parametros;
        const partida = estado.matches.find((item) => Number(item.id) === Number(id));
        if (!partida) return [{ affectedRows: 0 }];
        partida.title = title;
        partida.description = description;
        partida.game_id = Number(gameId);
        partida.match_date = matchDate;
        partida.max_players = Number(maxPlayers);
        partida.status = status;
        return [{ affectedRows: 1 }];
      }

      if (comando.startsWith('DELETE FROM matches')) {
        const [id] = parametros;
        const antes = estado.matches.length;
        estado.matches = estado.matches.filter((item) => Number(item.id) !== Number(id));
        estado.matchPlayers = estado.matchPlayers.filter((item) => Number(item.match_id) !== Number(id));
        return [{ affectedRows: antes !== estado.matches.length ? 1 : 0 }];
      }

      if (comando.startsWith('SELECT COUNT(*) AS total FROM match_players')) {
        const [matchId] = parametros;
        const total = estado.matchPlayers.filter((item) => Number(item.match_id) === Number(matchId)).length;
        return [{ 0: { total } }];
      }

      if (comando.startsWith('SELECT id FROM match_players')) {
        const [matchId, userId] = parametros;
        const filtrados = estado.matchPlayers.filter(
          (item) => Number(item.match_id) === Number(matchId) && Number(item.user_id) === Number(userId)
        );
        return [clonar(filtrados)];
      }

      if (comando.startsWith('INSERT INTO match_players')) {
        const [matchId, userId] = parametros;
        const item = { id: Date.now() + Math.random(), match_id: Number(matchId), user_id: Number(userId) };
        estado.matchPlayers.push(item);
        return [{ insertId: item.id, affectedRows: 1 }];
      }

      if (comando.startsWith('DELETE FROM match_players WHERE match_id = ? AND user_id = ?')) {
        const [matchId, userId] = parametros;
        const antes = estado.matchPlayers.length;
        estado.matchPlayers = estado.matchPlayers.filter(
          (item) => !(Number(item.match_id) === Number(matchId) && Number(item.user_id) === Number(userId))
        );
        return [{ affectedRows: antes !== estado.matchPlayers.length ? 1 : 0 }];
      }

      return [[]];
    },

    async query(sql, parametros = []) {
      return this.execute(sql, parametros);
    },

    async end() {
      return undefined;
    },
  };
}

async function criarPoolReal() {
  const conexao = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    multipleStatements: true,
  });

  try {
    await conexao.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conexao.query(`USE \`${process.env.DB_NAME}\``);

    const [tabelas] = await conexao.query('SHOW TABLES');
    if (!Array.isArray(tabelas) || tabelas.length === 0) {
      const schemaSql = await fs.readFile(schemaPath, 'utf8');
      await conexao.query(schemaSql);
    }
  } finally {
    await conexao.end();
  }

  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true,
    charset: 'utf8mb4',
  });
}

let pool;
try {
  pool = await criarPoolReal();
} catch {
  pool = criarPoolFallback();
}

export default pool;
