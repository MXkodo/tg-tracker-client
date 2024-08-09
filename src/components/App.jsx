import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContent from "./MainContent";
import Footer from "./Footer";
import AddTaskPage from "./Add";
import GroupsPage from "./Groups";
import AuthCheck from "./AuthCheck";

function App() {
  const [userRole, setUserRole] = useState(null);
  console.log(userRole);
  return (
    <Router>
      <div className="app">
        <AuthCheck setUserRole={setUserRole} />
        <main>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/add" element={<AddTaskPage />} />
            <Route path="/group" element={<GroupsPage />} />
          </Routes>
        </main>
        {userRole !== 0 && <Footer />}{" "}
        {/* Отображаем Footer только если роль не равна 0 */}
      </div>
    </Router>
  );
}

export default App;
