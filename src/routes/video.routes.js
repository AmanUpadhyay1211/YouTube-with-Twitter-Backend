import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { uploadVideo, deleteVideo, updateVideoDetails, updateVideoThumbnail, getAllVideos,getVideoByID} from "../controllers/video.controllers.js"

const videoRouter = Router()

videoRouter.route("/get-all-videos").get(getAllVideos)
videoRouter.route("/get-video").get(getVideoByID)

// Secured Routes - require JWT authentication
videoRouter.route("/upload").post(upload.single("video"), verifyAccessToken, uploadVideo)
videoRouter.route("/delete").get(verifyAccessToken,deleteVideo)
videoRouter.route("/update-details").patch(verifyAccessToken,updateVideoDetails)
videoRouter.route("/update-thumbnail").patch(verifyAccessToken,updateVideoThumbnail)


export default videoRouter;