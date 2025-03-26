import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    //Veryfy USer logged in -jwt middleware
    //Get all details like title isPublic videosArr from Body
    //Check we are getting data as expected and for required field
    //Create the playlist

    const user = req.user;
    if (user) res.status(403).json(new ApiError(403, "Not Authonticated"));

    const { title, description, isPublic, videosArr } = req.body;
    if (title.trim() === "" || description.trim() === "")
      res.status(404).json(new ApiError(400, "Missing Required FIelds"));
    if (videosArr.length === 0)
      res.status(404).json(new ApiError(400, "Missing Required FIelds"));

    const userInDb = await User.findById(user._id);
    if (!userInDb) res.status(404).json(new ApiError(404, "User Not Found"));

    const createdPlaylist = await Playlist.create({
      title,
      description,
      isPublic,
      videos: videosArr,
      owner: user._id,
    });

    if (!createdPlaylist)
      res
        .status(500)
        .json(
          new ApiError(500, "Internal Server Error While interacting with DB")
        );

    res
      .status(201)
      .json(
        new ApiResponse(201, createPlaylist, "Playlist Created Successfully")
      );
  } catch (error) {
    console.log(error);
    logger.error(error.message);
  }
});
const addVideoInPlaylist = asyncHandler(async (req, res) => {
  try {
    //Verify user logged in -jwt middleware
    //Get the playlist id and video id from params
    //Check if video is already in playlist
    //Add the video to playlist
    const user = req.user;
    const { playlistId, videoId } = req.params;
    if (!user)
      res
        .status(403)
        .json(new ApiError(403, "Not Authourised to perform this action"));

    if (playlistId.trim() === "" || videoId.trim() === "")
      throw new ApiError(400, "Missing Required Fields");
    const userInDb = await User.findById(user._id);
    if (!userInDb) throw new ApiError(404, "User Not found in DB");
  } catch (error) {
    console.log(error);
    logger.error(error.message);
  }
});
const removeVideoInPlaylist = asyncHandler(async (req, res) => {
  const user = req.user;
  const { playlistId, videoId } = req.params;
  if (!user) throw new ApiError(403, "Not Authourised to perform this action");
  if (playlistId.trim() === "" || videoId.trim() === "")
    throw new ApiError(400, "Missing Required Fields");
  const userInDb = await User.findById(user._id);
  if (!userInDb) throw new ApiError(404, "User Not found in DB");
});
const deletePlaylist = asyncHandler(async (req, res) => {});

export {
  createPlaylist,
  addVideoInPlaylist,
  removeVideoInPlaylist,
  deletePlaylist,
};
