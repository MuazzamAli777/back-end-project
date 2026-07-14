import {Router} from "express";
import { registeruser ,login_user,logout_user,accesstoken_through_refreshtoken,changepassword, updateavatar, updatecoverimage,getWatchHistory,getcurrentuser,getuserchannelprofile,useraccountupdate} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js" 

import { verifyJwt } from "../middlewares/auth.middleware.js";
const router =Router()

router.route("/register").post(

    upload.fields([

        {
           name:"avatar",
           maxCount:1 
        },
        {
            name:"coverimage",
           maxCount:1 

        }
    ])
    ,
    registeruser
)

router.route("/login").post(login_user)
router.route("/logout").post(verifyJwt,logout_user)

router.route("/refreshtoken").post(accesstoken_through_refreshtoken)


router.route("/change-password").post(verifyJwt, changepassword)
router.route("/current-user").get(verifyJwt, getcurrentuser)
router.route("/update-account").patch(verifyJwt, useraccountupdate)

router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateavatar)
router.route("/cover-image").patch(verifyJwt, upload.single("coverimage"),updatecoverimage)

router.route("/c/:username").get(verifyJwt, getuserchannelprofile)
router.route("/history").get(verifyJwt, getWatchHistory)



export {router};