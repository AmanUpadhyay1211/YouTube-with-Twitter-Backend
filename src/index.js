import dotenv from "dotenv";
import dbConnect from "./db/dbConnect.js";

dotenv.config({ path: "./env" });

dbConnect()
  .then(()=> console.log("successs"))
  .catch((err) => console.log("MongoDB Connection Failed:  ", err));
