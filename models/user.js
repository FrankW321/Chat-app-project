const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},

    received_friend_requests: {type: Array},
    sent_friend_requests: {type: Array},
    friends: {type: Array}
})

module.exports = mongoose.model('User', userSchema)