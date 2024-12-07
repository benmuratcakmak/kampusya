import React, { useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Icons from "../../icons";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import "./PostModal.css";

export const PostModal = ({ isOpen, onClose, setPosts }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);

  const handleBackClick = useCallback(() => {
    if (isDirty) {
      setOpenDialog(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleBackButton = (event) => {
      event.preventDefault();
      handleBackClick();
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handleBackButton);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("popstate", handleBackButton);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, handleBackClick]);

  if (!isOpen || !user) return null;

  const handlePollOptionChange = (index, value) => {
    const updatedOptions = [...pollOptions];
    updatedOptions[index] = value;
    setPollOptions(updatedOptions);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      // 10 seçenek sınırı
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      // En az 2 seçenek olmalı
      const updatedOptions = pollOptions.filter((_, idx) => idx !== index);
      setPollOptions(updatedOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media && !eventTitle.trim() && !pollQuestion.trim())
      return;

    const formData = new FormData();
    if (content.trim()) formData.append("content", content);
    formData.append("userId", user._id);
    if (media) formData.append("media", media);
    if (eventTitle.trim()) formData.append("eventTitle", eventTitle);
    if (eventDate) formData.append("eventDate", eventDate);
    if (eventDescription.trim())
      formData.append("eventDescription", eventDescription);
    if (pollQuestion.trim()) formData.append("pollQuestion", pollQuestion);
    pollOptions.forEach((option, index) => {
      if (option.trim()) formData.append(`pollOptions[${index}]`, option);
    });

    setIsLoading(true);

    try {
      const response = await axios.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const postWithUserInfo = {
        ...response.data,
        username: user.username,
        photo: user.photo,
        eventTitle: response.data.eventTitle,
        eventDate: response.data.eventDate,
        eventDescription: response.data.eventDescription,
        pollQuestion: response.data.pollQuestion,
        pollOptions: response.data.pollOptions,
      };

      if (setPosts) {
        setPosts((prevPosts) => [postWithUserInfo, ...prevPosts]);
      }

      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Gönderi başarısız:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setIsDirty(true);
  };

  const handleDialogClose = (confirm) => {
    setOpenDialog(false);
    if (confirm) {
      setContent("");
      setMedia(null);
      setEventTitle("");
      setEventDate("");
      setEventDescription("");
      setPollQuestion("");
      setPollOptions(["", ""]);
      onClose();
    }
  };

  const handleEventFormToggle = () => {
    if (showPollForm) setShowPollForm(false);
    setShowEventForm((prev) => !prev);
  };

  const handlePollFormToggle = () => {
    if (showEventForm) setShowEventForm(false);
    setShowPollForm((prev) => !prev);
  };

  return (
    <div className="post-modal-container" onClick={(e) => e.stopPropagation()}>
      <div className="close-back-icon">
        <Icons.Back onClick={handleBackClick} />
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={
            showEventForm || showPollForm
              ? "Etkinlik ya da anket oluştururken bu alanı kullanamazsınız."
              : "Bir şeyler yaz..."
          }
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setIsDirty(true);
          }}
          disabled={showEventForm || showPollForm} // Etkinlik veya anket formu aktif olduğunda yazıyı devre dışı bırak
        />

        {media && (
          <div className="post-media-preview">
            <div>
              <Icons.Times className="x-icon" onClick={handleRemoveMedia} />{" "}
            </div>
            {media.type.includes("image") ? (
              <img src={URL.createObjectURL(media)} alt="preview" />
            ) : media.type.includes("video") ? (
              <video controls>
                <source src={URL.createObjectURL(media)} type={media.type} />
              </video>
            ) : null}
          </div>
        )}

        <div className="modal-icons">
          <div className="modal-icons-left">
            <label>
              <Icons.Paperclip
                className={`icon ${
                  showEventForm || showPollForm ? "disabled" : ""
                }`}
              />
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  setMedia(e.target.files[0]);
                  setIsDirty(true);
                }}
                disabled={showEventForm || showPollForm} // Etkinlik veya anket formu açıkken devre dışı bırak
              />
            </label>

            <label className="event-icon" onClick={handleEventFormToggle}>
              <Icons.Calendar className="icon" />
            </label>

            <label className="poll-icon" onClick={handlePollFormToggle}>
              <Icons.Poll className="icon" />
            </label>
          </div>

          {isLoading ? (
            <span>Yükleniyor...</span>
          ) : (
            <div className="send-icon-container">
              <Icons.FaPaperPlane
                className="icon"
                disabled={
                  (content.trim() === "" &&
                    !media &&
                    !eventTitle.trim() &&
                    !pollQuestion.trim()) ||
                  isLoading
                }
                onClick={handleSubmit}
              />
            </div>
          )}
        </div>

        {showEventForm && (
          <div className="event-form">
            <input
              type="text"
              placeholder="Etkinlik Başlığı"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="event-input"
            />
            <textarea
              placeholder="Etkinlik Açıklaması"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="event-input"
            />
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="event-input"
            />
          </div>
        )}

        {showPollForm && (
          <div className="poll-form">
            <input
              type="text"
              placeholder="Anket Sorusu"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
            />
            {pollOptions.map((option, index) => (
              <div key={index} className="poll-option-select">
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    handlePollOptionChange(index, e.target.value)
                  }
                  placeholder={`Seçenek ${index + 1}`}
                />
                  <Icons.Times onClick={() => handleRemovePollOption(index)}/>
              </div>
            ))}
            <button
              type="button"
              className="add-option"
              onClick={handleAddPollOption}
            >
              Yeni Seçenek Ekle
            </button>
          </div>
        )}
      </form>

      <Dialog open={openDialog}>
        <DialogTitle>Değişiklikler Kaydedilmedi!</DialogTitle>
        <DialogContent>
          <p>Değişiklikleriniz kaydedilmeden çıkmak istiyor musunuz?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)}>Hayır</Button>
          <Button onClick={() => handleDialogClose(true)}>Evet</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
