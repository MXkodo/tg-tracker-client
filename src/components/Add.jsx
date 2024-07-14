import React, { useState } from "react";
import "../styles/Add.css";

const AddTaskPage = () => {
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [executor, setExecutor] = useState("");
  const [sendTime, setSendTime] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const taskData = {
      name: taskName,
      description: taskDescription,
      status_id: 1,
      apperance_timestamp: sendTime,
      group_uuid: "123e4567-e89b-12d3-a456-426614174002",
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
        throw new Error("Ошибка при сохранении задачи");
      }

      console.log("Задача сохранена!");
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error.message);
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
            <option value="Исполнитель 1">Исполнитель 1</option>
            <option value="Исполнитель 2">Исполнитель 2</option>
            <option value="Исполнитель 3">Исполнитель 3</option>
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
