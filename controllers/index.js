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
        req.flash('danger', 'Please login')
        return res.redirect('/login')
    }
}


router.get('/', (req, res) => {
    /**
     * Vaate "renderdamine", ehk parsitakse EJS süntaks HTML-iks kokku
     * ning saadetakse kliendile, kes selle päringu teostas (ehk kes sellele URL-ile läks)
    */
    if (req.user) {
      res.render('private_index', {username: req.user.username})
    } else {
      res.render('index')
    }
})

router.post('/', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'You\'ve successfully logged out')
    return res.redirect('/')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let password2 = req.body.password2

    console.log(username)
    console.log(password)

    let newUser = new User({
        username: username,
        password: password
    });

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            if(err) {
                console.log(err)
                return res.redirect('/register')
            }

            newUser.password = hash
            newUser.save(function(err) {
                if(err) {
                    console.log(err);
                    return res.redirect('/register')
                }
                return res.redirect('/')
            })
        })
    })
})


module.exports = router