import React from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@mui/material";

import "./ConversationItem.css";
import { getAvatarUrl } from '../../utils/avatarHelper';

const ConversationItem = ({
  conversation,
  onMarkAsRead,
  onDeleteConversation,
}) => {
  const handleDelete = (e) => {
    e.preventDefault(); // Link tıklamasını önle
    onDeleteConversation(conversation.conversationId);
  };

  return (
    <div
      className={`conversation-item ${conversation.isRead ? "read" : "unread"}`}
      onClick={() => onMarkAsRead(conversation.conversationId)}
    >
      <Link
        className="conversation-link"
        to={`/messages/${conversation.conversationId}`}
      >
        <div className="conversation-real-item">
          <Avatar
            src={conversation.otherUser?.photo || getAvatarUrl(conversation.otherUser?.username)}
            alt={`${conversation.otherUser?.username || "Kullanıcı"} profil fotoğrafı`}
            className="user-photo"
          />
          <div className="conversation-fullname-and-lastMessage">
            <div className="full-name">
              <strong>
                {conversation.otherUser?.firstName || "Kullanıcı"}
              </strong>
              <strong>{conversation.otherUser?.lastName || ""}</strong>
            </div>
            <p className="last-message">
              {conversation.lastMessage?.text?.length > 10
                ? conversation.lastMessage.text.slice(0, 10) + "..."
                : conversation.lastMessage?.text ||
                  "Bu konuşmada henüz mesaj yok."}
            </p>
          </div>

          <div className="options" onClick={handleDelete}>
            ...
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ConversationItem;
