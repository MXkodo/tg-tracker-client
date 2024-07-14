import React, { useState } from "react";
import "../styles/ScrollContainer.css";
import Button from "./Button";

function ScrollContainer() {
  const buttons = [
    { label: "Новые" },
    { label: "Отправленные" },
    { label: "Выполняются" },
    { label: "Требует проверки" },
    { label: "Проверяются" },
    { label: "Выполнены с ошибкой" },
    { label: "Выполнены" },
  ];

  const [activeButtonIndex, setActiveButtonIndex] = useState(null);

  const handleButtonClick = (index) => {
    setActiveButtonIndex(index);
  };

  return (
    <div className="scroll-container">
      {buttons.map((button, index) => (
        <Button
          key={index}
          label={button.label}
          isActive={index === activeButtonIndex}
          onClick={() => handleButtonClick(index)}
        />
      ))}
    </div>
  );
}

export default ScrollContainer;
