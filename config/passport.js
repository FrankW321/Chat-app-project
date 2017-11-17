const LocalStrategy = require('passport-local').Strategy,
	  User = require('../models/user'),
	  bcrypt = require('bcryptjs')

module.exports = function (passport) {
    passport.use(new LocalStrategy(function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) {
                throw err
            }
            if (!user) {
                console.log('No user found')
                return done(null, false, { message: 'Invalid login credentials' })
            }

            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) {
                    throw err
                }
                if (isMatch) {
                    console.log('password match')
                    return done(null, user)
                } else {
                    console.log('password doesn\'t match')
                    return done(null, false, { message: 'Invalid login credentials' })
                }
            })
        })
    }))

    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user)
        })
    })
}