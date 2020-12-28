const express = require('express')
const {protect,authorize} = require('../middleware/auth')

const { sendReq, acceptRequest, getFriends } = require('../controllers/friendship');

const router  = express.Router()

router.route('/:id')
.get(getFriends)

router.post('/sendrequest',sendReq)
router.put('/acceptrequest/:resetToken',acceptRequest)
module.exports = router
