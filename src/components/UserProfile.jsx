import React, { useEffect, useState } from "react";

function UserProfile() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Проверяем, загружен ли Telegram Web Apps API
    if (window.Telegram && window.Telegram.WebApp) {
      const { WebApp } = window.Telegram;

      // Инициализируем Telegram Web App
      WebApp.ready();

      // Получаем информацию о пользователе из initDataUnsafe
      const user = WebApp.initDataUnsafe.user;
      if (user && user.username) {
        setUserName(user.username);
      }
    } else {
      console.error("Telegram Web Apps API is not loaded");
    }
  }, []);

  return (
    <div>
      <h1>Welcome, {userName || "Guest"}!</h1>
    </div>
  );
}

export default UserProfile;
