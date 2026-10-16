import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard"
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import OAuthCallback from "./components/OAuthCallback/OAuthCallback";
import ResendVerification from "./components/ResendVerification/Resendverification";
import ForgotPassword from "./components/ForgotPassword/Forgotpassword";
import ResetPassword from "./components/ResetPassword/Resetpassword";
import './index.css'
import LandingPage from "./LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;