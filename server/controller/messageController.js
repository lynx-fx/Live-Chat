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
        .json({ success: false, message: "Unauthorized access" });
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

exports.getMessages = async (req, res) => {
  try {
    const friendId = req.query.id;
    const token = tokenExtractor(req);
    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized access" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.id);
    if (!user) {
      return resP
        .status(404)
        .json({ success: false, message: "Unauthorized access" });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return res
        .status(404)
        .json({ success: false, message: "Friend doesn't exists" });
    }

    // getting messages via id, which could be of either sender or receiver but must have both id's at each end.
    const messages = await Message.find({
      $or: [
        { sender: user._id, receiver: friend._id },
        { sender: friend._id, receiver: user._id },
      ],
    }).sort({ createdAt: 1 });

    const decryptedMessage = messages.map((msg) => ({
      ...msg.toObject(),
      content: decryptMessage(msg.content, process.env.ENCRYPTION_SECRET),
    }));
    return res.status(200).json({ success: true, messages: decryptedMessage });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message:
        "Something went wrong while getting messages. Please try again later",
    });
  }
};

// TODO: Write logic for getting last messages for all friends
exports.getLastMessages = async (req, res) => {
  try {
    const token = tokenExtractor(req);
    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized access" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized access" });
    }

    const messages = await Message.find({
      $or: [
        { sender: user._id, receiver: friend._id },
        { sender: friend._id, receiver: user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(1);

    const decryptedMessage = messages.map((msg) => ({
      ...msg.toObject(),
      content: decryptMessage(msg.content, process.env.ENCRYPTION_SECRET),
    }));
    return res.status(200).json({ success: true, messages: decryptedMessage });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while getting last message. Try again later",
    });
  }
};
