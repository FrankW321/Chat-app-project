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
        res.render('private_index', {
            user: {
                username: req.user.username,
                email: req.user.email,
                friends: req.user.friends,
                received_friend_requests: req.user.received_friend_requests,
                sent_friend_requests: req.user.sent_friend_requests
            }
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