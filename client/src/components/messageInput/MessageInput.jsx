import React from "react";
import SendIcon from "@mui/icons-material/Send";
import "./MessageInput.css";

export const MessageInput = ({ newMessage, setNewMessage, handleSendMessage }) => {
  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Bir mesaj yazın..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <SendIcon onClick={handleSendMessage} />
    </div>
  );
};
