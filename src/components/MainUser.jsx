import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ScrollContainer from "./ScrollContainerUser";
import "../styles/MainContent.css";
import ClearIcon from "../img/Clear.png";
import UpdateIcon from "../img/Update.png";
import backgroundImage from "../img/Back.png";

function MainContent({ userUUID, userRole }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeStatusId, setActiveStatusId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const getGroupNameByUUID = useCallback(
    (groupUUID) => {
      const group = groups.find((g) => g.uuid === groupUUID);
      return group ? group.name : "Unknown Group";
    },
    [groups]
  );

  const filterTasksBySearchAndStatus = useCallback(
    (tasksArray = [], searchTerm, statusId) => {
      if (!tasksArray) {
        console.error("Tasks array is null or undefined.");
        return;
      }

      let filteredTasks = tasksArray;

      if (statusId !== null) {
        filteredTasks = filteredTasks.filter(
          (task) => task.status_id === statusId
        );
      }

      if (searchTerm.trim() !== "") {
        filteredTasks = filteredTasks.filter((task) => {
          const taskName = task.name || "";
          const groupName = getGroupNameByUUID(task.group_uuid) || "";
          return (
            taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            groupName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }

      setTasks(filteredTasks);
    },
    [getGroupNameByUUID]
  );

  const fetchTasks = useCallback(async () => {
    try {
      const endpoint = `/api/v1/tasks/all/${userUUID}`;
      const response = await axios.get(`https://taskback.emivn.io${endpoint}`, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setAllTasks(response.data);
        filterTasksBySearchAndStatus(response.data, searchTerm, activeStatusId);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  }, [userUUID, searchTerm, activeStatusId, filterTasksBySearchAndStatus]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        "https://taskback.emivn.io/api/v1/groups",
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
    filterTasksBySearchAndStatus(allTasks, searchTerm, activeStatusId);
  }, [allTasks, searchTerm, activeStatusId, filterTasksBySearchAndStatus]);

  const refreshData = () => {
    fetchTasks();
  };

  const handleAcceptTask = async (taskId, status) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, isLoading: true } : task
        )
      );

      await axios.patch(`https://taskback.emivn.io/api/v1/tasks/status`, {
        uuid: taskId,
        status_id: status,
        returned: false,
      });

      refreshData();
    } catch (error) {
      console.error("Error accepting task:", error);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
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

  const handleSortChange = (e) => {
    const selectedSortOption = e.target.value;
    switch (selectedSortOption) {
      case "group":
        sortByGroup();
        break;
      case "title":
        sortByTitle();
        break;
      case "timestamp":
        sortByTimestamp();
        break;
      default:
        break;
    }
  };

  const sortByGroup = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const groupNameA = getGroupNameByUUID(a.group_uuid).toLowerCase();
      const groupNameB = getGroupNameByUUID(b.group_uuid).toLowerCase();
      return groupNameA.localeCompare(groupNameB);
    });
    setTasks(sortedTasks);
  };

  const sortByTitle = () => {
    const sortedTasks = [...tasks].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    setTasks(sortedTasks);
  };

  const sortByTimestamp = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const timestampA = new Date(a.apperance_timestamp);
      const timestampB = new Date(b.apperance_timestamp);
      return timestampB - timestampA;
    });
    setTasks(sortedTasks);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Не указано";

    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <ScrollContainer
          onFilterChange={handleFilterChange}
          activeStatusId={activeStatusId}
        />
      </header>
      <div
        className="flex flex-col flex-grow rounded-[17px] overflow-y-auto p-5 box-border mb-4 h-[79vh]"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center mr-0">
          <input
            id="search"
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={handleInputChange}
            className="rounded-[15px] w-[27vh] h-[5vh] p-1"
            style={{ color: "black" }}
          />

          {searchTerm && (
            <button className="clear-button" onClick={clearSearch}>
              <img src={ClearIcon} alt="Clear" />
            </button>
          )}

          <select
            className="sort-dropdown rounded-[15px] ml-2 h-[5vh] bg-green-500 border-none cursor-pointer text-white font-semibold transition-colors duration-300"
            onChange={handleSortChange}
          >
            <option value="group">По группе</option>
            <option value="title">По названию</option>
            <option value="timestamp">По времени</option>
          </select>
          <button
            className="icon-button rounded-[10px] ml-2 h-[5vh] bg-green-500 border-none cursor-pointer transition-colors duration-300 hover:bg-green-700"
            onClick={refreshData}
          >
            <img src={UpdateIcon} alt="Update" />
          </button>
        </div>
        {tasks.map((task, index) => {
          return (
            <div
              key={task.id}
              className={`mt-5 border rounded-[17px] p-1 mb-1 bg-[#737373] shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-2 ${
                task.returned
                  ? "border-red-500"
                  : "border-[rgba(115,115,115,.31)]"
              } ${index === tasks.length - 1 ? "mb-5 last-task" : ""}`}
            >
              <div className="task-tile" onClick={() => handleEditClick(task)}>
                <h3>{task.name}</h3>
                <p>
                  Время отправки: {formatTimestamp(task.apperance_timestamp)}
                </p>
                <p>Дедлайн: {formatTimestamp(task.deadline)}</p>
                <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
                {task.status_id === 7 && <p>Оценка: {task.grade}</p>}
                {task.isLoading ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    {task.status_id === 2 && (
                      <button
                        className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.id, 3);
                        }}
                      >
                        Принять
                      </button>
                    )}
                    {task.status_id === 3 && (
                      <button
                        className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.id, 4);
                        }}
                      >
                        Готово
                      </button>
                    )}
                    {task.status_id === 4 && (
                      <button className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600">
                        В проверке
                      </button>
                    )}
                    {task.status_id === 5 && <></>}
                    {task.status_id === 6 && (
                      <button
                        className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.id, 3);
                        }}
                      >
                        Принять
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {modalOpen && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-zinc-900 p-5 rounded-lg shadow-lg max-w-4xl max-h-full overflow-auto text-white">
                <h2 className="text-xl font-bold whitespace-normal overflow-hidden max-w-full">
                  Информация о задаче
                </h2>
                <p className="whitespace-normal overflow-hidden max-w-full">
                  <strong>Название:</strong> {selectedTask.name}
                </p>
                <p className="whitespace-normal overflow-hidden max-w-prose break-words">
                  <strong>Описание:</strong> {selectedTask.description}
                </p>
                <p className="whitespace-normal overflow-hidden max-w-full">
                  <strong>Группа:</strong>{" "}
                  {getGroupNameByUUID(selectedTask.group_uuid)}
                </p>
                <p className="whitespace-normal overflow-hidden max-w-full">
                  <strong>Время отправки:</strong>{" "}
                  {formatTimestamp(selectedTask.apperance_timestamp)}
                </p>
                <div className="flex justify-end mt-5">
                  <button
                    className="ml-2 px-5 py-2 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                    onClick={closeModal}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainContent;
