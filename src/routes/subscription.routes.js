import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/subscribe").post(verifyJWT, toggleSubscription);
router.route("/subscribers").get(verifyJWT, getUserChannelSubscribers);
router.route("/channels").get(verifyJWT, getSubscribedChannels);

export default router;
