const User = require("../model/userModel");

exports.setUserOnline = async(userId) => {
    console.log("Turning online for: ", userId);
    return User.findOneAndUpdate({_id: userId}, {isOnline: true})
}

exports.setUserOffline = async(userId) => {
    return User.findOneAndUpdate({_id: userId}, {isOnline: false})
}   