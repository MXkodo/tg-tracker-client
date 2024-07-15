import React, { useState, useEffect } from "react";
import axios from "axios";
import ScrollContainer from "./ScrollContainer";
import "../styles/MainContent.css";
import ClearIcon from "../img/Clear.png";
// import SearchIcon from "../img/Search.png";
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

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <ScrollContainer
          onFilterChange={handleFilterChange}
          activeStatusId={activeStatusId}
        />
      </header>
      <div className="flex flex-col flex-grow bg-[#525252] rounded-[17px] overflow-y-auto p-5 box-border mb-4 h-[79vh]">
        <div className="flex items-center mr-0">
          <input
            id="search"
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={handleInputChange}
            className="rounded-[15px] w-[35vh] h-[5vh] p-1"
          />
          {searchTerm && (
            <button className="clear-button" onClick={clearSearch}>
              <img src={ClearIcon} alt="Clear" />
            </button>
          )}
          {/* <button className="search-button rounded-[10px] bg-[#66f96b] border-none p-1 h-[5vh] cursor-pointer transition-colors duration-300 hover:bg-[#15803d]"></.button> */}
          <button
            className="icon-button rounded-[10px] mr-2 h-[5vh] bg-[#66f96b] border-none cursor-pointer transition-colors duration-300 hover:bg-[#15803d] ml-5"
            onClick={handleSettingsClick}
          >
            <img src={SettingIcon} alt="Setting" />
          </button>
          <button
            className="icon-button rounded-[10px] ml-2 h-[5vh] bg-[#66f96b] border-none cursor-pointer transition-colors duration-300 hover:bg-[#15803d]"
            onClick={handleEditClick}
          >
            <img src={UpdateIcon} alt="Update" />
          </button>
        </div>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`mt-5 border border-[rgba(115,115,115,.31)] rounded-[17px] p-1 mb-1 bg-[#737373] shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-5 ${
              index === tasks.length - 1 ? "mb-5 last-task" : ""
            }`}
          >
            <div className="task-tile" onClick={() => handleEditClick(task)}>
              <h3>{task.name}</h3>
              <p>Время отправки: {formatTimestamp(task.apperance_timestamp)}</p>
              <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && selectedTask && (
        <Modal task={selectedTask} onClose={closeModal} />
      )}
    </div>
  );
}

const Modal = ({ task, groups, onClose }) => {
  const [taskName, setTaskName] = useState(task.name);
  const [taskDescription, setTaskDescription] = useState(task.description);
  const [executor, setExecutor] = useState("");
  const [sendTime, setSendTime] = useState(formatDateTime(task.sendTime));

  // // Define getExecutorNameByGroupUUID locally
  // const getExecutorNameByGroupUUID = (groupUUID) => {
  //   const executor = executors.find((ex) => ex.group_uuid === groupUUID);
  //   return executor ? executor.name : "";
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare the updated task data
      const updatedTask = {
        ...task,
        name: taskName,
        description: taskDescription,
        group_uuid: executor,
        sendTime: sendTime, // Adjust this based on your date/time format handling
      };

      // Send a POST request to save the updated task
      const response = await axios.post(
        "https://c947-176-100-119-5.ngrok-free.app/api/v1/tasks",
        updatedTask
      );

      // Handle success response (optional)
      console.log("Task updated successfully:", response.data);

      // Optionally, you can add logic to inform the user (e.g., show a success message)
      alert("Changes saved successfully!");

      // Close the modal after successful submission
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      // Optionally, handle errors (e.g., show an error message to the user)
      alert("Failed to save changes. Please try again.");
    }
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
              value={task.name}
              onChange={(e) => setTaskName(e.target.value)}
              required
              className="input-field"
              placeholder="Введите заголовок задачи"
            />
            <textarea
              name="taskDescription"
              value={task.description}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows="4"
              required
              className="input-field"
              placeholder="Введите описание задачи"
            ></textarea>
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
            <input
              type="datetime-local"
              name="sendTime"
              value={new Date(task.sendTime).toISOString().substr(0, 16)} // Преобразование формата даты
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

// const handleUpdateClick = () => {
//   alert("Кнопка Update нажата");
// };

export default MainContent;
