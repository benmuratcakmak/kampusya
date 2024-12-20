import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import HomePost from "../../components/homePost/HomePost.jsx";
import ShareModal from "../../components/shareModal/ShareModal";
import CommentModal from "../../components/commentModal/CommentModal.jsx";
// import axiosInstance from "../../api.js";
import "./Home.css";

export const Home = () => {
  const { user } = useContext(AuthContext);
  const userId = user._id;
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('campus');
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  // const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const navigate = useNavigate();
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [campusPosts, setCampusPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (campusPosts.length > 0) return;
    
    setIsLoading(true);
    try {
      const res = await axios.get("/api/posts");
      setCampusPosts(res.data);
      setPosts(res.data);
    } catch (err) {
      console.error("Postlar alınırken hata oluştu:", err);
      setError("Postlar yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [campusPosts.length]);

  const fetchFollowingPosts = useCallback(async () => {
    if (followingPosts.length > 0) return;
    
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/posts/following/${userId}`);
      setFollowingPosts(res.data);
      setPosts(res.data);
    } catch (err) {
      console.error("Takip edilen gönderiler alınırken hata oluştu:", err);
      setError("Gönderiler yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, followingPosts.length]);

  useEffect(() => {
    if (activeTab === 'campus') {
      fetchPosts();
    } else {
      fetchFollowingPosts();
    }
  }, [activeTab, fetchPosts, fetchFollowingPosts]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setCampusPosts([]);
      setFollowingPosts([]);
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const handleLike = useCallback(async (postId) => {
    try {
      // Optimistik güncelleme
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(userId)
                  ? post.likes.filter(id => id !== userId)
                  : [...post.likes, userId]
              }
            : post
        )
      );

      // Backend işlemi
      const res = await axios.post(`/api/postFeatures/${postId}/like`, {
        userId,
      });

      // Hata durumunda geri al
      if (!res.data) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likes: post.likes.includes(userId)
                    ? post.likes.filter(id => id !== userId)
                    : [...post.likes, userId]
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Beğeni işlemi sırasında hata oluştu:", error);
      // Hata durumunda UI'ı eski haline getir
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(userId)
                  ? post.likes.filter(id => id !== userId)
                  : [...post.likes, userId]
              }
            : post
        )
      );
    }
  }, [userId]);

  const handleQuoteClick = (postId) => {
    navigate(`/posts/post/${postId}`);
  };

  const handleCommentClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseCommentModal = () => {
    setSelectedPost(null);
  };

  const handleDeletePost = async (postId) => {
    const isConfirmed = window.confirm(
      "Bu gönderiyi silmek istediğinizden emin misiniz?"
    );
    if (isConfirmed) {
      try {
        await axios.delete(`/api/posts/${postId}`);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
      } catch (error) {
        console.error("Post silinirken hata oluştu:", error);
      }
    }
  };

  const [modalState, setModalState] = useState({
    isShareModalOpen: false,
    selectedPostForShare: null,
    selectedPostForComment: null,
  });

  const handleShareClick = (post) => {
    setModalState({
      ...modalState,
      isShareModalOpen: true,
      selectedPostForShare: post,
    });
  };

  const closeShareModal = () => {
    setModalState({
      ...modalState,
      isShareModalOpen: false,
      selectedPostForShare: null,
    });
  };

  const handleCommentSubmit = (postId) => {
    setSelectedPost(null);
    // Yalnızca yorum yapılan postu güncelleyin
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, comments: [...post.comments] } : post
      )
    );
  };

  const handleImageClick = (imageUrl) => {
    setFullscreenImage(imageUrl);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'campus') {
      setPosts(campusPosts);
    } else {
      setPosts(followingPosts);
    }
  };

  if (isLoading) {
    return <div className="loading">Gönderiler yükleniyor...</div>;
  }

  return (
    <div className="home-posts-container">
      <div className="home-tabs" style={{ zIndex: 1 }}>
        <div 
          className={`tab ${activeTab === 'campus' ? 'active' : ''}`}
          onClick={() => handleTabChange('campus')}
        >
          Kampüste olan biten
        </div>
        <div 
          className={`tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => handleTabChange('following')}
        >
          Takip edilenler
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading-spinner">Yükleniyor...</div>
      ) : Array.isArray(posts) && posts.length > 0 ? (
        posts.map((post) =>
          post && post._id ? (
            <HomePost
              key={post._id}
              post={post}
              userId={userId}
              handleLike={handleLike}
              handleQuoteClick={handleQuoteClick}
              handleCommentClick={handleCommentClick}
              handleShareClick={handleShareClick}
              handleDeletePost={handleDeletePost}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
            />
          ) : null
        )
      ) : (
        <div className="no-posts-message">
          {activeTab === 'campus' 
            ? "Henüz gönderi yok." 
            : "Takip ettiğiniz kişilerin gönderileri burada görünecek."}
        </div>
      )}

      {selectedPost && (
        <CommentModal
          postId={selectedPost?._id}
          onClose={handleCloseCommentModal}
          onSubmit={handleCommentSubmit}
        />
      )}

      <ShareModal
        isOpen={modalState.isShareModalOpen}
        onClose={closeShareModal}
        selectedPost={modalState.selectedPostForShare}
      />

      {/* Add fullscreen modal */}
      {fullscreenImage && (
        <div className="fullscreen-image-modal" onClick={() => setFullscreenImage(null)}>
          <div className="close-button" onClick={() => setFullscreenImage(null)}>
            <Icons.Times />
          </div>
          <img src={fullscreenImage} alt="Full screen" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};
