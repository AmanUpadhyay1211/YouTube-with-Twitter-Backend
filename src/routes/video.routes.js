import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import {
  uploadVideo,
  deleteVideo,
  updateVideoDetails,
  updateVideoThumbnail,
  getAllVideos,
  getVideoByID,
} from "../controllers/video.controllers.js";

const videoRouter = Router();

videoRouter.route("/get-all-videos").get(getAllVideos);
videoRouter.route("/get-video/:videoId").get(getVideoByID);

// Secured Routes - require JWT authentication
videoRouter.route("/upload").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  verifyAccessToken,
  uploadVideo
);
videoRouter.route("/delete/:videoId").delete(verifyAccessToken, deleteVideo);
videoRouter
  .route("/update-details/:videoId")
  .patch(verifyAccessToken, updateVideoDetails);
videoRouter
  .route("/update-thumbnail/:videoId")
  .patch(verifyAccessToken, upload.single("thumbnail"), updateVideoThumbnail);

export default videoRouter;
