import React, { useState, useEffect } from "react";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const RepeatGoalModal = ({ goal, onClose, onConfirm }) => {
  const [newDeadline, setNewDeadline] = useState("");

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const handleConfirm = () => {
    const goalId = goal.goal_id || goal.id; // ⬅️ Тут главное изменение
    console.log("🔁 Повторение цели — ID:", goalId);
    console.log("📅 Новая дата завершения:", newDeadline);

    if (!newDeadline) {
      alert("Оберіть нову дату завершення цілі");
      return;
    }

    onConfirm(goalId, newDeadline); // ⬅️ Передаём только ID и дату
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1050 }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          style={{ zIndex: 1051 }}
        >
          <div
            className="modal-content"
            style={{ backgroundColor: "#1e1e1e", color: "#fff" }}
          >
            <div className="modal-header">
              <h5 className="modal-title text-warning">
                Повторити ціль: <strong>{goal.name}</strong>
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <label className="form-label">Нова дата завершення:</label>
              <input
                type="date"
                className="form-control"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                style={{
                  backgroundColor: "#2c2c2c",
                  color: "#ffcc00",
                  border: "1px solid #444",
                  borderRadius: "6px",
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={handleConfirm}>
                Підтвердити
              </button>
              <button className="btn btn-danger" onClick={onClose}>
                Скасувати
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />
    </>
  );
};

export default RepeatGoalModal;
