var express = require('express');
const { session } = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session, req.user);
  res.send('in user router');
});

module.exports = router;
