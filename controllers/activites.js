const Post = require('../model/activitesPost')
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');



//@desc    Create a Post
//@route   Post /api/v1/activites/post
//@access  Public
exports.createPost = asyncHandler(async (req,res,next)=>{
    //Add user to reqbody
    req.body.user = req.user.id
    const post = await Post.create(req.body)
    res.status(201).json({
        success:true,
        data:post
    })
})






//@desc    Upload photo for User
//@route   POST /api/v1/activites/:id/photo
//@access  Private
exports.bootcampPhotoUpload= asyncHandler(async(req,res,next)=>{
   
    const bootcamp = await Bootcamp.findById(req.params.id)
    
    if(!bootcamp){
        return   next(new ErrorResponse(`Bootcamp not found with he id of ${req.params.id}`,404))
    }

       //Make sure user is the bootcamp owner
       if(bootcamp.user.toString()!==req.user.id&& req.user.role!=='admin'){
        return next(
            new ErrorResponse(`User with he id of ${req.params.id} is not authorized to update the bootcamp`,401)
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
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
        if(err){
            console.error(err)
            new ErrorResponse(`Problem with file upoad ${process.env.MAX_FILE_UPLOAD}`,500)
        }

        await Bootcamp.findByIdAndUpdate(req.params.id,{photo:file.name})

        res.status(200).json({
            success:true,
            data:file.name
        })
    })
})