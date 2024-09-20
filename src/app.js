import express from "express";
import { sizeLimit } from "./constants.js";
import envConf from "./envConf/envConf.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Setting up the configuration to accept multiple kind of data formats
app.use(express.json({ limit: sizeLimit })); // For JSON data
app.use(express.urlencoded({ limit: sizeLimit, extended: true })); //For URL Params
app.use(cors({ origin: envConf.corsOrigin, credentials: true })); //For Cross origin resource sharing so our frontend can communicate with backend
app.use(cookieParser()); //To perform CURD operation on cookies on user browser efficiently
app.use(express.static("public")); //To store some static data avalaible for all in this case it would be image

// import routers
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.route.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/subscriptions",subscriptionRouter);
app.use("/api/v1/playlists",playlistRouter);
//https://localhost:8000/api/v1/users/register

export { app };
