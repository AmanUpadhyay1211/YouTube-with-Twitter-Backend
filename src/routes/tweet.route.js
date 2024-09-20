import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { createTweet , deleteTweet,getAllUserTweets,getTweetById,updateTweet} from "../controllers/tweet.controllers.js"

const tweetRouter = Router()

tweetRouter.route("/get-all-tweet").get(getAllUserTweets)
tweetRouter.route("/get-tweet").get(getTweetById)

// Secured Routes - require JWT authentication
tweetRouter.route("/create").post( verifyAccessToken, createTweet)
tweetRouter.route("/delete").get(verifyAccessToken,deleteTweet)
tweetRouter.route("/update").patch(verifyAccessToken,updateTweet)


export default tweetRouter;