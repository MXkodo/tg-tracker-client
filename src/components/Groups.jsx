import React, { useEffect, useState } from "react";
import axios from "axios";

const GroupsPage = () => {
  const [viewMode, setViewMode] = useState("groups"); // Состояние для переключения между группами и пользователями
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    if (viewMode === "groups") {
      axios
        .get("https://b744-176-100-119-170.ngrok-free.app/api/v1/groups", {
          headers: {
            "ngrok-skip-browser-warning": "1",
          },
        })
        .then((response) => {
          if (response.data !== null) {
            setGroups(response.data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching groups:", error);
          setError(error.message);
          setIsLoading(false);
        });
    }
  }, [viewMode]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setActiveGroup(null); // Сбрасываем активное состояние
  };

  const handleItemClick = (itemId) => {
    setActiveGroup(itemId);
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

  const handleSaveItem = () => {
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
    } else {
      // Логика для сохранения пользователя будет здесь
      handleCloseModal();
    }
  };

  const handleDeleteItem = (uuid) => {
    const itemToDelete = groups.find((group) => group.uuid === uuid);
    setItemToDelete(itemToDelete);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = () => {
    if (viewMode === "groups" && itemToDelete) {
      axios
        .delete(
          `https://b744-176-100-119-170.ngrok-free.app/api/v1/groups/${itemToDelete.uuid}`
        )
        .then(() => {
          const updatedGroups = groups.filter(
            (group) => group.uuid !== itemToDelete.uuid
          );
          setGroups(updatedGroups);
          setItemToDelete(null);
          setShowDeleteModal(false);
        })
        .catch((error) => {
          console.error("Error deleting group:", error);
        });
    } else {
      // Логика для удаления пользователя будет здесь
      setShowDeleteModal(false);
    }
  };

  const renderLoadingAnimation = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-5 border-green-500"></div>
    </div>
  );

  const renderGroupsList = () => (
    <ul className="list-none pl-0">
      {groups.length === 0 ? (
        <p className="text-center">Нет доступных групп.</p>
      ) : (
        groups.map((group) => (
          <li
            key={group.uuid}
            className={`mt-5 border border-green-500 rounded-[10px] p-1 mb-1 shadow-md flex items-center justify-between ${
              activeGroup === group.uuid ? "bg-green-500 text-black" : ""
            }`}
            onClick={() => handleItemClick(group.uuid)}
          >
            <span>{group.name}</span>
            <button
              className="px-2 py-1 bg-red-500 text-white rounded"
              onClick={() => handleDeleteItem(group.uuid)}
            >
              Удалить
            </button>
          </li>
        ))
      )}
    </ul>
  );

  const renderUsersPlaceholder = () => (
    <p className="text-center">Здесь будет список пользователей.</p>
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

      {viewMode === "groups" ? renderGroupsList() : renderUsersPlaceholder()}

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
    </div>
  );
};

export default GroupsPage;
