import { asyncHandler } from "../utils/Asynchandler.js";
import { apierror } from "../utils/ApiError.js";
import { apiresponse } from "../utils/Apiresponse.js";
import { User } from "../models/user.model.js";
import { uplodoncloudinary } from "../utils/Cloudinary.js";
import fs from "fs";
import { secureHeapUsed } from "crypto";
import jwt from "jsonwebtoken";

const registeruser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { fullName, username, email, password } = req.body;

    // validation - not empty
    if (
        [username, fullName, email, password].some((field) => !field || field.trim() === "")
    )
     {
        // Clean up uploaded files if validation fails
        if (req.files?.avatar?.[0]?.path) {

            try { fs.unlinkSync(req.files.avatar[0].path); }

            catch (error) { }
        }
        if (req.files?.coverimage?.[0]?.path) {
            try { fs.unlinkSync(req.files.coverimage[0].path); }

            catch (error) { }
        }
        throw new apierror(400, "all fields are required");
    }

    // check if user already exists
    const exiting_user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (exiting_user) {
        // Clean up uploaded files if user exists
        if (req.files?.avatar?.[0]?.path) {

            try { fs.unlinkSync(req.files.avatar[0].path); }

            catch (error) { }
        }
        if (req.files?.coverimage?.[0]?.path) {

            try { fs.unlinkSync(req.files.coverimage[0].path); }

            catch (error) { }
        }
        throw new apierror(409, "username or email already exists");
    }

    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    const coverimagelocalpath = req.files?.coverimage?.[0]?.path;

    if (!avatarlocalpath) {
        if (coverimagelocalpath) {
            try { fs.unlinkSync(coverimagelocalpath); } catch (error) { }
        }
        throw new apierror(400, "avatar is required");
    }

    // upload them to cloudinary
    const avatar = await uplodoncloudinary(avatarlocalpath);
    const coverimage = await uplodoncloudinary(coverimagelocalpath);

    if (!avatar) {
        if (coverimagelocalpath) {
            try { fs.unlinkSync(coverimagelocalpath); } catch (error) { }
        }
        throw new apierror(400, "avatar file upload failed");
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // remove password and refresh token field from db to show in console and apiresponse
    const created_user = await User.findById(user._id).select(
        "-password -refreshtoken"
    );

    console.log("mai ho created user :", created_user)

    if (!created_user) {
        throw new apierror(500, "something went wrong while registering the user");
    }

    // return response
    return res.status(201).json(
        new apiresponse(201, created_user, "user registered successfully")
    );
});










const genrateaccessandrefereshtoken = async (user_id) => {
    try {
        const user = await User.findById(user_id)

        const access_token = await user.generateAccessToken()
        const refresh_token = await user.generateRefreshToken()

        user.refreshtoken = refresh_token //override ki yaha 

        await user.save({
            validateBeforeSave: false
        });

        return { access_token, refresh_token }

    } catch (error) {
        throw new apierror(500, "something went wrong during while generating access and referesh token ")
    }
}


const login_user = asyncHandler(async (req, res) => {
    // req.body ->data
    //username email
    //check 
    //password 
    //access and refresh token
    //cookie 
    //response
    const { username, password, email } = req.body

    if (!(username || email)) {
        throw new apierror(404, "username or email are required ")

    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new apierror(404, "user is not found ")
    }

    const ispasswordvalid = await user.isPasswordCorrect(password)

    if (!ispasswordvalid) {
        throw new apierror(400, "password is invalid ")
    }

    const { access_token, refresh_token } = await genrateaccessandrefereshtoken(user._id)

    const logged_in = await User.findById(user._id).select("-password -refreshtoken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accesstoken", access_token, options)
        .cookie("refreshtoken", refresh_token, options)
        .json(
            new apiresponse(
                200,
                {
                    user: logged_in,
                    access_token,
                    refresh_token
                },
                "User logged in successfully"
            )
        );

})

const logout_user = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshtoken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accesstoken", options)
        .clearCookie("refreshtoken", options)
        .json(
            new apiresponse(200, {}, "User logout successfully")
        );

})

 const accesstoken_through_refreshtoken=asyncHandler(async(req,res)=>{


   const incoming_refreshtoken= req.cookies.refreshtoken || req.body.refreshtoken  //yah browser frontend wala ha 

   if (!incoming_refreshtoken){

    throw new apierror(401,"unauthorized request0")
   }
try 

{  
    // yah incoming_refreshtoken ha na yah abhi encoded ha matlb vkjhdanhfvdiuhnsg k formate mai isko decode karna like 
    // const decodedtoken  = {
//     _id: "687abc123",
//     iat: 1750000000,
//     exp: 1750864000
// }  islia jwt.verify use kiya 
    
       const decodedtoken=jwt.verify(
        incoming_refreshtoken,
        process.env.REFRESH_TOKEN
       )
    
       const user = await User.findById(decodedtoken?._id)
    
       if(!user){
    
        throw new  apierror(401,"invalid refresh token")
       }
    
             if(incoming_refreshtoken !== user?.refreshtoken)
             {
                throw new apierror("refresh token are expired")
             }
    
              const options={
                httpOnly:true,
                secure:true
              }
    
              const {access_token,newrefresh_token} =await genrateaccessandrefereshtoken(user._id)
     
        
            return res
            .status(200)
            .cookie("accesstoken", access_token, options)
            .cookie("refreshtoken", newrefresh_token, options)
            .json(
                new ApiResponse(
                    200, 
                    {accesstoken :access_token,
                        refreshtoken: newrefresh_token},
                    "Access token refreshed"
                )
            )
} catch (error) {

    throw new ApiError(401, error?.message || "Invalid refresh token")
    
}

 })

 const changepassword  =asyncHandler(async(req,res)=>{
            
    const {oldpassword,newpassword }=req.body

         const user =await   User.findById(res.user?._id)

         if(!user){
            throw new apierror(401,"unauthorized access ")
         }

         const passwordcheck= await user.isPasswordCorrect(oldpassword)

         if (!passwordcheck){
            throw new apierror(400,"password is incorrect")
         }

         user.password=newpassword 
         user.save({
            validateBeforeSave:false
         }) //yah ab jay ga userschema.pre("save") pay
        return res.status(200)
        .json(
            new ApiResponse(
                200,{

                },
                "password successfully changed "
            )

        )
 })

 const getcurrentuser=asyncHandler(async(req,res)=>{

    const user =User.findById(req.user?._id)
    return res
    .status(200)
    .json(new apiresponse (200,user,"current user fetch successfuly ")

)
 })

 const useraccountupdate=asyncHandler(async(req,res)=>{
    const {fullName,username}=req.body

    if(!fullName || !username){
        throw new apierror(404,"fullname and username are required ")

    } 

    const user =await User.findByIdAndUpdate(req.user?._id,{
        $set:{
fullName,
username
        }

    },{
        new:true  
    }

)
.select(" -password -refreshtoken")

return res
.status(201).json(
    new apiresponse(201,user,"account update successfulyy ")
)

 })

 const updateavatar=asyncHandler(async(req,res)=>{

    const avatarlocalpath=req.file?.path 

    if(!avatarlocalpath){
        throw apierror(400,"avatarlocalpath is not preset ")

    }

    const avatar =await uplodoncloudinary(avatarlocalpath)

    if(!avatar)
    {
        throw new apierror(400,"avatar is not uploaded on cloudinary ")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
         set:{
            avatar:avatar.url
         }

        },{
            new:true 
        }
    ).select("-password -refreshtoken")

 })

 
 const updatecoverimage=asyncHandler(async(req,res)=>{

    const coverimagelocalpath=req.file?.path 

    if(!coverimagelocalpath){
        throw apierror(400,"coverimage is not preset ")

    }

    const coverimage =await uplodoncloudinary(coverimagelocalpath)

    if(!coverimage)
    {
        throw new apierror(400,"coverimage is not uploaded on cloudinary ")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
         set:{
            coverimage:coverimage.url
         }

        },{
            new:true 
        }
    ).select("-password -refreshtoken")

 })



export { login_user, logout_user,accesstoken_through_refreshtoken ,changepassword,updateavatar,updatecoverimage}
export { registeruser };