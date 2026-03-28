import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { UserController } from '../controllers/userController';

const router = Router()

router.get("/", AuthMiddleware.authenticateUser, UserController.getProfile)

export default router