import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthCheck({ setUserRole }) {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authChecked");

    // Отладка
    console.log("Is authenticated:", isAuthenticated);
    alert("Checking authentication...");

    if (isAuthenticated) return;

    if (window.Telegram && window.Telegram.WebApp) {
      const { WebApp } = window.Telegram;

      WebApp.ready();
      const user = WebApp.initDataUnsafe.user;
      const username = user ? user.username : null;

      console.log("User data from WebApp:", user); // Отладка
      alert("Username: " + username);

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
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Data received from server:", data); // Отладка
            alert("Data received: " + JSON.stringify(data));
            localStorage.setItem("authChecked", "true");
            setUserRole(data.role); // Передаём роль пользователя в состояние
            navigate("/");
          })
          .catch((error) => {
            console.error("Fetch error:", error);
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
  }, [navigate, setUserRole]);

  return null;
}

export default AuthCheck;
