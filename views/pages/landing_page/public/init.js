const passport = require('passport')

function initLanding (app) {
  //app.get('/', renderWelcome)
  app.post('/', catchAuthentication)

}

function catchAuthentication () {
	console.log(post)
	passport.authenticate('local', { failureRedirect: '/' }),
	function(req, res) {
		res.redirect('/')
	}
}

module.exports = initLanding