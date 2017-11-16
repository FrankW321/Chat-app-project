const passport = require('passport')


function initUser (app) {
  app.get('/', renderWelcome)
}

function renderWelcome (req, res) {
  //res.render('landing_page/private/index')
  res.render('landing_page/public')
}


/*io.socket.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});*/

/*module.exports = function(io) {
  io.sockets.on('connection', function() {
    console.log('Connection on socket.io on socket');
    // .. do stuff 
  });
};*/

/*exports = module.exports = function(io){
  io.sockets.on('connection', function (socket) {
    socket.on('file1Event', function () {
      console.log('file1Event triggered');
    });
  });
}*/

module.exports = initUser