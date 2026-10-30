import { Router } from 'express';
import { listarProdutos, buscarProdutoPorId, cadastrarProduto, atualizarProduto, excluirProduto } from '../controllers/produtosController.js';
import autenticarToken from '../middlewares/autenticarToken.js';
import somenteAdmin from '../middlewares/somenteAdmin.js';

const router = Router();

// Todas as operações exigem login. Alterações exigem também o nível admin.
router.use(autenticarToken);
router.get('/', listarProdutos);
router.get('/:id', buscarProdutoPorId);
router.post('/', somenteAdmin, cadastrarProduto);
router.put('/:id', somenteAdmin, atualizarProduto);
router.delete('/:id', somenteAdmin, excluirProduto);

export default router;
