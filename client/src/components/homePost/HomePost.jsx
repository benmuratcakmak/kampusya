import React from "react";
import Avatar from "@mui/material/Avatar";
import {
  MdFavoriteBorder,
  MdFavorite,
  MdChatBubbleOutline,
  MdShare,
  MdMoreVert,
} from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import FormatTime from "../FormatTime";
import PollSection from "../pollSection/PollSection";
import DeletePost from "../deletePost/DeletePost";
import "./HomePost.css";

const HomePost = ({
  post,
  userId,
  handleLike,
  handleQuoteClick,
  handleCommentClick,
  handleShareClick,
  handleDeletePost,
  showDropdown,
  setShowDropdown,
}) => {
  const navigate = useNavigate();

  // Profil tıklama işlemi
  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`); // username'e göre kullanıcı profil sayfasına git
  };
  return (
    <div className="post">
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
                setShowDropdown((prev) => (prev === post._id ? null : post._id))
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

        {post.pollQuestion && (
          <PollSection
            postId={post._id}
            pollQuestion={post.pollQuestion}
            pollOptions={post.pollOptions}
            userId={userId}
          />
        )}

        {/* Gönderi Alıntısı */}
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
          {/* Alıntı Bilgileri */}
          <div className="quote-top">
            <div className="quote-top-left">
              {post.sharePostProfilePhoto && (
                <Avatar
                  src={post.sharePostProfilePhoto}
                  alt="Profile"
                  className="avatar"
                  onClick={() => handleProfileClick(post.sharePostUsername)}
                />
              )}
            </div>
            <div className="quote-top-right">
              <div className="quote-top-right-info">
                <small>
                  {post.sharePostFirstName} {post.sharePostLastName}
                </small>
                <small>@{post.sharePostUsername}</small>
                <FormatTime timestamp={post.shareCreatedAt} />
              </div>
              {post.sharePostContent && (
                <div className="quote-right-top-text">
                  <p>{post.sharePostContent}</p>
                </div>
              )}
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

        <div className="right-icons">
          <span className="like-button" onClick={() => handleLike(post._id)}>
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
          <span className="share-button" onClick={() => handleShareClick(post)}>
            <MdShare />
            {post.shareCount || 0}
          </span>
        </div>

        {showDropdown === post._id && (
          <DeletePost postId={post._id} handleDeletePost={handleDeletePost} />
        )}
      </div>
    </div>
  );
};

export default HomePost;
