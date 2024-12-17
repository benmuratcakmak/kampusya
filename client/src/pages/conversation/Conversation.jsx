import React, { useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import MessagesList from "../../components/messagesList/MessagesList";
import { MessageInput } from "../../components/messageInput/MessageInput";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./Conversation.css";

// const socket = io("http://localhost:5000", {
//   withCredentials: true, // CORS için
//   transports: ["websocket", "polling"], // WebSocket ve polling kullanımı
// });

// const socket = io("https://kampusya.com", {
//   transports: ["websocket"],
// });

// const socket = io(process.env.NODE_ENV === "production" ? "https://kampusya.com" : "http://localhost:5000", {
//   transports: ["websocket"], // WebSocket protokolünü kullan
// });

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://kampusya.com"
    : "http://localhost:5000";

console.log("Bağlanılan sunucu:", SERVER_URL);

const socket = io(SERVER_URL, {
  transports: ["websocket"], // WebSocket protokolünü kullan
});

export const Conversation = () => {
  const { conversationId } = useParams();
  const { user } = useContext(AuthContext);
  const userId = user._id;
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/${conversationId}`);
        // Veriyi dizi olduğundan emin olun
        if (Array.isArray(response.data)) {
          setMessages(response.data);
        } else {
          setError("Mesajlar geçerli bir dizi değil.");
        }
      } catch (error) {
        console.error("Mesajlar yüklenirken hata:", error);
        setError("Mesajlar yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    socket.emit("joinConversation", conversationId);

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg._id === message._id)) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const conversationResponse = await axios.get(
        `/api/messages/forSocketNotification/${conversationId}`
      );
      const conversation = conversationResponse.data;

      if (
        !conversation.participants ||
        conversation.participants.length === 0
      ) {
        setError("Konuşma katılımcıları yüklenemedi.");
        return;
      }

      const receiverId = conversation.participants.find(
        (id) => id.toString() !== userId
      );

      if (!receiverId) {
        setError("Alıcı bilgisi alınamadı.");
        return;
      }

      const messageData = {
        conversationId,
        sender: userId,
        receiver: receiverId,
        text: newMessage,
        // createdAt: new Date(),
      };

      const response = await axios.post("/api/messages", messageData);
      socket.emit("sendMessage", response.data);

      setMessages((prevMessages) => [
        ...prevMessages,
        { ...response.data, sender: { _id: userId } },
      ]);
      setNewMessage("");
    } catch (error) {
      console.error("Mesaj gönderilirken hata:", error);
      setError("Mesaj gönderilemedi.");
    }
  };

  const handleBackClick = () => {
    navigate("/messages");
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/post/${postId}`);
  };

  return (
    <div className="conversation-container">
      <div className="close-back-icon">
        <ArrowBackIcon onClick={handleBackClick} />
      </div>
      <MessagesList
        messages={messages}
        userId={userId}
        error={error}
        loading={loading}
        handlePostClick={handlePostClick}
      />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};
