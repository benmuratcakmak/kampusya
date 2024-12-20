import { useState } from "react";
import { Link } from "react-router-dom";

import "./Auth.css";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(data.message);
        setEmail("");
      } else {
        setError(data.message || "Bir hata oluştu.");
      }
    } catch (err) {
      setError("Sunucuyla bağlantı kurulamadı: " + err.message);
    }
  };
  

  return (
    <div className="auth-container">
      <h3>Şifre Sıfırla</h3>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Edu uzantılı e-posta adresinizi girin"
          required
        />
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <br />
        <button type="submit">Şifreyi Sıfırla</button>
        <br />
        <Link to="/register">Giriş ekranına dön</Link>
      </form>
    </div>
  );
};
