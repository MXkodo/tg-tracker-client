import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Add.css";
import backgroundImage from "../img/Back.png";

const AddTaskPage = ({ role, adminUUID }) => {
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [executor, setExecutor] = useState("");
  const [executorsList, setExecutorsList] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [sendTime, setSendTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assignmentType, setAssignmentType] = useState("users"); // Тип назначения
  const [selectedGroup, setSelectedGroup] = useState(""); // Выбранная группа

  useEffect(() => {
    const fetchExecutors = async () => {
      try {
        const url =
          role === 1
            ? `https://taskback.emivn.io/api/v1/groups/${adminUUID}`
            : `https://taskback.emivn.io/api/v1/groups`;

        const response = await fetch(url, {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        });

        if (!response.ok) {
          throw new Error("Ошибка при загрузке исполнителей!");
        }

        const data = await response.json();
        setExecutorsList(data || []);
      } catch (error) {
        console.error("Ошибка при загрузке исполнителей:", error.message);
      }
    };

    fetchExecutors();
  }, [role, adminUUID]);

  useEffect(() => {
    if (assignmentType === "specific" && selectedGroup) {
      fetchGroupUsers(selectedGroup);
    }
  }, [assignmentType, selectedGroup]);

  const fetchGroupUsers = (groupId) => {
    axios
      .get(`https://taskback.emivn.io/api/v1/groups/${groupId}/users`, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      })
      .then((response) => {
        setGroupUsers(response.data || []);
      })
      .catch((error) => {
        console.error(
          `Ошибка при получении пользователей группы ${groupId}:`,
          error
        );
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    const formattedSendTime = new Date(sendTime).toISOString();
    const deadlineFormatted = new Date(deadline).toISOString();

    const taskData = {
      name: taskName,
      description: taskDescription,
      status_id: 1,
      apperance_timestamp: formattedSendTime,
      deadline: deadlineFormatted,
      group_uuid: assignmentType === "specific" ? executor : "", // Выбор исполнителя в зависимости от типа назначения
      result: 1,
    };

    try {
      const response = await fetch("https://taskback.emivn.io/api/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Ошибка при сохранении задачи!");
      }

      console.log("Задача сохранена!");
      alert("Задача успешно создана");

      // Сброс состояния формы
      setTaskName("");
      setTaskDescription("");
      setExecutor("");
      setSendTime("");
      setDeadline("");
      setAssignmentType("users");
      setSelectedGroup("");
      setGroupUsers([]);
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error.message);
      alert("Ошибка при сохранении задачи: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="mx-auto p-5 bg-cover bg-center rounded-lg shadow-md h-screen text-white font-sans"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <form className="flex flex-col space-y-5" onSubmit={handleSubmit}>
        <label className="block mb-2">
          <input
            type="text"
            name="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-black focus:border-custom-yellow focus:outline-none"
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
            className="w-full px-4 py-2 resize-y min-h-12 border border-gray-300 rounded-lg text-center bg-black focus:border-custom-yellow focus:outline-none"
            placeholder="Введите описание задачи"
          ></textarea>
        </label>
        <label className="block mb-2">
          <select
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-black focus:border-custom-yellow"
          >
            <option value="users">Пользователям</option>
            <option value="admins">Админам</option>
            <option value="everyone">Всем</option>
            <option value="specific">Точечно</option>
          </select>
        </label>
        {assignmentType === "specific" && (
          <>
            <label className="block mb-2">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-black focus:border-custom-yellow"
              >
                <option value="">Выберите группу</option>
                {executorsList.length > 0 &&
                  executorsList.map((group) => (
                    <option key={group.uuid} value={group.uuid}>
                      {group.name}
                    </option>
                  ))}
              </select>
            </label>
            {selectedGroup && (
              <label className="block mb-2">
                <select
                  value={executor}
                  onChange={(e) => setExecutor(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-black focus:border-custom-yellow"
                >
                  <option value="">Выберите пользователя</option>
                  {groupUsers.length > 0 &&
                    groupUsers.map((user) => (
                      <option key={user.uuid} value={user.uuid}>
                        {user.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
          </>
        )}
        <label className="block mb-2">
          Время отправки:
          <input
            type="datetime-local"
            name="sendTime"
            value={sendTime}
            onChange={(e) => setSendTime(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-black focus:border-custom-yellow"
            placeholder="Выберите время отправки"
          />
        </label>
        <label className="block mb-2">
          Дедлайн:
          <input
            type="datetime-local"
            name="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-black focus:border-custom-yellow"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-custom-yellow text-white rounded-lg mt-5 font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Отправка..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
};

export default AddTaskPage;
