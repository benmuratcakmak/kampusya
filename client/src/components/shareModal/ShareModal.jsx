import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaCheck } from "react-icons/fa";
import { Avatar } from "@mui/material";
import axios from "axios";
import "./ShareModal.css";
import { debounce } from "lodash"; // debounce import

const ShareModal = ({ isOpen, onClose, selectedPost }) => {
  const { user } = useContext(AuthContext);
  const userId = user?._id;

  // State tanımları
  const [followers, setFollowers] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [content, setContent] = useState(""); // Kullanıcı yazısı için state

  const modalContentRef = useRef(null);

  // Takip edilen kullanıcıları alma
  useEffect(() => {
    if (!user?.username) return;

    const fetchFollowing = async () => {
      setStatus({ loading: true, error: null });
      try {
        const response = await axios.get(`/follow/following/${user.username}`);
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

  // Kullanıcı yazısı değişimini debounce ile kontrol etme
  const handleContentChange = useCallback(
    debounce((e) => setContent(e.target.value), 300),
    [] // Bu şekilde her renderda yeni bir fonksiyon oluşturulmaz
  );

  // Kullanıcı seçimini toggle etme
  const toggleFollowerSelection = useCallback((followerId) => {
    setSelectedFollowers((prev) =>
      prev.includes(followerId)
        ? prev.filter((id) => id !== followerId)
        : [...prev, followerId]
    );
  }, []);

  // Bildirim gösterme
  const showNotification = useCallback((message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${type === "success" ? "✔️" : "❌"}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }, []);

  // Gönderi paylaşma
  const handleSend = async () => {
    if (!selectedPost?._id || !selectedFollowers.length || !content) {
      showNotification("Gönderi ID'si geçersiz veya eksik!", "error");
      return; // Eğer geçerli bir ID yoksa işlemi sonlandır
    }

    try {
      for (const followerId of selectedFollowers) {
        const { data } = await axios.post(
          "/conversations/getOrCreateConversation",
          { senderId: userId, receiverId: followerId }
        );
        const conversationId = data._id;

        await axios.post("/messages", {
          conversationId,
          sharePostId: selectedPost._id,
          sender: userId,
          text: content,
          sharePostText: selectedPost.content,
          sharePostMedia: selectedPost.mediaUrl,
          sharePostProfilePhoto: selectedPost.userId?.photo,
          sharePostFirstName: selectedPost.userId?.firstName,
          sharePostLastName: selectedPost.userId?.lastName,
          sharePostUsername: selectedPost.userId?.username,
          shareCreatedAt: selectedPost.userId?.createdAt,
        });

        await axios.put(
          `/postFeatures/${selectedPost._id}/incrementShareCount`
        );
      }

      showNotification("Gönderi başarıyla iletildi!", "success");
      setSelectedFollowers([]);
      setContent(""); // Gönderim sonrası input'u temizle
      onClose();
    } catch (err) {
      showNotification("Bir hata oluştu: " + err.message, "error");
    }
  };

  // Evinize paylaşma
  const handleSendforHome = async () => {
    if (!selectedPost?.content && !selectedPost?.mediaUrl) {
      showNotification("Geçerli bir gönderi yok.", "error");
      return;
    }

    try {
      const response = await axios.post("/posts", {
        content,
        sharePostId: selectedPost._id,
        sharePostContent: selectedPost.content,
        userId: userId,
        sharePostMedia: selectedPost.mediaUrl,
        sharePostProfilePhoto: selectedPost.userId?.photo,
        sharePostFirstName: selectedPost.userId?.firstName,
        sharePostLastName: selectedPost.userId?.lastName,
        sharePostUsername: selectedPost.userId?.username,
        isSharedFromHome: true,
        originalPostId: selectedPost._id,
        shareCreatedAt: selectedPost.userId?.createdAt,
      });

      if (response.status === 201) {
        showNotification("Gönderiniz başarıyla paylaşıldı!", "success");
        onClose();
      }
    } catch (err) {
      showNotification("Bir hata oluştu: " + err.message, "error");
    }
  };

  // Modal dışına tıklanırsa kapatma
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
        <header className="share-header" onClick={handleSendforHome}>
          <h3>Alıntı olarak Paylaş</h3>
        </header>
        <textarea
          className="content-textarea"
          value={content}
          onChange={handleContentChange}
          placeholder="Buraya yazın..."
        />

        <main className="modal-content">
          <h4>Takip Ettiklerin</h4>
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

          <button
            className="send-button"
            onClick={handleSend}
            disabled={!selectedFollowers.length || !content} // Eğer içerik yoksa butonu devre dışı bırak
          >
            Gönder
          </button>
        </main>
      </div>
    </div>
  );
};

export default ShareModal;
