import React from "react";
import Avatar from "@mui/material/Avatar";
import Icons from "../../icons";
import { useNavigate } from "react-router-dom";
import FormatTime from "../FormatTime";
import PollDetails from "../pollDetails/PollDetails";
import EventDetails from "../eventDetails/EventDetails";
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
          <p onClick={() => handleProfileClick(post.userId.username)}>
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
          {/* Alıntı Bilgileri */}
          <div className="quote-top">
            <div className="quote-top-left">
              {post.sharePostId && (
                <Avatar
                  src={post.sharePostId.userId?.photo}
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
                <img src={post.sharePostId?.mediaUrl} alt="Shared Media" />
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
          <span className="like-button" onClick={() => handleLike(post._id)}>
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
          <span className="share-button" onClick={() => handleShareClick(post)}>
            <Icons.Share />
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
