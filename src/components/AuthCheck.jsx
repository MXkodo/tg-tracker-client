import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, был ли пользователь уже аутентифицирован
    const isAuthenticated = localStorage.getItem("authChecked");

    if (isAuthenticated) return; // Если аутентификация была уже проверена, ничего не делаем

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
            localStorage.setItem("authChecked", "true"); // Устанавливаем флаг аутентификации в localStorage
            navigate("/");
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
  }, [navigate]);

  return null;
}

export default AuthCheck;
