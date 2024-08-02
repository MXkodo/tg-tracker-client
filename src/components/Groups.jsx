import React, { useEffect, useState } from "react";
import axios from "axios";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
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
  }, []);

  const handleGroupClick = (groupId) => {
    setActiveGroup(groupId);
  };

  const handleAddGroupClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setGroupName("");
  };

  const handleInputChange = (event) => {
    setGroupName(event.target.value);
  };

  const handleSaveGroup = () => {
    axios
      .post("https://b744-176-100-119-170.ngrok-free.app/api/v1/groups", {
        name: groupName,
      })
      .then((response) => {
        setGroups([...groups, response.data]);
        setShowModal(false);
        setGroupName("");
      })
      .catch((error) => {
        console.error("Error adding group:", error);
      });
  };

  const handleDeleteGroup = (uuid) => {
    const groupToDelete = groups.find((group) => group.uuid === uuid);
    setGroupToDelete(groupToDelete);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = () => {
    if (groupToDelete) {
      axios
        .delete(
          `https://b744-176-100-119-170.ngrok-free.app/api/v1/groups/${groupToDelete.uuid}`
        )
        .then(() => {
          const updatedGroups = groups.filter(
            (group) => group.uuid !== groupToDelete.uuid
          );
          setGroups(updatedGroups);
          setGroupToDelete(null);
          setShowDeleteModal(false);
        })
        .catch((error) => {
          console.error("Error deleting group:", error);
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

  return (
    <div className="mx-auto p-5 bg-zinc-900 rounded-lg shadow-md h-screen text-white font-sans">
      {groups.length === 0 ? (
        <p className="text-center">Нет доступных групп.</p>
      ) : (
        <ul className="list-none pl-0">
          {groups.map((group) => (
            <li
              key={group.uuid}
              className={`mt-5 border border-green-500 rounded-[10px] p-1 mb-1 shadow-md flex items-center justify-between ${
                activeGroup === group.uuid ? "bg-green-500 text-black" : ""
              }`}
              onClick={() => handleGroupClick(group.uuid)}
            >
              <span>{group.name}</span>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDeleteGroup(group.uuid)}
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
          onClick={handleAddGroupClick}
        >
          Добавить группу
        </button>
      </div>

      {showDeleteModal && groupToDelete && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-5 shadow-md w-80 rounded-[15px]">
            <h2 className="text-lg font-bold mb-4">Удаление группы</h2>
            <p className="mb-4">
              Вы уверены, что хотите удалить группу "{groupToDelete.name}"?
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2"
                onClick={confirmDeleteGroup}
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
            <h2 className="text-lg font-bold mb-4">Создание новой группы</h2>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md w-full mb-2 text-black"
              placeholder="Название группы"
              value={groupName}
              onChange={handleInputChange}
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                onClick={handleSaveGroup}
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
