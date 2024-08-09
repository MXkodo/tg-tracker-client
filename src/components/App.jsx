import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContent from "./MainContent";
import Footer from "./Footer";
import AddTaskPage from "./Add";
import GroupsPage from "./Groups";
import AuthCheck from "./AuthCheck";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [userUUID, setUserUUID] = useState("");
  const [loading, setLoading] = useState(true); // Состояние для управления загрузкой

  useEffect(() => {
    console.log("Current userRole:", userRole); // Отладка
    console.log("Current userUUID:", userUUID); // Отладка
  }, [userRole, userUUID]);
  alert(loading);
  // if (loading) {
  //   return <div>Loading...</div>; // Показать сообщение о загрузке, пока идет проверка аутентификации
  // }

  return (
    <Router>
      <div className="app">
        <main>
          <AuthCheck
            setUserRole={setUserRole}
            setUserUUID={setUserUUID}
            setLoading={setLoading}
          />
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
        {userRole !== 0 && <Footer />}
      </div>
    </Router>
  );
}

export default App;
