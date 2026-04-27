import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router()

router.post("/login", AuthController.login);
router.post("/firebase-login", AuthController.firebaseLogin);
router.post("/register", AuthController.register);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerification);
router.post("/logout", AuthMiddleware.authenticateUser, AuthController.logout);

export default router