import React, { useEffect, useState } from "react";
import "../../../styles/autoPlan.css";

const AutoPlansList = ({ goals, onClose, onEdit }) => {
  const [plans, setPlans] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/auto-plan", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      console.error("Помилка при отриманні автопланів:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`/api/auto-plan/${planToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete));
      setShowConfirm(false);
      setPlanToDelete(null);
    } catch (err) {
      console.error("Помилка видалення автоплану:", err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("uk-UA");
  };

  const frequencyMap = {
    daily: "Щодня",
    weekly: "Щотижня",
    monthly: "Щомісяця",
  };

  return (
    <div className="auto-modal-overlay" onClick={onClose}>
      <div
        className="auto-modal auto-plans-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="auto-title">Ваші автоматичні поповнення</h3>

        <div className="auto-plans-table">
          <table>
            <thead>
              <tr>
                <th>Ціль</th>
                <th>Сума</th>
                <th>Валюта</th>
                <th>Частота</th>
                <th>Період</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => {
                const goal = goals.find((g) => g.id === plan.goal_id);
                return (
                  <tr key={plan.id}>
                    <td>{goal ? goal.name : "-"}</td>
                    <td>{parseFloat(plan.amount).toFixed(8)}</td>
                    <td>{plan.currency}</td>
                    <td>{frequencyMap[plan.frequency] || plan.frequency}</td>
                    <td>
                      {formatDate(plan.start_date)} —{" "}
                      {plan.end_date
                        ? formatDate(plan.end_date)
                        : "Без терміну"}
                    </td>
                    <td className="btn-flex-edit">
                      <button
                        className="btn-edit"
                        onClick={() => onEdit?.(plan)}
                      >
                        <i
                          className="bi bi-pencil"
                          style={{
                            color: "#ffc107",
                            fontSize: "1.2rem",
                          }}
                        ></i>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          setShowConfirm(true);
                          setPlanToDelete(plan.id);
                        }}
                      >
                        <i
                          className="bi bi-trash"
                          style={{
                            color: "#dc3545",
                            fontSize: "1.2rem",
                          }}
                        ></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="auto-buttons" style={{ marginTop: "20px" }}>
          <button className="btn-autoplan-secondary" onClick={onClose}>
            Повернутися
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Ви впевнені, що хочете видалити автоплан?</p>
            <div className="confirm-actions">
              <button className="delete-btn" onClick={handleDeleteConfirm}>
                Видалити
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoPlansList;
