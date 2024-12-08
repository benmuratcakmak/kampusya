import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Icons from "../../icons";
import axios from "axios";
import { Avatar } from "@mui/material";
import "./Follow.css";

export const Follow = () => {
  const { username } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const initialTab = query.get("tab");
    setTabValue(initialTab === "following" ? 1 : 0);
  }, []);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await axios.get(`/api/follow/followers/${username}`);
        setFollowers(res.data);
      } catch (err) {
        console.error("Takipçiler alınamadı:", err);
      }
    };

    const fetchFollowing = async () => {
      try {
        const res = await axios.get(`/api/follow/following/${username}`);
        setFollowing(res.data);
      } catch (err) {
        console.error("Takip edilenler alınamadı:", err);
      }
    };

    fetchFollowers();
    fetchFollowing();
    setLoading(false);
  }, [username]);

  const handleBackClick = () => {
    navigate(`/profile/${username}`);
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="follow-container">
      <div className="close-back-icon">
        <Icons.Back onClick={handleBackClick} />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${tabValue === 0 ? "active" : ""}`}
          onClick={() => setTabValue(0)}
        >
          Takipçiler
        </div>
        <div
          className={`tab ${tabValue === 1 ? "active" : ""}`}
          onClick={() => setTabValue(1)}
        >
          Takip Edilenler
        </div>
      </div>

      {/* List */}
      <ul className="list">
        {tabValue === 0 &&
          followers.map((follower) => (
            <li className="list-item" key={follower._id}>
              <Link
                to={`/profile/${follower.username}`}
                className="profile-link"
              >
                <Avatar
                  src={follower.photo}
                  alt={`${follower.username} avatar`}
                  className="avatar"
                />
              </Link>
              <div className="profile-info">
                <Link to={`/profile/${follower.username}`} className="username">
                  {follower.username}
                </Link>
                <div className="full-name">
                  {follower.firstName} {follower.lastName}
                </div>
              </div>
            </li>
          ))}
        {tabValue === 1 &&
          following.map((followed) => (
            <li className="list-item" key={followed._id}>
              <Link
                to={`/profile/${followed.username}`}
                className="profile-link"
              >
                <Avatar
                  src={followed.photo}
                  alt={`${followed.username} avatar`}
                  className="avatar"
                />
              </Link>
              <div className="profile-info">
                <Link to={`/profile/${followed.username}`} className="username">
                  {followed.username}
                </Link>
                <div className="full-name">
                  {followed.firstName} {followed.lastName}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};
