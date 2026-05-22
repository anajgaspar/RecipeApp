import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { UserController } from '../controllers/userController';
import { FollowController } from '../controllers/followController';

const router = Router()

router.get("/public/:userId", UserController.getPublicProfile)
router.get("/", AuthMiddleware.authenticateUser, UserController.getProfile)
router.put("/", AuthMiddleware.authenticateUser, UserController.updateProfile)
router.get("/profiles", AuthMiddleware.authenticateUser, UserController.listProfiles)
router.post("/profiles", AuthMiddleware.authenticateUser, UserController.createProfile)
router.put("/profiles/:profileId", AuthMiddleware.authenticateUser, UserController.updateFamilyProfile)
router.delete("/profiles/:profileId", AuthMiddleware.authenticateUser, UserController.deleteFamilyProfile)
router.get("/social/me", AuthMiddleware.authenticateUser, FollowController.summary)
router.get("/social/followers", AuthMiddleware.authenticateUser, FollowController.followers)
router.get("/social/following", AuthMiddleware.authenticateUser, FollowController.following)
router.get("/social/:userId/status", AuthMiddleware.authenticateUser, FollowController.status)
router.post("/social/:userId/toggle", AuthMiddleware.authenticateUser, FollowController.toggle)

export default router