const express = require('express')

const router = express.Router()

const {createPost} = require('../controllers/activites')


router.route('/')
.post(createPost)

//.post(protect,authorize('publisher','admin'),addCourse)

module.exports = router 