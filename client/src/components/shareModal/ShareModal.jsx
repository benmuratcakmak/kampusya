import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { AuthContext } from "../../context/AuthContext";
import Icons from "../../icons";
import { Avatar } from "@mui/material";
import axios from "axios";
import "./ShareModal.css";
import baseUrl from '../../utils/baseUrl';

const ShareModal = ({ isOpen, onClose, selectedPost }) => {
  const { user } = useContext(AuthContext);
  const userId = user?._id;

  // State tanımları
  const [followers, setFollowers] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [content, setContent] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [shareMode, setShareMode] = useState(null); // 'quote' veya 'follower' için

  const modalContentRef = useRef(null);

  const handleShareToWhatsApp = () => {
    const title = "Kampusya'da Paylaşılan Gönderi";
    const username = selectedPost.userId?.username ? `@${selectedPost.userId.username}` : '';
    const content = selectedPost.content || '';
    const postUrl = `${baseUrl}/posts/post/${selectedPost._id}`;
    
    // Medya önizleme metni
    let mediaPreview = '';
    if (selectedPost.mediaUrl) {
      if (selectedPost.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/)) {
        mediaPreview = '📷 Fotoğraf';
      } else if (selectedPost.mediaUrl.match(/\.(mp4|webm)$/)) {
        mediaPreview = '🎥 Video';
      }
    }

    // Mesajı oluştur
    const message = [
      `${title}`,
      username && `${username} tarafından paylaşıldı`,
      '',
      content.length > 100 ? content.substring(0, 100) + '...' : content,
      mediaPreview && `\n${mediaPreview}`,
      '',
      '🔗 Gönderiyi görüntüle:',
      postUrl
    ].filter(Boolean).join('\n');

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    incrementShareCount();
  };
  
  const handleShareToInstagram = () => {
    const postUrl = `${baseUrl}/posts/post/${selectedPost._id}`;
    const username = selectedPost.userId?.username ? `@${selectedPost.userId.username}` : '';
    const content = selectedPost.content || '';
    
    // Instagram için caption oluştur
    const caption = [
      content.length > 80 ? content.substring(0, 80) + '...' : content,
      '',
      `Posted by ${username} on @kampusya`,
      '',
      '🔗 Link in bio',
      '#kampusya #socialmedia'
    ].filter(Boolean).join('\n');

    if (selectedPost.mediaUrl) {
      // Instagram story için deep link
      const storyUrl = new URL('instagram-stories://share');
      storyUrl.searchParams.append('source_application', 'kampusya');
      storyUrl.searchParams.append('media', selectedPost.mediaUrl);
      storyUrl.searchParams.append('caption', caption);
      
      window.location.href = storyUrl.toString();
    } else {
      // Feed paylaşımı için
      const feedUrl = new URL('instagram://share');
      feedUrl.searchParams.append('caption', `${caption}\n\n${postUrl}`);
      
      window.location.href = feedUrl.toString();
    }

    // Fallback olarak web versiyonuna yönlendir
    setTimeout(() => {
      window.open(`https://instagram.com`, "_blank");
    }, 500);
    
    incrementShareCount();
  };
  
  const handleShareToTwitter = () => {
    const username = selectedPost.userId?.username ? `@${selectedPost.userId.username}` : '';
    const content = selectedPost.content || '';
    const postUrl = `${baseUrl}/posts/post/${selectedPost._id}`;
    
    const message = [
      content.length > 80 ? content.substring(0, 80) + '...' : content,
      username && `via ${username}`,
      '👉 #Kampusya'
    ].filter(Boolean).join(' ');

    // Twitter Web Intent URL'sini oluştur
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.append('text', message);
    twitterUrl.searchParams.append('url', postUrl);
    twitterUrl.searchParams.append('via', 'kampusya');
    
    window.open(twitterUrl.toString(), "_blank");
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
    if (shareMode === 'quote') return; // Alıntı modundaysa takipçi seçimine izin verme
    
    setSelectedFollowers((prev) => {
      const newSelection = prev.includes(followerId)
        ? prev.filter((id) => id !== followerId)
        : [...prev, followerId];
      
      // Eğer hiç seçili kullanıcı kalmadıysa share mode'u ve input'u sıfırla
      if (newSelection.length === 0) {
        setShareMode(null);
        setShowInput(false);
        setContent("");
      } else {
        setShareMode('follower');
        setShowInput(true);
      }
      
      return newSelection;
    });
  }, [shareMode]);

  const showNotification = useCallback((message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: ${type === "success" ? "#4CAF50" : "#f44336"};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    notification.innerHTML = `
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Fade in
    requestAnimationFrame(() => {
      notification.style.opacity = "1";
    });

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }, []);

  const handleSend = async () => {
    if (!selectedPost?._id || !selectedFollowers.length) {
      showNotification("Lütfen en az bir kişi seçin!", "error");
      return;
    }

    try {
      for (const followerId of selectedFollowers) {
        const { data } = await axios.post(
          "/api/conversations/getOrCreateConversation",
          { senderId: userId, receiverId: followerId }
        );
        const conversationId = data._id;

        // Mesaj gönderme isteği
        const messageData = {
          conversationId,
          sharePostId: selectedPost._id,
          sender: userId,
          text: content ? content.trim() : "" // content varsa trim yap, yoksa boş string gönder
        };

        await axios.post("/api/messages", messageData);
        await axios.put(`/api/postFeatures/${selectedPost._id}/incrementShareCount`);
      }

      showNotification("Gönderi iletildi", "success");
      setSelectedFollowers([]);
      setContent("");
      onClose();
    } catch (err) {
      console.error("Hata detayı:", err.response?.data);
      showNotification("Bir hata oluştu: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleSendforHome = async () => {
    // Eğer follower modu aktifse ve kullanıcılar seçiliyse, işlemi engelle
    if (shareMode === 'follower' && selectedFollowers.length > 0) return;
    
    // İptal butonuna tıklandıysa sadece state'leri sıfırla
    if (shareMode === 'quote') {
      setShareMode(null);
      setShowInput(false);
      setContent("");
      return;
    }
    
    // İlk tıklamada sadece input'u göster
    setShareMode('quote');
    setShowInput(true);
  };

  // Yeni bir fonksiyon ekleyelim
  const handleQuoteSubmit = async () => {
    try {
      const response = await axios.post("/api/posts", {
        content: content.trim(),
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
        showNotification("Gönderi paylaşıldı", "success");
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

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowInput(false);
      setShareMode(null);
      setContent("");
      setSelectedFollowers([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="share-modal-container">
      <div className={`share-modal-content ${showInput ? 'has-input' : ''}`} ref={modalContentRef}>
        <button 
          onClick={handleSendforHome}
          className={shareMode === 'follower' ? 'disabled' : ''}
        >
          {shareMode === 'quote' ? "İptal" : "Alıntı olarak Paylaş"}
          <Icons.Draw />
        </button>

        <h4 className={shareMode === 'quote' ? 'disabled' : ''}>ya da</h4>
        <h4 className={shareMode === 'quote' ? 'disabled' : ''}>Takip ettiklerine gönder</h4>

        <main className={`modal-content ${shareMode === 'quote' ? 'disabled' : ''}`}>
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
                    src={follower.photo || getAvatarUrl(follower.username)}
                    alt={follower.username}
                    className="share-modal-avatar"
                  />
                  <span>{follower.username}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Takip ettiğiniz kimse yok.</p>
          )}
        </main>

        {!shareMode && (
          <div className="social-icons-container">
            <Icons.WhatsApp
              className="social-icon whatsapp"
              onClick={handleShareToWhatsApp}
            />
            <Icons.Instagram
              className="social-icon instagram"
              onClick={handleShareToInstagram}
            />
            <Icons.X
              className="social-icon twitter"
              onClick={handleShareToTwitter}
            />
          </div>
        )}

        {showInput && (
          <div className="input-container">
            <input
              className="share-modal-input"
              value={content}
              onChange={handleContentChange}
              placeholder="Buraya yazın... (opsiyonel)"
            />
            <Icons.FaPaperPlane
              className="share-modal-send-button"
              onClick={shareMode === 'quote' ? handleQuoteSubmit : handleSend}
              disabled={shareMode === 'follower' && !selectedFollowers.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
