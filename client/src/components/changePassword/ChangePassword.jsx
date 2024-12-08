import { useState } from "react";
import { Dialog, DialogActions, DialogTitle, Button } from "@mui/material";
import axios from "axios";
import "./Profile.css";

const ChangePassword = ({ open, onClose, userId, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    try {
      // Eski şifreyi doğrula
      const res = await axios.post("/api/users/verify-old-password", {
        userId,
        oldPassword,
      });

      if (res.data.success) {
        // Eski şifre doğrulandıysa yeni şifreyi değiştir
        await axios.put("/api/users/change-password", {
          userId,
          newPassword,
        });
        alert("Şifre başarıyla değiştirildi.");
        onSuccess();
        onClose();
      } else {
        setError("Eski şifreniz yanlış.");
      }
    } catch (err) {
      console.error("Şifre değiştirme hatası:", err);
      alert("Şifre değiştirme işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Şifrenizi Değiştirin</DialogTitle>
      <DialogActions>
        <div className="change-password-container">
          <input
            type="password"
            placeholder="Eski Şifre"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Yeni Şifre"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Şifreyi Onayla"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
          <Button onClick={handleChangePassword} color="primary">
            Değiştir
          </Button>
          <Button onClick={onClose} color="secondary">
            İptal
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePassword;
