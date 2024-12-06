// DropdownMenu.jsx
import React from "react";
import "./DropdownMenu.css";


const DeleteDropdown = ({ postId, onDeletePost, onClose }) => {
  return (
    <div className="dropdown-menu">
      <button onClick={() => onDeletePost(postId)}>
        Gönderiyi sil
      </button>
      <button onClick={onClose}>Kapat</button>
    </div>
  );
};

export default DeleteDropdown;
