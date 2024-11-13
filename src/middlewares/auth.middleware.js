import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";
//MIDDLEWARE banaci LOGOT Korte
export const verifyJWT = asyncHandler(async(req,_,next)=>{
    // cookies a acesstoken nao thakte pare, user custom header send kortese keu  (AUTH BEARER)
    const token = req.cookies?.accessToken || req.header //why not refresh token ?  next video .. front end 
    ("Authorization")?.replace("Bearer","") //(AUTH BEARER)
   
    if(!token){
        throw new ApiError(401,"Unauthorized request")
    }
    //verify hoile decoded info peye jabo [user.model.js]
    //without secret key you cannot verify 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    //id paici, password & refreshToken lagbe na ..
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken") //[user.model.js er _id theke astese] 

    try {
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        //user paici e paici
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }


})