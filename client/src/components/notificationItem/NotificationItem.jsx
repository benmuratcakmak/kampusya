import React from "react";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import FormatTime from "../../components/FormatTime";
// import "./NotificationItem.css";

const NotificationItem = ({ notification, handleNotificationClick, handleAvatarClick }) => {
  const navigate = useNavigate();

  const getMessage = (type, senderUsername) => {
    switch (type) {
      case "like":
        return `${senderUsername} sizin gönderinizi beğendi!`;
      case "comment":
        return `${senderUsername} gönderinize yorum yaptı!`;
      case "commentLike":
        return `${senderUsername} sizin yorumunuzu beğendi!`;
      case "commentReply":
        return `${senderUsername} yorumunuza yanıt verdi!`;
      case "commentReplyLike":
        return `${senderUsername} sizin yanıtınızı beğendi!`;
      case "follow":
        return `${senderUsername} sizi takip etmeye başladı!`;
      default:
        return "";
    }
  };

  return (
    <div
      className={`notification ${notification.isRead ? "read" : "unread"}`}
      onClick={() =>
        notification.type === "follow"
          ? handleNotificationClick(notification._id, null, notification.sender.username)
          : handleNotificationClick(notification._id, notification.postId?._id)
      }
    >
      <Avatar
        src={notification.sender?.photo || "/default-avatar.png"}
        alt={`${notification.sender?.username} profil fotoğrafı`}
        className="notification-photo"
        onClick={(e) => {
          e.stopPropagation(); // Avatar tıklanıldığında sadece avatarın işlevi çalışsın
          handleAvatarClick(notification.sender.username);
        }}
      />
      <p>
        <strong>{notification.sender?.username}</strong> {getMessage(notification.type, notification.sender?.username)}
      </p>
      <FormatTime timestamp={notification.createdAt} />
    </div>
  );
};

export default NotificationItem;
