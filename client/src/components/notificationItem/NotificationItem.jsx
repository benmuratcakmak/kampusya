import React from "react";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import FormatTime from "../../components/FormatTime";
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import "./NotificationItem.css";

const NotificationItem = ({
  notification,
  handleNotificationClick,
  handleAvatarClick,
  handleDeleteNotification,
}) => {
  // const navigate = useNavigate();

  const getMessage = (type) => {
    switch (type) {
      case "like":
        return "sizin gönderinizi beğendi!";
      case "comment":
        return "gönderinize yorum yaptı!";
      case "commentLike":
        return "sizin yorumunuzu beğendi!";
      case "commentReply":
        return "yorumunuza yanıt verdi!";
      case "commentReplyLike":
        return "sizin yanıtınızı beğendi!";
      case "follow":
        return "sizi takip etmeye başladı!";
      default:
        return "";
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Avatar veya bildirim metnine tıklanması durumunda delete butonuna tıklanması engellenir
    const confirmed = window.confirm(
      "Bu bildirimi silmek istediğinize emin misiniz?"
    );
    if (confirmed) {
      handleDeleteNotification(notification._id);
    }
  };

  return (
    <div
      className={`notification ${notification.isRead ? "read" : "unread"}`}
      onClick={() =>
        notification.type === "follow"
          ? handleNotificationClick(
              notification._id,
              null,
              notification.sender.username
            )
          : handleNotificationClick(notification._id, notification.postId?._id)
      }
    >
      <Avatar
        src={notification.sender?.photo}
        alt={`${notification.sender?.username} profil fotoğrafı`}
        className="notification-photo"
        onClick={(e) => {
          e.stopPropagation(); // Avatar tıklanıldığında sadece avatarın işlevi çalışsın
          handleAvatarClick(notification.sender.username);
        }}
      />
      <p>
        <strong>{notification.sender?.username}</strong>{" "}
        {getMessage(notification.type)}
      </p>
      <FormatTime timestamp={notification.createdAt} />
      <div className="options" onClick={handleDeleteClick}>
        <MoreVertIcon style={{ fontSize: '1rem' }} />
      </div>
    </div>
  );
};

export default NotificationItem;
