import React from "react";
import { Link, useNavigate } from "react-router-dom";
import homeImage from "../img/Home.png";
import addImage from "../img/Add.png";
import groupImage from "../img/Group.png";

const Footer = () => {
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/add");
  };

  const handleGroupClick = () => {
    navigate("/group");
  };

  return (
    <footer className="bg-green-500 p-5 flex justify-center items-center h-[15vh] fixed inset-x-0 bottom-0 w-full box-border">
      <button
        onClick={handleAddClick}
        className="flex-1 text-black bg-green-500 h-[15vh] w-[15vh] rounded-lg text-base font-semibold  transition duration-300 ease-in-out hover:bg-green-700 flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center">
          <img src={addImage} alt="Добавить" />
          <span>Добавить</span>
        </div>
      </button>
      <Link to="/" className="">
        <button className="flex-1 text-black bg-green-500 h-[15vh] w-[15vh] rounded-lg text-base font-semibold transition duration-300 ease-in-out hover:bg-green-700 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <img className="mt-1" src={homeImage} alt="Главная" />
            <span>Главная</span>
          </div>
        </button>
      </Link>
      <button
        onClick={handleGroupClick}
        className="flex-1 text-black bg-green-500 h-[15vh] w-[15vh] rounded-lg text-base font-semibold transition duration-300 ease-in-out hover:bg-green-700 flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center">
          <img src={groupImage} alt="Календарь" />
          <span>Группы</span>
        </div>
      </button>
    </footer>
  );
};

export default Footer;
