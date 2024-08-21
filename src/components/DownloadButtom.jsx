import axios from "axios";

const DownloadButton = () => {
  const handleDownload = () => {
    const { WebApp } = window.Telegram;
    WebApp.ready();
    const user = WebApp.initDataUnsafe.user;
    const chatID = user.id; // Получаем chatID из данных пользователя

    axios({
      url: `https://taskback.emivn.io/api/v1/tasks/download?chatID=${chatID}`, // Добавляем chatID в URL
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        // Выводим уведомление о том, что файл отправлен
        alert("Файл был отправлен вам в Telegram!");
      })
      .catch((error) => {
        console.error("Ошибка при скачивании файла", error);
      });
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-green-500 text-white py-2 px-4 rounded"
    >
      Экспорт
    </button>
  );
};

export default DownloadButton;
