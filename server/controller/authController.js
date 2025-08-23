const jwt = require("jsonwebtoken");

const User = require("../model/userModel.js");

const { oauth2client } = require("../util/googleConfig.js");

exports.login = async (req, res) => {
  try {
    const { code } = req.query;
    const googleResponse = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleResponse.tokens);

    const userRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`,
      {
        method: "GET",
      }
    );

    const { email, name, picture } = await userRes.json();
    let user = await User.findOne({ email });
    if (!user) {
      const newUser = new User({
        userName: name,
        email,
        profileURI: picture,
      });
      await newUser.save();

      const token = jwt.sign(
        {
          id: newUser._id,
          email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_TIMEOUT,
        }
      );

      return res
        .cookie("auth", token, {
          httpOnly: process.env.NODE_ENV == "production",
          secure: process.env.NODE_ENV == "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          expires: new Date(Date.now() + 86400000),
        })
        .json({
          success: true,
          message: "Account created and logged in successfully",
          redirect: "/dashboard",
        });
    } else {
      const token = jwt.sign(
        {
          id: user._id,
          email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_TIMEOUT,
        }
      );

      return res
        .cookie("auth", token, {
          httpOnly: process.env.NODE_ENV == "production",
          secure: process.env.NODE_ENV == "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          expires: new Date(Date.now() + 86400000),
        })
        .json({
          success: true,
          message: "logged in successfully",
          redirect: "/dashboard",
        });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error while logging in", error: err.message });
  }
};
