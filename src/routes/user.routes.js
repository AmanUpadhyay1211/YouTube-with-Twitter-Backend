import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage, updateUserPassword } from "../controllers/user.controllers.js";
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

//Secured Routes :- auth required (done by verifying jwt token)
userRouter.route("/logout").get( verifyAccessToken , logoutUser)
userRouter.route("/refresh-access-token").get(refreshAccessToken)
userRouter.route("/current-user").get(verifyAccessToken, getCurrentUser)
userRouter.route("/avatar-update").post(verifyAccessToken, updateUserAvatar)
userRouter.route("/cover-update").post(verifyAccessToken, updateUserCoverImage)
userRouter.route("/password-update").post(verifyAccessToken, updateUserPassword)



export default userRouter;
