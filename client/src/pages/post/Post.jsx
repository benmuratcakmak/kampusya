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
import { Helmet } from 'react-helmet';
import baseUrl from '../../utils/baseUrl';


export const Post = () => {
  const { user } = useContext(AuthContext);
  const userId = user._id;
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

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

  const handleShareClick = () => {
    setSelectedPost(post);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setSelectedPost(null);
  };

  const handleCommentClick = () => {
    setShowCommentModal(true);
    setSelectedPost(post);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPost(null);
  };

  const handleImageClick = (imageUrl) => {
    setFullscreenImage(imageUrl);
  };

  // Meta etiketlerini oluşturan yardımcı fonksiyon
  const getMetaTags = () => {
    if (!post) return null;

    const title = `${post.userId?.firstName} ${post.userId?.lastName} (@${post.userId?.username}) - Kampusya`;
    const description = post.content || "Kampusya'da paylaşılan gönderi";
    const image = post.mediaUrl || `${baseUrl}/og-default-image.jpg`;
    const url = `${baseUrl}/posts/post/${post._id}`;
    const type = post.mediaUrl?.match(/\.(mp4|webm)$/) ? 'video.other' : 'website';

    return (
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Open Graph Meta Etiketleri */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Kampusya" />

        {/* Twitter Card Meta Etiketleri */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@kampusya" />
        <meta name="twitter:creator" content={`@${post.userId?.username}`} />
        <meta name="twitter:domain" content="kampusya.com" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image:src" content={image} />
        {type === 'video.other' && (
          <>
            <meta name="twitter:card" content="player" />
            <meta name="twitter:player" content={post.mediaUrl} />
            <meta name="twitter:player:width" content="1280" />
            <meta name="twitter:player:height" content="720" />
          </>
        )}

        {/* Instagram Meta Etiketleri */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="article:author" content={`${post.userId?.firstName} ${post.userId?.lastName}`} />
        <meta property="article:published_time" content={post.createdAt} />
      </Helmet>
    );
  };

  if (!post)
    return (
      <div className="loading-container">
        <p>Yükleniyor...</p>
      </div>
    );

  return (
    <div className="home-posts-container">
      {getMetaTags()}
      <div className="close-back-icon">
        <Icons.Back
          onClick={() => navigate(-1)} // Kullanıcıyı önceki sayfaya yönlendirir
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="post">
        <div className="post-left">
          <Avatar
            src={post.userId?.photo || getAvatarUrl(post.userId?.username)}
            alt={post.userId?.username}
            className="post-avatar"
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
          {post.content && <span className="right-text">{post.content}</span>}
          {post.mediaUrl && (
            <div className="right-media">
              {post.mediaUrl.includes("video") ? (
                <video controls>
                  <source src={post.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <img src={post.mediaUrl} alt="Post Media" onClick={() => handleImageClick(post.mediaUrl)} />
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
        selectedPost={selectedPost}
      />
      {showCommentModal && (
        <CommentModal postId={post._id} onClose={handleCloseCommentModal} />
      )}
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
