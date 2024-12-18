import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaCheck } from "react-icons/fa";
import Icons from "../../icons";
import { Avatar } from "@mui/material";
import axios from "axios";
import "./ShareModal.css";

const ShareModal = ({ isOpen, onClose, selectedPost }) => {
  const { user } = useContext(AuthContext);
  const userId = user?._id;

  // State tanımları
  const [followers, setFollowers] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [content, setContent] = useState("");

  const modalContentRef = useRef(null);

  const handleShareToWhatsApp = () => {
    const message = encodeURIComponent(selectedPost.content);
    const postUrl = encodeURIComponent(
      `http://kampusya.com/posts/post/${selectedPost._id}`
    );
    window.open(`https://wa.me/?text=${message} ${postUrl}`, "_blank");
    incrementShareCount();
  };
  
  const handleShareToInstagram = () => {
    const message = encodeURIComponent(selectedPost.content);
    const postUrl = encodeURIComponent(
      `http://kampusya.com/posts/${selectedPost._id}`
    );
    window.open(`https://www.instagram.com/?url=${postUrl}`, "_blank");
    incrementShareCount();
  };
  
  const handleShareToTwitter = () => {
    const message = encodeURIComponent(selectedPost.content);
    const postUrl = encodeURIComponent(
      `http://kampusya.com/posts/${selectedPost._id}`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${message} ${postUrl}`,
      "_blank"
    );
    incrementShareCount();
  };
  

  const incrementShareCount = async () => {
    try {
      const response = await axios.put(
        `/api/postFeatures/${selectedPost._id}/incrementShareCount`
      );
      if (response.status === 200) {
        console.log("Paylaşma sayısı başarıyla güncellendi.");
      }
    } catch (err) {
      console.error("Paylaşma sayısı artırılamadı:", err);
    }
  };

  // Takip edilen kullanıcıları alma
  useEffect(() => {
    if (!user?.username) return;

    const fetchFollowing = async () => {
      setStatus({ loading: true, error: null });
      try {
        const response = await axios.get(
          `/api/follow/following/${user.username}`
        );
        setFollowers(response.data);
      } catch (err) {
        setStatus({
          loading: false,
          error: err.response?.data?.message || "Bir hata oluştu.",
        });
      } finally {
        setStatus({ loading: false, error: null });
      }
    };

    fetchFollowing();
  }, [user?.username]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const toggleFollowerSelection = useCallback((followerId) => {
    setSelectedFollowers((prev) =>
      prev.includes(followerId)
        ? prev.filter((id) => id !== followerId)
        : [...prev, followerId]
    );
  }, []);

  const showNotification = useCallback((message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${
          type === "success" ? "✔️" : "❌"
        }</span>
        <span>${message}</span>
      `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }, []);

  const handleSend = async () => {
    if (!selectedPost?._id || !selectedFollowers.length || !content) {
      showNotification("Gönderi ID'si geçersiz veya eksik!", "error");
      return;
    }

    try {
      for (const followerId of selectedFollowers) {
        const { data } = await axios.post(
          "/api/conversations/getOrCreateConversation",
          { senderId: userId, receiverId: followerId }
        );
        const conversationId = data._id;

        await axios.post("/api/messages", {
          conversationId,
          sharePostId: selectedPost._id,
          sender: userId,
          text: content,
        });

        await axios.put(
          `/api/postFeatures/${selectedPost._id}/incrementShareCount`
        );
      }

      showNotification("Gönderi başarıyla iletildi!", "success");
      setSelectedFollowers([]);
      setContent("");
      onClose();
    } catch (err) {
      showNotification("Bir hata oluştu: " + err.message, "error");
    }
  };

  const handleSendforHome = async () => {
    if (
      !selectedPost?.content &&
      !selectedPost?.mediaUrl &&
      !selectedPost?.pollQuestion &&
      !selectedPost?.eventTitle
    ) {
      showNotification("Geçerli bir gönderi yok.", "error");
      return;
    }

    try {
      const response = await axios.post("/api/posts", {
        content,
        sharePostId: selectedPost._id,
        userId: userId,
        pollQuestion: selectedPost.pollQuestion,
        pollOptions: selectedPost.pollOptions,
        eventTitle: selectedPost.eventTitle,
        eventDescription: selectedPost.eventDescription,
        eventDate: selectedPost.eventDate,
      });

      if (response.status === 201) {
        await axios.put(
          `/api/postFeatures/${selectedPost._id}/incrementShareCount`
        );
        showNotification("Gönderiniz başarıyla paylaşıldı!", "success");
        onClose();
      }
    } catch (err) {
      showNotification("Bir hata oluştu: " + err.message, "error");
    }
  };

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        if (
          modalContentRef.current &&
          !modalContentRef.current.contains(event.target)
        ) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="share-modal-container">
      <div className="share-modal-content" ref={modalContentRef}>
        <button onClick={handleSendforHome}>
          Alıntı olarak Paylaş
          <Icons.Draw />
        </button>
        <h4>ya da</h4>
        <h4>Takip ettiklerine gönder</h4>

        <main className="modal-content">
          {status.loading ? (
            <p>Yükleniyor...</p>
          ) : status.error ? (
            <p className="error-message">{status.error}</p>
          ) : followers.length ? (
            <ul className="followers-list">
              {followers.map((follower) => (
                <li
                  key={follower._id}
                  className={`follower-item ${
                    selectedFollowers.includes(follower._id) ? "selected" : ""
                  }`}
                  onClick={() => toggleFollowerSelection(follower._id)}
                >
                  <Avatar
                    src={follower.photo || "/default-avatar.png"}
                    alt={follower.username}
                  />
                  <span>{follower.username}</span>
                  {selectedFollowers.includes(follower._id) && <FaCheck />}
                </li>
              ))}
            </ul>
          ) : (
            <p>Takip ettiğiniz kimse yok.</p>
          )}
          <Icons.FaPaperPlane
            className="share-modal-send-button"
            onClick={handleSend}
            disabled={!selectedFollowers.length || !content}
          ></Icons.FaPaperPlane>
        </main>
        <input
          className="share-modal-input"
          value={content}
          onChange={handleContentChange}
          placeholder="Buraya yazın..."
        />
        <div className="social-icons-container">
          <Icons.WhatsApp
            className="social-icon"
            onClick={handleShareToWhatsApp}
          />
          <Icons.Instagram
            className="social-icon"
            onClick={handleShareToInstagram}
          />
          <Icons.X className="social-icon" onClick={handleShareToTwitter} />
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
