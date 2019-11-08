var log = require('lib/log')(module);
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var config = require('config');
var sessionStore = require('lib/sessionStore');
var User = require('models/user').User;
var HttpError = require('error');

function loadSession(sid){
	return new Promise((resolve, reject)=>{
		sessionStore.load(sid, function(err, session) {
			if (arguments.length == 0) {
				return resolve(null);
			} else {
				return resolve(session);
			}
		});

	});
}

function loadUser(session) {
	return new Promise((resolve, reject) =>{
		if (!session.user) {
			log.debug("Session %s is anonymous", session.id);
			return resolve(null);
		}

		log.debug("retrieving user ", session.user);

		User.findById(session.user, function(err, user) {
			if (err) return reject(err);

			if (!user) {
				return resolve(null);
			}
			log.debug("user findbyId result: " + user);

			resolve(user);
		});

	});
}


module.exports = function(server){
	let io = require('socket.io').listen(server);

	io.use(function(socket, next) {
		let cookies = cookie.parse( socket.handshake.headers.cookie || '');
		let sid = cookieParser.signedCookie( cookies[config.get('session:name')], config.get('session:secret'));

		//console.log(sid);
		loadSession(sid)
			.then((session)=>{
				if (!session) {
					throw new HttpError(401, "No session");
				}

				socket.handshake.session = session;
				socket.handshake.session.id = sid;
				return loadUser(session);
			})
			.then((user)=>{
				if (!user) {
					throw new HttpError(403, "Anonymous session may not connect");
				}

				socket.handshake.user = user;
				//console.log(socket.handshake);
				next();

			})
			.catch((e)=>{
				//console.log(3,e);
				next(e);
			});


	});

	io.sockets.on('session:reload', function(sid) {
		//console.log(321231,sid);
		//var clients = io.sockets.clients();

		//console.log(io.sockets.rooms);
		//console.log(io.sockets.client);
		//console.log(2,io.sockets.clients());
		//console.log(4,io.sockets.connected);
		//console.log(5,io.sockets.sockets);
		let clients = Object.values(io.sockets.connected);


		clients.forEach(function(client) {
			//console.log(111, client.handshake);
			//console.log(222, client.handshake.session.id);
			if (client.handshake.session.id != sid) return;

			loadSession(sid)
				.catch((err)=> {
					client.emit("error", "server error");
					client.disconnect();
					console.log("error");
					return;
				})
				.then((session)=> {
					if (!session){
						client.emit("logout");
						client.disconnect();
						console.log("logout");
						return;
					}
					client.handshake.session = session;
						console.log(session);
				});

		});

	});


	io.on('connection', function(socket){
//console.log(socket.handshake);
    var username = socket.handshake.user.get('username');

    socket.broadcast.emit('join', username);

		socket.on('message', (data, cb)=>{
			socket.broadcast.emit('message', username, data);
      cb && cb(data);
		});

    socket.on('disconnect', function() {
      socket.broadcast.emit('leave', username);
    });

	});

	return io;
}


