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
  required = false,
  id // 외부에서 id를 주입받을 수 있도록 추가
}) {
  // 전달받은 id가 없으면 name을 id로 사용 (라벨 연결용)
  const inputId = id || `input-${name || label}`;

  return (
    <div className="input-wrapper">
      {label && (
        <label 
          className="input-label" 
          htmlFor={inputId} // 핵심: input의 id와 일치시켜 연결
        >
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <input
        id={inputId} // 핵심: label의 htmlFor와 일치
        className={`input-field ${error ? "input-error" : ""} ${className}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        required={required}
      />

      {hint && <p className="input-hint">{hint}</p>}
      {error && <p className="input-error-text">{error}</p>}
    </div>
  );
}

export default Input;