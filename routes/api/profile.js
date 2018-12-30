const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');

// load profile model
const Profile = require('../../models/Profile');
//load user model
const User = require('../../models/Users');

// @route    GET api/profile/test
// @desc     GET profile route
// @access   Public
router.get('/test', (req, res) =>
  res.json({
    msg: 'Profile route works!!'
  })
);

// @route    GET api/profile
// @desc     GET current users profile
// @access   Private

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // initailize  errors object to store any errors that are throw
    const errors = {};

    // find  the users profile
    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'There is no profile for this user';
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);
// @route    POST api/profile
// @desc     POST create or update users profile
// @access   Private

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // get the input data from the body
    //initialize an empty user profile object
    const profileFields = {};
    // pass the user to the object
    profileFields.user = req.user.id;
    const { errors, isValid } = validateProfileInput(req.body);
    //check  validation
    if (!isValid) {
      // Return any errors to the users
      return res.status(400).json(errors);
    }
    // pass the form data to to the profileFields object
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.bodylocation;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }
    // social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    // check the DB for a user profile
    Profile.findOne({ user: req.user.id }).then(profile => {
      // if there is  a profile then update
      if (profile) {
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // if there is no existing profile found then create a new one and save to the DB
        // Check to see if there is an exsiting handle
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = 'sorry that handle already exists';
            res.status(400).json(errors);
          }

          //Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);
module.exports = router;
