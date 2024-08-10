import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ScrollContainer from "./ScrollContainer";
import "../styles/MainContent.css";
import UpdateIcon from "../img/Update.png";

function MainContent({ userUUID, userRole }) {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeStatusId, setActiveStatusId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      let endpoint = "";
      switch (activeStatusId) {
        case 1:
          endpoint = `/api/v1/tasks/new/${userUUID}`;
          break;
        case 2:
          endpoint = `/api/v1/tasks/sent/${userUUID}`;
          break;
        case 3:
          endpoint = `/api/v1/tasks/current/${userUUID}`;
          break;
        case 4:
          endpoint = `/api/v1/tasks/incorrect/${userUUID}`;
          break;
        case 5:
          endpoint = `/api/v1/tasks/incomplete/${userUUID}`;
          break;
        case 6:
          endpoint = `/api/v1/tasks/incorrect/${userUUID}`;
          break;
        case 7:
          endpoint = `/api/v1/tasks/completed/${userUUID}`;
          break;
        default:
          endpoint = `/api/v1/tasks/new/${userUUID}`;
      }

      const response = await axios.get(
        `https://1686-188-170-174-171.ngrok-free.app${endpoint}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        }
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [activeStatusId, userUUID]);

  useEffect(() => {
    fetchGroups();
    fetchTasks();
  }, [activeStatusId, userUUID, fetchTasks]);

  const fetchGroups = async () => {
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
      console.error("Error fetching groups:", error);
    }
  };

  const refreshData = () => {
    fetchTasks();
  };

  const handleAcceptTask = async (taskId, status) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.uuid === taskId ? { ...task, isLoading: true } : task
        )
      );

      await axios.patch(
        `https://1686-188-170-174-171.ngrok-free.app/api/v1/tasks`,
        {
          uuid: taskId,
          status_id: status,
        }
      );

      refreshData();
    } catch (error) {
      console.error("Error accepting task:", error);
    }
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
          userRole={userRole}
        />
      </header>
      <div className="flex flex-col flex-grow bg-[#525252] rounded-[17px] overflow-y-auto p-5 box-border mb-4 h-[79vh]">
        <div className="flex items-center mr-0">
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
            className={`mt-5 border border-[rgba(115,115,115,.31)] rounded-[17px] p-1 mb-1 bg-[#737373] shadow-md transition-transform duration-200 ease-in-out hover:-translate-y-2 ${
              index === tasks.length - 1 ? "mb-5 last-task" : ""
            }`}
          >
            <div className="task-tile" onClick={() => handleEditClick(task)}>
              <h3>{task.name}</h3>
              <p>Время отправки: {formatTimestamp(task.apperance_timestamp)}</p>
              <p>Имя группы: {getGroupNameByUUID(task.group_uuid)}</p>
              {task.isLoading ? (
                <div className="loader"></div>
              ) : (
                <>
                  {task.status_id === 2 && (
                    <button
                      className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
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
                      className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAcceptTask(task.uuid, 4);
                      }}
                    >
                      Готово
                    </button>
                  )}
                  {task.status_id === 4 && (
                    <>
                      <button
                        className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.uuid, 5);
                        }}
                      >
                        В проверке
                      </button>
                      <button
                        className="needs-work-button mr-1 px-1 bg-orange-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-orange-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.uuid, 6);
                        }}
                      >
                        Доработка
                      </button>
                    </>
                  )}
                  {task.status_id === 5 && (
                    <>
                      <button
                        className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAcceptTask(task.uuid, 7);
                        }}
                      >
                        Принята
                      </button>
                      <button
                        className="needs-work-button mr-1 px-1 bg-orange-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-orange-700"
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
                      className="accept-button mr-1 px-1 bg-green-500 border-none rounded-lg cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-green-600"
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

        {modalOpen && selectedTask && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>
                &times;
              </span>
              <h2>Редактировать задачу</h2>
              <form>
                <label>
                  Название:
                  <input
                    type="text"
                    value={selectedTask.name}
                    onChange={(e) =>
                      setSelectedTask((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Время:
                  <input
                    type="text"
                    value={formatTimestamp(selectedTask.apperance_timestamp)}
                    readOnly
                  />
                </label>
                <label>
                  Группа:
                  <select
                    value={selectedTask.group_uuid}
                    onChange={(e) =>
                      setSelectedTask((prev) => ({
                        ...prev,
                        group_uuid: e.target.value,
                      }))
                    }
                  >
                    {groups.map((group) => (
                      <option key={group.uuid} value={group.uuid}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={closeModal}>
                  Сохранить
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

export default MainContent;
