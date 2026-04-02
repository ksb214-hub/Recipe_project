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
  hint,
  error,
  required = false
}) {
  return (
    <div className="input-wrapper">

      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <input
        className={`input-field ${error ? "input-error" : ""} ${className}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
      />

      {hint && <p className="input-hint">{hint}</p>}

      {error && <p className="input-error-text">{error}</p>}

    </div>
  );
}

export default Input;