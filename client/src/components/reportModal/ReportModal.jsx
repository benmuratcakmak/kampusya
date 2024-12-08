import React, { useState, useRef, useEffect, useCallback } from "react";
import Icons from "../../icons";
import axios from "axios";
import "./ReportModal.css";

export const ReportModal = ({ open, handleClose }) => {
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // Gönderim durumu
  const fileInputRef = useRef(null);

  // Modal açıldığında vücut kaydırmasını engelle ve geri butonunu yönet
  useEffect(() => {
    if (open) {
      document.body.classList.add("no-scroll");
      window.history.pushState({ modalOpen: true }, "");
      const handlePopState = () => handleClose();
      window.addEventListener("popstate", handlePopState);

      return () => {
        document.body.classList.remove("no-scroll");
        window.removeEventListener("popstate", handlePopState);

        if (window.history.state?.modalOpen) {
          window.history.back();
        }
      };
    }
  }, [open, handleClose]);

  // Form gönderim işlemi
  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
  
      if (!message.trim() && !media) {
        alert("Lütfen bir mesaj yazın veya bir medya dosyası yükleyin.");
        return;
      }
  
      const formData = new FormData();
      formData.append("message", message);
      if (media) {
        formData.append("media", media);
      }
  
      setLoading(true);
      try {
        const response = await axios.post("/api/report/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setLoading(false);
  
        if (response.data.success) {
          setSubmitted(true); // Gönderim tamamlandığında başarı durumu
          setMessage("");
          setMedia(null);
          setTimeout(() => {
            setSubmitted(false); // 3 saniye sonra başarı mesajını sıfırla
            handleClose();
          }, 3000);
        } else {
          alert("Bir hata oluştu: " + response.data.message);
        }
      } catch (error) {
        setLoading(false);
        alert("Sunucu hatası: " + error.message);
      }
    },
    [message, media, handleClose]
  );
  

  // Dosya seçme işlemi
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  // Dosya değişikliklerini işleme
  const handleFileChange = (e) => {
    setMedia(e.target.files[0]);
  };

  // Medya önizlemesini kapatma
  const handleClosePreview = () => {
    setMedia(null);
  };

  if (!open) return null;

  return (
    <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
      <div className="close-back-icon">
        <Icons.Back onClick={handleClose} />
      </div>
      <h2>Elinizde bir haber, fotoğraf, video, dosya veya yazı varsa, bizimle paylaşabilirsiniz.</h2>
      <br />
      <h3>Gönderdiğiniz tüm içerikler tamamen anonim olarak işlenecek ve kişisel bilgileriniz kesinlikle gizli tutulacaktır.</h3>

      <form onSubmit={handleFormSubmit}>
        <textarea
          placeholder="Bir şeyler yaz..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <div className="modal-icons">
          <Icons.FaRegImages onClick={handleFileSelect} className="icon" />
          <Icons.FaPaperPlane onClick={handleFormSubmit} className="icon" />
        </div>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </form>

      {/* Medya Önizleme */}
      {media && (
        <div className="media-preview-container">
          <div className="close-media-preview" onClick={handleClosePreview}>
            <FaTimes />
          </div>
          {media.type.startsWith("image/") ? (
            <img src={URL.createObjectURL(media)} alt="Media Preview" className="preview-image" />
          ) : media.type.startsWith("video/") ? (
            <video controls className="preview-video">
              <source src={URL.createObjectURL(media)} type={media.type} />
              Tarayıcınız video etiketini desteklemiyor.
            </video>
          ) : null}
        </div>
      )}

      {loading && <div className="loading-indicator">Gönderiliyor...</div>}

      {/* Başarı mesajı */}
      {submitted && <div className="submitted-message">Gönderildi!</div>}

      {/* <div className="other-contacts">
        <span>whats</span>
        <span>insta</span>
        <span>e-posta</span>
      </div> */}
    </div>
  );
};
