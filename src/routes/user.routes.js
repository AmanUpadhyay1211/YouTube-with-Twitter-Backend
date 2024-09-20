import { Router } from "express";
import { 
  getCurrentUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  registerUser, 
  updateFullName, 
  updateUserAvatar, 
  updateUserCoverImage, 
  updateUserPassword, 
  updateEmail, 
  getUserChannel, 
  getUserWatchHistory 
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Registration route - allows avatar and coverImage upload
userRouter.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

// User login
userRouter.route("/login").post(loginUser);

// Dynamic route for fetching a user's channel based on their username
userRouter.route("/:userName").get(getUserChannel);

// Secured Routes - require JWT authentication
userRouter.route("/logout").get(verifyAccessToken, logoutUser);
userRouter.route("/refresh-access-token").post(refreshAccessToken);
userRouter.route("/current-user").get(verifyAccessToken, getCurrentUser);
userRouter.route("/avatar-update").patch(verifyAccessToken, upload.single("avatar"), updateUserAvatar);
userRouter.route("/cover-update").patch(verifyAccessToken, upload.single("coverImage"),updateUserCoverImage);
userRouter.route("/password-update").patch(verifyAccessToken, updateUserPassword);
userRouter.route("/fullname-update").patch(verifyAccessToken, updateFullName);
userRouter.route("/email-update").patch(verifyAccessToken, updateEmail);
userRouter.route("/watch-history").get(verifyAccessToken, getUserWatchHistory);

export default userRouter;
