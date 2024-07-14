import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContent from "./MainContent";
import Footer from "./Footer";
import AddTaskPage from "./Add";

function App() {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleKeyboardOpen = () => {
      setKeyboardOpen(true);
    };

    const handleKeyboardClose = () => {
      setKeyboardOpen(false);
    };

    window.addEventListener("resize", () => {
      if (window.innerHeight < window.screen.height) {
        handleKeyboardOpen();
      } else {
        handleKeyboardClose();
      }
    });

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    <Router>
      <div className={`app ${keyboardOpen ? "keyboard-open" : ""}`}>
        <main>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/add" element={<AddTaskPage />} />
          </Routes>
        </main>
        {!keyboardOpen && <Footer />}
      </div>
    </Router>
  );
}

export default App;
