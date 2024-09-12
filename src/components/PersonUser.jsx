import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const PersonUser = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockData = {
      name: "Иван Иванов",
      username: "ivan_ivanov",
      groups: ["Группа 1", "Группа 2"],
      rating: 4.5,
    };

    setTimeout(() => {
      setUserData(mockData);
      setLoading(false);
    }, 1000);
  }, [userId]);

  const renderLoadingAnimation = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-5 border-custom-yellow"></div>
    </div>
  );

  if (loading) {
    return renderLoadingAnimation();
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        User not found
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Информация о пользователе</h1>
        <div className="mb-4">
          <span className="font-semibold">Имя:</span>
          <p>{userData.name}</p>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Юзернейм:</span>
          <p>{userData.username}</p>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Группы:</span>
          <ul className="list-disc list-inside ml-4">
            {userData.groups.map((group, index) => (
              <li key={index}>{group}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-semibold">Рейтинг:</span>
          <p>{userData.rating}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonUser;
