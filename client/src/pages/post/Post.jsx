import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import Icons from "../../icons";
import FormatTime from "../../components/FormatTime";
import ShareModal from "../../components/shareModal/ShareModal";
import CommentModal from "../../components/commentModal/CommentModal";
import PollDetails from "../../components/pollDetails/PollDetails";
import DeletePost from "../../components/deletePost/DeletePost";
import { AuthContext } from "../../context/AuthContext";
import EventDetails from '../../components/eventDetails/EventDetails';

export const Post = () => {
  const { user } = useContext(AuthContext);
  const userId = user._id;
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/post/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Post bilgisi alınamadı:", err);
        setError("Post yüklenemedi. Lütfen tekrar deneyin.");
      }
    };
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    try {
      const res = await axios.post(`/api/postFeatures/${postId}/like`, { userId });
      setPost((prevPost) => ({
        ...prevPost,
        likes: res.data.likes,
      }));
    } catch (error) {
      console.error("Beğeni işlemi sırasında hata oluştu:", error);
    }
  };

  const handleDeletePost = async () => {
    const isConfirmed = window.confirm(
      "Bu gönderiyi silmek istediğinizden emin misiniz?"
    );
    if (isConfirmed) {
      try {
        await axios.delete(`/api/posts/${postId}`);
        navigate("/"); // Gönderi silindikten sonra ana sayfaya yönlendirme
      } catch (error) {
        console.error("Post silinirken hata oluştu:", error);
      }
    }
  };

  const handleShareClick = (post) => {
    console.log("Share tıklandı:", post);
    setSelectedPostForShare(post); // Burada post objesini doğru şekilde seçtiğinizden emin olun
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleCommentClick = () => {
    setSelectedPost(post);
  };

  const handleCloseCommentModal = () => {
    setSelectedPost(null);
  };

  if (!post)
    return (
      <div className="loading-container">
        <p>Yükleniyor...</p>
      </div>
    );

  return (
    <div className="home-posts-container">
      <div className="close-back-icon">
        <Icons.Back
          onClick={() => navigate(-1)} // Kullanıcıyı önceki sayfaya yönlendirir
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="post">
        <div className="post-left">
          <Avatar
            src={post.userId?.photo}
            alt="Profile"
            onClick={() => navigate(`/profile/${post.userId?.username}`)}
          />
        </div>
        <div className="post-right">
          <div className="right-info">
            <p>
              {post.userId?.firstName} {post.userId?.lastName}
            </p>
            <p>@{post.userId?.username}</p>
            <p>
              <FormatTime timestamp={post.createdAt} />
            </p>
            {post.userId?._id === userId && (
              <Icons.More
                style={{
                  cursor: "pointer",
                  marginLeft: "auto",
                  color: "gray",
                }}
                onClick={() => setShowDropdown((prev) => !prev)}
              />
            )}
          </div>
          {post.content && <p className="right-text">{post.content}</p>}
          {post.mediaUrl && (
            <div className="right-media">
              {post.mediaUrl.includes("video") ? (
                <video controls>
                  <source src={post.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <img src={post.mediaUrl} alt="Post Media" />
              )}
            </div>
          )}
          {post.pollQuestion && (
            <PollDetails
              postId={post._id}
              pollQuestion={post.pollQuestion}
              pollOptions={post.pollOptions}
              userId={userId}
            />
          )}
          {post.eventTitle && (
            <EventDetails
              eventTitle={post.eventTitle}
              eventDescription={post.eventDescription}
              eventDate={post.eventDate}
            />
          )}
          <div className="right-icons">
            <span className="like-button" onClick={handleLike}>
              {post.likes.includes(userId) ? (
                <Icons.Heart style={{ color: "red" }} />
              ) : (
                <Icons.HeartBorder />
              )}
              {post.likes.length}
            </span>
            <span className="comment-button" onClick={handleCommentClick}>
              <Icons.Comment />
              {post.comments.length}
            </span>
            <span className="share-button" onClick={handleShareClick}>
              <Icons.Share />
              {post.shareCount || 0}
            </span>
          </div>
          {showDropdown && (
            <DeletePost postId={post._id} handleDeletePost={handleDeletePost} />
          )}
        </div>
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
        selectedPost={selectedPostForShare}
      />
      {isShareModalOpen && (
        <ShareModal post={selectedPostForShare} onClose={closeShareModal} />
      )}
      {selectedPost && (
        <CommentModal postId={post._id} onClose={handleCloseCommentModal} />
      )}
    </div>
  );
};
