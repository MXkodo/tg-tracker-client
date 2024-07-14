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

    fetchAllTasks();
    fetchGroups();
  }, [activeStatusId]);

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
        <Modal task={selectedTask} onClose={closeModal} />
      )}
    </div>
  );
}

const Modal = ({ task, onClose }) => {
  const [editedTask, setEditedTask] = useState({
    name: task.name,
    description: task.description,
    assignee: task.assignee,
    apperance_timestamp: task.apperance_timestamp,
    group_uuid: task.group_uuid,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    alert("Изменения сохранены");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{task.name}</h2>
        <input
          type="text"
          name="description"
          value={editedTask.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="assignee"
          value={editedTask.assignee}
          onChange={handleInputChange}
        />
        <div className="modal-buttons">
          <button className="modal-button" onClick={handleSaveChanges}>
            Сохранить изменения
          </button>
          <button className="modal-button" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
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
