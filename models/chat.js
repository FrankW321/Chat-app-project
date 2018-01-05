const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true},
    msg: {type: String, required: true},
    timestamp: {type: Date, default: Date.now}
})

module.exports = chatSchema