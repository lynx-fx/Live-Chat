import React from "react";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login.jsx"
import NotFound from "./components/notFound.jsx"

function App() {
  return (
    <>
      <Toaster richColors />
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/*" element={<NotFound/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
