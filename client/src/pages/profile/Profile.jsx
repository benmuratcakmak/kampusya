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
  const [fullscreenImage, setFullscreenImage] = useState(null);

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
      const res = await axios.post(
        "/api/conversations/getOrCreateConversation",
        {
          senderId: currentUser._id,
          receiverId: user._id,
        }
      );
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
        await axios.put("/api/users/change-password", {
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
      // Önce UI'ı ve yerel state'i güncelle
      setIsFollowing(true);
      setUser(prev => ({
        ...prev,
        followers: [...prev.followers, currentUser._id]
      }));

      // Sonra API çağrısını yap
      await axios.put(`/api/follow/follow/${user._id}`, {
        followerId: currentUser._id,
      });
    } catch (err) {
      // Hata durumunda UI'ı geri al
      setIsFollowing(false);
      setUser(prev => ({
        ...prev,
        followers: prev.followers.filter(id => id !== currentUser._id)
      }));
      console.error("Takip etme hatası:", err);
    }
  };

  const handleUnfollow = async () => {
    try {
      // Önce UI'ı ve yerel state'i güncelle
      setIsFollowing(false);
      setUser(prev => ({
        ...prev,
        followers: prev.followers.filter(id => id !== currentUser._id)
      }));

      // Sonra API çağrısını yap
      await axios.put(`/api/follow/unfollow/${user._id}`, {
        followerId: currentUser._id,
      });
    } catch (err) {
      // Hata durumunda UI'ı geri al
      setIsFollowing(true);
      setUser(prev => ({
        ...prev,
        followers: [...prev.followers, currentUser._id]
      }));
      console.error("Takipten çıkarma hatası:", err);
    }
  };

  const handleImageClick = (imageUrl) => {
    if (imageUrl) {
      setFullscreenImage(imageUrl);
    }
  };

  return (
    <div className="profile-and-posts-container">
      {loading ? (
        <div className="loading">Profil bilgileri yükleniyor...</div>
      ) : (
        <>
          <div className="profile-container">
            <div className="profile-left">
              <div className="profile-left-top">
                <Avatar
                  src={user?.photo}
                  alt={user?.username}
                  className="profile-avatar"
                  sx={{ width: 56, height: 56 }}
                  onClick={() => handleImageClick(user?.photo)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="profile-left-top-icon">
                  {currentUser._id !== user?._id && (
                    <Icons.MessageIcon
                      onClick={createConversation}
                      className="message-button"
                    />
                  )}

                  {user?._id === currentUser._id && (
                    <>
                      <Icons.SettingsIcon
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        className="settings-button"
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
                  <span>{user?.followers.length}</span> Takipçi
                </Link>
                <Link
                  to={`/follow/followers-following/${user?.username}?tab=following`}
                  className="profile-link"
                >
                  <span>{user?.followings.length}</span> Takip Edilen
                </Link>
              </div>
              <div className="profile-left-bottom">
                {currentUser._id !== user?._id && (
                  <button
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    className={`follow-button ${isFollowing ? 'unfollow' : ''}`}
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
              <b className="fullname">
                {user?.firstName} {user?.lastName}
              </b>
              <div className="faculty-and-department">
                {user?._id !== currentUser._id ? (
                  user?.faculty && user?.department ? (
                    `${user?.faculty} / ${user?.department}`
                  ) : (
                    <span className="profil-detail">
                      Kullanıcı henüz eğitim bilgilerini eklememiş
                    </span>
                  )
                ) : user?.faculty && user?.department ? (
                  `${user?.faculty} / ${user?.department}`
                ) : (
                  <span className="profil-detail">
                    Eğitim bilgilerinizi profilinize ekleyebilirsiniz
                  </span>
                )}
              </div>

              <div className="bio-div">
                {user?._id !== currentUser._id ? (
                  user?.bio ? (
                    <span className="bio">{user?.bio}</span>
                  ) : (
                    <span className="profil-detail">
                      Kullanıcı henüz kendini tanıtmamış
                    </span>
                  )
                ) : user?.bio ? (
                  <span className="bio">{user?.bio}</span>
                ) : (
                  <span className="profil-detail">
                    Kendinizi tanıtan bir biyografi ekleyebilirsiniz
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

          {/* Add fullscreen modal */}
          {fullscreenImage && (
            <div className="fullscreen-image-modal" onClick={() => setFullscreenImage(null)}>
              <div className="close-button" onClick={() => setFullscreenImage(null)}>
                <Icons.Times />
              </div>
              <img 
                src={fullscreenImage} 
                alt="Full screen" 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
