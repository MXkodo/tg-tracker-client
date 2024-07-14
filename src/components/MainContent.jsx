import React, { useState, useEffect } from "react";
import axios from "axios";
import ScrollContainer from "./ScrollContainer";
import "../styles/MainContent.css";
import ClearIcon from "../img/Clear.png";
import SearchIcon from "../img/Search.png";
import SettingIcon from "../img/Setting.png";
import UpdateIcon from "../img/Update.png";

function MainContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchTasks(); // Вызываем функцию загрузки задач при монтировании компонента
  }, []); // Пустой массив зависимостей, чтобы запрос выполнялся один раз при загрузке

  useEffect(() => {
    fetchGroups(); // Вызываем функцию загрузки групп при монтировании компонента
  }, []); // Пустой массив зависимостей, чтобы запрос выполнялся один раз при загрузке

  const fetchTasks = async (statusId) => {
    try {
      const response = await axios.get(
        "https://c947-176-100-119-5.ngrok-free.app/api/v1/tasks",
        {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
          params: {
            status_id: statusId, // Передаем активный статус фильтра как параметр запроса
          },
        }
      );
      setTasks(response.data); // Устанавливаем полученные задачи в состояние
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        "https://c947-176-100-119-5.ngrok-free.app/api/v1/groups"
      );
      setGroups(response.data); // Устанавливаем полученные группы в состояние
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getGroupNameByUUID = (groupUUID) => {
    const group = groups.find((g) => g.uuid === groupUUID);
    return group ? group.name : "Unknown Group";
  };

  const handleFilterChange = (statusId) => {
    fetchTasks(statusId); // Вызываем функцию загрузки задач с новым статусом фильтра
  };

  return (
    <div className="main-content">
      <header className="header">
        <ScrollContainer onFilterChange={handleFilterChange} />
      </header>
      <div className="content">
        <div className="search-container">
          <input
            id="search"
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={handleInputChange}
          />
          {searchTerm && (
            <button className="clear-button" onClick={clearSearch}>
              <img src={ClearIcon} alt="Clear" />
            </button>
          )}
          <button className="search-button">
            <img src={SearchIcon} alt="Search" />
          </button>
          <img src={SettingIcon} alt="Setting" />
          <img src={UpdateIcon} alt="Update" />
        </div>
        <div className="task-tiles">
          {tasks.map((task) => (
            <div key={task.id} className="task-tile">
              <h3>{task.title}</h3>
              <p>Время отправки: {formatTimestamp(task.apperance_timestamp)}</p>
              <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Функция для форматирования времени
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export default MainContent;
