import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/conexao.js';
import { emailValido, senhaValida } from '../utils/validacoes.js';

export async function cadastrar(req, res) {
  // req.body contém dados externos. Extraímos apenas os campos permitidos.
  const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = req.body.senha;

  if (!nome || nome.length > 100 || !emailValido(email) || !senhaValida(senha)) {
    return res.status(400).json({ mensagem: 'Informe nome (até 100 caracteres), e-mail válido e senha com pelo menos 8 caracteres e até 72 bytes.' });
  }

  try {
    const [existentes] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
    }

    // A senha original nunca vai para o banco. Apenas o hash calculado com custo 10 é salvo.
    const senhaHash = await bcrypt.hash(senha, 10);
    // O nível é decidido no servidor. Um eventual req.body.nivel é ignorado.
    const nivel = 'usuario';
    const [resultado] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, nivel],
    );

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: { id: resultado.insertId, nome, email, nivel },
    });
  } catch (erro) {
    // UNIQUE também protege contra dois cadastros simultâneos do mesmo e-mail.
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
    }
    return res.status(500).json({ mensagem: 'Não foi possível cadastrar o usuário. Tente novamente.' });
  }
}

export async function login(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = req.body.senha;

  if (!emailValido(email) || typeof senha !== 'string' || !senha || Buffer.byteLength(senha, 'utf8') > 72) {
    return res.status(400).json({ mensagem: 'Informe e-mail válido e senha.' });
  }

  try {
    const [usuarios] = await pool.execute('SELECT id, nome, email, senha, nivel FROM usuarios WHERE email = ?', [email]);
    const usuario = usuarios[0];

    // A mesma mensagem evita revelar se um e-mail específico está cadastrado.
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    // Payload: dados mínimos da sessão, sem senha e sem hash.
    // Secret: segredo da API, lido do ambiente. expiresIn: validade de duas horas.
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nivel: usuario.nivel },
      process.env.JWT_SECRET,
      { expiresIn: '2h', algorithm: 'HS256' },
    );

    return res.status(200).json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Não foi possível realizar o login. Tente novamente.' });
  }
}

export function usuarioAtual(req, res) {
  // O middleware já validou o JWT e consultou os dados atuais. Nunca devolvemos o hash.
  const { id, nome, email, nivel } = req.usuario;
  return res.status(200).json({ id, nome, email, nivel });
}
