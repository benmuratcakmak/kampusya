const FormatTime = ({ timestamp }) => {
  const formatTime = (timestamp) => {
    // Geçersiz timestamp kontrolü
    if (!timestamp) {
      return "Geçersiz zaman";
    }

    const now = new Date();
    const timeDiff = (now - new Date(timestamp)) / 1000;
    const seconds = Math.floor(timeDiff);

    if (seconds < 60) {
      return "Az önce";
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} dakika`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} saat`;
    } else {
      const days = Math.floor(seconds / 86400);
      return `${days} gün`;
    }
  };

  return <p>{formatTime(timestamp)}</p>;
};

export default FormatTime;
