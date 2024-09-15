import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "./user.model.js";
import { Playlist } from "./playlist.model.js";
import { Comment } from "./comment.model.js";
import { Like } from "./like.model.js";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // Get by cloudinary response
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

videoSchema.post("findOneAndDelete",async function() {
     //Jaise tu video delete karega toh uske related jo ye vidoe kisi ki watchHistory[] mai hai ya kisi ki playlist[] mai ya iss video pe jo like/comment hai uska alag document hoga unn sab jagah se iska naam hatana for example playlist aur watchHistory array mese iski objectid remove karni hai then jiss like aur comment ki Video wale section mai iss video ki id hai unn document ko delete karna hoga

     if (doc) {
      const videoId = doc._id; // Get the deleted video id
      
      // Remove video from all users' watchHistory
      await User.updateMany(
        { watchHistory: videoId },
        { $pull: { watchHistory: videoId } }
      );
  
      // Remove video from all playlists
      await Playlist.updateMany(
        { videos: videoId },
        { $pull: { videos: videoId } } 
      );
  
      // Delete all comments related to the video
      await Comment.deleteMany({ video: videoId });
  
      // Delete all likes related to the video and likes on comments related to the video
      await Like.deleteMany({
        $or: [
          { video: videoId }, // Likes on the video itself
          { comment: { $in: await Comment.find({ video: videoId }).select('_id') } } // Likes on comments related to the video
        ]
      });
    }
})

export const Video = model("Video", videoSchema);
