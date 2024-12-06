import React, { useRef, useEffect } from "react";
import { Avatar } from "@mui/material";
import "./MessagesList.css";

const MessagesList = ({ messages, userId, error, loading, handlePostClick }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="messages">
      {messages.map((message, index) => (
        <div
          key={message._id || index}
          className={`message ${
            message.sender?._id === userId ? "my-message" : "their-message"
          }`}
        >
          {message.sender._id !== userId && (
            <Avatar
              src={message.sender?.photo || "/path/to/default-avatar.png"}
              alt={message.sender?.username}
              className="message-photo"
            />
          )}
          <div className="message-text">
            <p>{message.text}</p>
            {message.sharePostText && (
              <div
                className="conversation-post"
                onClick={() => handlePostClick(message.sharePostId)}
              >
                <div className="post-top">
                  <div className="top-left">
                    <Avatar
                      src={message.sharePostProfilePhoto}
                      alt={message.sharePostUsername}
                    />
                  </div>
                  <div className="top-right">
                    <p>{message.sharePostUsername}</p>
                    <p>{message.sharePostText}</p>
                  </div>
                </div>
                <div className="post-bottom">
                  {message.sharePostMedia && (
                    <img src={message.sharePostMedia} alt="paylaşılan medya" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
