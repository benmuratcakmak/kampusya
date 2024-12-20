import React, { useRef, useEffect } from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import "./MessagesList.css";
import { getAvatarUrl } from '../../utils/avatarHelper';

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

  if (loading) return <div className="loading">Mesajlarınız yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="messages">
      {messages.map((message, index) => {
        // Geçersiz mesajları atla
        if (!message || !message.sender) return null;

        return (
          <div
            key={message._id || index}
            className={`message ${
              message.sender._id === userId ? "my-message" : "their-message"
            }`}
          >
            {message.sender._id !== userId && (
              <Link to={`/profile/${message.sender?.username}`}>
                <Avatar
                  src={message.sender?.photo || getAvatarUrl(message.sender?.username)}
                  alt={message.sender?.username || "Kullanıcı"}
                  className="message-photo"
                />
              </Link>
            )}
            <div className="message-text">
              <p>{message.text || ""}</p>

              {/* Paylaşılan post varsa */}
              {message.sharePostId && (
                <div
                  className="conversation-post"
                  onClick={() =>
                    handlePostClick(message.sharePostId?._id)
                  }
                >
                  <div className="post-top">
                    <div className="top-left">
                      <Avatar
                        src={message.sharePostId?.userId?.photo || getAvatarUrl(message.sharePostId?.userId?.username)}
                        alt={message.sharePostId?.userId?.username || ""}
                      />
                    </div>
                    <div className="top-right">
                      <p>@{message.sharePostId?.userId?.username || ""}</p>
                      <p>{message.sharePostId?.content || ""}</p>
                    </div>
                  </div>
                  {/* Paylaşılan medya varsa */}
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

                  {/* Etkinlik verileri */}
                  {message.sharePostId?.eventTitle && (
                    <div className="event">
                      <h3>{message.sharePostId.eventTitle}</h3>
                      <p>{message.sharePostId.eventDescription || ""}</p>
                      <p>
                        <strong>Tarih:</strong>{" "}
                        {new Date(
                          message.sharePostId.eventDate
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Anket verileri */}
                  {message.sharePostId?.pollQuestion && (
                    <div className="poll">
                      <h3>{message.sharePostId.pollQuestion}</h3>
                      <ul>
                        {message.sharePostId.pollOptions.map(
                          (option, index) => (
                            <li key={index}>
                              {option.option} - {option.votes} oy
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {/* Mesajların sonuna kaydır */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
