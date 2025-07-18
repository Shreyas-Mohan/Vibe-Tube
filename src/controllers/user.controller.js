import {async_handler} from '../utils/async_handler.js'
import {ApiError} from '../utils/api-error.js'
import {user} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/api-response.js'
import jwt from 'jsonwebtoken'
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

const generateAccessAndRefreshToken = async(userId)=>{
   try {
      const User = await user.findById(userId)
      const accessToken = User.generateAccessToken()
      const refreshToken = User.generateRefreshToken()
      User.refreshToken = refreshToken
      await User.save({validateBeforeSave: false})
      return {accessToken, refreshToken}
   } catch (error) {
      throw new ApiError(500, 'Something went wrong while generating refresh and access token')
   }
}

const loginuser = async_handler(async (req, res)=>{
   const {email, username, password} = req.body
   if(!(username || email)){
      throw new ApiError(400, 'Username or email is required.')
   }
   const User = await user.findOne({$or: [{username}, {email}]})
   if (!User){
      throw new ApiError(404, 'User not found')
   }
   const isPassValid = await User.isPasswordCorrect(password)
   if (!isPassValid){
      throw new ApiError(401, 'Invalid user credentials')
   }
   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(User._id)
   const loggedInUser = await user.findById(User._id).select('-password -refreshToken')
   const options ={httpOnly: true, secure: true}
   return res
   .status(200)
   .cookie('accessToken', accessToken, options)
   .cookie('refreshToken', refreshToken, options)
   .json(new ApiResponse(200, 
      {
         User: loggedInUser, accessToken, refreshToken
      }, 'user logged in successfully'
   ))
})

const logoutUser = async_handler(async(req, res)=>{
   await user.findByIdAndUpdate(req.User._id,
      {
         $set:{refreshToken: undefined}
      },
      {new: true}
   )
   const options = {httpOnly: true, secure: true}
   return res
   .status(200)
   .clearCookie('accessToken', options)
   .clearCookie('refreshToken', options)
   .json(new ApiResponse(200, {}, 'user logged out.'))
})

const refreshAccessToken = async_handler(async(req,res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken){
      throw new ApiError(401, 'unauthorized request')
   }
   try {
      const decoded_token = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
      const User = await user.findById(decoded_token?._id)
      if(!User){
         throw new ApiError(401, 'invalid refresh token')
      }
      if(incomingRefreshToken != User?.refreshToken){
         throw new ApiError(401, 'invalid refresh token')
      }
      const options = {httpOnly: true, secure: true}
      const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
      return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(new ApiResponse(200, {accessToken, newRefreshToken}, 'access token refreshed'))
   } catch (error) {
      throw new ApiError(401, error?.message || 'invalid refresh token')
   }
})

const changeCurrentPassword = async_handler(async(req, res)=>{
   const {oldPass, newPass, confPass} = req.body
   if(!(newPass===confPass)){
      throw new ApiError(400, 'password does not match')
   }
   const User = await user.findById(req.User?._id)
   const isPassCorrect = User.isPasswordCorrect(oldPass)
   if(!isPassCorrect){
      throw new ApiError(400, 'paassword is not corect')
   }
   User.password = newPass
   await User.save({validateBeforeSave: false})
   return res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully.'))
   
})

const getCurrentUser = async_handler(async (req, res)=>{
   return res.status(200).json(new ApiResponse(200, req.User, 'current user fetched successfully'))
})

const updateAccount = async_handler(async(req, res)=>{
   const {fullname, email} = req.body
   if(!fullname || !email){
      throw new ApiError('all fields are required')
   }
   const User = user.findByIdAndUpdate(
      req.User?._id, 
      {$set:{fullname, email}}, 
      {new: true}
   ).select('-password')
   return res.status(200).json(new ApiResponse(200, User, 'account details updated successfully'))
})

const updateAvatar = async_handler(async (req, res)=>{
   const avatarLocalPath = req.file?.path
   if(!avatarLocalPath){
      throw new ApiError(400, 'avatar file is missing')
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   if(!avatar){
      throw new ApiError(400, 'error while uploading avatar')
   }
   const User = await user.findByIdAndUpdate(
      req.User?._id, 
      {$set: {avatar: avatar.url}}, 
      {new: true}).select('-password')
      return res.status(200).json(new ApiResponse(200, User, 'avatar updated sucessfully'))
})

const updateCover = async_handler(async (req, res)=>{
   const cvimgLocalPath = req.file?.path
   if(!avatarLocalPath){
      throw new ApiError(400, 'avatar file is missing')
   }
   const coverimage = await uploadOnCloudinary(cvimgLocalPath)
   if(!coverimage){
      throw new ApiError(400, 'error while uploading cover image')
   }
   const User = await user.findByIdAndUpdate(
      req.User?._id, 
      {$set: {coverimage: coverimage.url}}, 
      {new: true}).select('-password')
      return res.status(200).json(new ApiResponse(200, User, 'Cover Image updated sucessfully'))
})

export {registeruser, loginuser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccount, updateAvatar, updateCover}