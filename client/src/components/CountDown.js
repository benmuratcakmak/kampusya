import React, { useEffect, useState } from "react";

const Countdown = ({ eventDate }) => {
  const [countdown, setCountdown] = useState({});
  
  useEffect(() => {
    const calculateCountdown = () => {
      const eventDateTime = new Date(eventDate).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = eventDateTime - currentTime;

      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setCountdown({ hours, minutes, seconds });
      } else {
        setCountdown({ time: "Etkinlik Başladı!" });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [eventDate]);

  return (
    <div className="countdown">
      {countdown.time ? (
        <div className="event-started">{countdown.time}</div>
      ) : (
        <div className="countdown-timer">
          <span>{countdown.hours}saat </span>
          <span>{countdown.minutes}dakika </span>
          <span>{countdown.seconds}saniye</span>
        </div>
      )}
    </div>
  );
};

export default Countdown;