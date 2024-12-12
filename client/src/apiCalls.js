import axios from "axios";
import { toast } from "react-toastify";

// apiCalls.js
export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post("/api/auth/login", userCredential); // emailOrUsername parametresi gönderiliyor
    toast.success("Login Successful!");

    const { user, token } = res.data;
    
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("authToken", token);

    dispatch({ 
      type: "LOGIN_SUCCESS", 
      payload: { user, token } 
    });

    return token;
  } catch (err) {
    dispatch({ type: "LOGIN_FAILURE", payload: err.message });
    toast.error("Login Failed!");
    throw err;
  }
};

