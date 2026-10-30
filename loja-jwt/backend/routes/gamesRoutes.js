import { Router } from 'express';
import { listarJogos, buscarJogoPorId, criarJogo, atualizarJogo, excluirJogo } from '../controllers/gamesController.js';
import autenticarToken from '../middlewares/autenticarToken.js';
import somenteAdmin from '../middlewares/somenteAdmin.js';

const router = Router();

router.get('/', autenticarToken, listarJogos);
router.get('/:id', autenticarToken, buscarJogoPorId);
router.post('/', autenticarToken, somenteAdmin, criarJogo);
router.put('/:id', autenticarToken, somenteAdmin, atualizarJogo);
router.delete('/:id', autenticarToken, somenteAdmin, excluirJogo);

export default router;
