import React from "react";
import Countdown from "../CountDown.js";
import "./EventDetails.css";

const EventDetails = ({ eventTitle, eventDescription, eventDate }) => {
  return (
    <div className="event-details">
      <h3 className="event-title">{eventTitle}</h3>
      <p className="event-description">{eventDescription}</p>
      <div className="event-meta">
        <p className="event-date">
          {new Date(eventDate).toLocaleString("tr-TR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </p>
        <Countdown eventDate={eventDate} />
      </div>
    </div>
  );
};

export default EventDetails;
