import { Router } from 'express';
import { register, login, me } from '../controllers/authControllerGameHub.js';
import autenticarTokenGameHub from '../middlewares/autenticarTokenGameHub.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', autenticarTokenGameHub, me);

export default router;
