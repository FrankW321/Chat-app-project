const express = require('express'),
	  bodyParser = require('body-parser'),
	  router = express.Router(),
	  passport = require('passport'),
	  app = express(),
      http = require('http'),
      server = http.createServer(app),
	  io = require('socket.io')(server);
//const server = require('http').Server(app);
//const io = require('socket.io')(router);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


// Passport and passport HTTP basic auth strategy
const Strategy = require('passport-http').BasicStrategy;

passport.use(new Strategy(
  function(username, password, cb) {
    if (username === 'test' && password === 'test55958') {
    	return cb(null, username);
    } else {
    	return cb(null, false);
    }
  }
));

router.get('/', 
	passport.authenticate('basic', { session: false }),
	(req, res) => {
		res.render('pages/index');
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

module.exports = router;