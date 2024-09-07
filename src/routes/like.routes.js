import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route('/video').post(toggleVideoLike)
router.route('/tweet').post(toggleTweetLike)
router.route('/comment').post(toggleCommentLike)
router.route('/').get(getLikedVideos)

export default router;