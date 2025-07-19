import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelprofile, getWatchHistory, loginuser, logoutUser, refreshAccessToken, registeruser, updateAccount, updateAvatar, updateCover } from "../controllers/user.controller.js";
import {upload}  from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route('/register').post(
   upload.fields([
      {
         name: 'avatar',
         maxCount: 1
      },
      {
         name: 'coverimage',
         maxCount: 1
      }
   ]),
   registeruser,
)
router.route('/login').post(loginuser)
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account-details').patch(verifyJWT, updateAccount)
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar)
router.route('/update-cover-image').patch(verifyJWT, upload.single('coverimage'), updateCover)
router.route('/c/:username').get(verifyJWT, getUserChannelprofile)
router.route('/history').get(verifyJWT, getWatchHistory)

export default router