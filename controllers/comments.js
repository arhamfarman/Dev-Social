const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Comment = require('../model/comments');
const Post = require('../model/activitesPost');
const { post } = require('../routes/comments');



//@desc    Get  Single Comment
//@route   GET /api/v1/comment/:id
//@access Public

exports.getOneComment = asyncHandler(async(req,res,next)=>{
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

 //@desc    Add a comment
//@route   POST /api/v1/postactivity/:postId/comment
//@access Private

exports.addComment = asyncHandler(async(req,res,next)=>{
    
    req.body.post = req.params.postID;
    req.body.user = req.user.id;
    
    const post = await Post.findById(req.params.postID)
 
    if (!post) {
        return next(
          new ErrorResponse(`No Post with the id of ${req.params.postID}`),
          404
        );
      }

       //Make sure user is the comment maker
       if(post.user.toString()!==req.user.id&& req.user.role!=='admin'){
        return next(
            new ErrorResponse(`User with he id of ${req.user.id} is not authorized to add a comment to post ${post._id}`,401)
        )
    }
 
    const comment = await Comment.create(req.body)
      res.status(200).json({
          success:true,
          data:comment
      })
 })


 //@desc    Update a comment
//@route   PUT /api/v1/comment/:id
//@access Private

exports.updateComment = asyncHandler(async(req,res,next)=>{
    
    let comment = await Comment.findById(req.params.id)
 
    if (!comment) {
        return next(
          new ErrorResponse(`No comment found `),
          404
        );
      }
        //Make sure user is the course owner
        if(postt.user.toString()!==req.user.id&& req.user.role!=='admin'){
            return next(
                new ErrorResponse(`User with he id of ${req.user.id} is not authorized to update the course ${comment._id}`,401)
            )
        }
     comment = await Comment.findByIdAndUpdate(req.params.id, req.body,{
         new:true,
         runValidators:true
     })
      res.status(200).json({
          success:true,
          data:comment
      })
 })


 //@desc    Delete a comment
//@route   PUT /api/v1/comment/:id
//@access Private

exports.deleteComment = asyncHandler(async(req,res,next)=>{
    
    const comment = await Comment.findById(req.params.id)
 
    if (!comment) {
        return next(
          new ErrorResponse(`No comment found `),
          404
        );
      }
        //Make sure user is the course owner
        if(postt.user.toString()!==req.user.id&& req.user.role!=='admin'){
            return next(
                new ErrorResponse(`User with he id of ${req.user.id} is not authorized to delete the coomment`,401)
            )
        }
   await comment.remove()
      res.status(200).json({
          success:true,
          data:{}
      })
 })
