var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {title: 'You encounter...'});
});

//TODO show some behind the scenes check info
//TODO authenticate user
//TODO allow add/remove/edit database entries

module.exports = router;
