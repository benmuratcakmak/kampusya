import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import VerificationModal from "../../components/verificationModal/VerificationModal";
import { RiMailSendLine } from "react-icons/ri";

import "./Auth.css";

export const Register = ({setOpenModal}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    passwordAgain: "",
  });

  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal state
  const [registeredEmail, setRegisteredEmail] = useState(""); // Store registered email
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, username, email, password, passwordAgain } = formData;
  
    if (!firstName || !lastName || !username || !email || !password || !passwordAgain) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
  
    if (password !== passwordAgain) {
      setError("Şifreler uyuşmuyor!");
      return;
    }
  
    try {
      const res = await axios.post("/auth/register", formData);
  
      if (res.status === 200) {
        setRegisteredEmail(email); // Kayıt edilen e-posta adresini sakla
        setIsModalOpen(true); // Doğrulama modülünü aç
        toast.success("Kayıt başarılı! Doğrulama kodu gönderildi.");
      }
    } catch (err) {
      // Hata mesajını ayarlayın
      if (err.response?.data?.message === "Bu e-posta adresiyle zaten bir kayıt işlemi yapılmış. Lütfen doğrulama kodunu girin.") {
        setRegisteredEmail(email); // Kayıtlı e-posta adresini sakla
        setIsModalOpen(true); // Modal'ı tekrar aç
      }
      setError(err.response?.data?.message || "Kayıt işlemi sırasında bir hata oluştu.");
    }
  };  

  // Handle successful verification (e.g., redirect to login page)
  const handleVerificationSuccess = () => {
    setIsModalOpen(false); // Close modal
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="auth-container">
      <div className="report-container">
            <small>
              Bi'şeyler mi
              <br />
              biliyosun?
            </small>
            <div className="header-send-icon-container">
              <RiMailSendLine
                className="header-send-icon"
                onClick={handleOpenModal}
              />
            </div>
          </div>
      <b>
        Yalnızca .edu uzantılı e-posta adresleriyle <br /> hesap
        oluşturabilirsiniz.
      </b>
      <h3>Kayıt Ol</h3>
      <form className="form" onSubmit={handleSubmit}>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Ad"
          required
        />
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Soyad"
          required
        />
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Kullanıcı Adı"
          required
        />
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-posta"
          required
        />
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Şifre"
          required
        />
        <input
          id="passwordAgain"
          name="passwordAgain"
          type="password"
          value={formData.passwordAgain}
          onChange={handleChange}
          placeholder="Şifre Tekrar"
          required
        />
        <br />
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Kayıt ol</button>
        <br />
        <Link to="/login">
          Zaten üye misin? <span>Giriş Yap</span>
        </Link>
      </form>

      {/* Verification Modal */}
      <VerificationModal
        email={registeredEmail}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};
