const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../..//validation/education');

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

// @route    GET api/profile/all
// @desc     GET all profiles
// @access   Public

router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles';
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no users' }));
});

// @route    GET api/profile/handle/:handle
// @desc     GET profile by handle
// @access   Public

router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this users';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route    GET api/profile/user/:user_id
// @desc     GET profile by user ID
// @access   Public

router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this users';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: 'there is no profile for this user' })
    );
});

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

// @route    POST api/profile/experince
// @desc     POST Add experience to profile
// @access   Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check if the input is valid
    if (!isValid) {
      // return any errors with 400 status
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to experience array

      profile.experience.unshift(newExp);

      // update the profile in the db
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route    POST api/profile/education
// @desc     POST Add education to profile
// @access   Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check if the input is valid
    if (!isValid) {
      // return any errors with 400 status
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to experience array

      profile.education.unshift(newEdu);

      // update the profile in the db
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route    DELETE api/profile/experince/:exp_id
// @desc     DELETE experince
// @access   Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // splice out od  array
        profile.experience.splice(removeIndex, 1);

        // Save and update
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     DELETE education
// @access   Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // splice out od  array
        profile.education.splice(removeIndex, 1);

        // Save and update
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route    DELETE api/profile
// @desc     DELETE user and profile
// @access   Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
