import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getVideoComments);
router.route("/create").post(addComment);
router.route("/update").post(updateComment);
router.route("/").delete(deleteComment);

export default router;
