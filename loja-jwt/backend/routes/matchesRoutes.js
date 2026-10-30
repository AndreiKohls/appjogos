import { Router } from 'express';
import { listarPartidas, buscarPartidaPorId, criarPartida, atualizarPartida, excluirPartida, entrarNaPartida, sairDaPartida } from '../controllers/matchesController.js';
import autenticarTokenGameHub from '../middlewares/autenticarTokenGameHub.js';

const router = Router();

router.get('/', autenticarTokenGameHub, listarPartidas);
router.get('/:id', autenticarTokenGameHub, buscarPartidaPorId);
router.post('/', autenticarTokenGameHub, criarPartida);
router.put('/:id', autenticarTokenGameHub, atualizarPartida);
router.delete('/:id', autenticarTokenGameHub, excluirPartida);
router.post('/:id/join', autenticarTokenGameHub, entrarNaPartida);
router.delete('/:id/leave', autenticarTokenGameHub, sairDaPartida);

export default router;
