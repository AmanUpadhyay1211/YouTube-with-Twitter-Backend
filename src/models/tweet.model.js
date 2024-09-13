import { model,Schema } from "mongoose";
//Tweet is like community post from a user(Channel)
const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true
            },
        owner : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required: true,
        }
    },
    {
        timestamps:true
    }
)

export const Tweet = model("Tweet", tweetSchema);