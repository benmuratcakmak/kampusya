// Avatar URL'sini oluşturan yardımcı fonksiyon
export const getAvatarUrl = (username) => {
  if (!username) return "https://via.placeholder.com/150";
  
  // Dicebear Avatars API'sini kullanarak avatar oluştur
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
};
