import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function criarHashSenha(senha) {
  return bcrypt.hash(senha, 10);
}

export async function compararSenhaComHash(senha, hash) {
  return bcrypt.compare(senha, hash);
}

export function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h', algorithm: 'HS256' }
  );
}
