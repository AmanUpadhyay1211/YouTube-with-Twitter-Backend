import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateFullName, updateUserAvatar, updateUserCoverImage, updateUserPassword,updateEmail,getUserChannel,getUserWatchHistory } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    }
  ]),

  registerUser
);
userRouter.route("/login").post(loginUser)
userRouter.route("/:userName").get(getUserChannel)

//Secured Routes :- auth required (done by verifying jwt token)
userRouter.route("/logout").get( verifyAccessToken , logoutUser)
userRouter.route("/refresh-access-token").get(refreshAccessToken)
userRouter.route("/current-user").get(verifyAccessToken, getCurrentUser)
userRouter.route("/avatar-update").post(verifyAccessToken, upload.single("avatar"), updateUserAvatar)
userRouter.route("/cover-update").post(verifyAccessToken,upload.single("coverImage"), updateUserCoverImage)
userRouter.route("/password-update").post(verifyAccessToken, updateUserPassword)
userRouter.route("/fullname-update").post(verifyAccessToken, updateFullName)
userRouter.route("/email-update").post(verifyAccessToken, updateEmail)
userRouter.route("/watch-history").get(verifyAccessToken, getUserWatchHistory)



export default userRouter;
