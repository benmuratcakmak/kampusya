import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { loginCall } from "../../apiCalls";
import { Link, useNavigate } from "react-router-dom";
import { RiMailSendLine } from "react-icons/ri";

import "./Auth.css";

export const Login = ({ setOpenModal }) => {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { isFetching, dispatch, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  useEffect(() => {
    if (!isFetching && !user) {
      navigate("/login");
    } else if (user) {
      navigate("/");
    }
  }, [isFetching, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value.trim(), // Boşlukları kaldırıyoruz
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { emailOrUsername, password } = formData;
  
    // Boşluk kontrolü yapıyoruz
    if (!emailOrUsername || !password) {
      setError("Lütfen tüm alanları boşluklardan arındırarak doldurun.");
      return;
    }
  
    setError("");
    try {
      const token = await loginCall(formData, dispatch);
      localStorage.setItem("authToken", token);
      navigate("/"); // Giriş başarılıysa ana sayfaya yönlendir
    } catch (err) {
      setError("Giriş işlemi başarısız oldu.");
    }
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
      <b className="disclaimer">Paylaşımlarından sorumlu olduğunu unutma.</b>
      <h3>Giriş Yap</h3>
      <form className="form" onSubmit={handleSubmit}>
        <input
          id="emailOrUsername"
          name="emailOrUsername"
          type="text"
          value={formData.emailOrUsername}
          onChange={handleChange}
          placeholder="E-posta veya Kullanıcı Adı"
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
        <br />
        <Link to="/forgot-password">Şifreni mi unuttun?</Link>
        <br />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isFetching}>
          {isFetching ? "Yükleniyor..." : "Giriş Yap"}
        </button>
        <br />
        <Link to="/register">
          Üye değil misin? <span>Hemen kaydol!</span>
        </Link>
      </form>
    </div>
  );
};
