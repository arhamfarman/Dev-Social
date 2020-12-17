

const express = require('express') 
const {register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword
} = require('../controllers/auth')
const {protect}=require('../middleware/auth')
const router = express.Router()

console.log('auth routes 15')

router.post('/register',register)
router.post('/login',login)
router.get('/me',protect,getMe)
router.put('/updatedetails',protect,updateDetails)
router.post('/forgotpassword',forgotPassword)
// router.put('/updatepassword',protect,updatePassword)
router.put('/resetpassword/:resetToken',resetPassword)
module.exports = router 