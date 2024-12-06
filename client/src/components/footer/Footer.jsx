  import { useState, useContext, useEffect, useCallback } from "react";
  import { io } from "socket.io-client";
  import { AuthContext } from "../../context/AuthContext";
  import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
  import HomeIcon from "@mui/icons-material/Home";
  import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
  import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
  import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
  import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
  import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
  import MessageIcon from "@mui/icons-material/Message";
  import { NavLink, useLocation } from "react-router-dom";
  import { PostModal } from "../../components/postModal/PostModal";
  import "./Footer.css";

  export const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {
      user,
      newMessageNotification,
      setMessageNotification,
      newLikeNotification,
      setLikeNotification,
      newCommentNotification,
      setCommentNotification,
      newCommentLikeNotification,
      setCommentLikeNotification,
      newCommentReplyNotification,
      setCommentReplyNotification,
      newCommentReplyLikeNotification,
      setCommentReplyLikeNotification,
      newFollowNotification,
      setFollowNotification,
    } = useContext(AuthContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hasClicked, setHasClicked] = useState(false);
    const location = useLocation();

    const handleScroll = useCallback(() => {
      setIsScrolled(window.scrollY > 100);
    }, []);

    const handleNotificationClick = (type) => {
      if (type === "message") {
        setMessageNotification(false);
      } else {
        setLikeNotification(false);
        setCommentNotification(false);
        setCommentLikeNotification(false);
        setCommentReplyNotification(false);
        setCommentReplyLikeNotification(false);
        setFollowNotification(false);
      }
    };

    useEffect(() => {
      if (!user) return;

      const socket = io("http://localhost:5000");
      socket.emit("joinRoom", user._id);

      socket.on("newMessageNotification", () => {
        if (!hasClicked) {
          setMessageNotification(true);
        }
      });

      socket.on("newLikeNotification", () => {
        if (!hasClicked) {
          setLikeNotification(true);
        }
      });

      socket.on("newCommentNotification", (data) => {
        if (!hasClicked) {
          console.log("Yeni bildirim:", data);
          setCommentNotification(true);
        }
      });

      socket.on("newCommentLikeNotification", (data) => {
        if (!hasClicked) {
          console.log("Yeni bildirim:", data);
          setCommentLikeNotification(true);
        }
      });

      socket.on("newCommentReplyNotification", (data) => {
        if (!hasClicked) {
          console.log("Yeni bildirim:", data);
          setCommentReplyNotification(true);
        }
      });

      socket.on("newCommentReplyLikeNotification", (data) => {
        if (!hasClicked) {
          console.log("Yeni bildirim:", data);
          setCommentReplyLikeNotification(true);
        }
      });

      socket.on("newFollowNotification", (data) => {
        if (!hasClicked) {
          console.log("Yeni bildirim:", data);
          setFollowNotification(true);
        }
      });

      return () => {
        socket.disconnect();
      };
    }, [
      user,
      setMessageNotification,
      setLikeNotification,
      setCommentNotification,
      setCommentLikeNotification,
      setCommentReplyNotification,
      setCommentReplyLikeNotification,
      setFollowNotification,
      hasClicked,
    ]);

    useEffect(() => {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
      setHasClicked(false);
    }, [location]);

    const closeModal = () => setIsModalOpen(false);
    const isNotificationPage = location.pathname === "/notifications";

    return (
      <div className={`footer-wrapper ${isScrolled ? "scrolled" : ""}`}>
        <div className="container">
          <div className="footer">
            <div className="footer-links">
              {/* Home */}
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active-link" : "link")}
              >
                {({ isActive }) =>
                  isActive ? (
                    <HomeIcon className="icon" />
                  ) : (
                    <HomeOutlinedIcon className="icon" />
                  )
                }
              </NavLink>

              {/* Search */}
              <NavLink
                to="/search"
                className={({ isActive }) => (isActive ? "active-link" : "link")}
              >
                <SearchRoundedIcon className="icon" />
              </NavLink>

              {/* Add Post */}
              <AddCircleOutlineIcon
                className="icon add-icon"
                onClick={() => setIsModalOpen(true)}
              />
              <PostModal isOpen={isModalOpen} onClose={closeModal} />

              {/* Notifications */}
              <NavLink
                to="/notifications"
                className={({ isActive }) => (isActive ? "active-link" : "link")}
                onClick={handleNotificationClick}
              >
                {isNotificationPage ? (
                  <NotificationsActiveIcon className="icon" />
                ) : (
                  <NotificationsNoneIcon className="icon" />
                )}

                {newMessageNotification && !hasClicked && (
                  <div className="message-notification-badge"></div>
                )}
                {newLikeNotification && !hasClicked && (
                  <div className="notification-badge"></div>
                )}
                {newCommentNotification && !hasClicked && (
                  <div className="notification-badge"></div>
                )}
                {newCommentLikeNotification && !hasClicked && (
                  <div className="notification-badge"></div>
                )}
                {newCommentReplyNotification && !hasClicked && (
                  <div className="notification-badge"></div>
                )}
                {newCommentReplyLikeNotification && !hasClicked && (
                  <div className="notification-badge"></div>
                )}
                {newFollowNotification && !hasClicked && (
                  <div className="notification-badge"></div>
                )}
              </NavLink>

              {/* Messages */}
              <NavLink
                to="/messages"
                className={({ isActive }) => (isActive ? "active-link" : "link")}
                onClick={() => handleNotificationClick("message")}
              >
                {({ isActive }) =>
                  isActive ? (
                    <MessageIcon className="icon" />
                  ) : (
                    <MessageOutlinedIcon className="icon" />
                  )
                }
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  };
