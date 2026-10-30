export default function somenteAdminGameHub(req, res, next) {
  if (req.usuario?.role !== 'admin') {
    return res.status(403).json({ mensagem: 'Acesso permitido apenas para administradores.' });
  }

  next();
}
