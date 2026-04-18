import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

router.post('/login', userController.login);
router.get('/users/search', userController.search);
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.post('/users', userController.create);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.remove);

export default router;
