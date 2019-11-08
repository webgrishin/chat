var User = require('models/user').User;
var HttpError = require('error');
var AuthError = require('models/user').AuthError;
//var async = require('async');

exports.get = function(req, res) {
  res.render('login');
};

exports.post = function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

	User.authorize(username, password)
		.then((user)=>{
			req.session.user = user._id;
			//console.log(req.session);
			res.send({});

		})
		.catch(function(err) {
			if (err instanceof AuthError) {
				return next(new HttpError(403, err.message));
			} else {
				return next(err);
			}
		});
};
