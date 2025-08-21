"use client";

import { useState, useEffect, useRef } from "react";
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

function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFriendPopup, setShowFriendPopup] = useState(false);
  const [friendRequestText, setFriendRequestText] = useState("");
  const messagesEndRef = useRef(null);

  // Mock data - replace with real data from your backend
  const [friends] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
      lastMessage: "Hey! How are you?",
      timestamp: "2:30 PM",
    },
    {
      id: 2,
      name: "Bob Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
      lastMessage: "See you tomorrow!",
      timestamp: "1:15 PM",
    },
    {
      id: 3,
      name: "Carol Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
      lastMessage: "Thanks for the help!",
      timestamp: "12:45 PM",
    },
    {
      id: 4,
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
      lastMessage: "Let's meet up soon",
      timestamp: "11:30 AM",
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
    2: [
      {
        id: 1,
        text: "See you tomorrow!",
        sender: "Bob Smith",
        timestamp: "1:15 PM",
        isMe: false,
      },
      {
        id: 2,
        text: "Looking forward to it",
        sender: "Me",
        timestamp: "1:16 PM",
        isMe: true,
      },
    ],
    3: [
      {
        id: 1,
        text: "Thanks for the help!",
        sender: "Carol Davis",
        timestamp: "12:45 PM",
        isMe: false,
      },
      {
        id: 2,
        text: "Anytime! Happy to help",
        sender: "Me",
        timestamp: "12:46 PM",
        isMe: true,
      },
    ],
    4: [
      {
        id: 1,
        text: "Let's meet up soon",
        sender: "David Wilson",
        timestamp: "11:30 AM",
        isMe: false,
      },
      {
        id: 2,
        text: "Sounds great! When works for you?",
        sender: "Me",
        timestamp: "11:31 AM",
        isMe: true,
      },
    ],
  });

  const [friendRequests] = useState([
    {
      id: 1,
      name: "Emma Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 3,
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 1,
    },
  ]);

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

  const handleSendFriendRequest = (e) => {
    e.preventDefault();
    if (!friendRequestText.trim()) return;

    console.log("[v0] Sending friend request to:", friendRequestText);
    // Add logic to send friend request
    setFriendRequestText("");
    setShowFriendPopup(false);
  };

  const handleAcceptRequest = (requestId) => {
    console.log("[v0] Accepting friend request:", requestId);
    // Add logic to accept friend request
  };

  const handleDeclineRequest = (requestId) => {
    console.log("[v0] Declining friend request:", requestId);
    // Add logic to decline friend request
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="user-info">
            <img
              src="/placeholder.svg?height=40&width=40"
              alt="Your avatar"
              className="user-avatar"
            />
            <div className="user-details">
              <h3>John Doe</h3>
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
                      <div key={request.id} className="friend-request-item">
                        <div className="request-user-info">
                          <img
                            src={request.avatar || "/placeholder.svg"}
                            alt={request.name}
                            className="request-avatar"
                          />
                          <div className="request-details">
                            <div className="request-name">{request.name}</div>
                            <div className="mutual-friends">
                              {request.mutualFriends} mutual friends
                            </div>
                          </div>
                        </div>
                        <div className="request-actions">
                          <button
                            className="accept-btn"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            Accept
                          </button>
                          <button
                            className="decline-btn"
                            onClick={() => handleDeclineRequest(request.id)}
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
