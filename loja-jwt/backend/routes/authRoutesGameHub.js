import { Router } from 'express';
import { register, login, me } from '../controllers/authControllerGameHub.js';
import autenticarToken from '../middlewares/autenticarToken.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', autenticarToken, me);

export default router;
