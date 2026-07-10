import { User } from "../models/user.model.js";
import { apierror } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/Asynchandler.js";
import jwt from "jsonwebtoken";


export const verifyJwt =asyncHandler(async(req ,res, next  )=>{
const  token =req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")

if(!token){

    throw new apierror(401,"unauthorized access ")
}

   const decodedjwt=jwt.verify(token, process.env.ACCESS_TOKEN)

   const user = await User.findById(decodedjwt?._id).select("-password -refreshtoken")

   if(!user){

    throw new apierror(401,"invalid access token")
   }

   req.user=user;
   next()
})