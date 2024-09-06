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

  const renderLoadingAnimation = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-5 border-custom-yellow"></div>
    </div>
  );

  return (
    <Router>
      <div className="app">
        <main>
          <AuthCheck setUserRole={setUserRole} setUserUUID={setUserUUID} />
          <Routes>
            <Route
              path="/"
              element={
                userRole !== null && userUUID ? (
                  userRole === 0 ? (
                    <MainUser role={userRole} userUUID={userUUID} />
                  ) : (
                    <MainContent userRole={userRole} userUUID={userUUID} />
                  )
                ) : (
                  renderLoadingAnimation()
                )
              }
            />
            <Route
              path="/add"
              element={<AddTaskPage role={userRole} adminUUID={userUUID} />}
            />
            <Route
              path="/group"
              element={<GroupsPage role={userRole} adminUUID={userUUID} />}
            />
          </Routes>
        </main>
        {userRole !== 0 && <Footer />}
      </div>
    </Router>
  );
}

export default App;
