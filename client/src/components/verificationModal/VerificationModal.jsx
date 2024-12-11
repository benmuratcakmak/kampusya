import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VerificationModal.css";

const VerificationModal = ({ email, isOpen, onClose, onSuccess }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await axios.delete("/api/auth/cancel-registration", {
          data: { email }, // Backend'e e-posta gönderiliyor
        });
      } catch (error) {
        console.error("Veritabanı silme hatası:", error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [email]);

  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsCodeExpired(true);
    }

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage(""); // Önceki mesajları temizle
    setError(""); // Önceki hataları temizle

    if (!verificationCode.trim()) {
      setError("Doğrulama kodu boş bırakılamaz.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/verify-code", {
        email,
        verificationCode,
      });

      setMessage(response.data.message);
      if (response.data.message.includes("Doğrulama kodu süresi dolmuş")) {
        setIsCodeExpired(true);
      } else {
        onSuccess(); // Doğrulama başarılı
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Bir hata oluştu. Tekrar deneyin."
      );
    }
  };

  const resendCode = async () => {
    setIsCodeExpired(false);
    setTimeLeft(100); // Zamanlayıcıyı sıfırla
    setMessage(""); // Önceki mesajları temizle

    try {
      const response = await axios.post("/api/auth/resend-code", { email });
      setMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message || "Bir hata oluştu. Tekrar deneyin."
      );
    }
  };

  const handleModalClose = async () => {
    try {
      // Email verisini kontrol et
      console.log("Kullanıcı emaili:", email);

      // Email'i backend'e gönder
      await axios.delete("/api/auth/cancel-registration", {
        data: { email }, // Email gönderiliyor
      });

      onClose(); // Modal'ı kapat
    } catch (error) {
      console.error(
        "Kayıt silinirken bir hata oluştu:",
        error.response?.data || error.message
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="verification-modal-content">
      <p>E-posta adresinize gönderilen doğrulama kodunu girin:</p>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Doğrulama Kodu"
          required
        />
        <button type="submit">Kod Doğrula</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      {isCodeExpired && (
        <div>
          <p className="expired-message">
            Doğrulama kodu süresi dolmuş. Lütfen yeni bir kod bekleyin.
          </p>
          <button onClick={resendCode}>Yeni Kod Gönder</button>
        </div>
      )}
      {!isCodeExpired && <p className="timer">Kalan Süre: {timeLeft} saniye</p>}
      <br />
      <button className="close-button" onClick={handleModalClose}>
        Kapat
      </button>
    </div>
  );
};

export default VerificationModal;
