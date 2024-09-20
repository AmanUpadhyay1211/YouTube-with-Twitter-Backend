import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const subscribe = asyncHandler(async (req,res)=>{
    const user = req.user
    if(!user) throw new ApiError(404, "Unauthorized Request")
    const channelId = req.params
   if(!channelId) throw new ApiError(400,"Channel Id is required to subscribe a channel")
    const channel = await Channel.findById(channelId)
if(!channel) throw new ApiError(404,"Channel not Exists")
    const subscription = await Subscription.create({subscriber : channelId, channel : user._id})
if(!subscription) throw new ApiError(500,"internal Server Error while Creation Subscription Document")
return res.status(201).json(ApiResponse(200, "Subscription,subscription, Created Successfully"))
})

const unsubscribe = asyncHandler(async(re,res)=>{
    const user = req.user
    if(!user) throw new ApiError(404, "Unauthorized Request")
        const channelId = req.params
    if(!channelId) throw new ApiError(400,"Channel Id is required to unsubscribe a channel")
        const channel = await Channel.findById(channelId)
    if(!channel) throw new ApiError(404,"Channel not Exists")
        const subscription = await Subscription.findOneAndDelete({subscriber : channelId, channel : user._id})
    if(!subscription) throw new ApiError(500,"internal Server Error while Deletion Subscription Document")
        res.status(200).json(
    new ApiResponse(200,{},"Unsubscribe"))
})

export {subscribe,unsubscribe}