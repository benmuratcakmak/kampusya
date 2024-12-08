import axios from "axios";
import { toast } from "react-toastify";

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post("/api/auth/login", userCredential);
    toast.success("Login Successful!");

    const { user, token } = res.data;
    
    // Kullanıcıyı ve token'ı localStorage'a doğru şekilde kaydediyoruz
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("authToken", token);

    dispatch({ 
      type: "LOGIN_SUCCESS", 
      payload: { user, token } 
    });

    return token;  // Token'ı frontend'de kullanmak için geri döndürüyoruz
  } catch (err) {
    dispatch({ type: "LOGIN_FAILURE", payload: err.message });
    toast.error("Login Failed!");
    throw err;
  }
};
