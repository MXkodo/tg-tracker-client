import axios from "axios";

const DownloadButton = () => {
  const handleDownload = () => {
    const { WebApp } = window.Telegram;
    WebApp.ready();
    const user = WebApp.initDataUnsafe.user;
    const chatID = user.id.toString();

    console.log("Sending request with chatID:", chatID);

    axios({
      url: `https://taskback.emivn.io/api/v1/tasks/download`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        chatID: chatID,
      },
    })
      .then((response) => {
        console.log("Response:", response);
        alert("Файл был отправлен вам в Telegram!");
      })
      .catch((error) => {
        console.error("Ошибка при запросе к серверу", error);
      });
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-custom-yellow text-white py-2 px-4 rounded"
    >
      Экспорт
    </button>
  );
};

export default DownloadButton;
