import React, { useState, useEffect, useRef } from 'react';
import './DeletePost.css'

const DeletePost = ({ postId, handleDeletePost }) => {
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    isOpen && (
      <div className="dropdown-menu" ref={dropdownRef}>
        <button onClick={() => handleDeletePost(postId)}>
          Gönderiyi sil
        </button>
      </div>
    )
  );
};

export default DeletePost;
