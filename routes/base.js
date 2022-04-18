const express = require('express');
const router = new express.Router();
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');
const routeGuard = require('./../middleware/routeGuard');
const { route } = require('express/lib/application');

router.get('/', (req, res, next) => {
  res.render('index');
});

// GET - /login - To display the login form
router.get('/login', (req, res, next) => {
  res.render('login');
});

// POST - /login To handle login form submission
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  let user;
  User.findOne({ username })
    .then((doc) => {
      user = doc;
      if (user === null) {
        throw new Error('There is no user with that username');
      } else {
        return bcryptjs.compare(password, user.passwordEncrypted);
      }
    })
    .then((result) => {
      if (result) {
        req.session.userId = user._id;
        res.redirect('/private');
      } else {
        throw new Error('Wrong password');
      }
    })
    .catch((error) => {
      next(error);
    });
});

// GET - /signup To display the sign up form
router.get('/signup', (req, res, next) => {
  res.render('signup');
});

// POST - /signup To jandle sign up form submission
router.post('/signup', (req, res, next) => {
  const { username, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then((passwordEncrypted) => {
      return User.create({
        username,
        passwordEncrypted
      });
    })
    .then((user) => {
      req.session.userId = user._id;
      res.redirect('/private');
    })
    .catch((error) => {
      next(error);
    });
});

// GET - /private To display private page to authenticated users only
router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

// GET /main To display the main page
router.get('/main', routeGuard, (req, res, next) => {
  res.render('main');
});
module.exports = router;
