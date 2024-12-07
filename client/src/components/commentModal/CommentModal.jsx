import React, { useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Icons from "../../icons";
import FormatTime from "../../components/FormatTime";
import SendIcon from "@mui/icons-material/Send";
import "./CommentModal.css";
import { Avatar } from "@mui/material";

const CommentModal = ({ postId, onCommentSubmit, onClose }) => {
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const [replyContents, setReplyContents] = useState({});
  const [visibleReplies, setVisibleReplies] = useState({});
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch comments when postId changes
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/postFeatures/${postId}/comments`);
        console.log(res.data); // Veriyi kontrol edin
        setComments(res.data);
      } catch (err) {
        alert("Yorumlar alınırken hata oluştu.");
      }
    };
    if (postId) fetchComments();
  }, [postId]);

  // Refresh comments
  const refreshComments = useCallback(async () => {
    try {
      const res = await axios.get(`/postFeatures/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      alert("Yorumlar yenilenirken hata oluştu.");
    }
  }, [postId]);

  // Handle new comment submission
  const handleCommentSubmit = async () => {
    try {
      await axios.post(`/postFeatures/${postId}/comment`, {
        userId: user._id,
        content: commentContent,
      });
      setCommentContent("");
      refreshComments();
      // onCommentSubmit çağrısını kaldırarak modalın kapanmasını engelle
      // onCommentSubmit();
    } catch (err) {
      alert("Yorum eklerken bir hata oluştu.");
    }
  };

  // Handle like toggling
  const handleLike = async (id, type, parentId = null) => {
    try {
      const url =
        type === "comment"
          ? `/postFeatures/${postId}/comment/${id}/like`
          : `/postFeatures/${postId}/comment/${parentId}/reply/${id}/like`;

      const res = await axios.post(url, { userId: user._id });

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === parentId || comment._id === id
            ? {
                ...comment,
                ...(type === "comment"
                  ? { likes: res.data.likes }
                  : {
                      replies: comment.replies.map((reply) =>
                        reply._id === id
                          ? { ...reply, likes: res.data.likes }
                          : reply
                      ),
                    }),
              }
            : comment
        )
      );
    } catch (err) {
      alert("Beğeni işlemi sırasında bir hata oluştu.");
    }
  };

  // Reply functions
  const handleReplyChange = (commentId, value) =>
    setReplyContents((prev) => ({ ...prev, [commentId]: value }));

  const handleReplySubmit = async (commentId) => {
    try {
      await axios.post(`/postFeatures/${postId}/comment/${commentId}/reply`, {
        userId: user._id,
        content: replyContents[commentId],
      });
      setReplyContents((prev) => ({ ...prev, [commentId]: "" }));
      refreshComments();
    } catch (err) {
      alert("Yanıt eklerken bir hata oluştu.");
    }
  };

  // Toggle visibility of replies
  const toggleRepliesVisibility = (commentId) =>
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

  // Check if the user has liked the content
  const isLikedByUser = (likes) => likes && likes.includes(user._id);

  // Navigate to user profile
  const goToProfile = (id) => navigate(`/profile/${id}`);

  return (
    <div
      className="comment-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-labelledby="comments-title"
    >
      <div
        className="comment-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close-back-icon" onClick={onClose}>
          <Icons.Back />
        </div>
        <div className="comment-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onLike={handleLike}
                onReplyChange={handleReplyChange}
                onReplySubmit={handleReplySubmit}
                toggleRepliesVisibility={toggleRepliesVisibility}
                visibleReplies={visibleReplies}
                isLikedByUser={isLikedByUser}
                goToProfile={goToProfile}
                replyContent={replyContents[comment._id] || ""}
              />
            ))
          ) : (
            <p>Henüz yorum yok.</p>
          )}
        </div>
        <div className="comment-input">
          <input
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Yorum yaz..."
            aria-label="Yorum yaz"
          />
          <SendIcon onClick={handleCommentSubmit}>Gönder</SendIcon>
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  onLike,
  onReplyChange,
  onReplySubmit,
  toggleRepliesVisibility,
  visibleReplies,
  isLikedByUser,
  goToProfile,
  replyContent,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReplySubmit = (commentId) => {
    onReplySubmit(commentId);
    setShowReplyInput(false); // Yanıt yazma alanını gizle
  };

  return (
    <div className="comment-item">
      <div className="comment-item-top">
        <div
          className="item-left"
          onClick={() => goToProfile(comment.userId.username)}
        >
          <Avatar src={comment.userId.photo} alt={comment.userId.username} />
        </div>
        <div className="item-mid">
          <div className="user-and-time">
            <p onClick={() => goToProfile(comment.userId.username)}>
              {comment.userId.username}
            </p>
            <FormatTime timestamp={comment.createdAt} />
          </div>
          <p className="content">{comment.content}</p>
          <p
            className="show-reply-input"
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            {showReplyInput ? "Gizle" : "Yanıtla"}
          </p>
        </div>
        <div className="item-right">
          {isLikedByUser(comment.likes) ? (
            <Icons.Heart
              size={20}
              color="red"
              onClick={() => onLike(comment._id, "comment")}
            />
          ) : (
            <Icons.HeartBorder
              size={20}
              color="gray"
              onClick={() => onLike(comment._id, "comment")}
            />
          )}
          <span>{comment.likes.length}</span>
        </div>
      </div>
      <div className="comment-item-bottom">
        {comment.replies.length > 0 && (
          <p className="show-comment" onClick={() => toggleRepliesVisibility(comment._id)}>
            {visibleReplies[comment._id]
              ? "Yanıtları gizle"
              : `${comment.replies.length} diğer yanıtı gör`}
          </p>
        )}
        {visibleReplies[comment._id] && (
          <div className="replies">
            {comment.replies.map((reply) => (
              <div key={reply._id} className="reply-item">
                <div
                  className="reply-item-left"
                  onClick={() => goToProfile(reply.userId?._id)}
                >
                  <Avatar
                    className="reply-avatar"
                    src={reply.userId?.photo}
                    alt={reply.userId?.username}
                  />
                </div>
                <div className="reply-item-mid">
                  <div className="user-and-time">
                    <p onClick={() => goToProfile(reply.userId?._id)}>
                      {reply.userId
                        ? reply.userId.username
                        : "Kullanıcı adı bulunamadı"}
                    </p>
                    <FormatTime timestamp={reply.createdAt} />
                  </div>
                  <p className="content">{reply.content}</p>
                </div>
                <div className="reply-item-right">
                  {isLikedByUser(reply.likes) ? (
                    <Icons.Heart
                      size={20}
                      color="red"
                      onClick={() => onLike(reply._id, "reply", comment._id)}
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <Icons.HeartBorder
                      size={20}
                      color="gray"
                      onClick={() => onLike(reply._id, "reply", comment._id)}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  <span>{reply.likes.length}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {showReplyInput && (
          <div className="reply-send">
            <input
              value={replyContent}
              onChange={(e) => onReplyChange(comment._id, e.target.value)}
              placeholder="Yanıt yaz..."
            />
            <SendIcon
              onClick={() => handleReplySubmit(comment._id)}
              style={{ cursor: "pointer" }} // Stil özelleştirme
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
