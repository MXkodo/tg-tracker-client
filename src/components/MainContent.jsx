import React, { useState, useEffect } from "react";
import axios from "axios";
import ScrollContainer from "./ScrollContainer";
import "../styles/MainContent.css";
import ClearIcon from "../img/Clear.png";
import UpdateIcon from "../img/Update.png";
import backgroundImage from "../img/Back.png";

const MainContent = ({ userRole, userUUID }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeStatusId, setActiveStatusId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  //const [editMode, setEditMode] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [rating, setRating] = useState(1);
  const [pendingTaskId, setPendingTaskId] = useState(null);
  const [comment, setComment] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [userDesc, setUserDesc] = useState("");
  const [userLink, setUserLink] = useState("");

  useEffect(() => {
    fetchGroups();
  }, [activeStatusId]);
  useEffect(() => {
    console.log("Inside MainContent");
    console.log("userRole in MainContent:", userRole);
    console.log("userUUID in MainContent:", userUUID);
  }, [userRole, userUUID]);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let url = "";

        if (userRole === 1) {
          if (!isValidUUID(userUUID)) {
            throw new Error("Invalid UUID format.");
          }
          url = `https://taskback.emivn.io/api/v1/tasks/${userUUID}`;
        } else {
          url = "https://taskback.emivn.io/api/v1/tasks";
        }
        console.log("Fetching from adminUUID:", userUUID);
        console.log("Fetching from userRole:", userRole);
        console.log("Fetching from URL:", url);
        const response = await axios.get(url, {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        });

        setAllTasks(response.data || []);
        filterTasksByStatus(response.data, activeStatusId);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
    fetchGroups();
  }, [activeStatusId, userRole, userUUID]);

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
  const isValidUUID = (uuid) => {
    const uuidPattern =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidPattern.test(uuid);
  };

  const handleAcceptTask = async (taskId, status) => {
    console.log(
      "handleAcceptTask called with taskId:",
      taskId,
      "and status:",
      status
    );
    if (status === 7) {
      console.log("Opening modal for task:", taskId);
      setPendingTaskId(taskId);
      setSelectedTask(tasks.find((task) => task.uuid === taskId));
      setModalOpen(true);
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
    setSelectedTask(task);
    setTaskName(task.name);
    setTaskDescription(task.description);
    //setEditMode(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
    //setEditMode(false);
  };

  const openCommentModal = (taskId) => {
    setPendingTaskId(taskId);
    setCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setComment("");
    setPendingTaskId(null);
  };

  const handleSaveComment = async () => {
    if (pendingTaskId && comment.trim()) {
      var id = pendingTaskId;
      try {
        await axios.patch(
          `https://taskback.emivn.io/api/v1/tasks/comment/${id}`,
          { comment },
          { headers: { "ngrok-skip-browser-warning": "1" } }
        );

        await axios.patch(
          "https://taskback.emivn.io/api/v1/tasks/status",
          { uuid: pendingTaskId, status_id: 6 },
          { headers: { "ngrok-skip-browser-warning": "1" } }
        );

        console.log("Комментарий сохранен и статус обновлен");
        refreshData();
        closeCommentModal();
      } catch (error) {
        console.error(
          "Ошибка при сохранении комментария или обновлении статуса:",
          error
        );
      }
    }
  };

  const handleSaveGrade = async () => {
    if (selectedTask) {
      try {
        if (pendingTaskId) {
          await axios.patch(
            "https://taskback.emivn.io/api/v1/tasks/grade",
            {
              userUUID: selectedTask.user_uuid,
              taskUUID: pendingTaskId,
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
              uuid: pendingTaskId,
              status_id: 7,
            },
            {
              headers: {
                "ngrok-skip-browser-warning": "1",
              },
            }
          );

          console.log("Task rating updated and status changed to 7");
          setPendingTaskId(null);
        } else {
          const response = await axios.patch(
            `https://taskback.emivn.io/api/v1/tasks`,
            {
              uuid: selectedTask.uuid,
              name: taskName,
              description: taskDescription,
            }
          );
          console.log("Task updated:", response.data);
        }

        refreshData();
        closeModal();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleResumeTask = async (taskId) => {
    try {
      await axios.patch(
        `https://taskback.emivn.io/api/v1/tasks/status`,
        {
          uuid: taskId,
          status_id: 3,
          returned: true,
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        }
      );

      console.log("Task status updated to 3 and returned set to true");

      refreshData();
    } catch (error) {
      console.error("Error resuming task:", error);
    }
  };

  const handleSave = async () => {
    if (selectedTask) {
      try {
        const response = await axios.patch(
          `https://taskback.emivn.io/api/v1/tasks`,
          {
            uuid: selectedTask.uuid,
            name: taskName,
            description: taskDescription,
          }
        );
        console.log("Task updated:", response.data);
        refreshData();
        closeModal();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleRatingChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const number = Number(value);

      if (number >= 1 && number <= 100) {
        setRating(number);
      } else if (value === "") {
        setRating("");
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
      case "timestamp-asc":
        sortByTimestamp(true);
        break;
      case "timestamp-desc":
        sortByTimestamp(false);
        break;
      default:
        break;
    }
  };

  const sortByTimestamp = (ascending = true) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const timestampA = new Date(a.apperance_timestamp);
      const timestampB = new Date(b.apperance_timestamp);
      return ascending ? timestampA - timestampB : timestampB - timestampA;
    });
    setTasks(sortedTasks);
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
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          taskName.toLowerCase().includes(lowerSearchTerm) ||
          groupName.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    setTasks(filteredTasks);
  };
  const formatDateLabel = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const taskDate = new Date(date);

    if (taskDate.toDateString() === today.toDateString()) {
      return "Сегодня";
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return "Завтра";
    } else {
      return date;
    }
  };
  const groupTasksByDate = (tasks) => {
    return tasks.reduce((groups, task) => {
      const date = formatTimestamp(new Date(task.apperance_timestamp)).split(
        " "
      )[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
      return groups;
    }, {});
  };

  const handleNameChange = (e) => {
    setTaskName(e.target.value);
    //setEditMode(true); // Включить режим редактирования при изменении
  };

  const handleDescriptionChange = (e) => {
    setTaskDescription(e.target.value);
    //setEditMode(true); // Включить режим редактирования при изменении
  };
  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setSelectedTask(null);
  };
  const fetchTasks = async () => {
    try {
      let url = "";

      if (userRole === 1) {
        if (!isValidUUID(userUUID)) {
          throw new Error("Invalid UUID format.");
        }
        url = `https://taskback.emivn.io/api/v1/tasks/${userUUID}`;
      } else {
        url = "https://taskback.emivn.io/api/v1/tasks";
      }
      console.log("Fetching from adminUUID:", userUUID);
      console.log("Fetching from userRole:", userRole);
      console.log("Fetching from URL:", url);
      const response = await axios.get(url, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      });

      setAllTasks(response.data || []);
      filterTasksByStatus(response.data, activeStatusId);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  const handleSaveClick = async () => {
    try {
      await axios.patch(`https://taskback.emivn.io/api/v1/tasks/userchange`, {
        id: selectedTask.id,
        user_desc: userDesc,
        user_link: userLink,
      });

      await axios.patch(`https://taskback.emivn.io/api/v1/tasks/status`, {
        uuid: selectedTask.id,
        status_id: 4,
      });

      handleCloseStatusModal();
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };
  const handleOpenStatusModal = (task) => {
    setSelectedTask(task);
    setUserDesc(task.user_desc || "");
    setUserLink(task.user_link || "");
    setStatusModalOpen(true);
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
            className="sort-dropdown rounded-[15px] ml-2 h-[5vh] bg-custom-yellow border-none cursor-pointer text-white font-semibold transition-colors duration-300"
            onChange={handleSortChange}
            style={{
              textAlignLast: "center",
            }}
          >
            <option value="group">По группе</option>
            <option value="title">По названию</option>
            <option value="timestamp-asc">Ближайшие</option>
            <option value="timestamp-desc">Дальние</option>
          </select>
          <button
            className="icon-button rounded-[10px] ml-2 h-[5vh] bg-custom-yellow border-none cursor-pointer transition-colors duration-300 hover:bg-yellow-700"
            onClick={refreshData}
          >
            <img src={UpdateIcon} alt="Update" />
          </button>
        </div>

        {/* Группируем задачи по дате */}
        {Object.entries(groupTasksByDate(tasks)).map(([date, tasksByDate]) => (
          <div key={date}>
            {/* Полоска для даты */}
            <div className="w-full bg-custom-yellow h-1 my-4"></div>

            <h2 className="text-xl font-bold mb-2">{formatDateLabel(date)}</h2>
            {tasksByDate.map((task, index) => (
              <div
                key={task.id}
                className={`mt-1 border rounded-[17px] p-1 mb-1 bg-gray-800 shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-2 ${
                  task.returned
                    ? "border-red-500"
                    : "border-[rgba(115,115,115,.31)]"
                } ${index === tasksByDate.length - 1 ? "mb-2 last-task" : ""}`}
              >
                <div
                  className="task-tile"
                  onClick={() => handleEditClick(task)}
                >
                  <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
                  <p>Исполнитель: {task.first_name}</p>
                  <p>
                    Время отправки: {formatTimestamp(task.apperance_timestamp)}
                  </p>
                  <p>Дедлайн: {formatTimestamp(task.deadline)}</p>
                  <h3>Тема: {task.name}</h3>
                  {task.comment !== "0" && task.comment && (
                    <p>Комментарий: {task.comment}</p>
                  )}
                  {task.status_id === 7 && (
                    <p>Оценка: {task.grade || "Не указана"}</p>
                  )}

                  {task.isLoading ? (
                    <div className="loader"></div>
                  ) : (
                    <>
                      {task.status_id === 2 && task.user_uuid === userUUID && (
                        <button
                          className="accept-button mr-1 px-1 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAcceptTask(task.id, 3);
                          }}
                        >
                          Приступить к выполнению
                        </button>
                      )}
                      {task.status_id === 3 && task.user_uuid === userUUID && (
                        <button
                          className="accept-button mr-1 px-1 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenStatusModal(task);
                          }}
                        >
                          Завершить
                        </button>
                      )}
                      {task.status_id === 4 && (
                        <button
                          className="accept-button mr-1 px-1 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAcceptTask(task.id, 5);
                          }}
                        >
                          К проверке
                        </button>
                      )}
                      {task.status_id === 5 && (
                        <>
                          <button
                            className="accept-button mr-1 px-1 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPendingTaskId(task.id);
                              setSelectedTask(task);
                              setModalOpen(true);
                            }}
                          >
                            Проверить
                          </button>
                        </>
                      )}
                      {task.status_id === 6 && task.user_uuid === userUUID && (
                        <button
                          className="accept-button mr-1 px-1 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAcceptTask(task.id, 3);
                          }}
                        >
                          Принять
                        </button>
                      )}
                      {task.status_id === 8 && (
                        <button
                          className="resume-button mr-1 px-1 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-blue-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleResumeTask(task.id);
                          }}
                        >
                          Возобновить
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {commentModalOpen && (
        <div className="modal-overlay" onClick={closeCommentModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-zinc-900 p-5 rounded-lg shadow-lg max-w-4xl max-h-full overflow-auto text-white">
                <h2 className="text-xl font-bold">Опишите причину</h2>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-2 p-2 rounded border border-gray-600 bg-gray-800"
                  rows="4"
                  placeholder="Введите ваш комментарий"
                />
                <div className="flex justify-end mt-5">
                  <button
                    className="ml-2 px-5 py-2 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                    onClick={handleSaveComment}
                  >
                    Сохранить
                  </button>
                  <button
                    className="ml-2 px-5 py-2 bg-red-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-red-600"
                    onClick={closeCommentModal}
                  >
                    Назад
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {statusModalOpen && selectedTask && (
        <div className="modal-overlay" onClick={handleCloseStatusModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-zinc-900 p-5 rounded-lg shadow-lg max-w-4xl max-h-full overflow-auto text-white">
                <h2 className="text-xl font-bold whitespace-normal overflow-hidden max-w-full">
                  Добавьте информацию о результате
                </h2>
                <p className="whitespace-normal overflow-hidden max-w-prose break-words">
                  <strong>Описание:</strong>
                  <textarea
                    value={userDesc}
                    onChange={(e) => setUserDesc(e.target.value)}
                    rows="4"
                    className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg"
                  />
                </p>
                <p className="whitespace-normal overflow-hidden max-w-full">
                  <strong>Ссылка на решение:</strong>
                  <input
                    type="text"
                    value={userLink}
                    onChange={(e) => setUserLink(e.target.value)}
                    className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg"
                  />
                </p>
                <div className="flex justify-end mt-5">
                  <button
                    className="ml-2 px-5 py-2 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                    onClick={handleSaveClick}
                  >
                    Сохранить и отправить
                  </button>
                  <button
                    className="ml-2 px-5 py-2 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                    onClick={handleCloseStatusModal}
                  >
                    Назад
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-zinc-900 p-5 rounded-lg shadow-lg max-w-4xl max-h-full overflow-auto text-white">
                {selectedTask && (
                  <>
                    {pendingTaskId && selectedTask.status_id === 5 ? (
                      <>
                        <h2 className="text-xl font-bold">Оцените задачу</h2>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Имя исполнителя
                          </label>
                          <p>
                            {selectedTask.first_name} {selectedTask.last_name}
                          </p>{" "}
                          {/* Имя исполнителя */}
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Название задачи:
                          </label>
                          <p>{selectedTask.name}</p> {/* Название задачи */}
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Описание задачи:
                          </label>
                          <p>{selectedTask.description}</p>{" "}
                          {/* Описание задачи */}
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Дедлайн:
                          </label>
                          <p>{formatTimestamp(selectedTask.deadline)}</p>{" "}
                          {/* Дедлайн */}
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Время отправки:
                          </label>
                          <p>
                            {formatTimestamp(selectedTask.apperance_timestamp)}
                          </p>{" "}
                          {/* Время отправки */}
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Группа:
                          </label>
                          <p>{getGroupNameByUUID(selectedTask.group_uuid)}</p>{" "}
                          {/* Группа */}
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Комментарий пользователя:
                          </label>
                          <p className="whitespace-normal overflow-hidden max-w-full">
                            {selectedTask.user_desc}
                          </p>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Ссылка от пользователя:
                          </label>
                          <p className="whitespace-normal overflow-hidden max-w-full">
                            {selectedTask.user_link ? (
                              <a
                                href={selectedTask.user_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                {selectedTask.user_link}
                              </a>
                            ) : (
                              "Нет ссылки"
                            )}
                          </p>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium">
                            Оценка (1-100):
                          </label>
                          <input
                            type="text"
                            value={rating}
                            onChange={handleRatingChange}
                            className="mt-1 p-1 rounded border border-gray-600 bg-gray-800"
                          />
                        </div>
                        <div className="flex justify-end mt-5">
                          <button
                            className="ml-2 px-5 py-2 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                            onClick={handleSaveGrade}
                          >
                            Принять
                          </button>
                          <button
                            className="needs-work-button ml-2 px-5 py-2 bg-orange-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-orange-700"
                            onClick={() => {
                              closeModal();
                              openCommentModal(selectedTask.id);
                            }}
                          >
                            Доработка
                          </button>
                          <button
                            className="ml-2 px-5 py-2 bg-red-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-red-600"
                            onClick={closeModal}
                          >
                            Выйти
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold whitespace-normal overflow-hidden max-w-full">
                          Информация о задаче
                        </h2>
                        <p className="whitespace-normal overflow-hidden max-w-full">
                          <strong>Название:</strong>
                          <input
                            type="text"
                            value={taskName}
                            onChange={handleNameChange}
                            className="ml-2 p-1 rounded border border-gray-600 bg-gray-800"
                          />
                        </p>
                        <p className="whitespace-normal overflow-hidden max-w-prose break-words">
                          <strong>Описание:</strong>
                          <textarea
                            value={taskDescription}
                            onChange={handleDescriptionChange}
                            className="ml-2 p-1 rounded border border-gray-600 bg-gray-800"
                            rows="4"
                          />
                        </p>
                        <p className="whitespace-normal overflow-hidden max-w-full">
                          <strong>Группа:</strong>{" "}
                          {getGroupNameByUUID(selectedTask.group_uuid)}
                        </p>
                        <p className="whitespace-normal overflow-hidden max-w-full">
                          <strong>Время отправки:</strong>{" "}
                          {formatTimestamp(selectedTask.apperance_timestamp)}
                        </p>
                        <p className="whitespace-normal overflow-hidden max-w-full">
                          <strong>Дедлайн:</strong>{" "}
                          {formatTimestamp(selectedTask.deadline)}
                        </p>
                        <p className="whitespace-normal overflow-hidden max-w-full">
                          <strong>Комментарий пользователя:</strong>{" "}
                          {selectedTask.user_desc}
                        </p>
                        <p className="whitespace-normal overflow-hidden max-w-full">
                          <strong>Ссылка от пользователя:</strong>{" "}
                          {selectedTask.user_link ? (
                            <a
                              href={selectedTask.user_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              {selectedTask.user_link}
                            </a>
                          ) : (
                            "Нет ссылки"
                          )}
                        </p>
                        <p className="whitespace-normal overflow-hidden max-w-full">
                          <strong>Оценка:</strong> {selectedTask.grade}
                        </p>
                        <p className="whitespace-normal overflow-hidden max-w-full">
                          <strong>Комментарий:</strong> {selectedTask.comment}
                        </p>

                        <div className="flex justify-end mt-5">
                          {selectedTask && selectedTask.status_id === 1 && (
                            <button
                              className="ml-2 px-5 py-2 bg-custom-yellow border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-yellow-600"
                              onClick={handleSave}
                            >
                              Сохранить
                            </button>
                          )}
                          <button
                            className="ml-2 px-5 py-2 bg-red-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-red-600"
                            onClick={closeModal}
                          >
                            Назад
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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

export default MainContent;
