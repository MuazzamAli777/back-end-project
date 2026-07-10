

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplodoncloudinary=async (localfilepath)=>{
    try {
         if(!localfilepath) return null;
         const response= await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"

         })
         //file has been upload successfulyy
         console.log("file is uploaded on cloudinary ", response.url)
         fs.unlinkSync(localfilepath)
         return response;
           
        
           
         
    } catch (error) {
        console.error("Cloudinary upload failed:", error)
        try { fs.unlinkSync(localfilepath) } catch (unlinkError) {}

        return null;
        
    }
}
export {uplodoncloudinary}
export default cloudinary;//yah bas check krna k lia rakha tha config hova ya nhi