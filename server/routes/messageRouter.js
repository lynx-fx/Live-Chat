const express = require("express")
const router = express.Router();
const messageController = require("../controller/messageController.js")

router.get("/getMessages", messageController.getMessages);
router.post("/sendMessage", messageController.sendMessage);

module.exports = router;