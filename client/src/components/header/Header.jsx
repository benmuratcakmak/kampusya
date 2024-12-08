import React, { useState, useContext, useEffect } from "react";
import { Avatar } from "@mui/material";
import Icons from "../../icons";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import "./Header.css";

export const Header = ({ setOpenModal }) => {
  const { user } = useContext(AuthContext);
  const [userPhoto, setUserPhoto] = useState(user?.photo);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  useEffect(() => {
    if (!user || !user._id) return;
    const getUser = async () => {
      try {
        const response = await axios.get(`/api/users/${user._id}`);
        if (response.data?.photo) {
          setUserPhoto(response.data.photo);
        }
      } catch (error) {
        console.error("User API request error:", error);
      }
    };
    getUser();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!user) return <p>Yükleniyor...</p>;

  return (
    <div className={`header-container ${isScrolled ? "scrolled" : ""}`}>
      <div className="header">
        <div className="header-links">
          <Link to={`/profile/${user.username}`}>
            <Avatar className="header-avatar" src={userPhoto} />
          </Link>
          <div className="report-container">
            <small>
              Bi'şeyler mi
              <br />
              biliyosun?
            </small>
            <div className="header-send-icon-container">
              <Icons.ReportSend
                className="header-send-icon"
                onClick={handleOpenModal}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};