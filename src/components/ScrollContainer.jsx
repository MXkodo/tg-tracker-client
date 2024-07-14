import React from "react";
import "../styles/ScrollContainer.css";
import Button from "./Button";

function ScrollContainer({ onFilterChange }) {
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
    onFilterChange(statusId); // Вызываем колбэк для передачи статуса фильтра в родительский компонент
  };

  return (
    <div className="scroll-container">
      {buttons.map((button, index) => (
        <Button
          key={index}
          label={button.label}
          onClick={() => handleButtonClick(button.statusId)}
        />
      ))}
    </div>
  );
}

export default ScrollContainer;
