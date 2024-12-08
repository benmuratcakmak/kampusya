import axios from "axios";

export const fetchConversationMessages = async (conversationId) => {
  const response = await axios.get(`/api/messages/${conversationId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await axios.post("/messages", messageData);
  return response.data;
};
