CREATE DATABASE IF NOT EXISTS gamehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gamehub;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(40) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('jogador', 'admin') NOT NULL DEFAULT 'jogador',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_username (username),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS games (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_games_name (name),
  KEY idx_games_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_games (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  game_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_games (user_id, game_id),
  KEY idx_user_games_user_id (user_id),
  KEY idx_user_games_game_id (game_id),
  CONSTRAINT fk_user_games_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_user_games_game
    FOREIGN KEY (game_id) REFERENCES games(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS matches (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  game_id INT UNSIGNED NOT NULL,
  creator_id INT UNSIGNED NOT NULL,
  match_date DATETIME NOT NULL,
  max_players SMALLINT UNSIGNED NOT NULL,
  status ENUM('aberta', 'em_andamento', 'encerrada') NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_matches_game_id (game_id),
  KEY idx_matches_creator_id (creator_id),
  KEY idx_matches_status (status),
  KEY idx_matches_match_date (match_date),
  CONSTRAINT fk_matches_game
    FOREIGN KEY (game_id) REFERENCES games(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_matches_creator
    FOREIGN KEY (creator_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT chk_matches_max_players CHECK (max_players > 0),
  CONSTRAINT chk_matches_title CHECK (CHAR_LENGTH(title) >= 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS match_players (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  match_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_match_players (match_id, user_id),
  KEY idx_match_players_match_id (match_id),
  KEY idx_match_players_user_id (user_id),
  CONSTRAINT fk_match_players_match
    FOREIGN KEY (match_id) REFERENCES matches(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_match_players_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS teams (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  game_id INT UNSIGNED NOT NULL,
  creator_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_teams_name (name),
  KEY idx_teams_game_id (game_id),
  KEY idx_teams_creator_id (creator_id),
  CONSTRAINT fk_teams_game
    FOREIGN KEY (game_id) REFERENCES games(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_teams_creator
    FOREIGN KEY (creator_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT chk_teams_name CHECK (CHAR_LENGTH(name) >= 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS team_members (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  team_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_team_members (team_id, user_id),
  KEY idx_team_members_team_id (team_id),
  KEY idx_team_members_user_id (user_id),
  CONSTRAINT fk_team_members_team
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_team_members_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dados iniciais de exemplo para facilitar testes e apresentação.
INSERT INTO games (name, description, image_url)
VALUES
  ('Valorant', 'FPS tático com rounds intensos e trabalho em equipe.', 'https://images.unsplash.com/...'),
  ('League of Legends', 'MOBA estratégico com objetivos e jogadas em equipe.', 'https://images.unsplash.com/...'),
  ('Minecraft', 'Exploração, construção e cooperação em um mundo criativo.', 'https://images.unsplash.com/...')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  image_url = VALUES(image_url);
