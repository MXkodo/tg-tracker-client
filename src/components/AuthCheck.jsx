import { useEffect } from "react";
import axios from "axios";

function AuthCheck({ setUserRole, setUserUUID }) {
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const { WebApp } = window.Telegram;

      WebApp.ready();
      const user = WebApp.initDataUnsafe.user;
      const username = user ? user.username : null;
      const chatID = user.id.toString();

      if (username) {
        axios
          .post("https://taskauth.emivn.io/api/v1/user", {
            username,
          })
          .then((response) => {
            localStorage.setItem("authChecked", "true");

            const { role, uuid, chat_id } = response.data;

            setUserRole(role);
            setUserUUID(uuid);

            console.log("Received chat_id from server:", chat_id);
            console.log("Chat ID from WebApp:", chatID);

            // Если chat_id в ответе пустой и chatID существует, обновляем chat_id
            if (!chat_id && chatID) {
              console.log("Updating chat ID...");

              // Подготовка данных для запроса
              const dataToSend = {
                chat_id: chatID, // отправляем как chat_id
              };

              console.log("Data to be sent:", dataToSend);

              axios
                .put(
                  `https://taskauth.emivn.io/api/v1/users/chatid/${uuid}`,
                  dataToSend
                )
                .then(() => {
                  console.log("Chat ID updated successfully");
                })
                .catch((error) => {
                  console.error("Error updating chat ID:", error);
                });
            }
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
  }, [setUserRole, setUserUUID]);

  return null;
}

export default AuthCheck;
