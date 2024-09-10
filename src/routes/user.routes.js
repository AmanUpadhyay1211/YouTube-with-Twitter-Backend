import { Router } from "express";
import { loginUser, logoutUser, regenerateAccessAndRefreshToken, registerUser } from "../controllers/user.controllers.js";
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
userRouter.route("/regenerate-tokens").get(regenerateAccessAndRefreshToken)

export default userRouter;
