import { model,Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likedBy :{
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true
        },

        //Depending upon the like if is on video/comment/tweet the id of that will insert and rest field will be empty
        video : {
            type : Schema.Types.ObjectId,
            ref : 'Video',
        },
        comment : {
            type : Schema.Types.ObjectId,
            ref : 'Comment',
        },
        tweet : {
            type : Schema.Types.ObjectId,
            ref : 'Tweet',
        },
    },
    {
        timestamps:true
    }
)

likeSchema.plugin(mongooseAggregatePaginate);

export const Like = model("Like", likeSchema);