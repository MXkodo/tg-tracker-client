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
    // Функция для загрузки задач с API
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          "https://c947-176-100-119-5.ngrok-free.app/api/v1/tasks",
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        );
        setTasks(response.data); // Устанавливаем полученные задачи в состояние
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks(); // Вызываем функцию загрузки при монтировании компонента
  }, []); // Пустой массив зависимостей, чтобы запрос выполнялся один раз при загрузке

  useEffect(() => {
    // Функция для загрузки всех групп с API
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

    fetchGroups(); // Вызываем функцию загрузки при монтировании компонента
  }, []); // Пустой массив зависимостей, чтобы запрос выполнялся один раз при загрузке

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

  return (
    <div className="main-content">
      <header className="header">
        <ScrollContainer />
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
              <p>Время отправки: {task.timestamp}</p>
              <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainContent;
