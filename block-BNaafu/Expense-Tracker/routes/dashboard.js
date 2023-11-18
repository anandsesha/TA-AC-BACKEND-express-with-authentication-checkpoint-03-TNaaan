var express = require('express');
var User = require('../models/User');
var router = express.Router();

router.get('/', async (req, res) => {
  res.render('dashboard');
});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

module.exports = router;
