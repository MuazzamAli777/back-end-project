import { asyncHandler } from "../utils/Asynchandler.js";
import { apierror } from "../utils/ApiError.js";
import { apiresponse } from "../utils/Apiresponse.js";
import { User } from "../models/user.model.js";
import { uplodoncloudinary } from "../utils/Cloudinary.js";
import fs from "fs";

const registeruser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { fullName, username, email, password } = req.body;

    // validation - not empty
    if (
        [username, fullName, email, password].some((field) => !field || field.trim() === "")
    ) {
        // Clean up uploaded files if validation fails
        if (req.files?.avatar?.[0]?.path) {
            try { fs.unlinkSync(req.files.avatar[0].path); } 

            catch (error) {}
        }
        if (req.files?.coverimage?.[0]?.path) {
            try { fs.unlinkSync(req.files.coverimage[0].path); } 
            
            catch (error) {}
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

            catch (error) {}
        }
        if (req.files?.coverimage?.[0]?.path) {

            try { fs.unlinkSync(req.files.coverimage[0].path); } 
            
            catch (error) {}
        }
        throw new apierror(409, "username or email already exists");
    }

    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    const coverimagelocalpath = req.files?.coverimage?.[0]?.path;

    if (!avatarlocalpath) {
        if (coverimagelocalpath) {
            try { fs.unlinkSync(coverimagelocalpath); } catch (error) {}
        }
        throw new apierror(400, "avatar is required");
    }

    // upload them to cloudinary
    const avatar = await uplodoncloudinary(avatarlocalpath);
    const coverimage = await uplodoncloudinary(coverimagelocalpath);

    if (!avatar) {
        if (coverimagelocalpath) {
            try { fs.unlinkSync(coverimagelocalpath); } catch (error) {}
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

    // remove password and refresh token field from response
    const created_user = await User.findById(user._id).select(
        "-password -refreshtoken"
    );
console.log("mai ho created user :",created_user)
    if (!created_user) {
        throw new apierror(500, "something went wrong while registering the user");
    }

    // return response
    return res.status(201).json(
        new apiresponse(201, created_user, "user registered successfully")
    );
});

export { registeruser };