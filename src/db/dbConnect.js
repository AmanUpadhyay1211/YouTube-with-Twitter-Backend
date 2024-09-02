import mongoose from "mongoose";
import envConf from "../envConf/envConf.js";
import {DB_NAME} from "../constants.js"

async function dbConnect() {
    try {
        console.log(`${envConf.mongoDbConnectionString}/${DB_NAME}`)
       const connectionInstance = await mongoose.connect(`${envConf.mongoDbConnectionString}/${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log(`MongoDB Connection Failed: `,error)
        process.exit(1)
    }
}

export default dbConnect;