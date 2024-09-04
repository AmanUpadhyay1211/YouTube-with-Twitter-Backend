import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import envConf from "../envConf/envConf.js";

cloudinary.config({
  cloud_name: envConf.cloudinaryCloudName,
  api_key: envConf.cloudinaryApiKey,
  api_secret: envConf.cloudinaryApiSecret,
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {resource_type : "auto"})
        fs.unlinkSync(localFilePath)
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("Upload on cloudinary error: ",error)
        return null
    }
};
