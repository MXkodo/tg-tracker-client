import React, { useState, useEffect } from "react";
import axios from "axios";
import backgroundImage from "../img/Back.png";

const PersonUser = ({ userId, name, username }) => {
  const [groups, setGroups] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const ratingResponse = await axios.get(
          `https://taskback.emivn.io/api/v1/user/rating/${userId}`
        );
        setRating(ratingResponse.data.rating);

        const groupsResponse = await axios.get(
          `https://taskback.emivn.io/api/v1/user/${userId}`
        );
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
    <div className="flex items-center justify-center h-screen bg-gray-800">
      <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-5 border-custom-yellow"></div>
    </div>
  );

  if (loading) {
    return renderLoadingAnimation();
  }

  if (!name || !username) {
    return (
      <div className="flex items-center justify-center h-screen bg-custom-yellow">
        <div>User not found</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col flex-grow rounded-[17px] overflow-y-auto p-5 box-border mb-4 h-[79vh]"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
