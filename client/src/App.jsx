import React from "react";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login.jsx";
import NotFound from "./components/notFound.jsx";
import Dashboard from "./components/dashboard.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const GoogleLogin = () => {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Login></Login>
      </GoogleOAuthProvider>
    );
  };

  return (
    <>
      <Toaster richColors />
      <Router>
        <Routes>
          <Route path="/" element={<GoogleLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/profile" element={<Profile />} /> */}
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
