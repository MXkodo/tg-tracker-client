import React, { useState, useEffect } from "react";
import axios from "axios";

const PersonUser = ({ userId, name, username }) => {
  const [groups, setGroups] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Получение рейтинга пользователя
        const ratingResponse = await axios.get(`/api/v1/user/rating/${userId}`);
        setRating(ratingResponse.data.rating);

        // Получение групп пользователя
        const groupsResponse = await axios.get(`/api/v1/user/${userId}`);
        setGroups(groupsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const renderLoadingAnimation = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-5 border-custom-yellow"></div>
    </div>
  );

  if (loading) {
    return renderLoadingAnimation();
  }

  if (!name || !username) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div>User not found</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Информация о пользователе</h1>
        <div className="mb-4">
          <span className="font-semibold">Имя: {name}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Юзернейм: {username}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Группы:</span>
          <ul className="list-disc list-inside ml-4">
            {groups.map((group, index) => (
              <li key={index}>{group.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-semibold">Рейтинг: {rating}</span>
        </div>
      </div>
    </div>
  );
};

export default PersonUser;
