import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContent from "./MainContent";
import Footer from "./Footer";
import AddTaskPage from "./Add";
import GroupsPage from "./Groups";
import AuthCheck from "./AuthCheck";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [userUUID, setUserUUID] = useState(""); // Добавляем состояние для userUUID

  useEffect(() => {
    console.log("Current userRole:", userRole); // Отладка
  }, [userRole]);

  return (
    <Router>
      <div className="app">
        <AuthCheck setUserRole={setUserRole} setUserUUID={setUserUUID} />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                userRole !== null && userUUID ? (
                  <MainContent role={userRole} userUUID={userUUID} />
                ) : (
                  <div>Loading...</div>
                )
              }
            />
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
