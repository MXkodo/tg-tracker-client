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
  const [assignmentType, setAssignmentType] = useState("users");
  const [selectedGroup, setSelectedGroup] = useState("");

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
          throw new Error("Ошибка при загрузке групп!");
        }

        const data = await response.json();
        setExecutorsList(data || []);
      } catch (error) {
        console.error("Ошибка при загрузке групп:", error.message);
      }
    };

    fetchExecutors();
  }, [role, adminUUID]);

  useEffect(() => {
    if (assignmentType === "specific" && selectedGroup) {
      fetchGroupUsers(selectedGroup);
    } else if (assignmentType === "specific") {
      setGroupUsers([]);
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
      group_uuid: assignmentType === "specific" ? executor : "",
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

  const handleAssignmentTypeChange = (event) => {
    const selectedType = event.target.value;
    setAssignmentType(selectedType);
    if (selectedType !== "specific") {
      setSelectedGroup("");
      setGroupUsers([]);
    }
  };

  const handleExecutorChange = (event) => {
    const selectedValue = event.target.value;
    setExecutor(selectedValue);
    if (assignmentType === "specific") {
      setSelectedGroup(selectedValue);
    }
  };

  const handleSendTimeChange = (event) => {
    setSendTime(event.target.value);
  };

  const handleSendDeadline = (event) => {
    setDeadline(event.target.value);
  };

  return (
    <div
      className="relative mx-auto p-5 bg-cover bg-center rounded-lg shadow-md h-screen text-white font-sans"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-h-screen overflow-y-auto pb-16">
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
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label className="block mb-2">
                <select
                  value={assignmentType}
                  onChange={handleAssignmentTypeChange}
                  required
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-black focus:border-custom-yellow"
                >
                  <option value="users">Пользователям</option>
                  <option value="admins">Админам</option>
                  <option value="everyone">Всем</option>
                  <option value="specific">Точечно</option>
                </select>
              </label>
            </div>
            <div className="flex-1">
              <label className="block mb-2">
                <select
                  value={executor}
                  onChange={handleExecutorChange}
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
              {assignmentType === "specific" && (
                <label className="block mb-2 mt-2">
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
            </div>
          </div>
          <label className="block mb-2">
            Время отправки:
            <input
              type="datetime-local"
              name="sendTime"
              value={sendTime}
              onChange={handleSendTimeChange}
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
              onChange={handleSendDeadline}
              required
              className="w-full px-4 py-2 border border-gray-400 rounded-lg text-center text-white bg-black focus:border-custom-yellow"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 mb-30 bg-custom-yellow text-white rounded-lg mt-5 font-bold"
            disabled={isLoading}
          >
            {isLoading ? "Отправка..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskPage;
