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
      User.find({}, 'username', function (err, users) {
        if (err) return handleError(err)

        var usernames = []

        for (var i = 0; i < users.length; i++) {
          if (users[i].username != req.user.username) {
            usernames.push({
              username: users[i].username
            })
          }
        }
        users = JSON.stringify(usernames)
        res.render('private_index', {username: req.user.username, email: req.user.email, users: usernames})
      })

    } else {
      res.render('index')
    }
})

/*router.post('/', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next)
})*/

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

/*router.post('/register', (req, res) => {
    console.log('POST')
    let username = req.body.username
    let password = req.body.password
    let password2 = req.body.password2


    console.log('Username: '+ username +' password'+ password)

    User.findOne({ username: username}, function (err, doc) {
        if (err) return handleError(err)
        
        if (doc == null) {
            return null
        } else {
            error = 1
        }
    })

    console.log(error)
    if (error) {
        req.flash('failure', 'Username already exists, biatch!')
        return res.redirect('/register')
    }

    if (password !== password2) {
    	req.flash('failure', 'Passwords don\'t match!')
    	return res.redirect('/register')
    }

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
                    console.log(err)
                    return res.redirect('/register')
                }
                return res.redirect('/')
            })
        })
    })
})*/


module.exports = router