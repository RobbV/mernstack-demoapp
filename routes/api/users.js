const express = require("express");
const router = express.Router();

// @route    GET api/users/test
// @desc     GET users route
// @access   Public
router.get("/test", (req, res) =>
  res.json({
    msg: "users route works!!"
  })
);

module.exports = router;