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
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeStatusId, setActiveStatusId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const response = await axios.get(
          "https://c947-176-100-119-5.ngrok-free.app/api/v1/tasks",
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        );
        setAllTasks(response.data);
        filterTasksByStatus(response.data, activeStatusId);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          "https://c947-176-100-119-5.ngrok-free.app/api/v1/groups",
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        );
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchAllTasks();
    fetchGroups();
  }, [activeStatusId]);

  useEffect(() => {
    filterTasksByStatus(allTasks, activeStatusId);
  }, [activeStatusId, allTasks]);

  const filterTasksByStatus = (tasksArray, statusId) => {
    const filteredTasks = tasksArray.filter(
      (task) => task.status_id === statusId
    );
    setTasks(filteredTasks);
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
    setActiveStatusId(statusId);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="main-content">
      <header className="header">
        <ScrollContainer
          onFilterChange={handleFilterChange}
          activeStatusId={activeStatusId}
        />
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
          <button className="icon-button" onClick={handleSettingsClick}>
            <img src={SettingIcon} alt="Setting" />
          </button>
          <button className="icon-button" onClick={handleUpdateClick}>
            <img src={UpdateIcon} alt="Update" />
          </button>
        </div>
        <div className="task-tiles">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="task-tile"
              onClick={() => handleTaskClick(task)}
            >
              <h3>{task.name}</h3>
              <p>Время отправки: {formatTimestamp(task.apperance_timestamp)}</p>
              <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
            </div>
          ))}
        </div>
      </div>
      {modalOpen && selectedTask && (
        <Modal task={selectedTask} onClose={closeModal} groups={groups} />
      )}
    </div>
  );
}

const Modal = ({ task, onClose, groups }) => {
  // Remove unused variables and functions
  const [taskName, setTaskName] = useState(task.name);
  const [taskDescription, setTaskDescription] = useState(task.description);
  const [executor, setExecutor] = useState(task.executor);
  const [sendTime, setSendTime] = useState(formatDateTime(task.sendTime));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement your submit logic here
    alert("Form submitted!");
  };

  const handleExecutorChange = (e) => {
    setExecutor(e.target.value);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <label>
            Заголовок задачи:
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
            Описание задачи:
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
            Исполнитель:
            <select
              value={executor}
              onChange={handleExecutorChange}
              required
              className="input-field select-field"
            >
              <option value="">Выберите исполнителя</option>
              {groups.map((group) => (
                <option key={group.uuid} value={group.uuid}>
                  {group.name}
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
              onChange={(e) => setSendTime(e.target.value)}
              required
              className="input-field"
              placeholder="Выберите время отправки"
            />
          </label>
          <div className="modal-buttons">
            <button type="submit" className="modal-button">
              Сохранить изменения
            </button>
            <button className="modal-button" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function to format date-time in the required format for datetime-local input
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  const isoDateTime = date.toISOString().slice(0, 16);
  return isoDateTime;
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const handleSettingsClick = () => {
  alert("Кнопка Setting нажата");
};

const handleUpdateClick = () => {
  alert("Кнопка Update нажата");
};

export default MainContent;
