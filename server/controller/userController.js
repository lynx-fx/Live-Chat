const jwt = require("jsonwebtoken");

const User = require("../model/userModel");

const { tokenExtractor } = require("../util/tokenExtractor.js");
const User = require("../model/userModel");

exports.getUserDetails = async (req, res) => {
  try {
    const token = tokenExtractor(req);

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
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.log("Error while getting user details: ", err);
    return res
      .status(500)
      .json({ success: false, message: "Error while getting user details" });
  }
};

exports.handleFriends = async (req, res) => {
  try {
    const { friendId, action } = req.body;

    const token = tokenExtractor(req);
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
        .json({ success: false, message: "User not found" });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return res
        .status(404)
        .json({ success: false, message: "Friend not found" });
    }

    if (action == "accept") {
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
        "username email profileURI isOnline"
      );

      return res.status(200).json({
        success: true,
        message: "Friend request accepted",
        friends: updatedFriends,
      });
    } else if (action == "reject") {
      await User.findByIdAndUpdate(friend._id, {
        $addToSet: { friendRequests: user._id },
      });

      const updatedFriendRequests = await User.findById(user._id).populate(
        "friendRequests",
        "username email profileURI"
      );

      return res.status(200).json({
        success: true,
        message: "Friend request rejected successfully",
        updatedFriendRequests,
      });
    } else if (action == "send") {
      friend.friendRequests.push(decode.id);
      await friend.save();

      return res
        .status(200)
        .json({ success: true, message: "Friend request sent successfully" });
    } else if (action == "remove") {
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
