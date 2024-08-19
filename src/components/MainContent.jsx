import React, { useState, useEffect } from "react";
import axios from "axios";
import ScrollContainer from "./ScrollContainer";
import "../styles/MainContent.css";
import ClearIcon from "../img/Clear.png";
import UpdateIcon from "../img/Update.png";

function MainContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeStatusId, setActiveStatusId] = useState(1);

  const [rating, setRating] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [, setEditMode] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedTaskForRating, setSelectedTaskForRating] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, [activeStatusId]);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const response = await axios.get(
          "https://taskback.emivn.io/api/v1/tasks",
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        );
        setAllTasks(response.data || []);
        filterTasksByStatus(response.data, activeStatusId);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchAllTasks();
    fetchGroups();
  }, [activeStatusId]);

  useEffect(() => {
    filterTasksByStatus(allTasks, activeStatusId);
  }, [activeStatusId, allTasks]);

  const refreshData = async () => {
    try {
      const response = await axios.get(
        "https://taskback.emivn.io/api/v1/tasks",
        {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        }
      );
      setAllTasks(response.data || []);
      filterTasksByStatus(response.data, activeStatusId);
      fetchGroups();
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
  };

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
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };
  const handleAcceptTask = async (taskId, status) => {
    if (status === 7) {
      openRatingModal(tasks.find((task) => task.uuid === taskId));
      return;
    }

    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.uuid === taskId ? { ...task, isLoading: true } : task
        )
      );

      const response = await axios.patch(
        `https://taskback.emivn.io/api/v1/tasks/status`,
        {
          uuid: taskId,
          status_id: status,
        }
      );
      console.log("Task accepted:", response.data);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.uuid === taskId ? { ...task, isLoading: false } : task
        )
      );

      refreshData();
    } catch (error) {
      console.error("Error accepting task:", error);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    filterTasksBySearchAndStatus(allTasks, e.target.value, activeStatusId);
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
    setTaskName(task.name);
    setTaskDescription(task.description);
    setEditMode(true);
    setEditModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTaskForEdit(task);
    setTaskName(task.name);
    setTaskDescription(task.description);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedTaskForEdit(null);
    setEditMode(false);
  };

  const openRatingModal = (task) => {
    setSelectedTaskForRating(task);
    setRating(0); // Сброс оценки
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedTaskForRating(null);
  };

  const handleSaveRating = async () => {
    if (selectedTaskForRating) {
      try {
        await axios.patch(
          "https://taskback.emivn.io/api/v1/tasks/grade",
          {
            userUUID: selectedTaskForRating.user_uuid, // Замените на правильный userUUID
            taskUUID: selectedTaskForRating.uuid,
            grade: rating,
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        );

        await axios.patch(
          "https://taskback.emivn.io/api/v1/tasks/status",
          {
            uuid: selectedTaskForRating.uuid,
            status_id: 7, // Статус "Принята"
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        );

        console.log("Task rating updated and status changed to 7");
        refreshData(); // Обновляем данные после успешного обновления
        closeRatingModal(); // Закрываем модальное окно после успешного сохранения
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (selectedTaskForEdit) {
      try {
        await axios.patch(`https://taskback.emivn.io/api/v1/tasks`, {
          uuid: selectedTaskForEdit.uuid,
          name: taskName,
          description: taskDescription,
        });
        console.log("Task updated");
        refreshData();
        closeEditModal();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
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

  const handleTaskClick = (task) => {
    openEditModal(task);
  };

  const filterTasksByStatus = (tasksArray, statusId) => {
    const filteredTasks = tasksArray.filter(
      (task) => task.status_id === statusId
    );
    setTasks(filteredTasks);
  };

  const filterTasksBySearchAndStatus = (tasksArray, searchTerm, statusId) => {
    let filteredTasks = tasksArray || [];

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
    <div className="flex flex-col min-h-screen">
      <header>
        <ScrollContainer
          onFilterChange={handleFilterChange}
          activeStatusId={activeStatusId}
        />
      </header>
      <div className="flex flex-col flex-grow bg-[#525252] rounded-[17px] overflow-y-auto p-5 box-border mb-4 h-[79vh]">
        <div className="flex items-center mr-0 ">
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

        {tasks.map((task, index) => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task)}
            className={`mt-5 border border-[rgba(115,115,115,.31)] rounded-[17px] p-1 mb-1 bg-[#737373] shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-2 ${
              index === tasks.length - 1 ? "mb-5 last-task" : ""
            }`}
          >
            <div className="task-tile" onClick={() => handleEditClick(task)}>
              <h3>{task.name}</h3>
              <p>Время отправки: {formatTimestamp(task.apperance_timestamp)}</p>
              <p>Дедлайн: {formatTimestamp(task.deadline)}</p>
              <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
              <p>Исполнитель:{task.first_name}</p>
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
                    <button
                      className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAcceptTask(task.id, 5);
                      }}
                    >
                      В проверке
                    </button>
                  )}
                  {task.status_id === 5 && (
                    <>
                      <button
                        className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.id, 7);
                        }}
                      >
                        Принята
                      </button>

                      <button
                        className="needs-work-button mr-1 px-1 bg-orange-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-orange-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.id, 6);
                        }}
                      >
                        Доработка
                      </button>
                    </>
                  )}
                  {task.status_id === 6 && (
                    <>
                      <button
                        className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.id, 3);
                        }}
                      >
                        Принять
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {editModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-zinc-900 p-5 rounded-lg shadow-lg max-w-4xl max-h-full overflow-auto text-white">
                {selectedTaskForEdit && (
                  <>
                    <h2 className="text-xl font-bold">Редактирование задачи</h2>
                    <div className="mt-4">
                      <label className="block text-sm font-medium">
                        Название задачи:
                      </label>
                      <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        className="mt-1 p-1 rounded border border-gray-600 bg-gray-800"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium">
                        Описание задачи:
                      </label>
                      <textarea
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="mt-1 p-1 rounded border border-gray-600 bg-gray-800"
                        rows="4"
                      />
                    </div>
                    <div className="flex justify-end mt-5">
                      <button
                        className="ml-2 px-5 py-2 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={handleSaveEdit}
                      >
                        Сохранить
                      </button>
                      <button
                        className="ml-2 px-5 py-2 bg-red-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-red-600"
                        onClick={closeEditModal}
                      >
                        Закрыть
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {ratingModalOpen && (
        <div className="modal-overlay" onClick={closeRatingModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-zinc-900 p-5 rounded-lg shadow-lg max-w-4xl max-h-full overflow-auto text-white">
                {selectedTaskForRating && (
                  <>
                    <h2 className="text-xl font-bold">Оцените задачу</h2>
                    <div className="mt-4">
                      <label className="block text-sm font-medium">
                        Имя исполнителя:
                      </label>
                      <p>
                        {selectedTaskForRating.first_name}{" "}
                        {selectedTaskForRating.last_name}
                      </p>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium">
                        Название задачи:
                      </label>
                      <p>{selectedTaskForRating.name}</p>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium">
                        Описание задачи:
                      </label>
                      <p>{selectedTaskForRating.description}</p>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium">
                        Дедлайн:
                      </label>
                      <p>{formatTimestamp(selectedTaskForRating.deadline)}</p>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium">
                        Оценка (1-100):
                      </label>
                      <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="mt-1 p-1 rounded border border-gray-600 bg-gray-800"
                      />
                    </div>
                    <div className="flex justify-end mt-5">
                      <button
                        className="ml-2 px-5 py-2 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={handleSaveRating}
                      >
                        Сохранить
                      </button>
                      <button
                        className="ml-2 px-5 py-2 bg-red-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-red-600"
                        onClick={closeRatingModal}
                      >
                        Закрыть
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

export default MainContent;
