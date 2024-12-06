export const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isFetching: true,
        error: false,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isFetching: false,
        error: false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isFetching: false,
        error: true,
      };
    case "LOGOUT":
      return {
        user: null,
        token: null,
        isFetching: false,
        error: false,
      };
      case "SET_MESSAGE_NOTIFICATION":
        return {
          ...state,
          newMessageNotification: action.payload, // Yeni bildirim durumunu güncelle
        };
      case "SET_LIKE_NOTIFICATION":
        return {
          ...state,
          newLikeNotification: action.payload, // Yeni bildirim durumunu güncelle
        };
      case "SET_COMMENT_NOTIFICATION":
        return {
          ...state,
          newCommentNotification: action.payload, // Yeni bildirim durumunu güncelle
        };
      case "SET_COMMENT_LIKE_NOTIFICATION":
        return {
          ...state,
          newCommentLikeNotification: action.payload, // Yeni bildirim durumunu güncelle
        };
      case "SET_COMMENT_REPLY_NOTIFICATION":
        return {
          ...state,
          newCommentReplyNotification: action.payload, // Yeni bildirim durumunu güncelle
        };
      case "SET_COMMENT_REPLY_LIKE_NOTIFICATION":
        return {
          ...state,
          newCommentReplyLikeNotification: action.payload, // Yeni bildirim durumunu güncelle
        };
    case "SET_FOLLOW_NOTIFICATION":
      return {
        ...state,
        newFollowNotification: action.payload, // Yeni bildirim durumunu güncelle
      };
    default:
      return state;
  }
};
