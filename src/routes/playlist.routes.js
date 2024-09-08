import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createPlaylist);
router.route("/get").get(getUserPlaylists);
router.route("/:id").get(getPlaylistById);
router.route("/video/add").patch(addVideoToPlaylist);
router.route("/video/remove").delete(removeVideoFromPlaylist);
router.route("/remove").delete(deletePlaylist);
router.route("/update").patch(updatePlaylist);

export default router;
