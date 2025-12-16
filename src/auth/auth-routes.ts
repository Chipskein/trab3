import { Router } from 'express';

import { UserService } from '../users/users-services.js';
import { UsersRepository } from '../users/users-repository.js';
import { db } from '../db/db-connection.js';
import { AuthController } from './auth-controller.js';

const router = Router();

const repository = new UsersRepository(db)
const service = new UserService(repository)
const authController = new AuthController(service);

router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));

export default router;