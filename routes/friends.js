const express = require('express')
const {protect,authorize} = require('../middleware/auth')

const { addFriends } = require('../controllers/friendship');


const router  = express.Router({ mergeParams : true});


router.route('/addFriend')
.post(protect,authorize('publisher','admin'),addFriends)

module.exports = router