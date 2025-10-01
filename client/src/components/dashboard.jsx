"use client";

import { useState, useEffect, useRef, use, act } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiSend,
  FiMoreVertical,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { BsChatDots, BsPersonPlus } from "react-icons/bs";
import { Navigate } from "react-router-dom";
import "../styles/dashboard.css";
import { toast } from "sonner";
import Loading from "./loading.jsx";

// DONE: Fetching previous messages when a chat is selected
// TODO: Integration of socket.io for messaging

function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFriendPopup, setShowFriendPopup] = useState(false);
  const [friendRequestText, setFriendRequestText] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const messagesEndRef = useRef(null);
  const BACKEND = import.meta.env.PROD
    ? import.meta.env.VITE_BACKEND_HOSTED
    : import.meta.env.VITE_BACKEND_LOCAL;
  const [isloading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    setIsLoading(true);
    try {
      const getUserDetails = async () => {
        const response = await fetch(
          `${BACKEND}/api/user/getUserDetails?action=getUserDetails`,
          {
            method: "GET",
            headers: {
              Content_Type: "application/json",
            },
            credentials: "include",
          }
        );
        const data = await response.json();
        console.log(data);

        if (response.ok && data.success) {
          setUserDetails(data.user);
        } else {
          toast.error(data.message || "Session expired. Please log in again.");
          <Navigate to="/" />;
        }
      };
      const getFriends = async () => {
        const response = await fetch(
          `${BACKEND}/api/user/getUserDetails?action=getFriends`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
            },
            credentials: "include",
          }
        );
        setIsLoading(false);
        const data = await response.json();
        if (response.ok && data.success) {
          setFriends(data.friends || []);
        } else {
          toast.info(data.message || "No friends found. Try adding some!");
        }
      };
      const getLastMessages = async () => {
        try{
          const response = await fetch(`${BACKEND}/api/message/getLastMessages`,{
            method: "GET",
            headers: {
              "content-type": "application/json",
            }, credentials: "include",
          })
        }catch(err){
          console.log(err);
          toast.error("Something went wrong. Please try again later")
        }
      }
      getUserDetails();
      getFriends();
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      toast.error("Something went wrong. Please try again later");
    }
  }, []);

  useEffect(() => {
    if (!selectedChat) {
      return;
    }
    try {
      setIsLoading(true);
      const fetchMessages = async () => {
        const response = await fetch(
          `${BACKEND}/api/message/getMessages?id=${selectedChat._id}`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        setIsLoading(false);
        if (response.ok && data.success) {
          const formattedMessages = data.messages.map((msg) => ({
            _id: msg._id,
            content: msg.content,
            sender: isSenderMe(msg.sender) ? userDetails.userName : selectedChat.userName,
            createdAt: localTime(msg.createdAt),
            isMe: isSenderMe(msg.sender),
          }));

          setMessages((prev) => ({
            ...prev,
            [selectedChat._id]: formattedMessages,
          }));
        } else {
          toast.error(data.message || "Failed to fetch messages");
        }
      };
      fetchMessages();
    } catch (err) {
      setIsLoading(false);
      toast.error("Something went wrong. Please try again later");
    }
  }, [selectedChat]);

  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  // const filteredFriends = friends.filter((friend) =>
  //   friend.userName.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    // const newMessage = {
    // id: Date.now(),
    // text: message,
    // timestamp: new Date().toLocaleTimeString([], {
    // hour: "2-digit",
    // minute: "2-digit",
    // }),
    // isMe: true,
    // };

    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND}/api/message/sendMessage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          receiverId: selectedChat._id,
          content: message,
        }),
      });
      const data = await response.json();
      setIsLoading(false);
      setMessage("");
      data.newMessage.isMe = true;
      if (response.ok && data.success) {
        setMessages((prev) => ({
          ...prev,
          [selectedChat._id]: [
            ...(prev[selectedChat._id] || []),
            data.newMessage,
          ],
        }));
      } else {
        setMessage("");
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      setMessage("");
      setIsLoading(false);
      console.log(err);
      toast.error("Something went wrong. Please try again later");
    }

    setMessage("");
  };

  const handleLogout = () => {
    // Add logout logic here
    window.location.href = "/";
  };

  const handleFriendPopup = () => {
    getFriendRequests();
    setShowFriendPopup(true);
  };

  // API calls section
  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendRequestText.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND}/api/user/handleFriends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          friendEmail: friendRequestText,
          action: "sendFriendRequest",
        }),
      });

      setIsLoading(false);
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || "Friend request sent successfully");
      } else {
        toast.error(data.message || "Failed to send friend request");
      }
      setFriendRequestText("");
      setShowFriendPopup(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      toast.error("Something went wrong. Please try again later");
    }
  };

  const getFriendRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND}/api/user/getUserDetails?action=getUserFriendRequests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setIsLoading(false);
      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed getting friend requests");
      }
      setFriendRequests(data.friendRequests || []);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      toast.error("Something went wrong. Please try again later");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND}/api/user/handleFriends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          friendId: requestId,
          action: "acceptFriendRequest",
        }),
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok && data.success) {
        toast.success(data.message || "Friend request accepted");
        setFriends(data.friends);
        console.log(data.friends);
        getFriendRequests();
      } else {
        toast.error(data.message || "Failed to accept friend request");
      }
    } catch (err) {
      setIsLoading(false);
      console.log("Error while accepting friend request: ", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND}/api/user/handleFriends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          friendId: requestId,
          action: "rejectFriendRequest",
        }),
      });

      const data = await response.json();
      setIsLoading(false);
      if (response.ok && data.success) {
        toast.success(data.message || "Friend request rejected");
        getFriendRequests();
      } else {
        toast.error(data.message || "Failed to reject friend request");
      }
    } catch (err) {
      setIsLoading(false);
      console.log("Error while accepting friend request: ", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const localTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isSenderMe = (id) => {
    if (!userDetails || !userDetails?._id) return false;

    if (userDetails._id == id) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      {isloading && <Loading />}
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          {/* Header */}
          <div className="sidebar-header">
            <div className="user-info">
              <img
                src={
                  userDetails && userDetails.profileURI
                    ? userDetails.profileURI
                    : "/logo.png?height=40&width=40"
                }
                alt="Your avatar"
                className="user-avatar"
                referrerPolicy="no-referrer"
              />
              <div className="user-details">
                <h3>
                  {userDetails && userDetails.userName
                    ? userDetails.userName
                    : "user"}
                </h3>
                <span className="user-status">Online</span>
              </div>
            </div>
            <div className="user-menu-container">
              <button
                className="menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FiMoreVertical />
              </button>
              {showUserMenu && (
                <div className="user-menu">
                  <button className="menu-item" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Friends List */}
          <div className="friends-list">
            <div className="friends-header">
              <h4>Friends ({friends.length})</h4>
              <button className="add-friend-btn" onClick={handleFriendPopup}>
                {/* //mark */}
                <BsPersonPlus />
              </button>
            </div>
            <div className="friends-scroll">
              {friends.map((friend) => (
                <motion.div
                  key={friend._id}
                  className={`friend-item ${
                    selectedChat?.id === friend._id ? "active" : ""
                  }`}
                  onClick={() => setSelectedChat(friend)}
                  whileHover={{ backgroundColor: "#f8f9fa" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="friend-avatar-container">
                    <img
                      src={friend.profileURI || "/placeholder.svg"}
                      alt={friend.userName}
                      className="friend-avatar"
                    />
                    <div
                      className={`online-indicator ${
                        friend.isOnline ? "online" : "offline"
                      }`}
                    ></div>
                  </div>
                  <div className="friend-info">
                    <div className="friend-name">{friend.userName}</div>
                    <div className="friend-last-message">
                      {friend.lastMessage}
                    </div>
                  </div>
                  <div className="friend-timestamp">{friend.timestamp}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <img
                    src={selectedChat.profileURI || "/placeholder.svg"}
                    alt={selectedChat.userName}
                    className="chat-avatar"
                  />
                  <div>
                    <h3>{selectedChat.userName}</h3>
                    <span
                      className={`chat-status ${
                        selectedChat.isOnline ? "online" : "offline"
                      }`}
                    >
                      {selectedChat.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                <button className="chat-menu-btn">
                  <FiMoreVertical />
                </button>
              </div>

              {/* Messages */}
              <div className="messages-container">
                <AnimatePresence>
                  {(messages[selectedChat._id] || []).map((msg) => (
                    <motion.div
                      key={msg._id}
                      className={`message ${
                        msg.isMe ? "message-sent" : "message-received"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="message-content">
                        <p>{msg.content}</p>
                        <span className="message-timestamp">
                          {localTime(msg.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {/* TODO: Add caret here */}
              <form
                className="message-input-container black-caret"
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="message-input"
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!message.trim()}
                >
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <BsChatDots className="no-chat-icon" />
              <h3>Select a friend to start chatting</h3>
              <p>Choose from your friends list to begin a conversation</p>
            </div>
          )}
        </div>

        {/* Friend Popup Modal */}
        {showFriendPopup && (
          <div
            className="popup-overlay"
            onClick={() => setShowFriendPopup(false)}
          >
            <motion.div
              className="friend-popup"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="popup-header">
                <h3>Add Friends</h3>
                <button
                  className="close-popup"
                  onClick={() => setShowFriendPopup(false)}
                >
                  ×
                </button>
              </div>

              <div className="popup-content">
                {/* Send Friend Request Section */}
                <div className="popup-section">
                  <h4>Send Friend Request</h4>
                  <form
                    onSubmit={handleSendFriendRequest}
                    className="friend-request-form"
                  >
                    <input
                      type="text"
                      placeholder="Enter email to find friends."
                      value={friendRequestText}
                      onChange={(e) => setFriendRequestText(e.target.value)}
                      className="friend-request-input"
                    />
                    <button
                      type="submit"
                      className="send-request-btn"
                      disabled={!friendRequestText.trim()}
                    >
                      Send Request
                    </button>
                  </form>
                </div>

                {/* Pending Requests Section */}
                {friendRequests.length > 0 && (
                  <div className="popup-section">
                    <h4>Friend Requests ({friendRequests.length})</h4>
                    <div className="friend-requests-list">
                      {friendRequests.map((request) => (
                        <div key={request._id} className="friend-request-item">
                          <div className="request-user-info">
                            <img
                              src={request.profileURI || "/placeholder.svg"}
                              alt={request.userName}
                              className="request-avatar"
                            />
                            <div className="request-details">
                              <div className="request-name">
                                {request.userName}
                              </div>
                            </div>
                          </div>
                          <div className="request-actions">
                            <button
                              className="accept-btn"
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              Accept
                            </button>
                            <button
                              className="decline-btn"
                              onClick={() => handleDeclineRequest(request._id)}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
