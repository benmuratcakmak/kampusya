import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import HomePost from "../../components/homePost/HomePost.jsx";
import ShareModal from "../../components/shareModal/ShareModal";
import CommentModal from "../../components/commentModal/CommentModal.jsx";
// import "./Home.css";

export const Home = () => {
  const { user } = useContext(AuthContext);
  const userId = user._id;
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Postlar alınırken hata oluştu:", err);
      setError("Postlar yüklenemedi. Lütfen tekrar deneyin.");
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = useCallback(
    async (postId) => {
      try {
        const res = await axios.post(`/postFeatures/${postId}/like`, {
          userId,
        });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, likes: res.data.likes } : post
          )
        );
      } catch (error) {
        console.error("Beğeni işlemi sırasında hata oluştu:", error);
      }
    },
    [userId]
  );

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
        await axios.delete(`/posts/${postId}`);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
      } catch (error) {
        console.error("Post silinirken hata oluştu:", error);
      }
    }
  };

  const handleShareClick = (post) => {
    setSelectedPostForShare(post);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleCommentSubmit = () => {
    setSelectedPost(null);
    fetchPosts();
  };

  return (
    <div className="home-posts-container">
      {error && <div className="error-message">{error}</div>}
      {posts.map((post) =>
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
      )}

      {selectedPost && (
        <CommentModal
          postId={selectedPost?._id}
          onClose={handleCloseCommentModal}
          onSubmit={handleCommentSubmit}
        />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
        selectedPost={selectedPostForShare}
      />
      {isShareModalOpen && (
        <ShareModal
          post={selectedPostForShare}
          onClose={closeShareModal}
          onPostShare={() => fetchPosts()}
        />
      )}
    </div>
  );
};
