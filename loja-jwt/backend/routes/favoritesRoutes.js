import { Router } from 'express';
import { listarFavoritos, adicionarFavorito, removerFavorito } from '../controllers/favoritesController.js';
import autenticarTokenGameHub from '../middlewares/autenticarTokenGameHub.js';

const router = Router();

router.get('/', autenticarTokenGameHub, listarFavoritos);
router.post('/:gameId', autenticarTokenGameHub, adicionarFavorito);
router.delete('/:gameId', autenticarTokenGameHub, removerFavorito);

export default router;
