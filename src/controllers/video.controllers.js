import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../services/cloudinary.service.js";


const uploadVideo = asyncHandler (async (req,res)=>{
    const user = req.user
    if(!user) throw new ApiError(404, "Unauthorized Request")
    const videoFileLocalPath = req.files?.["videoFile"]?.[0]?.path
    const thumbnailLocalPath = req.files?.["thumbnail"]?.[0]?.path
    const { title ,description, isPublic} = req.body

    if(!videoFileLocalPath || !thumbnailLocalPath ||  !title || !description || !isPublic){
        throw new ApiError(400,"Missing required field")
    }

   const videoFile = await uploadOnCloudinary(videoFileLocalPath)
   if(!videoFile) throw new ApiError(500,"Internal server Error while Uploading yout video") 
   const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
   if(!thumbnail)throw new ApiError(500,"Internal server Error while Uploading the thumbnail")

  const video = await Video.create({
        videoFile : videoFile.secure_url,
        thumbnail : thumbnail.secure_url,
        title,
        description,
        duration: videoFile.duration,
        isPublic,
        owner:user._id
   })
  
   return res
   .status(201)
   .json(
    new ApiResponse(201,video,"Video Uploaded Successfully")
   )

})

const deleteVideo = asyncHandler(async(req,res)=>{
    const user = req.user
    if(!user) throw new ApiError(404, "Unauthorized Request")
    const {videoId} = req.params
  if(!videoId) throw new ApiError(404, "Missing required field to perform video deletion")
   const deletion = await Video.findByIdAndDelete(videoId)
  if(!deletion) throw new ApiError(500,"Internal server error while performing video deletionn")
    await  deleteFromCloudinary(videoFile.url)

  res.status(200).json(
    new ApiResponse(200,"Video deleted successfully")
  )
})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized request: User not authenticated.");
    
  
    const { videoId } = req.params;
    if (!videoId)   throw new ApiError(400, "Bad request: Video ID is required.");
  
    const videoInDB = await Video.findById(videoId);
    if (!videoInDB) throw new ApiError(404, "Video not found: No video exists with the provided ID.");
    
  
    // Check if the authenticated user is the owner of the video
    if (videoInDB.owner.toString() !== user._id.toString()) {
      throw new ApiError(403, "Forbidden: You are not authorized to update this video.");
    }
  
    const { title, description, isPublic } = req.body;
  
    // Validate required fields
    if (!title?.trim() || !description?.trim() || isPublic === undefined) {
      throw new ApiError(400, "Bad request: Title, description, and isPublic are required fields.");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        title,
        description,
        isPublic
      },
      { new: true }
    );
  
    if (!updatedVideo) throw new ApiError(500, "Internal server error: Failed to update video details.");
  
    res.status(200).json(
      new ApiResponse(200, updatedVideo, "Video details updated successfully.")
    );
  });
  
const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized request: User not authenticated.");
    
  
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(400, "Bad request: Video ID is required.");
    
    const videoInDB = await Video.findById(videoId);
    if (!videoInDB) throw new ApiError(404, "Video not found: No video exists with the provided ID.");
    
  
    // Check if the authenticated user is the owner of the video
    if (videoInDB.owner.toString() !== user._id.toString()) {
      throw new ApiError(403, "Forbidden: You are not authorized to update this video.");
    }
  
    // Ensure a thumbnail file is provided
    const newThumbnailLocalPath = req.file?.path;
    if (!newThumbnailLocalPath) throw new ApiError(400, "Bad request: Thumbnail file is missing.");
    

    const response = await uploadOnCloudinary(newThumbnailLocalPath);
    if (!response) throw new ApiError(500, "Internal server error: Failed to upload thumbnail to Cloudinary");
    

    const updatedVideoWithNewThumbnail = await Video.findByIdAndUpdate(
      videoId,
      { thumbnail: response.secure_url },
      { new: true }
    );
  
    if (!updatedVideoWithNewThumbnail)   throw new ApiError(500, "Internal server error: Failed to update video thumbnail.");
    
  
    res.status(200).json(
      new ApiResponse(200, updatedVideoWithNewThumbnail, "Video thumbnail updated successfully.")
    );
  });

const getVideoByID = asyncHandler (async(req,res)=>{
    
   const { videoId } = req.params; 
   if (!videoId) throw new ApiError(400, "Bad request: Video ID is required.");
    
   // Find the video in the database
    const videoInDB = await Video.findById(videoId);
    if (!videoInDB) throw new ApiError(404, "Video not found: No video exists with the provided ID.");

    res.status(200).json(
        new ApiResponse(200,videoInDB,"Video fetched Successfully")
    )
    
})

const getAllVideos = asyncHandler (async(req,res)=>{
    //Dekh saari video to ek saath le nhi sakte kyuki youtube pe billions of video hongi toh hum kuch selective 15-20 video ek baar mai fetch karenge then jabuser scroon karke pura niche pahuch jaye tab aur 15-20 search kar lenge and soo on to ussi hisab se iss controller ko design karna hai!!
})

export {uploadVideo,deleteVideo,updateVideoDetails,updateVideoThumbnail,getVideoByID,getAllVideos}