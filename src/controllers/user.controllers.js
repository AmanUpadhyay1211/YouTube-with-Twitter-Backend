import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";

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
    res
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
    $or: [{ email }, { userName }] 
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
    .json(new ApiResponse(201, 
      {
        user: userInDB,
        accessToken,
        refreshToken,
      },
      "User logged in successfully"
    ));
});

const logoutUser = asyncHandler(async(req,res)=>{
  const userID = req.user._id
  
 await User.findByIdAndUpdate(userID, 
    {
        $unset:{
            refreshToken:1
         }
    },
    {
      new: true,
    }
)

const options = {
  httpOnly: true,
  secure: true,
  expires: new Date(0),
}

res
.status(200)
.cookie("accessToken", "", options)
.cookie("refreshToken", "", options)
.json(new ApiResponse(200, {}, "User logged out successfully"))
})

const regenerateAccessAndRefreshToken = asyncHandler(async (req, res) => {
  const browserRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  
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
    sameSite: 'Strict',  // Prevent CSRF attacks
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
      201,
      {
        user: userInDB,
        accessToken,
        refreshToken,
      },
      "New Access and Refresh tokens generated!"
    ));
});


export { registerUser,loginUser,logoutUser,regenerateAccessAndRefreshToken };
