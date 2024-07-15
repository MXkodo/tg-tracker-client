import React, { useState, useEffect } from "react";
import "../styles/Add.css";

const AddTaskPage = () => {
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [executor, setExecutor] = useState("");
  const [executorsList, setExecutorsList] = useState([]);
  const [sendTime, setSendTime] = useState("");

  useEffect(() => {
    const fetchExecutors = async () => {
      try {
        const response = await fetch(
          "https://c947-176-100-119-5.ngrok-free.app/api/v1/groups",
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при загрузке исполнителей!");
        }

        const data = await response.json();

        setExecutorsList(data);
      } catch (error) {
        console.error("Ошибка при загрузке исполнителей:", error.message);
        alert("Ошибка при загрузке исполнителей: " + error.message);
      }
    };

    fetchExecutors();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formattedSendTime = new Date(sendTime).toISOString();

    const taskData = {
      name: taskName,
      description: taskDescription,
      status_id: 1,
      apperance_timestamp: formattedSendTime,
      group_uuid: executor,
    };

    try {
      const response = await fetch(
        "https://c947-176-100-119-5.ngrok-free.app/api/v1/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при сохранении задачи!");
      }

      console.log("Задача сохранена!");
      alert("Задача успешно создана");
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error.message);
      alert("Ошибка при сохранении задачи:", error.message);
    }
  };

  const handleExecutorChange = (event) => {
    setExecutor(event.target.value);
  };

  const handleSendTimeChange = (event) => {
    setSendTime(event.target.value);
  };

  return (
    <div className="mx-auto p-5 bg-zinc-900 rounded-lg shadow-md h-screen text-white font-sans">
      <form className="flex flex-col space-y-5" onSubmit={handleSubmit}>
        <label className="block mb-2">
          <input
            type="text"
            name="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-zinc-800 focus:border-green-500 focus:outline-none"
            placeholder="Введите заголовок задачи"
          />
        </label>
        <label className="block mb-2">
          <textarea
            name="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows="4"
            required
            className="w-full px-4 py-2 resize-y min-h-24 h-64 border border-gray-300 rounded-lg text-center bg-zinc-800 focus:border-green-500 focus:outline-none"
            placeholder="Введите описание задачи"
          ></textarea>
        </label>
        <label className="block mb-2">
          <select
            value={executor}
            onChange={handleExecutorChange}
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-zinc-800 focus:border-green-500"
          >
            <option value="">Выберите исполнителя</option>
            {executorsList.map((executor) => (
              <option key={executor.uuid} value={executor.uuid}>
                {executor.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block mb-2">
          Время отправки:
          <input
            type="datetime-local"
            name="sendTime"
            value={sendTime}
            onChange={handleSendTimeChange}
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-zinc-800 focus:border-green-500"
            placeholder="Выберите время отправки"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-lg mt-5 font-bold"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
};

export default AddTaskPage;
