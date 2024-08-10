import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContent from "./MainContent";
import Footer from "./Footer";
import AddTaskPage from "./Add";
import GroupsPage from "./Groups";
import AuthCheck from "./AuthCheck";
import MainUser from "./MainUser";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [userUUID, setUserUUID] = useState("");

  useEffect(() => {
    console.log("Current userRole:", userRole);
    console.log("Current userUUID:", userUUID);
  }, [userRole, userUUID]);

  return (
    <Router>
      <div className="app">
        <main>
          <AuthCheck setUserRole={setUserRole} setUserUUID={setUserUUID} />
          <Routes>
            {}
            <Route
              path="/"
              element={
                userRole !== null && userUUID ? (
                  userRole === 1 ? (
                    <MainContent role={userRole} userUUID={userUUID} />
                  ) : (
                    <MainUser role={userRole} userUUID={userUUID} />
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
