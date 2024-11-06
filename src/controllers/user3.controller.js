import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
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
export {registerUser} //yes export deafault dei ni ..
