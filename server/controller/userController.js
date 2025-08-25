const jwt = require("jsonwebtoken");

const User = require("../model/userModel");

const { tokenExtractor } = require("../util/tokenExtractor.js");

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

    if(!user){
        return res.status(404).json({success: false, message: "User not found"})
    }

    return res.status(200).json({success: true, user})
  } catch (err) {
    console.log("Error while getting user details: ", err);
    return res
      .status(500)
      .json({ success: false, message: "Error while getting user details" });
  }
};
