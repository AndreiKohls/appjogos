import { Router } from 'express';
import { listarEquipes, buscarEquipePorId, criarEquipe, atualizarEquipe, excluirEquipe, entrarNaEquipe, sairDaEquipe } from '../controllers/teamsController.js';
import autenticarTokenGameHub from '../middlewares/autenticarTokenGameHub.js';

const router = Router();

router.get('/', autenticarTokenGameHub, listarEquipes);
router.get('/:id', autenticarTokenGameHub, buscarEquipePorId);
router.post('/', autenticarTokenGameHub, criarEquipe);
router.put('/:id', autenticarTokenGameHub, atualizarEquipe);
router.delete('/:id', autenticarTokenGameHub, excluirEquipe);
router.post('/:id/join', autenticarTokenGameHub, entrarNaEquipe);
router.delete('/:id/leave', autenticarTokenGameHub, sairDaEquipe);

export default router;
