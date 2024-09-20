import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { subscribe,unsubscribe } from "../controllers/subscription.controllers.js"

const subscriptionRouter = Router()

// Secured Routes - require JWT authentication
subscriptionRouter.route("/create").post( verifyAccessToken, subscribe)
subscriptionRouter.route("/delete").get(verifyAccessToken,unsubscribe)


export default subscriptionRouter;