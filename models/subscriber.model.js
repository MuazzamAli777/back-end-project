import mongoose, { Schema } from "mongoose"

const subscribeschema= new Schema({

    subsciber:{
        type:Schema.Types.ObjectId,// one who is subcribing 
        ref:"User"
    },

        channel:{
        type:Schema.Types.ObjectId,// one who is subcribing channel
        ref:"User"
    },
    


}, {timestamps:true})


export const subscription =mongoose.model("Subscription",subscribeschema)