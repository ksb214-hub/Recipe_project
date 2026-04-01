// src/pages/Reg/RegPage.js

import React, { useState, useEffect } from "react";
import "./RegPage.css";

import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

function RegPage() {

  /* ===============================
     입력 상태
  =============================== */

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  /* ===============================
     재료 리스트
  =============================== */

  const [ingredients, setIngredients] = useState([]);

  /* ===============================
     수정 상태
  =============================== */

  const [editId, setEditId] = useState(null);

  /* ===============================
     LocalStorage 불러오기
  =============================== */

  useEffect(() => {
    const saved = localStorage.getItem("ingredients");

    if (saved) {
      setIngredients(JSON.parse(saved));
    }
  }, []);

  /* ===============================
     LocalStorage 저장
  =============================== */

  useEffect(() => {
    localStorage.setItem(
      "ingredients",
      JSON.stringify(ingredients)
    );
  }, [ingredients]);

  /* ===============================
     D-day 계산
  =============================== */

  const getDday = (date) => {

    if (!date) return "";

    const today = new Date();
    const expire = new Date(date);

    const diff = expire - today;

    const dday = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dday > 0) return `D-${dday}`;
    if (dday === 0) return "D-Day";

    return `D+${Math.abs(dday)}`;
  };

  /* ===============================
     재료 등록 / 수정
  =============================== */

  const handleRegister = () => {

    if (!name) {
      alert("재료 이름을 입력하세요");
      return;
    }

    /* 수정 모드 */
    if (editId) {

      const updated = ingredients.map((item) =>
        item.id === editId
          ? { ...item, name, amount, date }
          : item
      );

      setIngredients(updated);
      setEditId(null);

    } else {

      /* 새 재료 등록 */

      const newItem = {
        id: Date.now(),
        name,
        amount,
        date
      };

      setIngredients([...ingredients, newItem]);
    }

    /* 입력 초기화 */

    setName("");
    setAmount("");
    setDate("");
  };

  /* ===============================
     Enter 등록
  =============================== */

  const handleSubmit = (e) => {
    e.preventDefault();
    handleRegister();
  };

  /* ===============================
     삭제
  =============================== */

  const handleDelete = (id) => {

    setIngredients(
      ingredients.filter((item) => item.id !== id)
    );

  };

  /* ===============================
     수정
  =============================== */

  const handleEdit = (item) => {

    setName(item.name);
    setAmount(item.amount);
    setDate(item.date);

    setEditId(item.id);

  };

  /* ===============================
     UI
  =============================== */

  return (

    <div className="reg_container">

      <div className="reg_box">

        {/* Header */}

        <div className="reg_header">
          <h2>재료 등록</h2>
          <p>냉장고에 있는 재료를 등록하세요</p>
        </div>

        {/* 입력 영역 */}

        <form
          className="reg_input_section"
          onSubmit={handleSubmit}
        >

          <Input
            label="재료 이름"
            placeholder="예: 토마토"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="수량"
            placeholder="예: 2개"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="유통기한"
            placeholder="예: 2026.04.01"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Button type="submit">
            {editId ? "수정 완료" : "+ 재료 등록"}
          </Button>

        </form>

        {/* Divider */}

        <div className="divider"></div>

        {/* 재료 리스트 */}

        <div className="ingredient_list">

          {ingredients.length === 0 && (
            <p className="empty_text">
              등록된 재료가 없습니다
            </p>
          )}

          {ingredients.map((item) => (

            <div
              key={item.id}
              className="ingredient_card"
            >

              <h3>{item.name}</h3>

              <p>{item.amount}</p>

              <p>{item.date}</p>

              <span className="dday">
                {getDday(item.date)}
              </span>

              <div className="card_buttons">

                <button
                  className="edit_btn"
                  onClick={() => handleEdit(item)}
                >
                  수정
                </button>

                <button
                  className="delete_btn"
                  onClick={() => handleDelete(item.id)}
                >
                  삭제
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default RegPage;