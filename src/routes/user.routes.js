import {Router} from "express";
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar 
}  from "../controllers/user3.controller.js"; 
//emon import tokhon e nite johon export default na ...
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(
    upload.fields([//images send korte parbo //upload is a middleware 
    {
        name:"avatar",
        maxCount: 1

    },
    {
        name: "coverImage",
        maxCount: 1
    }
]),
registerUser
)  ///register hit hoile tokhon  method call korbo, naile kisui korbo na

router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(verifyJWT, logoutUser) // verify korbo, [next] logoutUser run 
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails) 

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) //upload (multer)
//router.route("/cover-Image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

//req.params theke nile problem ....
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router //yes default export, app.js a icca moto naam deya jabe 

//verify JWT [user.routes]  --> auth.middleware.js ===> cookies/ auth theke token nao , verify hoile req.user[user info sob add] add koro & next 
//now [user.controller.js] ahs access req.user._id 