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
import Icons from "../../icons";
import FormatTime from "../FormatTime.js";
import ShareModal from "../shareModal/ShareModal.jsx";
import CommentModal from "../commentModal/CommentModal.jsx";
import PollDetails from "../pollDetails/PollDetails.jsx";
import EventDetails from "../eventDetails/EventDetails.jsx";
import DeletePost from "../deletePost/DeletePost.jsx";

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
        const res = await axios.post(`/api/postFeatures/${postId}/like`, {
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
        await axios.delete(`/api/posts/${postId}`);
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

              {!post.sharePostId?.eventTitle && post.eventTitle && (
                <div className="right-event">
                  <EventDetails
                    eventTitle={post.eventTitle}
                    eventDescription={post.eventDescription}
                    eventDate={post.eventDate}
                  />
                </div>
              )}
              {!post.sharePostId?.pollQuestion && post.pollQuestion && (
                <div className="right-poll">
                  <PollDetails
                    postId={post._id}
                    pollQuestion={post.pollQuestion}
                    pollOptions={post.pollOptions}
                    userId={userId}
                  />
                </div>
              )}

              {/* Gönderi Alıntısı */}
              <div
                className="quote-container"
                style={{
                  display:
                    post.sharePostId?.content ||
                    post.sharePostId?.mediaUrl ||
                    post.sharePostId?.pollQuestion ||
                    post.sharePostId?.eventTitle
                      ? "block"
                      : "none",
                  border:
                    post.sharePostId?.content ||
                    post.sharePostId?.mediaUrl ||
                    post.sharePostId?.pollQuestion ||
                    post.sharePostId?.eventTitle
                      ? "#333 1px solid"
                      : "none",
                }}
                onClick={() => handleQuoteClick(post.sharePostId._id)}
              >
                <div className="quote-top">
                  <div className="quote-top-left">
                    {post.sharePostId && (
                      <Avatar
                        src={
                          post.sharePostId?.userId?.photo ||
                          "/path/to/default-avatar.png"
                        }
                        alt="Profile"
                        className="avatar"
                      />
                    )}
                  </div>
                  <div className="quote-top-right">
                    <div className="quote-top-right-info">
                      <small>
                        {post.sharePostId?.userId?.firstName}{" "}
                        {post.sharePostId?.userId?.lastName}
                      </small>
                      <small>@{post.sharePostId?.userId?.username}</small>
                      <small>
                        <FormatTime timestamp={post.sharePostId?.createdAt} />
                      </small>
                    </div>
                    {post.sharePostId?.content && (
                      <div className="quote-right-top-text">
                        <p>{post.sharePostId?.content}</p>
                      </div>
                    )}
                  </div>
                </div>
                {post.sharePostId?.mediaUrl && (
                  <div className="quote-bottom">
                    <div className="quote-bottom-media">
                      <img
                        src={post.sharePostId?.mediaUrl}
                        alt="Shared Media"
                      />
                    </div>
                  </div>
                )}

                {post.sharePostId?.eventTitle && (
                  <EventDetails
                    eventTitle={post.sharePostId?.eventTitle}
                    eventDescription={post.sharePostId?.eventDescription}
                    eventDate={post.sharePostId?.eventDate}
                  />
                )}

                {post.sharePostId?.pollQuestion && (
                  <PollDetails
                    postId={post.sharePostId?._id}
                    pollQuestion={post.sharePostId?.pollQuestion}
                    pollOptions={post.sharePostId?.pollOptions}
                    userId={userId}
                  />
                )}
              </div>

              <div className="right-icons">
                <span
                  className="like-button"
                  onClick={() => handleLike(post._id)}
                >
                  {post.likes.includes(userId) ? (
                    <Icons.Heart style={{ color: "red" }} />
                  ) : (
                    <Icons.HeartBorder />
                  )}
                  {post.likes.length}
                </span>
                <span
                  className="comment-button"
                  onClick={() => handleCommentClick(post)}
                >
                  <Icons.Comment />
                  {post.comments.length}
                </span>
                <span
                  className="share-button"
                  onClick={() => handleShareClick(post)}
                >
                  <Icons.Share />
                  {post.shareCount || 0}
                </span>
              </div>
              {showDropdown === post._id && (
                <DeletePost
                  postId={post._id}
                  handleDeletePost={handleDeletePost}
                />
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
