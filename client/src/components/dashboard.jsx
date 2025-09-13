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

  useEffect(() => {
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
      if (response.ok && data.success) {
        setUserDetails(data.user);
      } else {
        toast.error(data.message || "Session expired. Please log in again.");
        <Navigate to="/" />;
      }
    };
    getUserDetails();
  }, []);

  useEffect(() => {
    getFriendRequests();
  }, [showFriendPopup]);

  const [friends, setFriends] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      avatar: "/alice.png?height=40&width=40",
      online: true,
      lastMessage: "Pretty good! Working on some new projects",
      timestamp: "2:30 PM",
    },
  ]);

  const [messages, setMessages] = useState({
    1: [
      {
        id: 1,
        text: "Hey! How are you?",
        sender: "Alice Johnson",
        timestamp: "2:30 PM",
        isMe: false,
      },
      {
        id: 2,
        text: "I'm doing great! How about you?",
        sender: "Me",
        timestamp: "2:31 PM",
        isMe: true,
      },
      {
        id: 3,
        text: "Pretty good! Working on some new projects",
        sender: "Alice Johnson",
        timestamp: "2:32 PM",
        isMe: false,
      },
    ],
  });

  const [friendRequests, setFriendRequests] = useState([]);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "Me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
    }));

    setMessage("");
  };

  const handleLogout = () => {
    // Add logout logic here
    window.location.href = "/";
  };
  // API calls section

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendRequestText.trim()) return;
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

    const data = await response.json();
    if (response.ok && data.success) {
      toast.success(data.message || "Friend request sent successfully");
    } else {
      toast.error(data.message || "Failed to send friend request");
    }
    setFriendRequestText("");
    setShowFriendPopup(false);
  };

  const getFriendRequests = async () => {
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
    if (!response.ok || !data.success) {
      toast.error(data.message || "Failed getting friend requests");
    }

    setFriendRequests(data.friendRequests || []);
  };

  const handleAcceptRequest = async (requestId) => {
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
      if (response.ok && data.success) {
        toast.success(data.message || "Friend request accepted");
        // setFriends(data.friends);
        getFriendRequests();
      } else {
        toast.error(data.message || "Failed to accept friend request");
      }
    } catch (err) {
      console.log("Error while accepting friend request: ", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const handleDeclineRequest = async (requestId) => {
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
      if (response.ok && data.success) {
        toast.success(data.message || "Friend request rejected");
        getFriendRequests();
      } else {
        toast.error(data.message || "Failed to reject friend request");
      }
    } catch (err) {
      console.log("Error while accepting friend request: ", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
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
            <h4>Friends ({filteredFriends.length})</h4>
            <button
              className="add-friend-btn"
              onClick={() => setShowFriendPopup(true)}
            >
              {/* //mark */}
              <BsPersonPlus />
            </button>
          </div>
          <div className="friends-scroll">
            {filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                className={`friend-item ${
                  selectedChat?.id === friend.id ? "active" : ""
                }`}
                onClick={() => setSelectedChat(friend)}
                whileHover={{ backgroundColor: "#f8f9fa" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="friend-avatar-container">
                  <img
                    src={friend.avatar || "/placeholder.svg"}
                    alt={friend.name}
                    className="friend-avatar"
                  />
                  <div
                    className={`online-indicator ${
                      friend.online ? "online" : "offline"
                    }`}
                  ></div>
                </div>
                <div className="friend-info">
                  <div className="friend-name">{friend.name}</div>
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
                  src={selectedChat.avatar || "/placeholder.svg"}
                  alt={selectedChat.name}
                  className="chat-avatar"
                />
                <div>
                  <h3>{selectedChat.name}</h3>
                  <span
                    className={`chat-status ${
                      selectedChat.online ? "online" : "offline"
                    }`}
                  >
                    {selectedChat.online ? "Online" : "Offline"}
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
                {(messages[selectedChat.id] || []).map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`message ${
                      msg.isMe ? "message-sent" : "message-received"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="message-timestamp">{msg.timestamp}</span>
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
  );
}

export default Dashboard;
