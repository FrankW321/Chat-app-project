const express = require('express'),
      exphbs = require('express-handlebars'),
      bodyParser = require('body-parser'),
      path = require('path'),
      passport = require('passport'),
      app = express(),
      router = express.Router(),
      bcrypt = require('bcryptjs'),
      User = require('../models/user')

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


router.get('/', (req, res) => {
    if (req.user) {
        let friends,
              received_friend_requests,
              sent_friend_requests

        User.find({ _id: {$in: req.user.friends} }, 'username', function (err, found_users) {

            if (err) return handleError(err)

            friends = found_users.map(function (obj) {
                return {
                    id: obj.id,
                    username: obj.username
                }
            })

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

                    console.log(received_friend_requests)


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