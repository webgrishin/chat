var express = require('express');
var http = require('http');
var path = require('path');
var config = require('config');
var log = require('lib/log')(module);
var logger = require('morgan');
var HttpError = require('error');
var cookieParser = require('cookie-parser');
const session = require('express-session');

var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'template'));
app.set('view engine', 'ejs');

if (app.get('env') === 'development'){
	app.use(logger('dev'));
}else{
	app.use(logger('default'));
}


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(session({
	secret: config.get('session:secret'),
	name:   config.get('session:name'),
	resave: false,
	saveUninitialized: true,
	store: require('lib/sessionStore')
  })
);

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));

var indexRouter = require('routes/index');
app.use( indexRouter );

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
	console.log(123123, err);
  if (typeof err == 'number') { // next(404);
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  }else {
      log.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  
});

var errorhandler = require('errorhandler');
if (app.get('env') == 'development') {
  app.use(errorhandler());
}

let server = http.createServer(app);
server.listen(config.get('port'), function(){
  log.info('Express server listening on port ' + config.get('port'));
});

let io = require('socket')(server);
app.set('io', io);
