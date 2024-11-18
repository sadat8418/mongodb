import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
   
    
    //check for images, avatar 
    //req.body te sob data ashe , middleware dici routes a , tai req. onek extra function dibe 
    

    const videoFileLocalPath = req.files?.videoFile[0]?.path;     
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    //coverIMage na dile error
    
    if(!videoFileLocalPath){
        throw new ApiError(400, "video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail file is required")
    }
    
    //upload to cloudinary , 5mb er video, tai async handler lagaicilam upore ...
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    /*
    console.log(videoFile);
    {
        asset_id: '2108d4ddcb971d44f82d1eba6f18a02c',
        public_id: 'rsubdubhwodmzibivbau',
        version: 1731965281,
        version_id: '3365ba02ef571b3b10f4738cf62fd280',
        signature: '32e8b0064bc045b00378d71d2dc3050ab5a1fc58',
        width: 720,
        height: 1280,
        format: 'mp4',
        resource_type: 'video',
        created_at: '2024-11-18T21:28:01Z',
        tags: [],
        pages: 0,
        bytes: 2762462,
        type: 'upload',
        etag: 'caf32928932a1755fc7769c83831f4c9',
        placeholder: false,
        url: 'http://res.cloudinary.com/dxp8wcym3/video/upload/v1731965281/rsubdubhwodmzibivbau.mp4',
        secure_url: 'https://res.cloudinary.com/dxp8wcym3/video/upload/v1731965281/rsubdubhwodmzibivbau.mp4',
        playback_url: 'https://res.cloudinary.com/dxp8wcym3/video/upload/sp_auto/v1731965281/rsubdubhwodmzibivbau.m3u8',
        asset_folder: '',
        display_name: 'rsubdubhwodmzibivbau',
        audio: {
          codec: 'aac',
          bit_rate: '79561',
          frequency: 44100,
          channels: 2,
          channel_layout: 'stereo'
        },
        video: {
          pix_format: 'yuv420p',
          codec: 'h264',
          level: 31,
          profile: 'High',
          bit_rate: '323459',
          time_base: '1/25037'
        },
        is_audio: false,
        frame_rate: 25.037,
        bit_rate: 405875,
        duration: 54.449388,
        rotation: 0,
        original_filename: 'WhatsApp Video 2024-11-17 at 3.37.30 PM',
        nb_frames: 1353,
        api_key: '499631238322686'
      }
    */
      
    if (!videoFile){           //avatar required, check na kore db fete jabe 
        throw new ApiError(400, "video file is required")
    }
    if (!thumbnail){           //avatar required, check na kore db fete jabe 
        throw new ApiError(400, "video file is required")
    }

    //user registered, object banao, db te entry koro
const video = await Video.create({
    title,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url ,
    description,
    isPublished: true,
    duration: videoFile.duration,
    owner: req.user?._id,
} )

//sob video url postman a dekhabe ..
const createdVideo = await Video.findById(video._id).select(   //mongodb creates new _id always, even in videos
    "-password -refreshToken"    // minus password, rereshtoekn 
)  
if(!createdVideo){
    throw new ApiError(500,"Something went wrong while registering the user")
}
    return res.status(201).json(
        new ApiResponse(200,createdVideo, "Video upoaded Successfully")
    )

    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    //database e find
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
