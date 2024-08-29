import React, { useEffect, useState } from "react";
import axios from "axios";
import DownloadButton from "./DownloadButtom";

const GroupsPage = ({ userRole }) => {
  const [viewMode, setViewMode] = useState("groups");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [initialUserName, setInitialUserName] = useState("");
  const [initialTelegramUsername, setInitialTelegramUsername] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [ratingData, setRatingData] = useState([]);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);

  const [showUserSelectModal, setShowUserSelectModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupForUser, setSelectedGroupForUser] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editTelegramUsername, setEditTelegramUsername] = useState("");
  const [filter, setFilter] = useState("none");

  useEffect(() => {
    setIsLoading(true);
    const apiUrl =
      viewMode === "groups"
        ? "https://taskback.emivn.io/api/v1/groups"
        : viewMode === "users"
        ? "https://taskauth.emivn.io/api/v1/users"
        : "https:///taskback.emivn.io/api/v1/tasks/rating";

    axios
      .get(apiUrl, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      })
      .then((response) => {
        if (viewMode === "rating") {
          setRatingData(response.data || []);
        } else {
          setItems(response.data || []);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(`Error fetching ${viewMode}:`, error);
        setError(error.message);
        setIsLoading(false);
      });
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "users") {
      axios
        .get("https://taskback.emivn.io/api/v1/groups", {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        })
        .then((response) => {
          setAvailableGroups(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching groups:", error);
          setError("Ошибка при получении групп.");
        });
    }
  }, [viewMode]);
  useEffect(() => {
    if (userToEdit) {
      setEditUserName(userToEdit.name);
      setEditTelegramUsername(userToEdit.username || "");
      setInitialUserName(userToEdit.name);
      setInitialTelegramUsername(userToEdit.username || "");
      setIsAdmin(userToEdit.role === 1);
    }
  }, [userToEdit]);

  const hasChanges = () => {
    return (
      editUserName !== initialUserName ||
      editTelegramUsername !== initialTelegramUsername ||
      isAdmin !== (userToEdit?.role === 1)
    );
  };
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const fetchGroupUsers = (groupId) => {
    axios
      .get(` https://taskback.emivn.io/api/v1/groups/${groupId}/users`, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      })
      .then((response) => {
        setGroupUsers(response.data || []);
        setShowGroupModal(true);
      })
      .catch((error) => {
        console.error(`Error fetching users for group ${groupId}:`, error);
        setError(
          "Ошибка при получении пользователей группы. Проверьте сервер."
        );
      });
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditUserName(user.name);
    setEditTelegramUsername(user.username || "");
    setShowEditModal(true);
  };

  const handleEditInputChange = (event) => {
    if (event.target.name === "editUserName") {
      setEditUserName(event.target.value);
    } else if (event.target.name === "editTelegramUsername") {
      setEditTelegramUsername(event.target.value);
    } else if (event.target.name === "isAdmin") {
      setIsAdmin(event.target.checked);
    }
  };

  const handleSaveEditUser = () => {
    if (userToEdit) {
      const userUUID = userToEdit.uuid;

      axios
        .put(
          `https://taskauth.emivn.io/api/v1/users/${userUUID}`,
          {
            name: editUserName,
            username: editTelegramUsername,
            role: isAdmin ? 1 : 0, // Установка role в зависимости от состояния чекбокса
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        )
        .then(() => {
          // Обновляем список пользователей
          return axios.get("https://taskauth.emivn.io/api/v1/users", {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          });
        })
        .then((response) => {
          setItems(response.data || []);
          setShowEditModal(false);
          setUserToEdit(null);
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          setError("Ошибка при обновлении пользователя.");
        });
    }
  };

  const handleRemoveUserFromGroup = (uuid) => {
    if (activeItem) {
      axios
        .delete(`https://taskback.emivn.io/api/v1/groups/user/${uuid}`, {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        })
        .then(() => {
          fetchGroupUsers(activeItem);
        })
        .catch((error) => {
          console.error("Error removing user from group:", error);
          setError("Ошибка при удалении пользователя из группы.");
        });
    }
  };

  const fetchAvailableUsers = () => {
    axios
      .get("https://taskauth.emivn.io/api/v1/users", {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      })
      .then((response) => {
        const allUsers = response.data || [];

        return axios
          .get("https://taskback.emivn.io/api/v1/groups/users", {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          })
          .then((groupUsersResponse) => {
            const groupUserUUIDs = groupUsersResponse.data || [];

            const usersNotInAnyGroup = allUsers.filter(
              (user) => !groupUserUUIDs.includes(user.uuid)
            );

            setAvailableUsers(usersNotInAnyGroup);
            setShowUserSelectModal(true);
          });
      });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setActiveItem(null);
  };

  const handleItemClick = (item, event) => {
    if (
      viewMode === "users" &&
      !event.target.classList.contains("delete-btn")
    ) {
      handleEditUser(item);
    } else {
      setActiveItem(item.uuid);
      if (viewMode === "groups") {
        fetchGroupUsers(item.uuid);
      } else {
        setShowGroupModal(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setItemName("");
    setTelegramUsername("");
  };

  const handleInputChange = (event) => {
    if (event.target.name === "itemName") {
      setItemName(event.target.value);
    } else if (event.target.name === "telegramUsername") {
      setTelegramUsername(event.target.value);
    }
  };

  const handleSaveItem = () => {
    const apiUrl =
      viewMode === "groups"
        ? "https://taskback.emivn.io/api/v1/groups"
        : "https://taskauth.emivn.io/api/v1/users";

    const requestData =
      viewMode === "groups"
        ? { name: itemName }
        : {
            name: itemName,
            username: telegramUsername,
            role: isAdmin ? 1 : 0, // Установка role в зависимости от состояния чекбокса
          };

    axios
      .post(apiUrl, requestData, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      })
      .then((response) => {
        if (viewMode === "users" && selectedGroupForUser) {
          return axios.post(
            "https://taskback.emivn.io/api/v1/groups/add-user",
            {
              user_uuid: response.data.uuid,
              group_uuid: selectedGroupForUser,
            },
            {
              headers: {
                "ngrok-skip-browser-warning": "1",
              },
            }
          );
        }
      })
      .then(() => {
        // Обновляем список
        return axios.get(apiUrl, {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        });
      })
      .then((response) => {
        setItems(response.data || []);
        handleCloseModal();
      })
      .catch((error) => {
        console.error(`Error adding ${viewMode.slice(0, -1)}:`, error);
      });
  };

  const handleDeleteItem = (uuid) => {
    const itemToDelete = items.find((item) => item.uuid === uuid);
    setItemToDelete(itemToDelete);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = () => {
    const apiUrl =
      viewMode === "groups"
        ? ` https://taskback.emivn.io/api/v1/groups/${itemToDelete.uuid}`
        : `https://taskauth.emivn.io/api/v1/users`;

    const requestData =
      viewMode === "users" ? { username: itemToDelete.username } : {};

    axios
      .request({
        url: apiUrl,
        method: "DELETE",
        data: requestData,
        headers: { "ngrok-skip-browser-warning": "1" },
      })
      .then(() => {
        const updatedItems = items.filter(
          (item) => item.uuid !== itemToDelete.uuid
        );
        setItems(updatedItems);
        setItemToDelete(null);
        setShowDeleteModal(false);
      })
      .catch((error) => {
        console.error(`Error deleting ${viewMode.slice(0, -1)}:`, error);
      });
  };
  const getFilteredRatingData = () => {
    switch (filter) {
      case "ascending":
        return [...ratingData].sort(
          (a, b) => a.average_rating - b.average_rating
        );
      case "descending":
        return [...ratingData].sort(
          (a, b) => b.average_rating - a.average_rating
        );
      case "alphabetical":
        return [...ratingData].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return ratingData;
    }
  };

  const filteredRatingData = getFilteredRatingData();

  const handleAddUserToGroup = () => {
    if (selectedUserId) {
      axios
        .post(
          " https://taskback.emivn.io/api/v1/groups/add-user",
          {
            user_uuid: selectedUserId,
            group_uuid: activeItem,
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        )
        .then(() => {
          fetchGroupUsers(activeItem);
          setSelectedUserId("");
          setShowUserSelectModal(false);
        })
        .catch((error) => {
          console.error("Error adding user to group:", error);
          setError("Ошибка при добавлении пользователя в группу.");
        });
    }
  };

  const renderLoadingAnimation = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-5 border-green-500"></div>
    </div>
  );

  const renderItemsList = () => (
    <ul className="list-none pl-0">
      {items.length === 0 ? (
        <p className="text-center">Нет доступных {viewMode.slice(0, -1)}.</p>
      ) : (
        items.map((item) => (
          <li
            key={item.uuid}
            className={`mt-5 border border-green-500 rounded-[10px] p-1 mb-1 shadow-md flex items-center justify-between ${
              activeItem === item.uuid ? "bg-green-500 text-black" : ""
            }`}
            onClick={(e) => {
              if (userRole === 2 || (viewMode === "groups" && userRole === 1)) {
                handleItemClick(item, e);
              } else {
                alert("Недостаточно прав");
              }
            }}
          >
            <div className="flex items-center cursor-pointer">
              <span>{item.name}</span>
              {viewMode === "users" && item.role === 1 && (
                <span className="ml-2 text-sm bg-green-500 text-black px-2 py-1 rounded-full">
                  А
                </span>
              )}
              {viewMode === "users" && item.role === 2 && (
                <span className="ml-2 text-sm bg-red-500 text-black px-2 py-1 rounded-full">
                  А
                </span>
              )}
            </div>
            <div className="flex items-center">
              {/* Условие для отображения кнопки удаления */}
              {userRole === 2 && (
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.uuid);
                  }}
                >
                  Удалить
                </button>
              )}
            </div>
          </li>
        ))
      )}
      <>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
            onClick={() => setShowModal(true)}
          >
            Создание{" "}
            {viewMode === "groups" ? " новой группы" : " нового пользователя"}
          </button>
        </div>
      </>
    </ul>
  );

  if (isLoading) return renderLoadingAnimation();
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="mx-auto p-5 bg-zinc-900 rounded-lg shadow-md h-screen text-white font-sans">
      <div className="flex justify-between mb-5">
        <button
          className={`px-4 py-2 rounded-lg ${
            viewMode === "groups" ? "bg-green-500" : "bg-gray-700"
          }`}
          onClick={() => handleViewModeChange("groups")}
        >
          Группы
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            viewMode === "rating" ? "bg-green-500" : "bg-gray-700"
          }`}
          onClick={() => handleViewModeChange("rating")}
        >
          Рейтинг
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            viewMode === "users" ? "bg-green-500" : "bg-gray-700"
          }`}
          onClick={() => handleViewModeChange("users")}
        >
          Пользователи
        </button>
      </div>

      {viewMode === "rating" ? (
        <div>
          <h1 className="text-xl font-bold mb-4 flex items-center justify-between">
            Рейтинг пользователей <DownloadButton />
            <div className="ml-4">
              <select
                id="filter"
                value={filter}
                onChange={handleFilterChange}
                className="border border-gray-300 p-2 rounded-md text-black"
              >
                <option value="none">Фильтр</option>
                <option value="ascending">По возрастанию рейтинга</option>
                <option value="descending">По убыванию рейтинга</option>
                <option value="alphabetical">По алфавиту имени</option>
              </select>
            </div>
          </h1>
          <ul className="space-y-2">
            {filteredRatingData.map((user) => (
              <li key={user.uuid} className="flex justify-between items-center">
                <span>{user.name}</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded">
                  {Math.ceil(user.average_rating)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        renderItemsList()
      )}

      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">
              Удаление {viewMode === "groups" ? "группы" : "пользователя"}
            </h2>
            <p className="mb-4">
              Вы уверены, что хотите удалить{" "}
              {viewMode === "groups" ? "группу" : "пользователя"} "
              {itemToDelete.name}"? В таком случае удалятся и связанные задачи.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2"
                onClick={confirmDeleteItem}
              >
                Удалить
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">
              Редактирование пользователя
            </h2>
            <input
              type="text"
              name="editUserName"
              className="border border-gray-300 p-2 rounded-md w-full mb-2 text-black"
              placeholder="Имя"
              value={editUserName}
              onChange={handleEditInputChange}
              required
            />
            <input
              type="text"
              name="editTelegramUsername"
              className="border border-gray-300 p-2 rounded-md w-full mb-2 text-black"
              placeholder="Юзернейм (после @)"
              value={editTelegramUsername}
              onChange={handleEditInputChange}
              required
            />
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="isAdmin"
                checked={isAdmin}
                onChange={handleEditInputChange}
                className="mr-2"
              />
              <label htmlFor="isAdmin">Админ</label>
            </div>
            <div className="flex justify-end">
              {hasChanges() && (
                <button
                  type="button"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                  onClick={handleSaveEditUser}
                >
                  Сохранить
                </button>
              )}
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                onClick={() => setShowEditModal(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center mb-14">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">
              Создание нового{" "}
              {viewMode === "groups" ? "группы" : "пользователя"}
            </h2>
            <input
              type="text"
              name="itemName"
              className="border border-gray-300 p-2 rounded-md w-full mb-2 text-black"
              placeholder={viewMode === "groups" ? "Название группы" : "Имя"}
              value={itemName}
              onChange={handleInputChange}
              required
            />
            {viewMode === "users" && (
              <>
                <input
                  type="text"
                  name="telegramUsername"
                  className="border border-gray-300 p-2 rounded-md w-full mb-2 text-black"
                  placeholder="Юзернейм (после @)"
                  value={telegramUsername}
                  onChange={handleInputChange}
                  required
                />
                <select
                  value={selectedGroupForUser}
                  onChange={(e) => setSelectedGroupForUser(e.target.value)}
                  className="border border-gray-300 p-2 rounded-md w-full mb-2 text-black"
                >
                  <option value="">Выберите группу</option>
                  {availableGroups.map((group) => (
                    <option key={group.uuid} value={group.uuid}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {userRole !== 1 && (
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="isAdmin"
                      checked={isAdmin}
                      onChange={() => setIsAdmin(!isAdmin)}
                      className="mr-2"
                    />
                    <label htmlFor="isAdmin">Админ</label>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                onClick={handleSaveItem}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                onClick={handleCloseModal}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">Пользователи в группе</h2>
            <ul className="list-none pl-0 mb-4">
              {groupUsers.length === 0 ? (
                <p className="text-center">В этой группе нет пользователей.</p>
              ) : (
                groupUsers.map((user) => (
                  <li
                    key={user.uuid}
                    className="mb-2 border border-green-500 p-2 rounded-md shadow-md flex justify-between items-center"
                  >
                    <span>{user.name}</span>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleRemoveUserFromGroup(user.uuid)}
                    >
                      Удалить
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                onClick={fetchAvailableUsers}
              >
                Добавить пользователя
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                onClick={() => setShowGroupModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserSelectModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">Выберите пользователя</h2>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="border border-gray-300 p-2 rounded-md w-full mb-4 text-black"
            >
              <option value="">Выберите пользователя</option>
              {availableUsers.map((user) => (
                <option key={user.uuid} value={user.uuid}>
                  {user.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                onClick={handleAddUserToGroup}
              >
                Добавить в группу
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                onClick={() => setShowUserSelectModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
