import React, { useEffect, useState } from "react";

function UserProfile() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Проверяем, загружен ли Telegram Web Apps API
    if (window.TelegramWebApp) {
      // Инициализируем Telegram Web App
      const { TelegramWebApp } = window;

      // Получаем информацию о пользователе
      const user = TelegramWebApp.initDataUnsafe.user;
      if (user) {
        setUserName(user.first_name);
      }

      // В случае, если скрипт еще не загрузился, устанавливаем таймер
      TelegramWebApp.onEvent("onMainButtonClicked", () => {
        setUserName(TelegramWebApp.initDataUnsafe.user.first_name);
      });

      TelegramWebApp.ready();
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
