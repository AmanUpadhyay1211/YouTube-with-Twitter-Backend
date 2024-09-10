import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"; 
import envConf from "../envConf/envConf.js";

const verifyAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const decodedToken = jwt.verify(token, envConf.accessTokenSecret); 

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }
    
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized: Invalid token or user");
  }
});

export { verifyAccessToken };
