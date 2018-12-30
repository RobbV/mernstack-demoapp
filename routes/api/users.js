const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcyrpt = require('bcryptjs');

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
  User.findOne({ email: req.body.email }).then(user => {
    // check for the user
    if (user) {
      return res.status(400).json({ email: 'Email  already exists' });
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

// @route    GET api/users/login
// @desc     Login User / returing JWT token
// @access   Public
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // find the user by email

  User.findOne({ email }).then(user => {
    //check for the user
    if (!user) {
      return res.status(404).json({ email: 'User not found' });
    }

    // check the password
    bcyrpt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        res.json({ json: 'success' });
      } else {
        return res.status(400).json({ password: 'Password incorrect' });
      }
    });
  });
});

module.exports = router;
