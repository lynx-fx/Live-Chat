const jwt = require("jsonwebtoken");

const User = require("../model/userModel");
const Message = require("../model/messageModel.js");

const { tokenExtractor } = require("../util/tokenExtractor.js");
const { encryptMessage, decryptMessage } = require("../util/encryption.js");

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const token = tokenExtractor(req);
    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "No token provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res
        .status(404)
        .json({ success: false, message: "Friend not found" });
    }

    const encrypt = encryptMessage(content, process.env.ENCRYPTION_SECRET);

    const newMessage = new Message({
      sender: user.id,
      receiver: receiverId,
      content: encrypt,
      hasReceiverSeen: false,
      hasSenderSeen: true,
    });
    await newMessage.save();

    const messageObj = newMessage.toObject();
    messageObj.content = decryptMessage(encrypt, process.env.ENCRYPTION_SECRET);
    return res.status(200).json({ success: true, newMessage: messageObj });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending message",
    });
  }
};
