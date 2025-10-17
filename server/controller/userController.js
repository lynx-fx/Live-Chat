
const jwt = require("jsonwebtoken");

const User = require("../model/userModel");
const Message = require("../model/messageModel.js");

const { tokenExtractor } = require("../util/tokenExtractor.js");
const { encryptMessage, decryptMessage } = require("../util/encryption.js");

// DONE: Make get details modular
exports.getUserDetails = async (req, res) => {
  try {
    const token = tokenExtractor(req);
    const action = req.query.action;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "No token provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decode.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized access" });
    }

    if (action === "getUserDetails") {
      return res.status(200).json({ success: true, user });
    } else if (action === "getUserFriendRequests") {
      const userDetails = await User.findById(user._id).populate(
        "friendRequests",
        "_id userName email profileURI isOnline"
      );

      if (!userDetails || userDetails.friendRequests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No requests. Maybe try adding some ;)",
        });
      }

      return res.status(200).json({
        success: true,
        friendRequests: userDetails.friendRequests ?? [],
      });
    } else if (action === "getFriends") {
  const userDetails = await User.findById(user._id).populate(
    "friends",
    "_id userName email profileURI isOnline"
  );

  if (!userDetails || !userDetails.friends || userDetails.friends.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No friends found :(" });
  }

  const lastMessages = await getLastMessages(user._id, userDetails.friends);
  const friendsWithLastMsg = userDetails.friends.map(friend => {
    const friendObj = friend.toObject();
    const lastMsgObj = lastMessages.find(
      msg => msg.friendId.toString() === friend._id.toString()
    );

    friendObj.lastMessage = lastMsgObj?.lastMessage || "";
    friendObj.lastMessageAt = lastMsgObj?.createdAt || null;

    return friendObj;
  });

  return res.status(200).json({ success: true, friends: friendsWithLastMsg });
}
else {
      return res
        .status(400)
        .json({ success: false, message: "No action provided" });
    }
  } catch (err) {
    console.log("Error while getting user details: ", err);
    return res
      .status(500)
      .json({ success: false, message: "Error while getting user details" });
  }
};

// TODO: Check if friend already exists or not while adding new friends
exports.handleFriends = async (req, res) => {
  try {
    const { friendId, friendEmail, action } = req.body;

    const token = tokenExtractor(req);
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "No token provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decode.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User found" });
    }

    let friend = await User.findById(friendId);
    if (!friend) {
      friend = await User.findOne({ email: friendEmail });
    }
    if (!friend) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized access" });
    }

    if (action == "acceptFriendRequest") {
      // updating user's friend list
      await User.findByIdAndUpdate(user._id, {
        $pull: { friendRequests: friend._id },
        $addToSet: { friends: friend._id },
      });

      // updating friend's friend list
      await User.findByIdAndUpdate(friend._id, {
        $addToSet: { friends: user._id },
      });

      // gets updated friend's list to refresh list
      const updatedFriends = await User.findById(user._id).populate(
        "friends",
        "userName email profileURI isOnline"
      );

      return res.status(200).json({
        success: true,
        message: "Friend request accepted",
        friends: updatedFriends.friends,
      });
    } else if (action == "rejectFriendRequest") {
      await User.findByIdAndUpdate(user._id, {
        $pull: { friendRequests: friend._id },
      });

      return res.status(200).json({
        success: true,
        message: "Friend request rejected successfully",
      });
    } else if (action == "sendFriendRequest") {
      await User.findByIdAndUpdate(friend._id, {
        $addToSet: { friendRequests: user._id },
      });
      return res
        .status(200)
        .json({ success: true, message: "Friend request sent successfully" });
    } else if (action == "removeFriend") {
      // updating user's friend list
      await User.findByIdAndUpdate(user._id, {
        $pull: { friends: friend._id },
      });

      // updating friend's friend list
      await User.findByIdAndUpdate(friend._id, {
        $pull: { friends: user._id },
      });

      // gets updated friend's list to refresh list
      const updatedFriends = await User.findById(user._id).populate(
        "friends",
        "username email profileURI isOnline"
      );

      return res.status(200).json({
        success: true,
        message: "Friend removed successfully",
        friends: updatedFriends,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Action not provided" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while handling friend request",
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { friendId, content } = req.body;

    const token = tokenExtractor(req);
    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "No token provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized access" });
    }

    const friend = await User.findById(friendId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Friend not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending message",
    });
  }
};

const getLastMessages = async (userId, friends) => {
  try {
    const result = [];

    for (const friend of friends) {
      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, receiver: friend._id },
          { sender: friend._id, receiver: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(1);

      if (lastMsg) {
        result.push({
          friendId: friend._id,
          lastMessage: decryptMessage(
            lastMsg.content,
            process.env.ENCRYPTION_SECRET
          ),
          createdAt: lastMsg.createdAt,
        });
      } else {
        result.push({
          friendId: friend._id,
          lastMsg: "",
          createdAt: null,
        });
      }
    }
    return result;
  } catch (err) {
    console.log(err);
  }
};
