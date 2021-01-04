const express = require('express')
const Comment = require('./comments');
const router = express.Router()
const commentRouter = require('./comments')

const {createPost,getOnePost, updatePost, deletePosts, postPhotoUpload} = require('../controllers/activites')
const {protect, authorize}=  require('../middleware/auth');


router.use('/:postID/comment',commentRouter)


router.route('/').post(protect,authorize('publisher','admin'),createPost)

router.route('/:id')
.put(protect,authorize('publisher','admin'),updatePost)
.delete(protect,authorize('publisher','admin'),deletePosts)
.get(protect,authorize('publisher','admin'),getOnePost)



router.route('/:id/photo').put(protect,authorize('publisher','admin'),postPhotoUpload)

module.exports = router 