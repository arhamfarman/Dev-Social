const mongoose = require('mongoose');

const CommentScehma = new mongoose.Schema({
    
    comment:{
        type:String,
        required: [true,'Please add a comment']
    },
    photo:{
        type:String,
        default: 'no-phot.jpg'  
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    post:{
        type:mongoose.Schema.ObjectId,
        ref:'Post',
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'user',
        required:true
    }
})


module.exports=  mongoose.model('Comment', CommentScehma)