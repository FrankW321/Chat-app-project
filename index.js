const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');

// Passport and passport HTTP basic auth strategy
var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;	

passport.use(new Strategy(
  function(username, password, cb) {
    if (username === 'test' && password === 'test55958') {
    	return cb(null, username);
    } else {
    	return cb(null, false);
    }
  }
));

// DB connection
var connection = db.connect();

connection.query('SELECT * FROM users WHERE username="John"', function(err, rows, fields) {
	if (err) throw err;

	console.log(rows);
});

connection.end();

/*app.use(express.static('public'));*/

app.get('/', 
	passport.authenticate('basic', { session: false }),
	function(req, res){
	  	res.sendFile(__dirname + '/index.html');
	}
);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

http.listen(5555, function(){
  console.log('listening on *:5555');
});