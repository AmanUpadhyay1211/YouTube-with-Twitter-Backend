import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import envConf from "../envConf/envConf.js";
import { cloudinaryFolder } from "../constants.js";

cloudinary.config({
  cloud_name: envConf.cloudinaryCloudName,
  api_key: envConf.cloudinaryApiKey,
  api_secret: envConf.cloudinaryApiSecret,
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        const uploadResult = await cloudinary.uploader.upload(
            localFilePath,{
                resource_type : "auto",
                folder: cloudinaryFolder,
            })

        fs.unlinkSync(localFilePath)
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("Upload on cloudinary error: ",error)
        return null
    }
};


export const deleteFromCloudinary = async (cloudinaryURL)=>{
// https://res.cloudinary.com/amanupadhyay1211/image/upload/v1725902214/tgkz8xt3jxaewrsekoz6.png
    const urlWithoutExtension = cloudinaryURL.split('.').slice(0, -1).join('.');
    const publicId = urlWithoutExtension.split('/').pop();

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
      } catch (error) {
        console.log("Error deleting file from Cloudinary: ", error);
        return null;
      }

}