import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { createTweet , deleteTweet,getAllUserTweets,getTweetById,updateTweet} from "../controllers/tweet.controllers.js"

const tweetRouter = Router()

tweetRouter.route("/get-all-tweet/:userName").get(getAllUserTweets)
tweetRouter.route("/get-tweet/:tweetId").get(getTweetById)

// Secured Routes - require JWT authentication
tweetRouter.route("/create").post( verifyAccessToken, createTweet)
tweetRouter.route("/delete/:tweetId").delete(verifyAccessToken,deleteTweet)
tweetRouter.route("/update/:tweetId").patch(verifyAccessToken,updateTweet)


export default tweetRouter;