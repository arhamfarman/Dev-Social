const express = require('express') 
const {register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    // updatePassword,
    // regVerification, 
    verifiedLogin,
    checkProfile,
    googleAuth,
    googleCallback
} = require('../controllers/auth')
const {protect}=require('../middleware/auth')
const router = express.Router()

console.log('auth routes 15')
router.post('/register',register)
router.post('/login',login)
router.post('/login/:resetToken/verified',verifiedLogin)
router.get('/me',protect,getMe)
router.put('/updatedetails',protect,updateDetails)
router.post('/forgotpassword',forgotPassword)
// router.put('/updatepassword',protect,updatePassword)
router.get('/profile',checkProfile)
router.put('/resetpassword/:resetToken',resetPassword)
router.get('/googleauth',googleAuth)
router.get('/google/callback',googleCallback)
module.exports = router 