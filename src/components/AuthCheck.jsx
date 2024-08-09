import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AuthCheck({ setUserRole }) {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authChecked");

    console.log("Is authenticated:", isAuthenticated);

    if (window.Telegram && window.Telegram.WebApp) {
      const { WebApp } = window.Telegram;

      WebApp.ready();
      const user = WebApp.initDataUnsafe.user;
      const username = user ? user.username : null;

      console.log("User data from WebApp:", user);

      if (username) {
        axios
          .post("https://0239-85-172-92-2.ngrok-free.app/api/v1/user", {
            username,
          })
          .then((response) => {
            console.log("Data received from server:", response.data); // Отладк
            localStorage.setItem("authChecked", "true");
            setUserRole(response.data.role); // Передаём роль пользователя в состояние
            navigate("/");
          })
          .catch((error) => {
            console.error("Axios error:", error);
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
