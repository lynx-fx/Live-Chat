const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");

router.get("/getUserDetails", userController.getUserDetails)
router.post("/handleFriends", userController.handleFriends)

module.exports = router;

// Maybe I should have gone with modular approach in the handle friends. Using post for all kinda feels wrong