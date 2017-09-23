/* Change file name to db.js */
module.exports = {
  connect: function () {
    var mysql = require('mysql');
	var connection = mysql.createConnection({
		host	: 'localhost',
		user	: '', // DB User
		password: '', // DB Password
		database: ''  // DB name
	});

	connection.connect();

	return connection;
  }
};