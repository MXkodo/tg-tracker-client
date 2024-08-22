import { useEffect } from "react";
import axios from "axios";

function AuthCheck({ setUserRole, setUserUUID }) {
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const { WebApp } = window.Telegram;

      WebApp.ready();
      const user = WebApp.initDataUnsafe.user;
      const username = user ? user.username : null;
      const chatID = WebApp.initDataUnsafe.chat.id;

      console.log("Telegram WebApp is ready.");
      console.log("User:", user);
      console.log("Username:", username);
      console.log("Chat ID from WebApp:", chatID);

      if (username) {
        axios
          .post("https://taskauth.emivn.io/api/v1/user", { username })
          .then((response) => {
            const { role, uuid, chat_id } = response.data;

            console.log("User data response:", response.data);

            localStorage.setItem("authChecked", "true");

            setUserRole(role);
            setUserUUID(uuid);

            // Если chat_id в ответе пустой и chatID существует, обновляем chat_id
            if (!chat_id && chatID) {
              console.log("Updating chat ID...");
              axios
                .put(`https://taskauth.emivn.io/api/v1/users/chatid/${uuid}`, {
                  chat_id: chatID,
                })
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
        console.error("Username not found in Telegram");
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
