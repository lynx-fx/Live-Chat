const jwt = require("jsonwebtoken");

const User = require("../model/userModel");

const { tokenExtractor } = require("../util/tokenExtractor.js");

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
        .json({ success: false, message: "User not found" });
    }

    if (action === "getUserDetails") {
      return res.status(200).json({ success: true, user });
    } else if (action === "getUserFriends") {
      const userDetails = await User.findById(user._id).populate(
        "friends",
        "userName email profileURI isOnline"
      );

      if (!userDetails || userDetails.friends.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Try making new friends :)" });
      }

      return res
        .status(200)
        .json({ success: true, friends: userDetails.friends ?? [] });
    } else if (action === "getUserFriendRequests") {
      const userDetails = await User.findById(user._id).populate(
        "friendRequests",
        "_id userName email profileURI isOnline"
      );

      if (!userDetails || userDetails.friendRequests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No requests. Maybe try adding them?",
        });
      }

      return res.status(200).json({
        success: true,
        friendRequests: userDetails.friendRequests ?? [],
      });
    } else {
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
        .json({ success: false, message: "User not found" });
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
        "username email profileURI isOnline"
      );

      return res.status(200).json({
        success: true,
        message: "Friend request accepted",
        friends: updatedFriends.friends,
      });
    } else if (action == "rejectFriendRequest") {
      await User.findByIdAndUpdate(friend._id, {
        $addToSet: { friendRequests: user._id },
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
