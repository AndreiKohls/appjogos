import { Router } from 'express';
import { obterPerfil, atualizarPerfil, listarUsuarios } from '../controllers/usersControllerGameHub.js';
import autenticarTokenGameHub from '../middlewares/autenticarTokenGameHub.js';
import somenteAdminGameHub from '../middlewares/somenteAdminGameHub.js';

const router = Router();

router.get('/me', autenticarTokenGameHub, obterPerfil);
router.put('/me', autenticarTokenGameHub, atualizarPerfil);
router.get('/', autenticarTokenGameHub, somenteAdminGameHub, listarUsuarios);

export default router;
