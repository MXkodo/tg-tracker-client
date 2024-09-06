import React from "react";

function Button({ label, isActive, onClick }) {
  return (
    <button
      className={`px-2 mr-2 rounded-full shadow-sm whitespace-nowrap flex-shrink-0 transition-colors duration-300 cursor-pointer border border-custom-yellow ${
        isActive ? "bg-custom-yellow" : "bg-zinc-800"
      } text-white`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default Button;
