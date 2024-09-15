import { model,Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required: true,
        },
        channel : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required: true,
        }
    },
    {
        timestamps:true
    }
)

subscriptionSchema.plugin(mongooseAggregatePaginate);

export const Subscription = model("Subscription", subscriptionSchema);


/*Everytime a user subscribe a user it creates a new document everytime in which subscriber field get the name of user which got subscribed and channel field got the name of user which subscribed the other user for example user "aman" subscribed "all things" so the document formed something like this:
{
    "_id" : ObjectId("..."),
    "subscriber" : ObjectId("all things"),
    "channel" : ObjectId("aman"),
}
    and this operation happen everytime when anyone got  subscribed , so the idea is if we have to find the subscriber of a channel suppose "all things" so we just get count all the document from subscriptions from database where subscriber === "all things" by aggregation pipeline.
*/