import React, { useEffect, useState } from "react";
import axios from "axios";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [viewMode, setViewMode] = useState("groups");

  useEffect(() => {
    const fetchGroupsAndUsers = async () => {
      try {
        const groupsResponse = await axios.get(
          "https://b744-176-100-119-170.ngrok-free.app/api/v1/groups",
          {
            headers: { "ngrok-skip-browser-warning": "1" },
          }
        );
        setGroups(groupsResponse.data || []);

        const usersResponse = await axios.get(
          "https://b744-176-100-119-170.ngrok-free.app/api/v1/users",
          {
            headers: { "ngrok-skip-browser-warning": "1" },
          }
        );
        setUsers(usersResponse.data || []);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchGroupsAndUsers();
  }, []);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setActiveGroup(null);
    setActiveUser(null);
  };

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setItemName("");
  };

  const handleInputChange = (event) => {
    setItemName(event.target.value);
  };

  const handleSave = () => {
    if (viewMode === "groups") {
      axios
        .post("https://b744-176-100-119-170.ngrok-free.app/api/v1/groups", {
          name: itemName,
        })
        .then((response) => {
          setGroups([...groups, response.data]);
          handleCloseModal();
        })
        .catch((error) => {
          console.error("Error adding group:", error);
        });
    } else if (viewMode === "users") {
      axios
        .post("https://b744-176-100-119-170.ngrok-free.app/api/v1/users", {
          name: itemName,
        })
        .then((response) => {
          setUsers([...users, response.data]);
          handleCloseModal();
        })
        .catch((error) => {
          console.error("Error adding user:", error);
        });
    }
  };

  const handleDelete = (id) => {
    const itemToDelete =
      viewMode === "groups"
        ? groups.find((group) => group.uuid === id)
        : users.find((user) => user.uuid === id);

    setItemToDelete(itemToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const deleteUrl =
        viewMode === "groups"
          ? `https://b744-176-100-119-170.ngrok-free.app/api/v1/groups/${itemToDelete.uuid}`
          : `https://b744-176-100-119-170.ngrok-free.app/api/v1/users/${itemToDelete.uuid}`;

      axios
        .delete(deleteUrl)
        .then(() => {
          const updatedItems =
            viewMode === "groups"
              ? groups.filter((group) => group.uuid !== itemToDelete.uuid)
              : users.filter((user) => user.uuid !== itemToDelete.uuid);

          if (viewMode === "groups") {
            setGroups(updatedItems);
          } else {
            setUsers(updatedItems);
          }

          setItemToDelete(null);
          setShowDeleteModal(false);
        })
        .catch((error) => {
          console.error("Error deleting item:", error);
        });
    }
  };

  const renderLoadingAnimation = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-5 border-green-500"></div>
    </div>
  );

  if (isLoading) return renderLoadingAnimation();
  if (error) return <p>Error: {error}</p>;

  const itemsToRender = viewMode === "groups" ? groups : users;

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

      {itemsToRender.length === 0 ? (
        <p className="text-center">
          Нет доступных {viewMode === "groups" ? "групп" : "пользователей"}.
        </p>
      ) : (
        <ul className="list-none pl-0">
          {itemsToRender.map((item) => (
            <li
              key={item.uuid}
              className={`mt-5 border border-green-500 rounded-[10px] p-1 mb-1 shadow-md flex items-center justify-between ${
                (viewMode === "groups" ? activeGroup : activeUser) === item.uuid
                  ? "bg-green-500 text-black"
                  : ""
              }`}
              onClick={() =>
                viewMode === "groups"
                  ? setActiveGroup(item.uuid)
                  : setActiveUser(item.uuid)
              }
            >
              <span>{item.name}</span>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDelete(item.uuid)}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
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
                onClick={confirmDelete}
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
              Создание новой {viewMode === "groups" ? "группы" : "пользователя"}
            </h2>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md w-full mb-2 text-black"
              placeholder={`Название ${
                viewMode === "groups" ? "группы" : "пользователя"
              }`}
              value={itemName}
              onChange={handleInputChange}
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                onClick={handleSave}
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
    </div>
  );
};

export default GroupsPage;
