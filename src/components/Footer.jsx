import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Footer.css";
import homeImage from "../img/Home.png";
import addImage from "../img/Add.png";
import calendarImage from "../img/Calendar.png";

const Footer = () => {
  const [activePath, setActivePath] = useState("/"); // Default active path is "/"

  const location = useLocation();

  useEffect(() => {
    setActivePath(location.pathname); // Update activePath when location changes
  }, [location]);

  const handleAddClick = () => {
    // Handle navigation to "/add" route
  };

  return (
    <footer className="footer">
      <button onClick={handleAddClick}>
        <img src={addImage} alt="Добавить" />
        <span>Добавить</span>
      </button>
      <Link to="/" className={activePath === "/" ? "active" : ""}>
        <button>
          <img className="home" src={homeImage} alt="Главная" />
          <span>Главная</span>
        </button>
      </Link>
      <Link
        to="/calendar"
        className={activePath === "/calendar" ? "active" : ""}
      >
        <button>
          <img src={calendarImage} alt="Календарь" />
          <span>Календарь</span>
        </button>
      </Link>
    </footer>
  );
};

export default Footer;
