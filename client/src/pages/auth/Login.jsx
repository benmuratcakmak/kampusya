import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { loginCall } from "../../apiCalls";
import { Link, useNavigate } from "react-router-dom";
import { RiMailSendLine } from "react-icons/ri";

import "./Auth.css";

export const Login = ({ setOpenModal }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Lütfen tüm alanları doldurun.");
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
      <b className="disclaimer">
      Paylaşımlarından sorumlu olduğunu unutma.
      </b>

      <h3>Giriş Yap</h3>
      <form className="form" onSubmit={handleSubmit}>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-posta"
          required
          autoComplete="email"
        />
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Şifre"
          required
          autoComplete="current-password"
        />
        <br />
        <Link to="/forgot-password">Sifreni mi unuttun?</Link>
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
