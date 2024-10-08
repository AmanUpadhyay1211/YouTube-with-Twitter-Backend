import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const subscribe = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(404, "Unauthorized Request");
  
    const { channelId } = req.params;
    if (!channelId) throw new ApiError(400, "Channel Id is required to subscribe to a channel");
  
    // Check if the user is trying to subscribe to themselves
    if (user._id.toString() === channelId) {
      throw new ApiError(400, "You cannot subscribe to yourself");
    }
  
    // Check if a subscription already exists
    const existingSubscription = await Subscription.findOne({ 
      subscriber: user._id, 
      channel: channelId 
    });
  
    if (existingSubscription) {
      throw new ApiError(400, "You are already subscribed to this channel");
    }
  
    // Create the subscription
    const subscription = await Subscription.create({ 
      subscriber: user._id, 
      channel: channelId 
    });
  
    if (!subscription) throw new ApiError(500, "Internal Server Error while creating subscription");
  
    return res.status(201).json(new ApiResponse(200, "Subscription Created Successfully"));
  });
  
  
  const unsubscribe = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(404, "Unauthorized Request");
  
    const { channelId } = req.params;
    if (!channelId) throw new ApiError(400, "Channel Id is required to unsubscribe from a channel");
  
    // Check if the subscription exists and delete it
    const subscription = await Subscription.findOneAndDelete({
      subscriber: user._id,
      channel: channelId
    });
  
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }
  
    res.status(200).json(
      new ApiResponse(200, {}, "Unsubscribed successfully")
    );
  });
  

export {subscribe,unsubscribe}