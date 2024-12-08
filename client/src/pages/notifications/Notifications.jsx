import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationItem from "../../components/notificationItem/NotificationItem";
import "./Notifications.css";

export const Notifications = () => {
  const { user } = useContext(AuthContext);
  const userId = user._id;

  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`/api/notifications/${userId}`);
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
        } else {
          console.error("Beklenen formatta veri alınamadı", res.data);
          // Alternatif olarak boş dizi atayabilirsiniz.
          setNotifications([]);
        }
      } catch (error) {
        console.error("Bildirimler alınamadı:", error);
      }
    };
    

    fetchNotifications();
  }, [userId]);

  const handleNotificationClick = async (notificationId, postId, senderUsername) => {
    try {
      await axios.put(`/api/notifications/${notificationId}`, { isRead: true });

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      if (postId) {
        navigate(`/posts/post/${postId}`);
      }

      if (senderUsername) {
        navigate(`/profile/${senderUsername}`);
      }
    } catch (error) {
      console.error("Bildirim okundu olarak işaretlenemedi:", error);
    }
  };

  const handleAvatarClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="notifications-container">
      {/* {notifications.length === 0 ? ( */}
      {Array.isArray(notifications) && notifications.length === 0 ? (
        <p>Henüz bir bildiriminiz yok.</p>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            handleNotificationClick={handleNotificationClick}
            handleAvatarClick={handleAvatarClick}
          />
        ))
      )}
    </div>
  );
};
