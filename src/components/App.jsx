import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContent from "./MainContent";
import Footer from "./Footer";
import AddTaskPage from "./Add";
//import GroupsPage from "./Groups";
import UserProfile from "./UserProfile";

function App() {
  return (
    <Router>
      <div className="app">
        <main>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/add" element={<AddTaskPage />} />
            <Route path="/group" element={<UserProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
