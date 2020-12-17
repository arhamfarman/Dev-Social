const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Comment = require('../model/comments');



//@desc    Post  Add friends
//@route   GET /api/v1/friends/addFriend
//@access Public

exports.addFriends = asyncHandler(async(req,res,next)=>{
// app.post("/addFriend", function(req, res) {
    var conditions = {
        $or: [
            {$and: [
                {username: req.body.globalUserName},
                {$or: [
                    {'pendingFriends._id': {$ne: req.user._id}},
                    {'friends._id': {$ne: req.user._id}}
                ]}
            ]},
            {$and: [
                {username: req.user.username},
                {$or: [
                    {'pendingFriends._id': {$ne: req.body.globalUserId}},
                    {'friends._id': {$ne: req.body.globalUserId}}
                ]}
            ]}
        ]
    }
    var update = {
        $addToSet: {pendingFriends: { _id: req.user._id, username: req.user.username}}
    }
    
    User.findOneAndUpdate(conditions, update, function(error, doc) {
            if(error) {
                console.log(currentTime + " - FRIEND_REQUEST_SEND_ERROR: '" + req.user.username + "' TRIED TO SEND A FRIEND REQUEST TO '" + req.body.globalUserName + "'");
            }
            else {
                console.log(currentTime + " - FRIEND_REQUEST_SENT: '" + req.user.username + "' SENT A FRIEND REQUEST TO '" + req.body.globalUserName + "'");
            }
            res.redirect("/talk");
        });
    });

//@desc    Get  Find Friends
//@route   GET /api/v1/comment/search/:id
//@access Public

exports.findFriends = asyncHandler(async(req,res,next)=>{
    const comment = await Comment.findById(req.params.id).populate({
        path:'post',
        select:'comment'
    })
 
    if(!comment){
        return next(new ErrorResponse(`No comment found`,404))
    }
      res.status(200).json({
          success:true,
          data:comment
      })
 })