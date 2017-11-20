const express = require('express'),
      ejs = require('ejs'),
      session = require('express-session'),
      path = require('path'),
	  mongoose = require('mongoose'),
	  passport = require('passport'),
	  LocalStrategy = require('passport-local'),
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
require('./config/passport')(passport)


// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})


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
	    console.log('message: ' + msg)
	    io.emit('chat message', msg)
	})

	socket.on('private message', function(data){
		console.log(users)
	    console.log('Private message: from: ' + users[socket.id].username + ' to: ' + data.recipient + ' msg: ' + data.msg)

	    var recipient_id = Object.keys(users).filter(function(id) {
	    	return users[id].username == data.recipient
	    })

        io.to(recipient_id[0]).emit('private message', {msg: data.msg, from: users[socket.id].username})
	})
})