const User = require("../model/userModel");

exports.setUserOnline = async(userId) => {
    return User.findOneAndUpdate(userId, {isOnline: true})
}

exports.setUserOffline = async(userId) => {
    return User.findOneAndUpdate(userId, {isOnline: false})
}   