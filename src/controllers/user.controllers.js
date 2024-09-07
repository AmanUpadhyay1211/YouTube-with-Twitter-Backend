import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  // Check for missing fields
  if ([userName, fullName, email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "Invalid request: Missing required field(s)");
  }

  // Check if user already exists
  const alreadyExisted = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (alreadyExisted) {
    throw new ApiError(400, "Username or email already exists");
  }

  // Handle avatar file upload
  const avatarLocalFilePath = req.files?.['avatar']?.[0]?.path;
  if (!avatarLocalFilePath) {
    throw new ApiError(400, "Avatar is required");
  }
  const cloudinaryAvatarResponse = await uploadOnCloudinary(avatarLocalFilePath);

  // Handle cover image file upload (if provided)
  let cloudinaryCoverImageResponse;
  const coverImageLocalFilePath = req.files?.['coverImage']?.[0]?.path;
  if (coverImageLocalFilePath) {
    cloudinaryCoverImageResponse = await uploadOnCloudinary(coverImageLocalFilePath);
  }

  // Create the user
  const userCreated = await User.create({
    userName ,
    fullName,
    email,
    password,
    avatar: cloudinaryAvatarResponse.secure_url,
    coverImage: cloudinaryCoverImageResponse?.secure_url || ""
  });

  // Retrieve the user without the password and refreshToken fields
  const user = await User.findById(userCreated._id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Inmternal server error Failed to create user");
  } else {
    res.status(201).json(
      new ApiResponse(
        201, user, "User registered successfully"
      )
    );
  }
});

export { registerUser };
