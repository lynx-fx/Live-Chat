const express = require("express")
const router = express.Router();
const messageController = require("../controller/messageController.js")

router.get("/getMessages", messageController.getMessages);
router.get("/getLastMessages", messageController.getLastMessages);
router.post("/sendMessage", messageController.sendMessage);

module.exports = router;