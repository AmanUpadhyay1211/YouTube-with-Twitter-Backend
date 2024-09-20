import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const createTweet = asyncHandler ( async(req,res)=>{
    const user = req.user
    if(!user) throw new ApiError(404, "Unauthorized Request")
    const {tweet} = req.body
    if(tweet.trim() ==="") throw new ApiError(400, "Empty tweet is not allowed")

    const newTweet = await Tweet.create({
        content : tweet,
        owner : user._id
    })
    if(!newTweet) throw new ApiError(500,"Internal server database error")

    res.status(201).json(
        new ApiResponse(201,newTweet,"Tweet creation success")
    )

})

const deleteTweet = asyncHandler (async(req,res)=>{
    const user = req.user
    if(!user) throw new ApiError(404, "Unauthorized Request")
    const tweetId = req.params
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(404, "Tweet not found invalid tweet id")
    if(tweet.owner.toString() !== user._id.toString()) throw new ApiError(403, "You are not the owner of this tweet")
  const deletion = await Tweet.findByIdAndDelete(tweetId)
    if(!deletion) throw new ApiError(500,"Internal server error while performing video deletionn")
        res.status(200).json(
            new ApiResponse(200,"Video deleted successfully")
        )        
})

const updateTweet = asyncHandler(async(req,res)=>{
    const user = req.user
    if(!user) throw new ApiError(404, "Unauthorized Request")
    const {updatedTweet} = req.body
    if(updatedTweet.trim() === "") throw new ApiError(400, "Empty tweet is not allowed")
    const tweetId = req.params
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(404, "Tweet not found Invalid tweet if")
    if(tweet.owner.toString() !== user._id.toString()) throw new ApiError(403, "You are not the owner of this tweet")
        const updatedTweetInDb = await Tweet.findByIdAndUpdate(tweetId,
    {content:updateTweet}, {new:true})
    if(!updatedTweetInDb) throw new ApiError(500,"Internal server error while updating tweet")
        res.status(201).json(
    new ApiResponse(201,updatedTweetInDb,"Tweet updated successfully")
)
})

const getTweetById = asyncHandler(async(req,res)=>{
    const tweetId = req.params
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(404, "Tweet not found Invalid tweet id")
        res.status(200).json(
    new ApiResponse(200,tweet,"tweet fetched succesfully")
        )
})

const getAllUserTweets = asyncHandler(async(req,res)=>{
      // Set default pagination values (page 1, 20 videos per page)
  const { page = 1, limit = 20 } = req.query;
  
  const query = {}; // You can add more filters here based on categories, tags, etc.

  try {
    const allUserTweets = await Tweet.find(query)
      .limit(parseInt(limit)) 
      .skip((page - 1) * limit); 
    
    const allUserTweetsCount = await Tweet.countDocuments(query);
    
    res.status(200).json(
      new ApiResponse(
        200,
        {
            allUserTweets,
          pagination: {
            total: allUserTweetsCount,
            page: parseInt(page),
            limit: parseInt(limit),
          },
        },
        "User Tweets fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Internal Server Error while fetching videos");
  }
})

export {createTweet,deleteTweet,updateTweet,getTweetById,getAllUserTweets}