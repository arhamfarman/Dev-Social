const express = require('express')
const {protect,authorize} = require('../middleware/auth')
const { addComment, getOneComment, updateComment, deleteComment } = require('../controllers/comments');

const router  = express.Router({ mergeParams : true});


router.route('/')
.post(protect,authorize('publisher','admin'),addComment)

router.route('/:id')
.get(getOneComment)
.put(protect,authorize('publisher','admin'),updateComment)
.delete(protect,authorize('publisher','admin'),deleteComment )

module.exports = router