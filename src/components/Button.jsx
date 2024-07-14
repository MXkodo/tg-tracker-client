import React from "react";
import "../styles/Button.css";

function Button({ label, isActive, onClick }) {
  return (
    <button
      className={`custom-button ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default Button;
