const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Comment = require('../model/comments');
const User = require('../model/Users');
const { use } = require('../routes/comments');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail')


//@desc    Send Request to a User
//@route   POST /api/v1/postactivity/:postId/sendrequest
//@access Private

//@desc    Forgot Password
//@route   POST /api/v1/friends/sendrequest
//@access  Public

exports.sendReq = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email })

    if(!user){
        return next(new ErrorResponse('Theres no user with that email', 404))
    }

    //Get reset token

    const requestToken = user.getResetPasswordToken()

    await user.save({validateBeforeSave:false})

    // Create reset URL
    const requestURL  = `${req.protocol}://${req.get('host')}/api/v1/friends/acceptrequest/${requestToken}`
        
    const message = `I want to be friends with you. Please make a PUT request to check my invite
    to: \n\n${requestURL}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Friend Request',
            message
        })

        res.status(200).json({success:true, data: 'Email sent'})
    } catch (err) {
        console.log(err)
        // user.resetPasswordToken = undefined
        // user.resetPasswordExpire= undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorResponse('Request email could not be sent', 500))
    }

    res.status(200).json({
        success:true,
        data:user
    })
})



//@desc    Reset Password 
//@route   PUT /api/v1/auth/resetPassword/:resetoken
//@access  Private

exports.acceptRequest = asyncHandler(async(req,res,next)=>{
    //Get hashed token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex')


    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt: Date.now() }
    })
    if(!user){
        return next(new ErrorResponse('Invalid token', 400))
    }

    //Set the new password
     user.status = req.body.status
     user.resetPasswordToken=undefined
     user.resetPasswordExpire=undefined
     await user.save()

    sendTokenResponse(user, 200, res)
})






//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res)=>{
    //Create Token
    const token = user.getSignedJwtTokens()

    const options = {
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    }
    if (process.env.NODE_ENV==='production') {
        options.secure=true
    }
    res
    .status(statusCode)
    .cookie('token', token,options)
    .json({
        success:true,
        token
    })
}

 // Post request to an ID  POST
 // ID recieves the request GET
 // ID Accepts or Rejects the request POST
 //Web Sockets

 
