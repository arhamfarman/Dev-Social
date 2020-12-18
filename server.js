const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan  = require('morgan')
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db')
const colors = require('colors'); 
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const app = express();


//Route Files
const activitiesPost = require('./routes/activityPost')
const auth =  require('./routes/auth')
const friends = require('./routes/friends')
const comment =  require('./routes/comments')

// //Body Parser
app.use(express.json())

// // Cookie Parser
app.use(cookieParser())


//Load the env variables

dotenv.config({path:'./config/config.env'})

// Connect to database
connectDB();



//Dev Logging middleware
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

//file uploading
app.use(fileUpload())


//Set static folder
app.use(express.static(path.join(__dirname,'public')))


//Mount Routes
app.use('/api/v1/postactivity',activitiesPost)
app.use('/api/v1/comment',comment)
app.use('/api/v1/friends',friends)
app.use('/api/v1/auth',auth)


//Error Handler
app.use(errorHandler)

const PORT =  process.env.PORT || 9000;

const server = app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));


// handle Unhandled Promise rejections

process.on('unhandleRejection',(err, promise)=>{
    console.log(`Error ${err.message}`.red)
    //close server and exit process
    server.close(()=>process.exit(1))
})