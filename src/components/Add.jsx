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
        // Assuming data is an array of objects with properties like uuid and name
        setExecutorsList(data); // Assuming data is an array of executors
      } catch (error) {
        console.error("Ошибка при загрузке исполнителей:", error.message);
        // Handle error as needed, e.g., show an alert
        alert("Ошибка при загрузке исполнителей: " + error.message);
      }
    };

    fetchExecutors();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Преобразование sendTime в ISO 8601 формат
    const formattedSendTime = new Date(sendTime).toISOString();

    const taskData = {
      name: taskName,
      description: taskDescription,
      status_id: 1,
      apperance_timestamp: formattedSendTime,
      group_uuid: executor, // Use executor's UUID here
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
    <div className="add-task-page">
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            name="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            className="input-field"
            placeholder="Введите заголовок задачи"
          />
        </label>
        <label>
          <textarea
            name="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows="4"
            required
            className="input-field"
            placeholder="Введите описание задачи"
          ></textarea>
        </label>
        <label>
          <select
            value={executor}
            onChange={handleExecutorChange}
            required
            className="input-field select-field"
          >
            <option value="">Выберите исполнителя</option>
            {executorsList.map((executor) => (
              <option key={executor.uuid} value={executor.uuid}>
                {executor.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Время отправки:
          <input
            type="datetime-local"
            name="sendTime"
            value={sendTime}
            onChange={handleSendTimeChange}
            required
            className="input-field"
            placeholder="Выберите время отправки"
          />
        </label>
        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
};

export default AddTaskPage;
