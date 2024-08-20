import React from "react";
import axios from "axios";

const DownloadButton = () => {
  const handleDownload = () => {
    axios({
      url: "https://taskback.emivn.io/api/v1/tasks/download",
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "user_ratings.xlsx");
        document.body.appendChild(link);
        link.click();
        // Очистка ресурсов
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
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
      Скачать рейтинг в Excel
    </button>
  );
};

export default DownloadButton;
