import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ScrollContainer from "./ScrollContainer";
import ClearIcon from "../img/Clear.png";
import UpdateIcon from "../img/Update.png";

function MainContent({ role, userUUID }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeStatusId, setActiveStatusId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://1686-188-170-174-171.ngrok-free.app/api/v1/groups",
        {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        }
      );
      setGroups(response.data);
    } catch (error) {
      console.error("Ошибка при получении групп:", error);
    }
  }, []);

  const fetchAllTasks = useCallback(async () => {
    try {
      let url = "";
      if (role === 1) {
        url = "https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks";
      } else if (role === 0) {
        url = `https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks/new/${userUUID}`;
      }
      const response = await axios.get(url, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      });
      setAllTasks(response.data);
      filterTasksByStatus(response.data, activeStatusId);
    } catch (error) {
      console.error("Ошибка при получении задач:", error);
    }
  }, [role, userUUID, activeStatusId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  useEffect(() => {
    filterTasksByStatus(allTasks, activeStatusId);
  }, [activeStatusId, allTasks]);

  const refreshData = useCallback(async () => {
    try {
      let url = "";
      if (role === 1) {
        url = "https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks";
      } else if (role === 0) {
        url = `https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks/new/${userUUID}`;
      }
      const response = await axios.get(url, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      });
      setAllTasks(response.data);
      filterTasksByStatus(response.data, activeStatusId);
      fetchGroups();
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error);
    }
  }, [role, userUUID, activeStatusId, fetchGroups]);

  const handleAcceptTask = useCallback(
    async (taskId, status) => {
      try {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.uuid === taskId ? { ...task, isLoading: true } : task
          )
        );

        let url = "";
        if (role === 1) {
          url = `https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks/`;
        } else if (role === 0) {
          url = `https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks/status/${userUUID}`;
        }

        await axios.post(url, {
          uuid: taskId,
          status_id: status,
        });

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.uuid === taskId ? { ...task, isLoading: false } : task
          )
        );

        refreshData();
      } catch (error) {
        console.error("Ошибка при принятии задачи:", error);
      }
    },
    [role, userUUID, refreshData]
  );

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    filterTasksBySearchAndStatus(allTasks, e.target.value, activeStatusId);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getGroupNameByUUID = (groupUUID) => {
    const group = groups.find((g) => g.uuid === groupUUID);
    return group ? group.name : "Неизвестная группа";
  };

  const handleFilterChange = (statusId) => {
    setActiveStatusId(statusId);
    fetchTasksByStatus(statusId);
  };

  const fetchTasksByStatus = useCallback(
    async (statusId) => {
      try {
        let url = "";
        if (role === 1) {
          url = `https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks?status_id=${statusId}`;
        } else if (role === 0) {
          const statusMap = {
            1: "new",
            2: "current",
            3: "completed",
            4: "incorrect",
          };
          const statusPath = statusMap[statusId] || "new";
          url = `https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks/${statusPath}/${userUUID}`;
        }
        const response = await axios.get(url, {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        });
        setAllTasks(response.data);
        filterTasksByStatus(response.data, activeStatusId);
      } catch (error) {
        console.error("Ошибка при получении задач по статусу:", error);
      }
    },
    [role, userUUID, activeStatusId]
  );

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

  const filterTasksByStatus = (tasksArray, statusId) => {
    const filteredTasks = tasksArray.filter(
      (task) => task.status_id === statusId
    );
    setTasks(filteredTasks);
  };

  const filterTasksBySearchAndStatus = (tasksArray, searchTerm, statusId) => {
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header>
        <ScrollContainer
          onFilterChange={handleFilterChange}
          activeStatusId={activeStatusId}
        />
      </header>
      <div className="flex flex-col flex-grow p-4">
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            className="p-2 border rounded-lg border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Поиск по названию или группе"
          />
          <button
            className="ml-2 p-2 bg-red-500 rounded-lg hover:bg-red-700 transition duration-300"
            onClick={clearSearch}
          >
            <img src={ClearIcon} alt="Clear" className="w-5 h-5" />
          </button>
          <select
            onChange={handleSortChange}
            className="ml-2 p-2 border rounded-lg border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="none">Сортировка</option>
            <option value="group">По группе</option>
            <option value="title">По названию</option>
            <option value="timestamp">По времени</option>
          </select>
          <button
            className="ml-2 p-2 bg-green-500 rounded-lg hover:bg-green-700 transition duration-300"
            onClick={refreshData}
          >
            <img src={UpdateIcon} alt="Update" className="w-5 h-5" />
          </button>
        </div>

        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`mt-5 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-2 ${
              index === tasks.length - 1 ? "mb-5" : ""
            }`}
          >
            <div
              className="task-tile cursor-pointer"
              onClick={() => handleEditClick(task)}
            >
              <h3 className="text-lg font-semibold">{task.name}</h3>
              <p>Время отправки: {formatTimestamp(task.apperance_timestamp)}</p>
              <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
              {task.isLoading ? (
                <div className="loader"></div>
              ) : (
                <>
                  {task.status_id === 2 && (
                    <button
                      className="mr-1 px-2 py-1 bg-green-500 rounded-lg text-white font-semibold hover:bg-green-600 transition duration-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAcceptTask(task.uuid, 3);
                      }}
                    >
                      Принять
                    </button>
                  )}
                  {task.status_id === 3 && (
                    <button
                      className="mr-1 px-2 py-1 bg-green-500 rounded-lg text-white font-semibold hover:bg-green-600 transition duration-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAcceptTask(task.uuid, 4);
                      }}
                    >
                      Готово
                    </button>
                  )}
                  {task.status_id === 4 && (
                    <button
                      className="mr-1 px-2 py-1 bg-green-500 rounded-lg text-white font-semibold hover:bg-green-600 transition duration-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAcceptTask(task.uuid, 5);
                      }}
                    >
                      В проверке
                    </button>
                  )}
                  {task.status_id === 5 && (
                    <>
                      <button
                        className="mr-1 px-2 py-1 bg-green-500 rounded-lg text-white font-semibold hover:bg-green-600 transition duration-300"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.uuid, 7);
                        }}
                      >
                        Принята
                      </button>
                      <button
                        className="mr-1 px-2 py-1 bg-orange-500 rounded-lg text-white font-semibold hover:bg-orange-600 transition duration-300"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.uuid, 6);
                        }}
                      >
                        Доработка
                      </button>
                    </>
                  )}
                  {task.status_id === 6 && (
                    <button
                      className="mr-1 px-2 py-1 bg-green-500 rounded-lg text-white font-semibold hover:bg-green-600 transition duration-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAcceptTask(task.uuid, 3);
                      }}
                    >
                      Принять
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {modalOpen && selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900 p-5 rounded-lg shadow-lg max-w-4xl max-h-full overflow-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Информация о задаче</h2>
            <p className="mb-2">
              <strong>Название:</strong> {selectedTask.name}
            </p>
            <p className="mb-2">
              <strong>Описание:</strong> {selectedTask.description}
            </p>
            <p className="mb-2">
              <strong>Группа:</strong>{" "}
              {getGroupNameByUUID(selectedTask.group_uuid)}
            </p>
            <p className="mb-4">
              <strong>Время отправки:</strong>{" "}
              {formatTimestamp(selectedTask.apperance_timestamp)}
            </p>

            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-green-500 rounded-lg text-white font-semibold hover:bg-green-600 transition duration-300"
                onClick={closeModal}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
