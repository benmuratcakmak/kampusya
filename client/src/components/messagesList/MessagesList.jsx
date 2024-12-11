import React, { useRef, useEffect } from "react";
import { Avatar } from "@mui/material";
import FormatTime from "../../components/FormatTime";

import "./MessagesList.css";
import { Link } from "react-router-dom";

const MessagesList = ({
  messages,
  userId,
  error,
  loading,
  handlePostClick,
}) => {
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
            <Link to={`/profile/${message.sender?.username}`}>
              <Avatar
                src={message.sender?.photo}
                alt={message.sender?.username}
                className="message-photo"
              />
            </Link>
          )}
          <div className="message-text">
            <p>{message.text}</p>
            {message.sharePostId && (
              <div
                className="conversation-post"
                onClick={() => handlePostClick(message.sharePostId?._id)}
              >
                <div className="post-top">
                  <div className="top-left">
                    <Avatar
                      src={message.sharePostId?.userId?.photo}
                      alt={message.sharePostId?.userId?.username}
                    />
                  </div>
                  <div className="top-right">
                    <p>@{message.sharePostId?.userId?.username}</p>
                    <p>{message.sharePostId?.content}</p>
                  </div>
                </div>
                {message.sharePostId?.mediaUrl && (
                  <div className="post-bottom quote-bottom-media">
                    {message.sharePostId.mediaUrl.endsWith(".mp4") ||
                    message.sharePostId.mediaUrl.endsWith(".webm") ? (
                      <video controls>
                        <source
                          src={message.sharePostId.mediaUrl}
                          type="video/mp4"
                        />
                        Tarayıcınız bu videoyu desteklemiyor.
                      </video>
                    ) : (
                      <img
                        src={message.sharePostId.mediaUrl}
                        alt="paylaşılan medya"
                      />
                    )}
                  </div>
                )}

                {/* Etkinlik verileri burada görüntüleniyor */}
                {message.sharePostId?.eventTitle && (
                  <div className="event">
                    <h3>{message.sharePostId.eventTitle}</h3>
                    <p>{message.sharePostId.eventDescription}</p>
                    <p>
                      <strong>Tarih:</strong>{" "}
                      {new Date(message.sharePostId.eventDate).toLocaleString()}
                    </p>
                  </div>
                )}
                {/* Anket verileri burada görüntüleniyor */}
                {message.sharePostId?.pollQuestion && (
                  <div className="poll">
                    <h3>{message.sharePostId.pollQuestion}</h3>
                    <ul>
                      {message.sharePostId.pollOptions.map((option, index) => (
                        <li key={index}>
                          {option.option} - {option.votes} oy
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* <p className="message-list-formattime">
            <FormatTime timestamp={message.createdAt} />
          </p> */}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
