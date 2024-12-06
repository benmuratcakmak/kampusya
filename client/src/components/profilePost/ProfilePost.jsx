import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import { AuthContext } from "../../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import {
  MdFavoriteBorder,
  MdFavorite,
  MdChatBubbleOutline,
  MdMoreVert,
  MdShare,
} from "react-icons/md";
import FormatTime from "../FormatTime.js";
import ShareModal from "../shareModal/ShareModal.jsx";
import Countdown from "../CountDown.js";
import CommentModal from "../commentModal/CommentModal.jsx";
import PollSection from "../pollSection/PollSection.jsx";
import "./ProfilePost.css";
import "../../pages/home/Quote.css";

export const ProfilePost = ({ posts }) => {
  const { user } = useContext(AuthContext);
  const userId = user._id;
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const navigate = useNavigate();

  // Use useRef to store posts to avoid resetting on re-renders
  const postsRef = useRef(posts);

  // Update postsRef whenever posts prop changes
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const handleLike = useCallback(
    async (postId) => {
      try {
        const res = await axios.post(`/postFeatures/${postId}/like`, {
          userId,
        });
        // Update likes count and user's like status without reloading the page
        postsRef.current = postsRef.current.map((post) =>
          post._id === postId
            ? { ...post, likes: res.data.likes, isLiked: res.data.isLiked }
            : post
        );
      } catch (error) {
        setError("Beğeni işlemi sırasında bir hata oluştu.");
        console.error("Hata:", error);
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
        // Update posts using postsRef
        postsRef.current = postsRef.current.filter(
          (post) => post._id !== postId
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
  };

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="profile-posts-container">
      {error && <div className="error-message">{error}</div>}
      {postsRef.current.length ? (
        postsRef.current.map((post) => (
          <div key={post._id} className="post">
            <div className="post-left">
              <Avatar
                src={post.userId?.photo}
                alt="Profile"
                className="avatar"
                onClick={() => handleProfileClick(post.userId.username)}
              />
            </div>
            <div className="post-right">
              <div className="right-info">
                <p>
                  {post.userId?.firstName} {post.userId?.lastName}
                </p>
                <p>@{post.userId?.username}</p>
                <FormatTime timestamp={post.createdAt} />
                {post.userId?._id === userId && (
                  <MdMoreVert
                    style={{
                      cursor: "pointer",
                      marginLeft: "auto",
                      color: "gray",
                    }}
                    onClick={() =>
                      setShowDropdown((prev) =>
                        prev === post._id ? null : post._id
                      )
                    }
                  />
                )}
              </div>
              {post.content && (
                <div className="right-text">
                  <p>{post.content}</p>
                </div>
              )}

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

              {/* PollSection Component */}
              {post.pollQuestion && (
                <PollSection
                  postId={post._id}
                  pollQuestion={post.pollQuestion}
                  pollOptions={post.pollOptions}
                  userId={userId}
                />
              )}

              {/* Quote Section */}
              {post.sharePostProfilePhoto && (
                <div
                  className="quote-container"
                  style={{
                    display:
                      post.sharePostProfilePhoto &&
                      post.sharePostFirstName &&
                      post.sharePostLastName &&
                      post.sharePostUsername &&
                      post.sharePostContent
                        ? "block"
                        : "none",
                    border:
                      post.sharePostProfilePhoto ||
                      post.sharePostFirstName ||
                      post.sharePostLastName ||
                      post.sharePostUsername ||
                      post.sharePostContent ||
                      post.sharePostMedia
                        ? "#333 1px solid"
                        : "none",
                  }}
                  onClick={() => handleQuoteClick(post.sharePostId)}
                >
                  <div className="quote-top">
                    <div className="quote-top-left">
                    {post.sharePostProfilePhoto && (
                        <Avatar
                          src={
                            post.sharePostProfilePhoto ||
                            "/path/to/default-avatar.png"
                          }
                          alt="Profile"
                          className="avatar"
                          onClick={() =>
                            handleProfileClick(post.userId.username)
                          }
                        />
                      )}
                    </div>
                    <div className="quote-top-right">
                      <div className="quote-top-right-info">
                        <small>
                          {post.sharePostFirstName} {post.sharePostLastName}
                        </small>
                        <small>{post.sharePostUsername}</small>
                      </div>
                      <div className="quote-right-top-text">
                        <p>{post.sharePostContent}</p>
                      </div>
                    </div>
                  </div>
                  {post.sharePostMedia && (
                    <div className="quote-bottom">
                      <div className="quote-bottom-media">
                        <img src={post.sharePostMedia} alt="Shared Media" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {post.eventTitle && (
                <div className="event-details">
                  <h3 className="event-title">{post.eventTitle}</h3>
                  <p className="event-description">{post.eventDescription}</p>
                  <div className="event-meta">
                    <p className="event-date">
                      {new Date(post.eventDate).toLocaleString("tr-TR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </p>
                    <Countdown eventDate={post.eventDate} />
                  </div>
                </div>
              )}
              <div className="right-icons">
                <span
                  className="like-button"
                  onClick={() => handleLike(post._id)}
                >
                  {post.likes.includes(userId) ? (
                    <MdFavorite style={{ color: "red" }} />
                  ) : (
                    <MdFavoriteBorder />
                  )}
                  {post.likes.length}
                </span>
                <span
                  className="comment-button"
                  onClick={() => handleCommentClick(post)}
                >
                  <MdChatBubbleOutline />
                  {post.comments.length}
                </span>
                <span
                  className="share-button"
                  onClick={() => handleShareClick(post)}
                >
                  <MdShare />
                  {post.shareCount || 0}
                </span>
              </div>
              {showDropdown === post._id && (
                <div className="dropdown-menu">
                  <button onClick={() => handleDeletePost(post._id)}>
                    Gönderiyi sil
                  </button>
                </div>
              )}
              {selectedPost && selectedPost._id === post._id && (
                <CommentModal
                  postId={post._id}
                  onClose={handleCloseCommentModal}
                  onCommentSubmit={handleCommentSubmit}
                />
              )}
            </div>
          </div>
        ))
      ) : (
        <p>Henüz bir paylaşım yapmadınız.</p>
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
          onPostShare={() => {}}
        />
      )}
    </div>
  );
};
