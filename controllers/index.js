const express = require('express'),
      exphbs = require('express-handlebars'),
      bodyParser = require('body-parser'),
      path = require('path'),
      passport = require('passport'),
      app = express(),
      router = express.Router(),
      bcrypt = require('bcryptjs'),
      User = require('../models/user'),
      mongoose = require('mongoose'),
      Schema = mongoose.Schema


router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())


function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    } else {
        req.flash('failure', 'Please login')
        return res.redirect('/login')
    }
}

// Don't look down, it's really ugly down there
router.get('/', (req, res) => {
    if (req.user) {
        let friends,
            received_friend_requests,
            sent_friend_requests

        let friends_ids = req.user.friends.map(function (obj) {
            return obj.id
        })

        User.find({ _id: {$in: friends_ids} }, 'username').exec().then(function (found_users) {

            // Combine friends' ids and usernames into array of objects
            friends = found_users.map(function (obj) {
                return {
                    id: obj.id,
                    username: obj.username
                }
            })
        }).then(function() {
            // Add chat ID to friends array of objects
            for (var i = 0; i < friends.length; i++) {
                var result = req.user.friends.findIndex(function(obj) {
                    return obj.id == friends[i].id
                })

                if (result !== -1) {
                    friends[i].chat = req.user.friends[result].chat
                }
            }

            /*for (var i = 0; i < friends.length; i++) {
                const chatSchema = mongoose.Schema({
                    from: {type: String, required: true},
                    msg: {type: String, required: true},
                    date: {type: String, required: true}
                })

                if (typeof chat == 'undefined') {
                    chat = mongoose.model(friends[i].chat, chatSchema)
                }
                console.log(i)
                chat.find({}, {_id: 0}).sort({ date: -1 }).limit(1).then(function(message) {

                    //console.log(chat.modelName)
                    friend = friends.findIndex(function(obj) {
                        console.log(obj.chat)
                        console.log(chat.modelName)
                        obj.chat == chat.modelName
                    })

                    console.log(friend)

                    friend.last_msg = {
                        from: message[0].from,
                        msg: message[0].msg,
                        date: message[0].date
                    }

                }).catch(function(err) {
                    if (err) return handleError(err)
                })
            }*/
        }).then(function() {

            User.find({ _id: {$in: req.user.received_friend_requests} }, 'username', function (err, found_users) {

                if (err) return handleError(err)


                received_friend_requests = found_users.map(function (obj) {
                    return {
                        id: obj.id,
                        username: obj.username
                    }
                })

                User.find({ _id: {$in: req.user.sent_friend_requests} }, 'username', function (err, found_users) {

                    if (err) return handleError(err)

                    sent_friend_requests = found_users.map(function (obj) {
                        return {
                            id: obj.id,
                            username: obj.username
                        }
                    })

                    res.render('private_index', {
                        user: {
                            id: req.user._id,
                            username: req.user.username,
                            email: req.user.email,
                            friends: friends,
                            received_friend_requests: received_friend_requests,
                            sent_friend_requests: sent_friend_requests
                        }
                    })
                })
            })
        }).catch(function(err) {
            if (err) return handleError(err)
        })

    } else {
      res.render('index')
    }
})

router.post('/', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash : true  
}));

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'You\'ve successfully logged out')
    return res.redirect('/')
})

router.get('/register', (req, res) => {
    res.render('register')
})


router.post('/register', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/register',
    failureFlash : true  
}));


module.exports = router