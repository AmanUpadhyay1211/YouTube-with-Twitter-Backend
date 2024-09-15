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

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos",videoRouter)
//https://localhost:8000/api/v1/users/register

export { app };
