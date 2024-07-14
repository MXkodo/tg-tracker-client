import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Footer.css";
import homeImage from "../img/Home.png";
import addImage from "../img/Add.png";
import calendarImage from "../img/Calendar.png";

const Footer = () => {
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/add");
  };

  return (
    <footer className="footer">
      <button onClick={handleAddClick}>
        <img src={addImage} alt="Добавить" />
        <span>Добавить</span>
      </button>
      <Link to="/">
        <button>
          <img className="home" src={homeImage} alt="Главная" />
          <span>Главная</span>
        </button>
      </Link>
      <button>
        <img src={calendarImage} alt="Календарь" />
        <span>Календарь</span>
      </button>
    </footer>
  );
};

export default Footer;
