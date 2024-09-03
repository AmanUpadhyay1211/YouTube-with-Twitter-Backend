import dotenv from "dotenv";
import dbConnect from "./db/dbConnect.js";
import { app } from "./app.js";
import envConf from "./envConf/envConf.js";

dotenv.config({ path: "./env" });

dbConnect()
  .then(() =>
    app.listen(envConf.port || 8000, () => {
      console.log(`Server is running on port ${envConf.port || 8000}`);
    })
  )
  .catch((err) => console.log("MongoDB Connection Failed:  ", err));
