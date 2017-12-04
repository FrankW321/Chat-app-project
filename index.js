const express = require('express'),
      ejs = require('ejs'),
      session = require('express-session'),
      path = require('path'),
	  mongoose = require('mongoose'),
	  passport = require('passport'),
	  LocalStrategy = require('passport-local'),
	  bCrypt = require('bcryptjs')
	  indexRoutes = require('./controllers/index'),
	  app = express(),
	  port = 5555,
	  server = require('http').Server(app),
	  io = require('socket.io')(server, {wsEngine: 'ws'})	// temporarily set websocket engine to ws from default uws beacause of a segmantation fault


// Mongodb database connection
const mongoDB = 'mongodb://localhost/chat'
mongoose.Promise = global.Promise
mongoose.connect(mongoDB, {
	useMongoClient: true
})

let db = mongoose.connection

db.once('open', function() {
    console.log('Connected to database')
})

const User = require('./models/user')


app.set('view engine', 'ejs')
ejs.delimiter = '$'

app.use(express.static('public'))

app.use(session({
    secret: 'session secret',
    resave: true,
    saveUninitialized: true
}))

app.use(require('connect-flash')())
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res)
    next()
})


// Passport config

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport/init')(passport)


app.use('/', indexRoutes)


// Start server
server.listen(port, function (err) {
	if (err) {
		throw err
	} else {
		console.log(`Listening on port ${port}`)
	}
})



/*
	Socket.io
*/

var users = {}

io.on('connection', function (socket) {
	console.log('User connected')

	socket.on('connected', function(data) {
		users[data.id] = {'username': data.username}
		console.log(users)
	})

	socket.on('disconnect', function() {
	    console.log('user disconnected')
	    delete users[socket.id]
	})

	socket.on('join', function (data) {
		var sending_user = users[socket.id].username
		var receiving_user = data.username

		if (sending_user < receiving_user) {
			socket.join(sending_user + '_-_' + receiving_user)		// socket.io room
			console.log('Created room: ' + sending_user + '_-_' + receiving_user)
		} else {
			socket.join(receiving_user + '_-_' + sending_user)		// socket.io room
			console.log('Created room: ' + receiving_user + '_-_' + sending_user)
		}

		socket.to(data.username).emit('chat message', 'hello')
	})

	socket.on('leave', function (data) {
		socket.leave(data.username)		// socket.io room
		console.log('Left room: ' + data.username)
	})

	socket.on('chat message', function(msg){
	    var unix_epoch = Date.now()
	    io.emit('chat message', {msg: msg, date: unix_epoch})
	})

	socket.on('private message', function(data){
	    console.log('Private message: from: ' + users[socket.id].username + ' to: ' + data.recipient + ' msg: ' + data.msg)

	    var unix_epoch = Date.now()

	    var recipient_id = Object.keys(users).filter(function(id) {
	    	return users[id].username == data.recipient
	    })

        io.to(recipient_id[0]).emit('private message', {msg: data.msg, from: users[socket.id].username, date: unix_epoch})
	})


	socket.on('update_user_data', (newUser) => {
		if (newUser.new_password_1 !== newUser.new_password_2) {
			feedback('New passwords don\'t match')
			return
		}

		User.findOne({username: newUser.username}, function(err, user) {
			if (err) {
				feedback({failure: true, feedback: 'error'})
				return
			}

			if (newUser.username !== users[socket.id].username && user) {
				feedback({failure: true, feedback: 'Username is already taken'})
				return
			}


			User.findOne({username: users[socket.id].username}, function(err, user) {
				if (err) {
					feedback({failure: true, feedback: 'error'})
					return
				}

				if (user) {
					if (!bCrypt.compareSync(newUser.password, user.password)) {
						feedback({failure: true, feedback: 'Password incorrect'})
						return
					}


					if (user.username != newUser.username && newUser.email) {
						user.username = newUser.username
					}

					if (user.email != newUser.email && newUser.email) {
						user.email = newUser.email
					}

					if (newUser.new_password_1 && newUser.new_password_2) {
						user.password = bCrypt.hashSync(newUser.new_password_1, bCrypt.genSaltSync(10), null)
					}

					user.save(function (err) {
						if(err) {
							feedback({failure: true, feedback: 'error'})
						} else {
							feedback({failure: false, feedback: 'Updated'})
						}
					})
				} else {
					feedback({failure: true, feedback: 'error'})
				}
				
			})
		})

		function feedback(message) {
			socket.emit('feedback', message)
		}	
	})



	socket.on('search_users', (search_term) => {
		if (search_term == '') return


		/* Retrieve only usernames starting with the search term and
		don't include current user in the results */
		User.find({ $and: [
				{username: new RegExp('^' + search_term, 'i')},
				{username: { $ne: users[socket.id].username }} 
			]}, 'username -_id', function (err, found_users) {

		        if (err) return handleError(err)

		        found_users = found_users.map(function (obj) {
		        	return obj.username
		        })

		        io.to(socket.id).emit('search_results', found_users)
		    }
	    ).limit(5)
	})


	socket.on('friend_request', (recipient) => {
		User.findOne({username: users[socket.id].username}, function(err, user) {
			if (err) {
				// To-do error msg
				return
			}

			if (user) {
				if (user.received_friend_requests.indexOf(recipient) !== -1) {
					accept_friend_request(recipient)
				} else {
					User.update({ username: recipient }, { $addToSet: { received_friend_requests: users[socket.id].username } }, function(err, raw) {
						if (err) return handleError(err)
						io.to(socket.id).emit('friend_request_feedback', {nModified: raw.nModified, recipient: recipient})
					})

					User.update({ username: users[socket.id].username }, { $addToSet: { sent_friend_requests: recipient } }, function(err, raw) {
						if (err) return handleError(err)
					})
				}
			} else {
				// To-do error msg				
			}
		})
	})


	socket.on('accept_friend_request', (friend) => {
		accept_friend_request(friend)
	})

	function accept_friend_request(friend) {
		User.update({ username: users[socket.id].username }, { $addToSet: { friends: friend }, $pull: {received_friend_requests: friend, sent_friend_requests: friend} }, function(err, raw) {
			if (err) return handleError(err)
			io.to(socket.id).emit('friend_request_feedback', {nModified: raw.nModified, recipient: friend})
			console.log(raw)
		})

		User.update({ username: friend }, { $addToSet: { friends: users[socket.id].username }, $pull: {received_friend_requests: users[socket.id].username, sent_friend_requests: users[socket.id].username} }, function(err, raw) {
			if (err) return handleError(err)
			console.log(raw)
		})
	}

	socket.on('decline_friend_request', (contact) => {
		User.update({ username: users[socket.id].username }, { $pull: {received_friend_requests: contact} }, function(err, raw) {
			if (err) return handleError(err)
			io.to(socket.id).emit('friend_request_feedback', {nModified: raw.nModified, recipient: contact})
			console.log(raw)
		})
	})
	
})