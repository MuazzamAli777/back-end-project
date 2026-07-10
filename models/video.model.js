import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videschema= new Schema({

    videfile:{
        type:String,// cloudanairy sy lana
        required:true,
    },
    thumbnail:{
 type:String,// cloudanairy sy lana
        required:true,

    },
     title:{
 type:String,
        required:true,

    },
     desciption:{
 type:String,
        required:true,

    },
    duration:{
type:Number,
required:true
    },
    views:{
        type:Number,
        default:0
    },
    ispublish:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    
    }



})

videschema.plugin(mongooseAggregatePaginate)

export const video =mongoose.model("Video",videschema)