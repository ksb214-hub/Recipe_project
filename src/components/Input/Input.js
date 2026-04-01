import React from "react";
import "./Input.css";

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  className = "",
}) {
  return (
    <div className="input-wrapper">

      {label && <label className="input-label">{label}</label>}

      <input
        className={`input-field ${className}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
      />

    </div>
  );
}

export default Input;