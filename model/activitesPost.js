const mongoose = require('mongoose');
// const slugify = require('slugify');
// const geocoder = require('../utils/geocoder')

const PostSchema = new mongoose.Schema({
   
    // @ Title of Psot
    title:{
        type: String,
        required:[true,'Please add a title'],
        unique:true,
        trim:true,
        maxlength:[30,'Title cannot be more than 3a0 characetrs']
    },
    // slug:String,

    // @ Post full Descritpion
    description:{
        type: String,
        required:[true,'Please add a description'],
        unique:true,
        trim:true,
        maxlength:[3000,'Post cannot be more than 3000 characetrs']
    },

    //@ Optional User add photo
    photo:{
        type:String,
        default: 'no-phot.jpg'  
    },

    //@ Time of the post created
    createdAt:{
        type:Date,
        default:Date.now
    },

    //@ User who made the post
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
    
})

// //Create bootcamo slug for the name
// BootcampSchema.pre('save',function(next) {
//     this.slug = slugify(this.name,{lower:true})
//     console.log('Slugiy Ran',this.name)
//     next()
// })

// GEO-CODE Creat Location field

// BootcampSchema.pre('save', async function (next) {
//     const loc = await geocoder.geocode(this.address)
//     this.location = {
//         type: 'Point',
//         coordinates:[loc[0].longitude, loc[0].latitude],
//         formattedAddress: loc[0].formattedAddress,
//         street:loc[0].street,
//         city:loc[0].city,
//         state:loc[0].stateCode,
//         zipcode:loc[0].zipcode,
//         country:loc[0].countryCode
//     }

//     //Do not save address in DB
//     this.address = undefined

//     next()
// })

//Cascade delete courses when a bootcamp is deleted
// BootcampSchema.pre('remove',async function(next){
//     console.log(`courses being removed from bootcamp ${this._id}`)
//     await this.model('Course').deleteMany({bootcamp:this._id})
//     next()
// })


// //Reverse populae with virtuals
// BootcampSchema.virtual('courses',{
//     ref: 'Course',
//     localField:'_id',
//     foreignField: 'bootcamp',
//     justOne: false
// })

module.exports = mongoose.model('Post',PostSchema) 