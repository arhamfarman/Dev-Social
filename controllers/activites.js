const path = require('path')
const Post = require('../model/activitesPost')
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../model/Users') 
var gs = require('github-scraper');

// @desc    Create a Post
// @route   Post /api/v1/activites/post
// @access  Public

exports.createPost = asyncHandler(async (req, res, next) => {

    // Add user to req,body
    console.log('errer1')
    req.body.user = req.user.id;
    console.log('errer2')
    const post= await Post.create(req.body);
    
    res.status(201).json({
      success: true,
      data: post
    });
  });

  
// @desc    Get  Single Post
// @route   GET /api/v1/poatactivity/:id
// @access  Public
exports.getOnePost = asyncHandler(async(req,res,next)=>{
  const post = await Post.findById(req.params.id)

  if(!post){ 
   return   next(new ErrorResponse(`No Post found `,404))
  }
  res.status(200).json({success:true,data:post})   
})




//@desc    Update a Post
//@route   PUT /api/v1/postactivity/:id
//@access  Public
exports.updatePost = asyncHandler(async(req,res,next)=>{
  let post = await Post.findById(req.params.id)

  if(!post){
      // return res.status(400).json({success:false})
      return   next(new ErrorResponse(`Post not found with he id of ${req.params.id}`,404))
  }
  
//Make sure user is the bootcamp owner
if(post.user.toString()!==req.user.id&& req.user.role!=='admin'){
  return next(
      new ErrorResponse(`User with he id of ${req.params.id} is not authorized to update the post`,401)
  )
}

post = await Post.findOneAndUpdate(req.params.id,req.body,{
  new: true,
  runValidators:true
})
res.status(200).json({success:true,data:post})
})





//@desc    Delete  Posts
//@route   DELETE /api/v1/postactivity/:id
//@access  Public
exports.deletePosts = asyncHandler(async(req,res,next)=>{

 const post = await Post.findById(req.params.id)
 
 if(!post){
     return res.status(400).json({success:false})
 }

 //Make sure user is the bootcamp owner
 if(post.user.toString()!==req.user.id&& req.user.role!=='admin'){
  return next(
      new ErrorResponse(`User with he id of ${req.params.id} is not authorized to delete the post`
      ,401)
  )
}
 post.remove()
 res.status(200).json({success:true,data:post})

})

//@desc    Upload photo for Post
//@route   DELETE /api/v1/postactivity/:id/photo
//@access  Private
exports.postPhotoUpload= asyncHandler(async(req,res,next)=>{

const post = await Post.findById(req.params.id)

if(!post){
  return   next(new ErrorResponse(`Post not found with he id of ${req.params.id}`,404))
}

 //Make sure user is the bootcamp owner
 if(post.user.toString()!==req.user.id&& req.user.role!=='admin'){
  return next(
      new ErrorResponse(`User with he id of ${req.params.id} is not authorized to update the post`,401)
  )
}


if(!req.files){
  return   next(new ErrorResponse(`Please upload files`,400))
}

console.log(req.files)
const file = req.files.file

//Making sure that image is a photo
if(!file.mimetype.startsWith('image')){
  return   next(new ErrorResponse(`Please upload an image file`,400))
}

//Check file size
if(file.size>process.env.MAX_FILE_UPLOAD){
  return   next(
      new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,400))
}

//Create custom filename
file.name = `photo_${post._id}${path.parse(file.name).ext}`
file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
  if(err){
      console.error(err)
      new ErrorResponse(`Problem with file upoad ${process.env.MAX_FILE_UPLOAD}`,500)
  }

  await Post.findByIdAndUpdate(req.params.id,{photo:file.name})

  res.status(200).json({
      success:true,
      data:file.name
  })
})
})


