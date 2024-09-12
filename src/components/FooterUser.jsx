import React from "react";
import { Link, useNavigate } from "react-router-dom";
import homeImage from "../img/Home.png";
import personImage from "../img/Personal.png";
import eventImage from "../img/Event.png";

const FooterUser = () => {
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/peronal");
  };

  const handleGroupClick = () => {
    navigate("/event");
  };

  return (
    <footer className="bg-custom-yellow p-5 flex justify-center items-center h-[15vh] fixed inset-x-0 bottom-0 w-full box-border">
      <button
        onClick={handleAddClick}
        className="flex-1 text-black bg-custom-yellow h-[15vh] w-[15vh] rounded-lg text-base font-semibold  transition duration-300 ease-in-out hover:bg-yellow-700 flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center">
          <img src={personImage} alt="Личный кабинет" />
          <span>Личный кабинет</span>
        </div>
      </button>
      <Link to="/" className="">
        <button className="flex-1 text-black bg-custom-yellow h-[15vh] w-[15vh] rounded-lg text-base font-semibold transition duration-300 ease-in-out hover:bg-yellow-700 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <img className="mt-1" src={homeImage} alt="Главная" />
            <span>Главная</span>
          </div>
        </button>
      </Link>
      <button
        onClick={handleGroupClick}
        className="flex-1 text-black bg-custom-yellow h-[15vh] w-[15vh] rounded-lg text-base font-semibold transition duration-300 ease-in-out hover:bg-yellow-700 flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center">
          <img src={eventImage} alt="Календарь" />
          <span>События</span>
        </div>
      </button>
    </footer>
  );
};

export default FooterUser;
