const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User= require('../model/Users');
const { unsubscribe } = require('../routes/auth');
const sendEmail = require('../utils/sendEmail.js');
const crypto = require('crypto');
const octokitRequest = require('@octokit/request');
const { match } = require('assert');
const ghAccountExists = require('gh-account-exists');
const { exists } = require('../model/Users');
var gs = require('github-scraper');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { request } = require("@octokit/request");
var http = require('http');
var https = require('https');
const { json } = require('body-parser');
const { google } = require('googleapis');
const { red } = require('colors');
const Users = require('../model/Users');



//@desc    Register User
//@route   POST /api/v1/auth/register
//@access  Public

exports.register = asyncHandler(async(req,res,next)=>{

const{name,email,role}= req.body
const em = await User.findOne({email})



    if(em){
        return next(new ErrorResponse('USer with that email already exists', 404))
    }

    const password = generateString()

    const user = await User.create({
        name,
        email,
        password,
        role
      });

    //Get reset token

   // const resetToken = user.getVerfiyToken()

    await user.save({validateBeforeSave:false})

    // Create reset URL
    const resetURL  = `${req.protocol}://${req.get('host')}/api/v1/auth/login/`
        
    const message = `This is the verification email, to complete registration go to:
     \n${resetURL}\nYour Password is "${password}"`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            message
        })

        res.status(200).json({success:true, data: 'Email sent'})
    } catch (err) {
        console.log(err)
        user.verifToken = undefined
        user.verifTokenExpire= undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorResponse('Email could not be sent', 500))
    }

    sendTokenResponse(user, 200, res);
   
})


//@desc    Login User
//@route   POST /api/v1/auth/Login
//@access  Public

exports.login = asyncHandler(async(req,res,next)=>{

    const{email,password}= req.body

    //Validate email and password
    if(!email||!password){
        return next(new ErrorResponse('Please provide an email and a password', 400))
    }

    //Check for the user

    const user = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorResponse('Invalid email or password', 401))
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password)

    if(!isMatch){
        return next(new ErrorResponse('Invalid email or password', 401))
    }

    sendTokenResponse(user,200,res)
})


//@desc    Get current logged in user
//@route   POST /api/v1/auth/Login
//@access  Private

exports.getMe = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        data:user
    })
})

//@desc    Update user details
//@route   PUT /api/v1/auth/updatedetails
//@access  Private

exports.updateDetails = asyncHandler(async(req,res,next)=>{

    const fieldsToUpdate={
        name:req.body.name,
        email:req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new:true,
        runValidators:true
    })
    
    res.status(200).json({
        success:true,
        data:user
    })
})


//@desc    Update Password
//@route   PUT /api/v1/auth/updatePassword
//@access  Private

// exports.updatePassword = asyncHandler(async(req,res,next)=>{
//     const user = await (await User.findById(req.user.id)).isSelected('+password')

//     //Check current password
//     if(!(await user.matchPassword(req.body.currentPassword))){
//         return next(new ErrorResponse('Password is incorrect', 401))
//     }

//     user.password = req.body.newPassword
//     await user.save()

//     sendTokenResponse(user,200,res)
// })


//@desc    Forgot Password
//@route   POST /api/v1/auth/forgotpassword
//@access  Public

exports.forgotPassword = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email })

    if(!user){
        return next(new ErrorResponse('Theres no user with that email', 404))
    }

    //Get reset token

    const resetToken = user.getResetPasswordToken()

    await user.save({validateBeforeSave:false})

    // Create reset URL
    const resetURL  = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
        
    const message = `Ypu are reciveing this email because you(or someone else)
    has requested the reset of a password. Please make a PUT request 
    to: \n\n${resetURL}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Passwod reset token',
            message
        })

        res.status(200).json({success:true, data: 'Email sent'})
    } catch (err) {
        console.log(err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire= undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorResponse('Email could not be sent', 500))
    }

    res.status(200).json({
        success:true,
        data:user
    })
})

//@desc    Reset Password 
//@route   PUT /api/v1/auth/resetPassword/:resetoken
//@access  Private

exports.resetPassword = asyncHandler(async(req,res,next)=>{
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
     user.password = req.body.password
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

//@desc    Check User Profile
//@route   POST /api/v1/postactivity/:id
//@access  Public
exports.checkProfile = asyncHandler(async(req,res,next)=>{
//     var url = '/arhamfarman' // a random username
//   gs(url, function(err, data) {
//     console.log(data); // or what ever you want to do with the data
//   })
//   requestUserRepos(namer,res,req)
const result = await request("GET /users/arhamfarman");
  
  console.log(`Name:${result.data.name}\nProfile Picutre:${result.data.avatar_url}\nURL:${result.data.url}\nFollowers:${result.data.followers}\n${result.data.following}\n${result.data.gists_url}\n`);
//   console.log(result.data.login)
  res.json(result.data)
  
   })



//@desc    Google Auth
//@route   POST /api/v1/auth googleauth
//@access  Public
exports.googleAuth = asyncHandler(async(req,res,next)=>{

   clientId= process.env.GOOGLE_CLIENT_ID, // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
   clientSecret= process.env.GOOGLE_CLIENT_SECRET, // e.g. _ASDFA%DFASDFASDFASD#FAD-
   redirect= process.env.GOOGLE_REDIRECT_URL
    
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret,redirect)
    var authed = false;

    if (!authed) {
        // Generate an OAuth URL and redirect there
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/gmail.readonly'
        });
        console.log(url)
        res.redirect(url);
    } else {
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        gmail.users.labels.list({
            userId: 'me',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const labels = res.data.labels;
            if (labels.length) {
                console.log('Labels:');
                labels.forEach((label) => {
                    console.log(`- ${label.name}`);
                });
            } else {
                console.log('No labels found.');
            }
        });
        res.send('Logged in')
    }
})

exports.googleCallback = asyncHandler(async(req,res,next)=>{
    clientId= process.env.GOOGLE_CLIENT_ID, // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
    clientSecret= process.env.GOOGLE_CLIENT_SECRET, // e.g. _ASDFA%DFASDFASDFASD#FAD-
    redirect= process.env.GOOGLE_REDIRECT_URL
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirect)
    var authed = false;   
    const code = req.query.code
    if (code) {
        // Get an access token based on our OAuth code
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/')
            }
        });
    }
})



function generateString() {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    length = 10
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result.toString
    return result;
}