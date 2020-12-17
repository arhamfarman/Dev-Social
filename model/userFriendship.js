const crypto = require('crypto')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


var FriendRequestSchema = new mongoose.Schema({
    requester: {
        type: int,
        required: true
    },
    recipient: {
        type: int,
        required: true
    },
    status: 
    {
    type: int,
    required: true
} });

module.exports = mongoose.model('Friends',FriendRequestSchema)