import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContent from "./MainContent";
import Footer from "./Footer";
import AddTaskPage from "./Add";
import GroupsPage from "./Groups";
import AuthCheck from "./AuthCheck";
import MainUser from "./MainUser"; // Предполагается, что этот компонент импортирован

function App() {
  const [userRole, setUserRole] = useState(null);
  const [userUUID, setUserUUID] = useState("");

  useEffect(() => {
    console.log("Current userRole:", userRole); // Отладка
    console.log("Current userUUID:", userUUID); // Отладка
  }, [userRole, userUUID]);

  return (
    <Router>
      <div className="app">
        <main>
          <AuthCheck setUserRole={setUserRole} setUserUUID={setUserUUID} />
          <Routes>
            {/* Изменяем здесь логику выбора компонента */}
            <Route
              path="/"
              element={
                userRole !== null && userUUID ? (
                  userRole === 1 ? (
                    <MainContent role={userRole} userUUID={userUUID} />
                  ) : (
                    <MainUser /> // Показываем MainUser, если role равен 0
                  )
                ) : (
                  <div>Loading...</div>
                )
              }
            />
            <Route path="/add" element={<AddTaskPage />} />
            <Route path="/group" element={<GroupsPage />} />
          </Routes>
        </main>
        {userRole !== 0 && <Footer />}
      </div>
    </Router>
  );
}

export default App;
