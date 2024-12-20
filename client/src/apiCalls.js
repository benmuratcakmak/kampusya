import axios from "axios";
import { toast } from "react-toastify";

// apiCalls.js
export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post("/api/auth/login", userCredential);
    toast.success("Login Successful!");

    const { user, token } = res.data;
    
    if (!user || !token) {
      console.error("[Login Error] Eksik kullanıcı bilgisi veya token:", {
        user,
        hasToken: !!token
      });
      throw new Error("Invalid login response");
    }

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("authToken", token);

    dispatch({ 
      type: "LOGIN_SUCCESS", 
      payload: { user, token } 
    });

    return token;
  } catch (err) {
    console.error("[Login Error] Giriş hatası:", {
      error: err.message,
      stack: err.stack,
      credentials: {
        ...userCredential,
        password: '[HIDDEN]' // Şifreyi loglama
      }
    });
    dispatch({ type: "LOGIN_FAILURE", payload: err.message });
    toast.error("Login Failed!");
    throw err;
  }
};

