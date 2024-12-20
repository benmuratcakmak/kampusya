import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import ConversationItem from "../../components/conversationItem/ConversationItem";

import "./Conversations.css";

export const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const { user } = useContext(AuthContext);
  const userId = user._id;

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`/api/conversations/${userId}`);
        setConversations(response.data);
      } catch (error) {
        console.error("Konuşmaları getirirken hata:", error);
      }
    };

    fetchConversations();
  }, [userId]);

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm("Bu konuşmayı silmek istediğinizden emin misiniz?")) {
      try {
        await axios.delete(`/api/messages/${conversationId}`);
        setConversations(
          conversations.filter((c) => c.conversationId !== conversationId)
        );
      } catch (error) {
        console.error("Konuşmayı silerken hata:", error);
      }
    }
  };

  const handleMarkAsRead = async (conversationId) => {
    const conversationIndex = conversations.findIndex(
      (c) => c.conversationId === conversationId
    );
  
    if (conversationIndex === -1 || conversations[conversationIndex].isRead) {
      console.log("Bu konuşma zaten okundu.");
      return;
    }
  
    try {
      await axios.put(`/api/conversations/mark-as-read/${conversationId}`);
      const updatedConversations = [...conversations];
      updatedConversations[conversationIndex].isRead = true;
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Konuşma okunmuş olarak işaretlenirken hata:", error);
    }
  };
  

  return (
    <div className="conversations-container">
      {conversations.length === 0 ? (
        <p className="no-conversations">Henüz bir konuşma yok.</p>
      ) : (
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.conversationId}
              conversation={conversation}
              onMarkAsRead={handleMarkAsRead}
              onDeleteConversation={handleDeleteConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
};
