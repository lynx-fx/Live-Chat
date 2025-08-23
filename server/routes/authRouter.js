const express = require("express");
const router = express.Router();
const authContoller = require("../controller/authController.js");

router.get("/login", authContoller.login);

module.exports = router;