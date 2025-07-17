import { ApiError } from "../utils/api-error.js";
import { async_handler } from "../utils/async_handler.js";
import jwt from 'jsonwebtoken'
import { user } from "../models/user.model.js";



export const verifyJWT = async_handler(async (req, res, next)=>{
   try{
   const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')
   if(!token){
      throw new ApiError(401, 'Unauthoized Request')
   }
   const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
   const User = await user.findById(decoded_token?._id).select('-password -refreshToken')
   if(!User){
      throw new ApiError(401, 'invalid access token')
   }
   req.User = User
   next()
}
catch(error){
   throw new ApiError(401, error?.message || 'invalid access token')
}
})