const express = require('express')
const {protect,authorize} = require('../middleware/auth')

const { sendReq, acceptRequest } = require('../controllers/friendship');

const router  = express.Router()



router.post('/sendrequest',sendReq)
router.put('/acceptrequest/:requesttoken',acceptRequest)
module.exports = router
