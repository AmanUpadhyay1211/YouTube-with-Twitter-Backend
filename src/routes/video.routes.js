import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { uploadVideo, deleteVideo, updateVideoDetails, updateVideoThumbnail, getAllVideos,getVideoByID} from "../controllers/video.controllers.js"

const videoRouter = Router()

videoRouter.route("/get-all-vidoes").get(getAllVideos)
videoRouter.route("/get-vidoe").get(getVideoByID)

// Secured Routes
videoRouter.route("/upload").post(upload.single("video"), verifyAccessToken, uploadVideo)
videoRouter.route("/delete").get(verifyAccessToken,deleteVideo)
videoRouter.route("/update-details").post(verifyAccessToken,updateVideoDetails)
videoRouter.route("/update-thumbnail").post(verifyAccessToken,updateVideoThumbnail)


export default videoRouter;