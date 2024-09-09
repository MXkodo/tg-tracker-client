import React, { useEffect, useState } from "react";
import axios from "axios";
import DownloadButton from "./DownloadButtom";
import backgroundImage from "../img/Back.png";

const GroupsPage = ({ role, adminUUID }) => {
  const [viewMode, setViewMode] = useState("groups");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [groupUsersMap, setGroupUsersMap] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [initialUserName, setInitialUserName] = useState("");
  const [initialTelegramUsername, setInitialTelegramUsername] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

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

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editTelegramUsername, setEditTelegramUsername] = useState("");
  const [filter, setFilter] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("viewMode:", viewMode);
    console.log("userRole:", role);
    console.log("userUUID:", adminUUID);
    setIsLoading(true);
    let apiUrl;

    if (viewMode === "groups" && role === 1 && adminUUID) {
      apiUrl = `https://taskback.emivn.io/api/v1/groups/${adminUUID}`;
    } else if (viewMode === "rating") {
      apiUrl = "https://taskback.emivn.io/api/v1/rating";
    } else if (viewMode === "users") {
      apiUrl = "https://taskauth.emivn.io/api/v1/users";
    } else if (viewMode === "groups") {
      apiUrl = "https://taskback.emivn.io/api/v1/groups";
    }

    if (!apiUrl) {
      setError("Invalid API URL");
      setIsLoading(false);
      return;
    }

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
  }, [viewMode, role, adminUUID]);

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
  const filterGroups = (groups) => {
    if (!searchTerm) return groups;
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterUsers = (users) => {
    if (!searchTerm) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditUserName(user.name);
    setEditTelegramUsername(user.username || "");
    setShowEditModal(true);
  };

  const initiateDeleteProcess = () => {
    axios
      .post(
        `https://taskback.emivn.io/api/v1/groups/${itemToDelete.uuid}/initiate-deletion`,
        { adminUUID }
      )
      .then(() => {
        setIsDeletingGroup(true);
        setShowConfirmationModal(true);
      })
      .catch((error) => {
        console.error("Ошибка при инициации удаления:", error);
      });
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
            role: isAdmin ? 1 : 0,
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        )
        .then(() => {
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

  const handleRemoveUserFromGroup = (userUUID) => {
    setUserToRemove(userUUID);
    setShowConfirmModal(true);
  };

  const confirmRemoveUser = () => {
    if (userToRemove) {
      axios
        .delete(
          `https://taskback.emivn.io/api/v1/groups/user/${userToRemove}/${activeItem}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "1",
            },
          }
        )
        .then(() => {
          fetchGroupUsers(activeItem);
          setShowConfirmModal(false);
          setUserToRemove(null);
        })
        .catch((error) => {
          console.error("Error removing user from group:", error);
          setError("Ошибка при удалении пользователя из группы.");
          setShowConfirmModal(false);
          setUserToRemove(null);
        });
    }
  };

  const cancelRemoveUser = () => {
    setShowConfirmModal(false);
    setUserToRemove(null);
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
        setAvailableUsers(allUsers);
        setShowUserSelectModal(true);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const fetchGroupUsers = (groupId) => {
    axios
      .get(`https://taskback.emivn.io/api/v1/groups/${groupId}/users`, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      })
      .then((response) => {
        const users = response.data || [];
        setGroupUsersMap((prevMap) => ({
          ...prevMap,
          [groupId]: users,
        }));
        setGroupUsers(users);
        setShowGroupModal(true);
      })
      .catch((error) => {
        console.error(`Error fetching users for group ${groupId}:`, error);
        setError(
          "Ошибка при получении пользователей группы. Проверьте сервер."
        );
      });
  };
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSearchTerm("");
    setActiveItem(null);
  };

  const handleItemClick = (item, event) => {
    if (
      viewMode === "users" &&
      !event.target.classList.contains("delete-btn")
    ) {
      if (role === 1) {
        alert("Недостаточно прав для редактирования пользователя");
        return;
      }
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
        ? { name: itemName, admin_uuid: adminUUID }
        : {
            name: itemName,
            username: telegramUsername,
            role: isAdmin ? 1 : 0,
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
        } else if (viewMode === "groups" && role === 1) {
          const groupUUID = response.data.uuid;
          return axios.post(
            "https://taskback.emivn.io/api/v1/groups/add-user",
            {
              user_uuid: adminUUID,
              group_uuid: groupUUID,
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
        console.error(`Ошибка при добавлении ${viewMode.slice(0, -1)}:`, error);
        setError("Произошла ошибка.");
      });
  };

  const handleDeleteItem = (uuid) => {
    const itemToDelete = items.find((item) => item.uuid === uuid);
    setItemToDelete(itemToDelete);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = () => {
    if (viewMode === "groups") {
      initiateDeleteProcess();
    } else {
      axios
        .delete(`https://taskauth.emivn.io/api/v1/users`, {
          headers: { "ngrok-skip-browser-warning": "1" },
          data: { username: itemToDelete.username },
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
          console.error("Ошибка при удалении пользователя:", error);
        });
    }
  };

  const handleConfirmationCodeSubmit = () => {
    console.log("Confirmation Code:", confirmationCode);
    axios
      .delete(`https://taskback.emivn.io/api/v1/groups/${itemToDelete.uuid}`, {
        headers: { "ngrok-skip-browser-warning": "1" },
        params: { code: confirmationCode },
      })
      .then(() => {
        const updatedItems = items.filter(
          (item) => item.uuid !== itemToDelete.uuid
        );
        setItems(updatedItems);
        setItemToDelete(null);
        setShowConfirmationModal(false);
        setShowDeleteModal(false);
        setConfirmationCode("");
      })
      .catch((error) => {
        alert("Неверный код подтверждения");
        setConfirmationCode("");
        console.error("Ошибка при удалении группы:", error);
      });
  };

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
      <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-5 border-custom-yellow"></div>
    </div>
  );
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

  const filterRatingData = () => {
    let data = getFilteredRatingData();

    if (searchTerm) {
      data = data.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  };
  const itemLabel = viewMode === "groups" ? "групп" : "пользователей";
  const filteredRatingData = filterRatingData();
  const filteredItems =
    viewMode === "groups" ? filterGroups(items) : filterUsers(items);

  const getGroupNameForUser = (userUUID) => {
    for (const [groupId, users] of Object.entries(groupUsersMap)) {
      if (users.some((user) => user.uuid === userUUID)) {
        const group = availableGroups.find((g) => g.uuid === groupId);
        return group ? group.name : "Нет группы";
      }
    }
    return "Нет группы";
  };

  const renderItemsList = () => (
    <ul className="list-none pl-0">
      {filteredItems.length === 0 ? (
        <p className="text-center">Нет доступных {itemLabel}.</p>
      ) : (
        filteredItems.map((item) => (
          <li
            key={item.uuid}
            className={`mt-5 border border-custom-yellow rounded-[10px] p-1 mb-1 shadow-md flex items-center justify-between ${
              activeItem === item.uuid ? "bg-custom-yellow text-black" : ""
            }`}
            onClick={(e) => {
              handleItemClick(item, e);
            }}
          >
            <div className="flex items-center cursor-pointer">
              <span>{item.name}</span>
              {viewMode === "users" && item.role === 1 && (
                <span className="ml-2 text-sm bg-custom-yellow text-black px-2 py-1 rounded-full">
                  А
                </span>
              )}
              {viewMode === "users" && item.role === 2 && (
                <span className="ml-2 text-sm bg-red-500 text-black px-2 py-1 rounded-full">
                  А
                </span>
              )}
              {viewMode === "groups" && item.admin_uuid === adminUUID && (
                <span className="ml-2 text-sm bg-custom-yellow text-black px-2 py-1 rounded-full"></span>
              )}
            </div>
            <div className="flex items-center">
              {viewMode === "users" && (
                <span className="ml-2 text-sm">
                  {getGroupNameForUser(item.uuid)}
                </span>
              )}
              {role === 2 && (
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
      <div className="flex justify-end mt-4">
        <button
          type="button"
          className="px-4 py-2 bg-custom-yellow text-white rounded-lg"
          onClick={() => setShowModal(true)}
        >
          Создание{" "}
          {viewMode === "groups" ? " новой группы" : " нового пользователя"}
        </button>
      </div>
    </ul>
  );

  if (isLoading) return renderLoadingAnimation();
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      className="mx-auto p-5 rounded-lg shadow-md h-screen text-white font-sans"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-between mb-5">
        <button
          className={`px-4 py-2 rounded-lg ${
            viewMode === "groups" ? "bg-custom-yellow" : "bg-gray-700"
          }`}
          onClick={() => handleViewModeChange("groups")}
        >
          Группы
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            viewMode === "rating" ? "bg-custom-yellow" : "bg-gray-700"
          }`}
          onClick={() => handleViewModeChange("rating")}
        >
          Рейтинг
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            viewMode === "users" ? "bg-custom-yellow" : "bg-gray-700"
          }`}
          onClick={() => handleViewModeChange("users")}
        >
          Пользователи
        </button>
      </div>
      {viewMode === "groups" && (
        <div className="flex flex-col mb-5">
          <input
            type="text"
            placeholder="Поиск по группам"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-2 rounded-md mb-4 text-black"
          />
        </div>
      )}
      {viewMode === "users" && (
        <div className="flex flex-col mb-5">
          <input
            type="text"
            placeholder="Поиск по пользователям"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-2 rounded-md mb-4 text-black"
          />
        </div>
      )}
      {viewMode === "rating" ? (
        <div>
          <h1 className="text-xl font-bold mb-4">
            Рейтинг пользователей <DownloadButton />
          </h1>
          <div className="flex items-center mb-4">
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
          <div className="flex flex-col mb-5">
            <input
              type="text"
              placeholder="Поиск по пользователям"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 p-2 rounded-md mb-4 text-black"
            />
          </div>
          <ul className="space-y-2">
            {filteredRatingData.map((user) => (
              <li key={user.uuid} className="flex justify-between items-center">
                <span>{user.name}</span>
                <span className="bg-custom-yellow text-white px-2 py-1 rounded">
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

      {showConfirmationModal && isDeletingGroup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">Подтверждение удаления</h2>
            <p className="mb-4">
              Введите код подтверждения, отправленный вам по СМС:
            </p>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="mb-4 p-2 border rounded text-lg font-bold text-black"
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2"
                onClick={handleConfirmationCodeSubmit}
              >
                Подтвердить
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                onClick={() => setShowConfirmationModal(false)}
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
                  className="px-4 py-2 bg-custom-yellow text-white rounded-lg mr-2"
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
                {role !== 1 && (
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
                className="px-4 py-2 bg-custom-yellow text-white rounded-lg mr-2"
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
                groupUsers
                  .sort((a, b) => {
                    if (a.role === 1 || a.role === 2) return -1;
                    if (b.role === 1 || b.role === 2) return 1;
                    return 0;
                  })
                  .map((user) => (
                    <li
                      key={user.uuid}
                      className="mb-2 border border-custom-yellow p-2 rounded-md shadow-md flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <span>{user.name}</span>
                        {user.role === 1 && (
                          <span className="ml-2 text-sm bg-custom-yellow text-black px-2 py-1 rounded-full">
                            А
                          </span>
                        )}
                        {user.role === 2 && (
                          <span className="ml-2 text-sm bg-red-500 text-black px-2 py-1 rounded-full">
                            А
                          </span>
                        )}
                      </div>
                      {(role === 1 &&
                        (user.role === 0 || user.uuid === adminUUID)) ||
                      role !== 1 ? (
                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded"
                          onClick={() => handleRemoveUserFromGroup(user.uuid)}
                        >
                          Удалить
                        </button>
                      ) : null}
                    </li>
                  ))
              )}
            </ul>
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-custom-yellow text-white rounded-lg mr-2"
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

      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">Подтверждение удаления</h2>
            <p className="mb-4">Действительно удалить пользователя?</p>
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2"
                onClick={confirmRemoveUser}
              >
                Принять
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                onClick={cancelRemoveUser}
              >
                Отмена
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
                className="px-4 py-2 bg-custom-yellow text-white rounded-lg mr-2"
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
