import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
//method banalam refreshzZZ token er 


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken() //method tai ()
        const refreshToken = user.generateRefreshToken()

        //access toekn to user k die dei, refresh tokwn db te rakhi, jeno user theke 
        user.refreshToken = refreshToken //oobject a value add kore kivabe ? eivabe
        await user.save({ validateBeforeSave: false }) //validation chalale required fied o kick in hoye jabe 

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

/*
const registerUser = asyncHandler( async (req,res)=>{
    return res.status(500).json({   //register a gelam, status 200 & json response ok dekhabe 
        message:"ok"
    })
})

export {registerUser} //yes export deafault dei ni ..

*/
const registerUser = asyncHandler( async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email[]
    // check for images, check for avatar (compulsary image)
    // upload them to cloudinary, avatar 
    // create user object - create entry in db
    // remove password and refresh token field from response (encrypted .. tao send kroa jabe na )
    // check for user creation
    // return res
    const {fullName, email, username, password} = req.body // form, json theke nibo
    //console.log("email:", email); //postman a body or params /form-data
                                    // body/raw/json 


//Validation ..empty nai to?
/*    
if (fullName === ""){
    throw new ApiError(400,"fullName is required")
}
*/

 // sob ek bare check  , map diyeo hoy final return sob check korte hobe
if ([fullName,email,username,password].some((field)=>field?.trim()===""))
 {throw new ApiError(400,"All fields are required")}

 // username already exist kina?                               }
const existedUser = await User.findOne({
    $or: [{username},{email}]
})
if(existedUser){
    throw new ApiError(409, "User with email or username already exists")
}

//check for images, avatar 
//req.body te sob data ashe , middleware dici routes a , tai req. onek extra function dibe 

 const avatarLocalPath = req.files?.avatar[0]?.path;     
//const coverImageLocalPath = req.files?.coverImage[0]?.path;
//const coverImageLocalPath = req.files?.coverImage[0]?.path;
//coverIMage na dile error

let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}
    


if(!avatarLocalPath){
    throw new ApiError(400, "avatar file is required")
}

//upload to cloudinary , 5mb er video, tai async handler lagaicilam upore ...
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)
if (!avatar){           //avatar required, check na kore db fete jabe 
    throw new ApiError(400, "avatar file is required")
}

//object banao, db te entry koro
const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase() //db te sob lowercase rakhte 
} )
const createdUser = await User.findById(user._id).select(   //mongodb creates new _id 
    "-password -refreshToken"    // minus password, rereshtoekn 
)  
if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
}
// return res 
//return res.status(201).json({createdUser}) 
return res.status(201).json(
    new ApiResponse(200,createdUser, "USer Registered successfully")
) 


})


/////////////////////////LOGIN >>>>>>>>>>>>>>>>
const loginUser = asyncHandler(async (req,res)=>{
   //req body theke--> data
   //username or email
   //find the user 
   //password check
   //access & refresh token
   //send cookie
   
   const{email, username, password} = req.body
    if (!(username || email)){
        throw new ApiError(400,"username or password is required")
    }
    //registered hoile login korte parbe 
    //email,username 2tai check
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user){
        throw new ApiError(404,"User doesnot exisr")
    }

    //isPasswordCorrect user.model.js a ami method banaici
    //User. mongoose er 
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid){
        throw new ApiError(401,"Password Incorrect")
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    //user empty refresh token dibe, 
    //object theke update kore dao .or.. database query mere dao...
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//COOKIES
const options = {
    httpOnly: true, //frontend theke modify hobe na , only server
    secure: true
}
return res
.status(200)
.cookie("accessToken",accessToken, options)
.cookie("refreshToken",refreshToken, options)
.json(
    new ApiResponse(
        200, 
        { /// this.data = data (In Api response)... this{inside bracket} is data
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    )
)



})
///// LOGOUT >>> 
//cookies , refresh token out
const logoutUser = asyncHandler(async(req,res) =>{
    // User.findById , id kothay pabo ? email chabo ?
    //middleware : before going meet me
    //req, res ..object e to ... যার ভেতরে cookies( cookie parser use kore), .files(multer er through)
await User.findByIdAndUpdate( //findBy id dile user ano, refresh token delete korte hobe,save koro, validate before false
req.user._id,
{
    //$set:{ //ki ki update korte hobe , bolo
      //  refreshToken: undefined
   //}
   $unset:{ 
       refreshToken: 1  //removes refreshtoken
   }
},

{
    new: true // // return response a new updated value pailam, refresh token db theke out hoilo 
}
) 

const options = {
    httpOnly: true, //frontend theke modify hobe na , only server
    secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200,{},"User logged out successfully "))
})
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //incoming & db te stored refresh token compare

    if (!incomingRefreshToken){
        throw new ApiError(401,"Unauthorizzed Requff0est") 
    }

try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )//deocded token dibe, payload thaktei hobe emon necessary na...
        //refresh token decoded hoye gese, taile refresh token er sob info {access} amar kache thakar kotha ...
        const user = await User.findById(decodedToken?._id)
    
        if (!user){   //user na thakle 
            throw new ApiError(401,"Unauthorizzed Request")
        }
    
        //incoming refresh token ,user jeta pathaise ..
        //decoded refresh token ,,, ekhon 2ta match korate hobe
    if(incomingRefreshToken !== user?.refreshToken ){
        throw new ApiError(401,"Refresh token is expired or used")
    }
    
    //sob verification check hoye gese . new generate kore dao
    //cookies
    const options = {
        httpOnly: true,
        secure: true
    }
    // options likhci ekhon generate 
    const {accessToken, newrefreshToken} = await generateAccessAndRefereshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken: newrefreshToken}, "Access token refreshed"
    
            
        )
    )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
    
}
//refresh token er endpoint banay dicci ..
})

//after subscription.model.js 
// password change mod // logged in verify hobe routes er jWt te  
const changeCurrentPassword = asyncHandler(async(req,res) => {
    const{oldPassword, newPassword} = req.body  /// body theke old password & new tulbo ... user ja input dicce 
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password")
    }
    user.password = newPassword
    //pre jeno validate na kore from user.model.js
    await user.save({validateBeforeSave: false})
    
    return res
    .status(200)
    .json(new ApiResponse(200,{}, "Password changed successfully"))
})

//current user er endpoint banacci  // looged in, current user lagbe ...(simple code)
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user, "current user fetched successfully"))
})

//user nijer ki ki change korte parbe? naam change korbe ... your wish
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body
    // file(image) update alada rakhle valo, network a subidha 

    if(!fullName || !email){ //2tai update
        throw new ApiError(400,"All fields are required")
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {fullName, //Value sets can be attached to parameters of a concurrent program, whereas Lookups can't.
                email: email
            }   // mongoose er set, count, aggragate[js]
        },
        {new: true} //new updated value 
        ).select("-password") //direct password out , db call beche gelo 
        
        return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
    })
//file(image) update : multer, logged in user
const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.files?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate( //reference niye  response 
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            } 
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse( 200, user, "Avatar Image Updated Successfully"))
    
})

// coverImage updte .. .same to same code

const getUserChannelProfile = asyncHandler(async(req,res)=>{
//channel a jete "url" lagbe.. req.params theke pabo url
const {username} = req.params //destructure the username
if(!username?.trim()){
    throw new ApiError(400,"username is missing")
}
// User.find({username}) nibo, then aggregation ...use match
const channel = await User.aggregate([
    {
        $match:{
            username: username?.toLowerCase() //match kortese, tolowercase  na likhleo hobe ( sob username ami lowercase a likhci)
        }
    },
    {
        $lookup: {
            from: "subscriptions", //Subscription --> subscriptions model.js
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    { //ami koyjon k subscribe korci?
        $lookup:{
            from: "subscriptions",  
            localField: "_id",
            foreignField: "subscriber", //from subscription.model.js
            as: "subscribedTo"
        }
    },
    {
        $addFields: {
            subscribersCount:{
                $size: "$subscribers" //field er size
            },
            channelsSubscribedToCount: {
                $size: "$subscribedTo"
            },
            isSubscribed:{ //logged-in-user subscribed kina ? red button 
                $cond: {
                    if:{$in: [req.user?._id, "$subscribers.subscriber"]}, 
                // "in"field er vitor dhuke user k khoje , 1jon subscriber ase
                then: true, //front end true pabe, red button 
                else:false
                }
                
            }
        }
    },
    { //selected jinish projection 
        $project:{
            fullName: 1,
            username: 1, 
            subscribersCount: 1,
            channnelsSubscribedToCount: 1,
            isSubscribed: 1,
            coverImage: 1,
            email: 1, 
        }
    }
])
if(!channel?.length){
    throw new ApiError(404,"Channel doesnot exist")

}

return res
.status(200)
.json(
    new ApiResponse(200, channel[0],   //only 1st channel er index dilam
        "User Channel fetched successfully")
    )
})

//lookup loop for watch history of user 
const getWatchHistory = asyncHandler(async(req,res)=>{
//req.user._id // string pai (objctId)
const user = await User.aggregate ([
    {
        $match: {
            //_id: req.user._id  ... mongoose kaj kore na eikhane , aggreation pipeline 
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $lookup: {
            from: "videos", //video.model.js
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline:[
                {
                //videos theke user a lookup
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {// sob pathabo na , tai project ... owner field er vitor project. 
                            $project: {
                                fullName: 1,
                                username: 1,
                                avatar: 1
                            }

                        }
                    ]
                }

            },{
                //array te first value ber korte hoy (for frontend)
                //frontend  owner. diye sob peye jabe ..
                $addFields: {
                    owner:{
                        $first: "$owner"
                    }
                }
            }
        ]
        }
    }
])

return res
.status(200)
.json(
    new ApiResponse(
        200,
        user[0].watchHistory,"Watch history fetched successfully" 
    )
)

})

export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword, 
    getCurrentUser,
    updateAccountDetails, 
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory
} //yes export deafault dei ni ..
