const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

router.route('/register')  //no prefix from app.js, so just /register route
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login') //no prefix from app.js, so just /login route
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout) //no prefix from app.js, so just /logout route

module.exports = router;