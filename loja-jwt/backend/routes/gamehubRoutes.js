import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ mensagem: 'GameHub API funcionando.', ok: true });
});

export default router;
