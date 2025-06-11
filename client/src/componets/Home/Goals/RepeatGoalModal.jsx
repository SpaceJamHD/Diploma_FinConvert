import React, { useState } from "react";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const RepeatGoalModal = ({ goal, onClose, onConfirm }) => {
  const [newDeadline, setNewDeadline] = useState("");

  const handleConfirm = () => {
    if (!newDeadline) {
      alert("Оберіть нову дату завершення цілі");
      return;
    }
    onConfirm(goal, newDeadline);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-dialog"
        style={{ backgroundColor: "#1e1e1e", color: "#fff" }}
      >
        <h5 className="mb-3" style={{ color: "#ffd700" }}>
          Повторити ціль: <strong>{goal.name}</strong>
        </h5>

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
            marginBottom: "15px",
          }}
        />

        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-success" onClick={handleConfirm}>
            Підтвердити
          </button>
          <button className="btn btn-danger" onClick={onClose}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepeatGoalModal;
