import { useState, useEffect, useContext } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
} from "@mui/material";
import Icons from "../../icons";
import { AuthContext } from "../../context/AuthContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ProfilePost } from "../../components/profilePost/ProfilePost";
import "./Profile.css";

export const Profile = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const username = useParams().username;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          axios.get(`/api/users?username=${username}`),
          axios.get(`/api/posts/profile/${username}`),
        ]);
        
        // Kullanıcının followers verisini kontrol et
        const userFollowers = userRes.data.followers || []; // Eğer followers undefined ise boş dizi kullan
        setUser(userRes.data);
        setPosts(postsRes.data);
        setIsFollowing(userFollowers.includes(currentUser._id)); // Takip etme durumunu kontrol et
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username, currentUser._id]);
  

  const createConversation = async () => {
    try {
      const res = await axios.post("/api/conversations/getOrCreateConversation", {
        senderId: currentUser._id,
        receiverId: user._id,
      });
      const conversationId = res.data._id;
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangePasswordClick = () => {
    setOpenChangePasswordModal(true);
    setAnchorEl(null); // Menu'yu kapat
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    try {
      // Eski şifreyi doğrula
      const res = await axios.post("/api/users/verify-old-password", {
        userId: currentUser._id,
        oldPassword,
      });

      if (res.data.success) {
        // Eski şifre doğrulandıysa yeni şifreyi değiştir
        await axios.put("/users/change-password", {
          userId: currentUser._id,
          newPassword,
        });
        alert("Şifre başarıyla değiştirildi.");
        setOpenChangePasswordModal(false);
      } else {
        setError("Eski şifreniz yanlış.");
      }
    } catch (err) {
      console.error("Şifre değiştirme hatası:", err);
      alert("Şifre değiştirme işlemi sırasında bir hata oluştu.");
    }
  };

  const handleLogoutClick = async () => {
    try {
      // Çıkış işlemi için API isteği (token ve kullanıcıyı silme işlemi yapılacak)
      await axios.post("/api/users/logout"); // API endpoint'ine post isteği gönderiyoruz

      // API isteği başarılı olduktan sonra, auth token ve user bilgilerini localStorage'dan temizliyoruz
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");

      // AuthContext üzerinden logout fonksiyonunu çağırarak kullanıcıyı çıkartıyoruz
      dispatch({ type: "LOGOUT" }); // 'dispatch' burada kullanılabilir çünkü 'useContext' bileşen içinde çağrılıyor
    } catch (err) {
      console.error("Çıkış yapılırken bir hata oluştu:", err);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.put(`/api/follow/follow/${user._id}`, {
        followerId: currentUser._id,
      });
      setIsFollowing(true);
      const updatedUser = await axios.get(`/api/users?username=${username}`);
      setUser(updatedUser.data);
    } catch (err) {
      console.error("Takip etme hatası:", err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.put(`/api/follow/unfollow/${user._id}`, {
        followerId: currentUser._id,
      });
      setIsFollowing(false);
      const updatedUser = await axios.get(`/api/users?username=${username}`);
      setUser(updatedUser.data);
    } catch (err) {
      console.error("Takipten çıkarma hatası:", err);
    }
  };

  return (
    <div className="profile-and-posts-container">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="profile-container">
            <div className="profile-left">
              <div className="profile-left-top">
                <Avatar src={user?.photo} className="profile-photo" />
                <div className="profile-left-top-icon">
                  {currentUser._id !== user?._id && (
                    <Icons.MessageIcon
                      onClick={createConversation}
                      className="message-button"
                      sx={{ color: "grey" }}
                    />
                  )}

                  {user?._id === currentUser._id && (
                    <>
                      <Icons.SettingsIcon
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        className="settings-button"
                        sx={{ color: "grey" }}
                      />
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                      >
                        <MenuItem onClick={handleLogoutClick}>
                          <Icons.LogoutOutlinedIcon color="error" />
                          Çıkış Yap
                        </MenuItem>
                        <MenuItem onClick={handleChangePasswordClick}>
                          <Icons.VpnKeyIcon color="primary" />
                          Şifreyi Değiştir
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </div>
              </div>
              <div className="profile-left-mid">
                <Link
                  to={`/follow/followers-following/${user?.username}?tab=followers`}
                  className="profile-link"
                >
                  {user?.followers.length} Takipçi
                </Link>
                <Link
                  to={`/follow/followers-following/${user?.username}?tab=following`}
                  className="profile-link"
                >
                  {user?.followings.length} Takip Edilen
                </Link>
              </div>
              <div className="profile-left-bottom">
                {currentUser._id !== user?._id && (
                  <button
                    variant="contained"
                    color={isFollowing ? "secondary" : "primary"}
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    className="follow-button"
                  >
                    {isFollowing ? "Takipten Çık" : "Takip Et"}
                  </button>
                )}

                {user?._id === currentUser._id && (
                  <Link to={`/updateProfile/${username}`}>
                    <button className="edit-profile-button">Düzenle</button>
                  </Link>
                )}
              </div>
            </div>
            <div className="profile-right">
              <span className="username">@{user?.username}</span>
              <span className="fullname">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="faculty-and-department">
                {user?.faculty && user?.department ? (
                  `${user?.faculty} / ${user?.department}`
                ) : (
                  <span style={{ color: "red" }}>
                    Fakülte ve bölüm bilgisi henüz girilmemiş. Lütfen
                    bilgilerinizi güncelleyiniz.
                  </span>
                )}
              </span>
              <div className="bio-div">
                {user?.bio ? (
                  <span className="bio">{user?.bio}</span>
                ) : (
                  <span style={{ color: "red" }}>
                    Biyografi bilgisi henüz girilmemiş. Kendinizi tanıtan bir
                    biyografi ekleyebilirsiniz.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PostList bileşenini kullanıyoruz */}
          <ProfilePost posts={posts} />

          {/* Şifre Değiştirme Modali */}
          <Dialog
            open={openChangePasswordModal}
            onClose={() => setOpenChangePasswordModal(false)}
          >
            <DialogTitle>Şifre Değiştir</DialogTitle>
            <div>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Eski şifre"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifre"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifreyi doğrula"
              />
              <span className="error-message">{error}</span>
            </div>
            <DialogActions>
              <Button onClick={handleChangePassword}>Değiştir</Button>
              <Button
                onClick={() => setOpenChangePasswordModal(false)}
                color="secondary"
              >
                Kapat
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Profile;
