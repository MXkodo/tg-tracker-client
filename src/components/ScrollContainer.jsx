import React from "react";
import "../styles/ScrollContainer.css";
import Button from "./Button";

function ScrollContainer({ onFilterChange, activeStatusId }) {
  const buttons = [
    { label: "Новые", statusId: 1 },
    { label: "Отправленные", statusId: 2 },
    { label: "Выполняются", statusId: 3 },
    { label: "Требует проверки", statusId: 4 },
    { label: "Проверяются", statusId: 5 },
    { label: "Выполнены с ошибкой", statusId: 6 },
    { label: "Выполнены", statusId: 7 },
  ];

  const handleButtonClick = (statusId) => {
    onFilterChange(statusId);
  };

  return (
    <div className="scroll-container">
      {buttons.map((button, index) => (
        <Button
          key={index}
          label={button.label}
          isActive={button.statusId === activeStatusId}
          onClick={() => handleButtonClick(button.statusId)}
        />
      ))}
    </div>
  );
}

export default ScrollContainer;
