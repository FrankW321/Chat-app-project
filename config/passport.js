const LocalStrategy = require('passport-local').Strategy,
	  User = require('../models/user'),
	  bcrypt = require('bcryptjs')

module.exports = function (passport) {
    passport.use(new LocalStrategy(function (username, password, done) {
        User.findOne({ email: username }, function (err, user) {
            if (err) {
                throw err
            }
            if (!user) {
                return done(null, false, { message: 'No user found' })
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
                    return done(null, false, { message: 'Wrong password' })
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