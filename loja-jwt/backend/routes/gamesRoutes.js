import { Router } from 'express';
import { listarJogos, buscarJogoPorId, criarJogo, atualizarJogo, excluirJogo } from '../controllers/gamesController.js';
import autenticarTokenGameHub from '../middlewares/autenticarTokenGameHub.js';
import somenteAdminGameHub from '../middlewares/somenteAdminGameHub.js';

const router = Router();

router.get('/', autenticarTokenGameHub, listarJogos);
router.get('/:id', autenticarTokenGameHub, buscarJogoPorId);
router.post('/', autenticarTokenGameHub, somenteAdminGameHub, criarJogo);
router.put('/:id', autenticarTokenGameHub, somenteAdminGameHub, atualizarJogo);
router.delete('/:id', autenticarTokenGameHub, somenteAdminGameHub, excluirJogo);

export default router;
