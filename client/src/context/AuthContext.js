import { createContext, useEffect, useReducer, useState } from "react";
import { AuthReducer } from "./AuthReducer";

const INITIAL_STATE = {
  user: null,
  token: null,
  isFetching: false,
  error: false,
  newMessageNotification: false,
  newLikeNotification: false,
  newCommentNotification: false,
  newCommentLikeNotification: false,
  newCommentReplyNotification: false,
  newCommentReplyLikeNotification: false,
  newFollowNotification: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (user && token) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: parsedUser, token },
        });
      } catch (e) {
        console.error("localStorage'dan user verisi alınırken hata:", e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (state.user && state.token) {
      try {
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem("authToken", state.token);
      } catch (e) {
        console.error("User verisi localStorage'a kaydedilirken hata:", e);
      }
    }
  }, [state.user, state.token]);

  // Logout fonksiyonunu ekleyelim
  const logout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      dispatch({ type: "LOGOUT" });
    } catch (e) {
      console.error("LocalStorage'tan çıkış yapılırken hata:", e);
    }
  };

  // Bildirim durumunu güncellemek için fonksiyon ekleyelim
  const setMessageNotification = (status) => {
    dispatch({
      type: "SET_MESSAGE_NOTIFICATION", // Yeni bildirim durumu ayarlama
      payload: status,
    });
  };
  const setLikeNotification = (status) => {
    dispatch({
      type: "SET_LIKE_NOTIFICATION", // Yeni bildirim durumu ayarlama
      payload: status,
    });
  };
  const setCommentNotification = (status) => {
    dispatch({
      type: "SET_COMMENT_NOTIFICATION", // Yeni bildirim durumu ayarlama
      payload: status,
    });
  };
  const setCommentLikeNotification = (status) => {
    dispatch({
      type: "SET_COMMENT_LIKE_NOTIFICATION", // Yeni bildirim durumu ayarlama
      payload: status,
    });
  };
  const setCommentReplyNotification = (status) => {
    dispatch({
      type: "SET_COMMENT_REPLY_NOTIFICATION", // Yeni bildirim durumu ayarlama
      payload: status,
    });
  };
  const setCommentReplyLikeNotification = (status) => {
    dispatch({
      type: "SET_COMMENT_REPLY_LIKE_NOTIFICATION", // Yeni bildirim durumu ayarlama
      payload: status,
    });
  };
  const setFollowNotification = (status) => {
    dispatch({
      type: "SET_FOLLOW_NOTIFICATION", // Yeni bildirim durumu ayarlama
      payload: status,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isFetching: state.isFetching,
        error: state.error,
        isLoading,
        newMessageNotification: state.newMessageNotification,
        setMessageNotification,
        newLikeNotification: state.newLikeNotification,
        setLikeNotification,
        newCommentNotification: state.newCommentNotification,
        setCommentNotification,
        newCommentLikeNotification: state.newCommentLikeNotification,
        setCommentLikeNotification,
        newCommentReplyNotification: state.newCommentReplyNotification,
        setCommentReplyNotification,
        newCommentReplyLikeNotification: state.newCommentReplyLikeNotification,
        setCommentReplyLikeNotification,
        newFollowNotification: state.newFollowNotification,
        setFollowNotification,
        logout,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
