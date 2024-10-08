import React from "react";
import Button from "./Button";
import "../styles/ScrollContainer.css";

function ScrollContainer({ onFilterChange, activeStatusId }) {
  const buttons = [
    { label: "Новые", statusId: 1 },
    { label: "Отправленные", statusId: 2 },
    { label: "Выполняются", statusId: 3 },
    { label: "Требует проверки", statusId: 4 },
    { label: "Проверяются", statusId: 5 },
    { label: "Выполнены с ошибкой", statusId: 6 },
    { label: "Выполнены", statusId: 7 },
    { label: "Просрочены", statusId: 8 },
  ];

  const handleButtonClick = (statusId) => {
    onFilterChange(statusId);
  };

  return (
    <div className="flex overflow-x-auto p-2 bg-black h-[6vh]">
      {buttons.map((button, index) => (
        <Button
          key={index}
          label={button.label}
          isActive={button.statusId === activeStatusId}
          onClick={() => handleButtonClick(button.statusId)}
          className={`px-6 py-6 mr-2 bg-gray-700 rounded-full cursor-pointer transition-colors duration-300 whitespace-nowrap ${
            button.statusId === activeStatusId ? "bg-custom-yellow" : ""
          }`}
        />
      ))}
    </div>
  );
}

export default ScrollContainer;
