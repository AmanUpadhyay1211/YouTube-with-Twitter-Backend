import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../services/cloudinary.service.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  // Check for missing fields
  if (
    [userName, fullName, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "Invalid request: Missing required field(s)");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid Email : Doesn't exits");
  }

  // Check if user already exists
  const alreadyExisted = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (alreadyExisted) {
    throw new ApiError(400, "Username or email already exists");
  }

  // Handle avatar file upload
  const avatarLocalFilePath = req.files?.["avatar"]?.[0]?.path;
  if (!avatarLocalFilePath) {
    throw new ApiError(400, "Avatar is required");
  }
  const cloudinaryAvatarResponse = await uploadOnCloudinary(
    avatarLocalFilePath
  );

  // Handle cover image file upload (if provided)
  let cloudinaryCoverImageResponse;
  const coverImageLocalFilePath = req.files?.["coverImage"]?.[0]?.path;
  if (coverImageLocalFilePath) {
    cloudinaryCoverImageResponse = await uploadOnCloudinary(
      coverImageLocalFilePath
    );
  }

  //TODO: Add two step email verification cheak here using nodemailer otp

  // Create the user
  const userCreated = await User.create({
    userName,
    fullName,
    email,
    password,
    avatar: cloudinaryAvatarResponse.secure_url,
    coverImage: cloudinaryCoverImageResponse?.secure_url || "",
  });

  // Retrieve the user without the password and refreshToken fields
  const user = await User.findById(userCreated._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(500, "Inmternal server error Failed to create user");
  } else {
    return res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
  }
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  if (!email && !userName) {
    throw new ApiError(400, "Email or username is required");
  }

  if (!password || password === "") {
    throw new ApiError(400, "Password is required");
  }

  let userInDB = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!userInDB) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const isPasswordValid = await userInDB.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const accessToken = await userInDB.generateAccessToken();
  const refreshToken = await userInDB.generateRefreshToken();

  userInDB.refreshToken = refreshToken;

  try {
    await userInDB.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, "Failed to save user token");
  }

  userInDB.refreshToken = undefined;
  userInDB.password = undefined;

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: userInDB,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
 

const logoutUser = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  await User.findByIdAndUpdate(
    userID,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  };

  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const browserRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!browserRefreshToken) {
    throw new ApiError(404, "Refresh Token not found");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(browserRefreshToken, envConf.refreshTokenSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or Expired Refresh Token");
  }

  const userInDB = await User.findById(decodedToken._id);
  if (!userInDB) {
    throw new ApiError(400, "User not found");
  }

  if (browserRefreshToken !== userInDB.refreshToken) {
    throw new ApiError(400, "Refresh Token does not match");
  }

  // Generate new tokens
  const accessToken = await userInDB.generateAccessToken();
  const refreshToken = await userInDB.generateRefreshToken();

  userInDB.refreshToken = refreshToken;

  try {
    await userInDB.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, "Failed to save new tokens");
  }

  // Clear sensitive fields before sending the response
  userInDB.refreshToken = undefined;
  userInDB.password = undefined;

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict", // Prevent CSRF attacks
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: userInDB,
          accessToken,
          refreshToken,
        },
        "New Access and Refresh tokens generated!"
      )
    );
});


const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new ApiError(500, "Cannot find current user");

  return res
    .status(200)
    .json(new ApiResponse(200, currentUser, "Current User Found"));
});


const updateUserAvatar = asyncHandler(async (req, res) => {
  const userID = req.user?._id;
  const newAvatarLocalPath = req.file?.path;  // Get the local path of the uploaded file

  if (!newAvatarLocalPath) throw new ApiError(404, "New Avatar File is required");

  const user = await User.findById(userID);
  if (!user) throw new ApiError(500, "Cannot find user");

  // Upload the new avatar to Cloudinary
  const newAvatar = await uploadOnCloudinary(newAvatarLocalPath);

  if (!newAvatar) throw new ApiError(500, "Error while uploading new avatar");

  // Delete old avatar from Cloudinary if it exists
  if (user.avatar) {
    await deleteFromCloudinary(user.avatar); 
  }

  const userWithUpdatedAvatar = await User.findByIdAndUpdate(
    userID,
    { avatar: newAvatar.secure_url },
    { new: true }
  );
  if (!userWithUpdatedAvatar) throw new ApiError(500, "Failed to update avatar in the database.");

  return res
    .status(201)
    .json(new ApiResponse(201, userWithUpdatedAvatar, "Avatar Updated Successfully"));
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
  const userID = req.user?._id;
  const newCoverImageLocalPath = req.file?.path; 

  if (!newCoverImageLocalPath) throw new ApiError(400, "No cover image file provided.");

  const user = await User.findById(userID);
  if (!user) throw new ApiError(404, "User not found.");

  // Upload the new image to Cloudinary
  const newCoverImage = await uploadOnCloudinary(newCoverImageLocalPath);

  if (!newCoverImage) throw new ApiError(500, "Failed to upload cover image to Cloudinary.");

  // Delete old cover image from Cloudinary if it exists
  if (user.coverImage) {
    await deleteFromCloudinary(user.coverImage); // Corrected variable name to user.coverImage
  }

  const userWithUpdatedCoverImage = await User.findByIdAndUpdate(
    userID,
    { coverImage: newCoverImage.secure_url },
    { new: true }
  );

  if (!userWithUpdatedCoverImage) throw new ApiError(500, "Failed to update cover image in the database.");

  return res
    .status(201)
    .json(new ApiResponse(201, userWithUpdatedCoverImage, "Cover image updated successfully."));
});


const updateUserPassword = asyncHandler(async(req,res)=>{
      const userID = req.user._id
      const {oldPassword , newPassword}= req.body
      if(!oldPassword || !newPassword){
        throw new ApiError(400,"Passwords field are required")
      }
      const user = await User.findById(userID)
      if(!user) throw new ApiError(404,"Cannot find User")
     
    const isMatch = await user.isPasswordCorrect(oldPassword);
    if(!isMatch) throw new ApiError(400,"Invalid Old Password")

      const userWithUpdatedPassword = await User.findByIdAndUpdate(userID,
        {password:newPassword},
        {new:true}
      ).select("-password -refreshToken")

      return res
      .status(200)
      .json(200,userWithUpdatedPassword,"Password Updated Successfully")
      
})


const updateFullName = asyncHandler(async(req,res)=>{
  const userID = req.user._id
 const {newName,password} = req.body
 if(!newName) throw new ApiError(400,"Name field is required")
  const user = await User.findById(userID)
 if(!user) throw new ApiError(404,"Cannot find User")
  const isMatch = await user.isPasswordCorrect(oldPassword);
 if(!isMatch) throw new ApiError(400,"Invalid Old Password")
  const userWithUpdatedName = await User.findByIdAndUpdate(userID,
{fullName:newName},
{new:true}).select("-password -refreshToken")
return res
      .status(200)
      .json(200,userWithUpdatedName,"Password Updated Successfully")
})

const updateEmail = asyncHandler(async(req,res)=>{
  //Design this functionality later on with two step email verification
})

const getUserChannel = asyncHandler (async(req,res)=>{
  const {userName} = req.params
  const user = await User.findOne({userName})
  if(!user) throw new ApiError(404,"User Not Found")

  await user.aggrigrate([
     {
      $lookup: {
        from: "subcriptions",
        localField: "_id",
        foreignField: "channel",
        as : "subscriber"
      }
    },
    {
      
    }
  ])
})



export { registerUser,
   loginUser, 
   logoutUser, 
   refreshAccessToken, 
   getCurrentUser,
   updateUserAvatar,
   updateUserCoverImage,
   updateUserPassword,
   updateFullName
  };
