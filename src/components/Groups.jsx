import React, { useEffect, useState } from "react";
import axios from "axios";

const GroupsPage = () => {
  const [viewMode, setViewMode] = useState("groups");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);

  const [showUserSelectModal, setShowUserSelectModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const apiUrl =
      viewMode === "groups"
        ? " https://taskback.emivn.io/api/v1/groups"
        : "https://taskauth.emivn.io/api/v1/users";

    axios
      .get(apiUrl, {
        headers: {
          "ngrok-skip-browser-warning": "1",
        },
      })
      .then((response) => {
        setItems(response.data || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(`Error fetching ${viewMode}:`, error);
        setError(error.message);
        setIsLoading(false);
      });
  }, [viewMode]);

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

  const handleItemClick = (item) => {
    setActiveItem(item.uuid);
    if (viewMode === "groups") {
      fetchGroupUsers(item.uuid);
    } else {
      setShowGroupModal(false);
    }
  };

  const handleAddClick = () => {
    setShowModal(true);
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
        ? " https://taskback.emivn.io/api/v1/groups"
        : "https://taskauth.emivn.io/api/v1/users";

    const requestConfig = {
      method: "post",
      url: apiUrl,
      data:
        viewMode === "groups"
          ? { name: itemName }
          : { name: itemName, username: telegramUsername },
    };

    axios(requestConfig)
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
            onClick={() => handleItemClick(item)}
          >
            <span>{item.name}</span>
            <button
              className="px-2 py-1 bg-red-500 text-white rounded"
              onClick={() => handleDeleteItem(item.uuid)}
            >
              Удалить
            </button>
          </li>
        ))
      )}
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
            viewMode === "users" ? "bg-green-500" : "bg-gray-700"
          }`}
          onClick={() => handleViewModeChange("users")}
        >
          Пользователи
        </button>
      </div>

      {renderItemsList()}

      <div className="w-full flex justify-center items-center">
        <button
          type="button"
          className="px-4 py-2 bg-green-500 text-white rounded-lg mt-5 font-bold mb-5 w-full"
          onClick={handleAddClick}
        >
          Добавить {viewMode === "groups" ? "группу" : "пользователя"}
        </button>
      </div>

      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">
              Удаление {viewMode === "groups" ? "группы" : "пользователя"}
            </h2>
            <p className="mb-4">
              Вы уверены, что хотите удалить{" "}
              {viewMode === "groups" ? "группу" : "пользователя"} "
              {itemToDelete.name}"?
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
            />
            {viewMode === "users" && (
              <input
                type="text"
                name="telegramUsername"
                className="border border-gray-300 p-2 rounded-md w-full mb-2 text-black"
                placeholder="Юзернейм (после @)"
                value={telegramUsername}
                onChange={handleInputChange}
              />
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
                    className="mb-2 border border-green-500 p-2 rounded-md shadow-md"
                  >
                    <span>{user.name}</span>
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
