import {async_handler} from '../utils/async_handler.js'
import {ApiError} from '../utils/api-error.js'
import {user} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/api-response.js'

/*
get user res from frontend
validation -not empty
check if user already exists
check for images, check for avatar
upload them to cloudinary, avatar
create user object - create entry in db
remove pass and refresh token field from res
check for user creation
return res
*/

const registeruser = async_handler(async (req, res)=>{
   const {fullname, email, username, password} = req.body
   // console.log('email', email)

   if([fullname, email, username, password].some((field)=>field?.trim()==='')){
      throw new ApiError(400, 'All Fields are required.')
   }

   const existeduser = await user.findOne({
      $or: [{username},{email}]
   })

   if (existeduser) {
      throw new ApiError(409, 'User with Email or username already exists.')
   }

   const avatarLocalPath = req.files?.avatar[0]?.path
   let cvimgLocalPath
   if(req.files && Array.isArray(req.files.coverimage)&& req.files.coverimage.length>0){
      cvimgLocalPath = req.files.coverimage[0].path
   }
   // const cvimgLocalPath = req.files?.coverimage[0]?.path

   if (!avatarLocalPath) {
      throw new ApiError(400, 'Avatar image is required.')
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverimage = await uploadOnCloudinary(cvimgLocalPath)

   if (!avatar){
      throw new ApiError(400, 'Avatar image is required.')
   }

   const User = await user.create({
      fullname, 
      avatar: avatar.url, 
      coverimage: coverimage?.url || '',
      email,
      password,
      username: username.toLowerCase()
   })

   const created_user = await user.findById(User._id).select('-password -refreshToken')
   
   if(!created_user){
      throw new ApiError(500,'something went wrong while registering the user')
   }
   
   return res.status(201).json(
      new ApiResponse(200, created_user, 'user registered successfully.')
   )
})
export {registeruser}