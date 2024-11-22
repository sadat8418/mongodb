import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {  query, sortBy, sortType, userId } = req.query
   
   //page = 1, limit = 10,
    // const sortCriteria = { [sortField]: parseInt(sortOrder) };
   const sortCriteria = { [sortBy]: parseInt(sortType) };
   const page = 1; // Current page number
   const limit = 10; // Number of documents per page

    console.log(userId, sortBy,sortType, page,query )
   // console.log(req.user?._id)  //works
   //userId lagbe na ,,, login acei 
//TODO: get all videos based on query, sort, pagination
//req.query : Extra bits at the end of a URL (e.g., form inputs, search bar)
const video = await Video.aggregate([ 
    { 
        $match: {
            title: { 
                $regex: query, 
                $options: "i" } // Case-insensitive search
          }

},{
    $sort: sortCriteria
    
    },
    { $skip: (page - 1) * limit }, // Skip documents for previous pages
    { $limit: limit } // Limit the number of documents to page size
      
    
]);
return res
        .status(200)
        .json(new ApiResponse(200, video, "Account details updated successfully"))
 
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    //check for images, avatar 
    //req.body te sob data ashe , middleware dici routes a , tai req. onek extra function dibe 

    const videoFileLocalPath = req.files?.videoFile[0]?.path; //multiple video    
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    //coverIMage na dile error
    
    if(!videoFileLocalPath){
        throw new ApiError(400, "video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail file is required")
    }

    //upload to cloudinary , 5mb er video
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
        throw new ApiError(400, "video thumbnail is required")
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
const createdVideo = await Video.findById(video._id)  //mongodb creates new _id always, even in videos
       
if(!createdVideo){
    throw new ApiError(500,"Something went wrong while uploading the video")
}
    return res.status(201).json(
        new ApiResponse(200,createdVideo, "Video uploaded Successfully")
    )

    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id, //find the video database 
  
    if(!videoId?.trim()){
        throw new ApiError(400,"Could not get url (videoId) of video")
    }

    //console.log(videoId) 
    //videoId === req.video?._id
    const a =  await Video.findById(videoId)
    return res
    .status(200)
    .json(new ApiResponse(200,a,"Got the details of the video"))
})


//text  based data update , multer lage na ..
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id, //find the video database 
  
    if(!videoId?.trim()){
        throw new ApiError(400,"Could not get url (videoId) of video")
    }
    
    const { title,description } = req.body
    const thumbnailLocalPath = req.file?.path //req.file?.path //local hdd theke nilam 
//TODO: delete old image - assignment

//console.log(req.params.file)
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail file is missing")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail.url){
        throw new ApiError(400,"Error while uploading on thumbnail")
    }
   
    
    // update video details like title, description, thumbnail
    // Find and update the video

    const video = await Video.findByIdAndUpdate(
        videoId, //req.video?._id kaj korbe na 
        {
            $set: { 
                title: title,
                description: description,
                thumbnail: thumbnail.url
                
            },
        },
        { new: true } // Return the updated document
    );
    if (!video) {
        return res.status(404).json({ 
            status: 404, 
            message: "Video not found." 
        });
    }
        return res
        .status(200)
        .json(new ApiResponse(200, video, "Video details updated successfully"))
        

})
//file update alada korei rakhte hoy , multer lage
//file(image) update : multer, logged in user

//(dont)  updateVideoThumbnail
const updateVideoThumbnail = asyncHandler(async(req,res)=>{
    
    const thumbnailLocalPath = req.file?.path //req.file?.path //local hdd theke nilam 
//TODO: delete old image - assignment

//console.log(req.params.file)
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Avatar file is missing") //if this comes, postman somossa
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail.url){
        throw new ApiError(400,"Error while uploading on thumbnail")
    }
    const { videoId } = req.params
    
    const video = await Video.findByIdAndUpdate( //reference niye  response 
        videoId,
        {
            $set:{
                thumbnail: thumbnail.url
            } 
        },
        {new:true}
    )

    return res
    .status(200)
    .json(new ApiResponse( 200, video, "Thumbnail Image Updated Successfully"))
    
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId?.trim()){
        throw new ApiError(400,"Could not get url (videoId) of video")
    }

    //console.log(videoId) 
    //videoId === req.video?._id
    const a =  await Video.findOneAndDelete(videoId, {
        projection: { name: 1, email: 1 },
        
      },{new:true})
    return res
    .status(200)
    .json(new ApiResponse(200,a,"Deleted video"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
//kon stage  a ace ? published hoile, unpublished 
const video1 = await Video.findById(videoId)
const isPublished = video1.isPublished
console.log(isPublished)

video1.isPublished = !isPublished

/*
const video = await Video.findByIdAndUpdate({
    videoId,
    $set:{
        isPublished: !isPublished
    } 
},
{new:true}
)
*/
return res
.status(200)
.json(new ApiResponse( 200, video1, "IsPublished Toggled"))


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    updateVideoThumbnail,
    deleteVideo,
    togglePublishStatus
}
