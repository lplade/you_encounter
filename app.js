var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var later = require('later');
var Twit = require('twit');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

// http://bunkat.github.io/later/
later.date.localTime();
var textSched = later.parse.text('every 4 hours');
var timer = later.setInterval(run, textSched);

// https://github.com/ttezel/twit
var t = new Twit({
	consumer_key:         process.env.CONSUMER_KEY,
	consumer_secret:      process.env.CONSUMER_SECRET,
	access_token:         process.env.ACCESS_TOKEN,
	access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
	timeout_ms:           60*1000
});

// this was pretty useful
// http://ursooperduper.github.io/2014/10/28/twitter-bot-with-node-js-part-2.html

// https://github.com/caolan/async#waterfall
run = function() {
	async.waterfall([
			getMonster,
			formatTweet,
			postTweet
		],
		function (err, result) {
			if (err) {
				console.log("There was an error posting to Twitter: ", err);
			} else {
				console.log("Tweet successful!");
				console.log("Tweet: ", result);
			}
		}
	);
};

getMonster = function(callback) {
	//TODO randomly pull an entry from monsters.json
	callback(null, monster);
};

formatTweet = function(monster, callback) {
	message = "You encounter ";
	message += monster;
	callback(null, tweetMessage);
};

postTweet = function(tweetMessage, callback) {
	t.post('statuses/update', { status: tweetMessage }, function(err, data, response) {
		callback(null, result);
	});
};

module.exports = app;
