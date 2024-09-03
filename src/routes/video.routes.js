import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getAllVideos);
router.route("/create").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router
  .route("/:videoId")
  .get(verifyJWT, getVideoById)
  .delete(verifyJWT, deleteVideo);
router
  .route("/update")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);
router.route("/update-status").patch(verifyJWT, togglePublishStatus);

export default router;
