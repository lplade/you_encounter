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
//var users = require('./routes/users');

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
//app.use('/users', users);

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

module.exports = app;

// *** END WEB SERVER ROUTING ***

// Main twitterbot logic -- split into own file?

//TODO store/retrieve data in MongoDB

// const for non-event "error"
var SILENCE = "SILENCE";

//Pull in array of monsters
var monsterObj = require('./monsters.json');

//Prototype for monster object
//This helps the code inspector understand object properties
//http://stackoverflow.com/questions/5873624/parse-json-string-into-a-particular-object-prototype-in-javascript
function Mobj(obj) {
	this.quantity = 1;
	this.monster = "normal man";
	for (var prop in obj) {
		this[prop] = obj[prop]; //hasOwnProperty needed?
	}
}

// Set up chron to fire every 4 hours
// http://bunkat.github.io/later/
later.date.localTime();
//TODO set this as an env var
var textSched = later.parse.text('every 4 hours'); //production rate
//var textSched = later.parse.text('every 15 minutes'); //demo rate
//var textSched = later.parse.text('every 10 seconds'); //better for testing
var timer = later.setInterval(run, textSched);

// Instantiate Twitter keys
// https://github.com/ttezel/twit
var t = new Twit({
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET,
	timeout_ms: 60 * 1000
});

// this was pretty useful
// http://ursooperduper.github.io/2014/10/28/twitter-bot-with-node-js-part-2.html

// Waterfall halts if any function fails
// https://github.com/caolan/async#waterfall
function run() {
	async.waterfall([
			encounterCheck,
			getMonster,
			formatTweet,
			postTweet
		],
		function (err, result) {
			if (err) {
				if (err == SILENCE){
					console.info(".");
				} else {
					console.warn("There was an error posting to Twitter: ", err);
				}
			} else if (result) {
				console.log("Tweet successful!");
				console.log("Tweet: ", result);
			}
		}
	);
}

function encounterCheck(callback) {
	randRoll = Math.floor(Math.random() * 10); //random integer 0-9
	if (randRoll == 0) {
		console.log("Go!");
		callback(null); // proceed with Tweet generation
	} else {
		callback(SILENCE);
	}
}

function getMonster(callback) {
	//TODO randomly pull an entry from monsters.json
	//http://stackoverflow.com/questions/10011011/using-node-js-how-do-i-read-a-json-object-into-server-memory
	console.log("Get monster function");
	//http://stackoverflow.com/questions/4550505/getting-random-value-from-an-array
	var randMonster = function () { //closure so it doesn't re-use "random" number
		return monsterObj[Math.floor(Math.random() * monsterObj.length)];
	}();
	var monster = new Mobj(randMonster);
	callback(null, monster);
}

function formatTweet(monst, callback) {
	var article = "";
	var firstLetter;
	var isVowel = false;
	console.log("Format tweet function");
	console.log("Building " + monst.monster);
	//Part 1: Verb
	message = "You encounter ";
	//TODO check if .quanity and .monster are available?
	//Part 2: Group name, quantity, or article
	if (monst.quantity == 1) {
		firstLetter = monst.monster.substring(0, 1).toUpperCase();
		//http://stackoverflow.com/questions/26926994/javascript-check-if-character-is-a-vowel
		isVowel = firstLetter == "A" ||
			firstLetter == "E" ||
			firstLetter == "I" ||
			firstLetter == "O" ||
			firstLetter == "U";
		article = isVowel ? "an " : "a ";
		message += article;
	} else if (Number.isInteger(monst.quantity)) {
		//TODO convert low-value integers to number words
		numString = " " + monst.quantity + " ";
		message += numString;
	} else if (monst.quantity.substring(0, 1) == '%') {
		//TODO use % to signify a random range expression i.e. %2d4
		//TODO figure out how to handle plurals
		throw "Not ready yet";
	} else {
		// Just use whatever content is, plus appropriate article
		firstLetter = monst.monster.substring(0, 1).toUpperCase();
		//http://stackoverflow.com/questions/26926994/javascript-check-if-character-is-a-vowel
		isVowel = firstLetter == "A" ||
			firstLetter == "E" ||
			firstLetter == "I" ||
			firstLetter == "O" ||
			firstLetter == "U";
		article = isVowel ? "an " : "a ";
		message += article;
		message += monst.quantity;
		message += ' ';
	}
	//Part 3: the actual monster name
	message += monst.monster;
	console.log("'" + message + "'");
	callback(null, message);
}

function postTweet(tweetMessage, callback) {
	t.post('statuses/update', {status: tweetMessage}, function (err, data, response) {
		callback(null, tweetMessage);
	});
}

