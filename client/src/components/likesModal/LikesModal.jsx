import React from 'react';
import { Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './LikesModal.css';
import Icons from '../../icons';

const LikesModal = ({ isOpen, onClose, likes }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
    onClose();
  };

  return (
    <div className="likes-modal-container" onClick={onClose}>
      <div className="likes-modal-content" onClick={e => e.stopPropagation()}>
        <div className="likes-modal-header">
          <h3>Beğenenler</h3>
          <Icons.Close onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
        <div className="likes-list">
          {likes.map(like => (
            <div key={like._id} className="like-item" onClick={() => handleProfileClick(like.username)}>
              <Avatar
                src={like.photo}
                alt={like.username}
                className="likes-modal-avatar"
              />
              <div className="user-info">
                <span className="username">@{like.username}</span>
                <span className="fullname">{like.firstName} {like.lastName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LikesModal; 