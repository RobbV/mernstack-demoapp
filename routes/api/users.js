const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcyrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load the user model
const User = require('../../models/Users');

// @route    GET api/users/test
// @desc     GET users route
// @access   Public
router.get('/test', (req, res) =>
  res.json({
    msg: 'users route works!!'
  })
);
// @route    GET api/users/register
// @desc     Register user
// @access   Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    // check for the user
    if (user) {
      errors.email = 'Email already exists, thought you looked familiar!';
      return res.status(400).json(errors);
    } else {
      // check  if te user has a gravatar profile to add aprofile picture
      const avatar = gravatar.url(req.body.email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      //hash the users password
      bcyrpt.genSalt(10, (err, salt) => {
        bcyrpt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route    POST api/users/login
// @desc     Login User / returing JWT token
// @access   Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // find the user by email

  User.findOne({ email }).then(user => {
    //check for the user
    if (!user) {
      errors.email = 'Oops! that is not the correct email address';
      return res.status(404).json(errors);
    }

    // check the password
    bcyrpt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // create JWT token
        // create payload
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };
        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token
            });
          }
        );
      } else {
        errors.password = 'That is not the right password';
        return res.status(400).json(errors);
      }
    });
  });
});

// @route    GET api/users/current
// @desc     return current user
// @access   Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
