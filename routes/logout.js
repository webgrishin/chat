exports.post = function(req, res, next) {
	var sid = req.session.id; // Это метод getter, его не видно
	console.log(0,sid);
  //var userId = req.session.user;
	//console.log(0,req.session);

  var io = req.app.get('io');
  req.session.destroy(function(err) {
		io.sockets._events["session:reload"](sid);
		//io.sockets._events["session:reload"](userId);
    if (err) return next(err);

		res.redirect('/');
  })
};
