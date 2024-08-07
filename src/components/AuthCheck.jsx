import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const { WebApp } = window.Telegram;

      // Инициализируем Telegram Web App
      WebApp.ready();

      // Получаем информацию о пользователе из initDataUnsafe
      const user = WebApp.initDataUnsafe.user;
      const username = user ? user.username : null;

      if (username) {
        // Проверяем наличие пользователя на сервере
        fetch("https://0239-85-172-92-2.ngrok-free.app/api/v1/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }), // Отправляем имя пользователя
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("User not found");
            }
            return response.json();
          })
          .then((data) => {
            console.log("User data:", data);
            // Продолжайте загрузку приложения
            navigate("/");
          })
          .catch((error) => {
            alert(
              "Вас не зарегистрировали, вы не можете использовать приложение"
            );

            // Закрываем Telegram Web App
            if (window.Telegram && window.Telegram.WebApp) {
              // window.Telegram.WebApp.close();
            }

            // Перенаправляем на страницу ошибки или выполняем другую логику, если нужно
            // navigate("/error"); // Не обязательно, так как WebApp будет закрыт
          });
      } else {
        alert("Пользователь не найден в Telegram");

        // Закрываем Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
          //window.Telegram.WebApp.close();
        }

        // Перенаправляем на страницу ошибки или выполняем другую логику, если нужно
        // navigate("/error"); // Не обязательно, так как WebApp будет закрыт
      }
    } else {
      console.error("Telegram Web Apps API is not loaded");

      alert("Произошла ошибка при загрузке приложения");

      // Закрываем Telegram Web App
      if (window.Telegram && window.Telegram.WebApp) {
        // window.Telegram.WebApp.close();
      }

      // Перенаправляем на страницу ошибки или выполняем другую логику, если нужно
      // navigate("/error"); // Не обязательно, так как WebApp будет закрыт
    }
  }, [navigate]);

  // Можно вернуть null, так как этот компонент только для проверки и перенаправления
  return null;
}

export default AuthCheck;
