import React from 'react';
import Avatar from '@mui/material/Avatar';
import { getAvatarUrl } from '../../utils/avatarUtils';

const FollowModal = () => {
  const user = {
    username: 'exampleUser',
    photo: 'https://example.com/photo.jpg',
  };

  return (
    <div>
      <Avatar
        src={user.photo || getAvatarUrl(user.username)}
        alt={user.username}
        className="follow-modal-avatar"
      />
    </div>
  );
};

export default FollowModal; 