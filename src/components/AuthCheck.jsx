import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthCheck() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false); // Состояние для отслеживания завершённости проверки аутентификации

  useEffect(() => {
    // Проверяем, была ли уже выполнена аутентификация
    if (authChecked) return;

    if (window.Telegram && window.Telegram.WebApp) {
      const { WebApp } = window.Telegram;

      WebApp.ready();
      const user = WebApp.initDataUnsafe.user;
      const username = user ? user.username : null;

      if (username) {
        fetch("https://0239-85-172-92-2.ngrok-free.app/api/v1/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("User not found");
            }
            return response.json();
          })
          .then((data) => {
            console.log("User data:", data);
            // Перенаправляем на главную страницу и устанавливаем authChecked в true
            navigate("/");
            setAuthChecked(true);
          })
          .catch((error) => {
            alert(
              "Вас не зарегистрировали, вы не можете использовать приложение"
            );

            if (window.Telegram && window.Telegram.WebApp) {
              window.Telegram.WebApp.close();
            }
          });
      } else {
        alert("Пользователь не найден в Telegram");

        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.close();
        }
      }
    } else {
      console.error("Telegram Web Apps API is not loaded");

      alert("Произошла ошибка при загрузке приложения");

      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.close();
      }
    }
  }, [authChecked, navigate]); // Зависимости useEffect

  return null;
}

export default AuthCheck;
