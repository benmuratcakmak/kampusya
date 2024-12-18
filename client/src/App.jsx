import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthContext, AuthContextProvider } from "./context/AuthContext";
import { Register } from "./pages/auth/Register";
import { Login } from "./pages/auth/Login";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { Conversation } from "./pages/conversation/Conversation";
import { Conversations } from "./pages/conversations/Conversations";
import { Header } from "./components/header/Header";
import { Footer } from "./components/footer/Footer";
import { Home } from "./pages/home/Home";
import { Profile } from "./pages/profile/Profile";
import { Follow } from "./pages/follow/Follow";
import { UpdateProfile } from "./pages/updateProfile/UpdateProfile";
import { Search } from "./pages/search/Search";
import { Notifications } from "./pages/notifications/Notifications";
import { Post } from "./pages/post/Post";
import { ReportModal } from "./components/reportModal/ReportModal";
import "./App.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Hata yakalandı:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Bir şeyler ters gitti.</h1>;
    }

    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const LocationBasedLayout = ({ openModal, setOpenModal }) => {
  const location = useLocation();

  // Gizlenecek yolları kontrol eden bir değişken
  const hideHeaderAndFooter =
    location.pathname.startsWith("/post") ||
    location.pathname.startsWith("/follow/followers-following") ||
    location.pathname.startsWith("/updateProfile") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    (location.pathname.startsWith("/messages/") &&
      location.pathname.split("/").length === 3 &&
      !location.pathname.includes(":conversationId"));

  return (
    <>
      {!hideHeaderAndFooter && <Header setOpenModal={setOpenModal} />}
      {!hideHeaderAndFooter && <Footer />}
    </>
  );
};

function App() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <AuthContextProvider>
      <div className="general-container">
        <Router>
          <ErrorBoundary>
            <LocationBasedLayout
              openModal={openModal}
              setOpenModal={setOpenModal}
            />
            <Routes>
              <Route
                path="/login"
                element={<Login setOpenModal={setOpenModal} />}
              />
              <Route
                path="/register"
                element={<Register setOpenModal={setOpenModal} />}
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/follow/followers-following/:username"
                element={
                  <ProtectedRoute>
                    <Follow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/post/:postId"
                element={
                  <ProtectedRoute>
                    <Post />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Conversations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/updateProfile/:username"
                element={
                  <ProtectedRoute>
                    <UpdateProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:conversationId"
                element={
                  <ProtectedRoute>
                    <Conversation />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ErrorBoundary>
          <ReportModal
            open={openModal}
            handleClose={() => setOpenModal(false)}
          />
        </Router>
      </div>
    </AuthContextProvider>
  );
}

export default App;
