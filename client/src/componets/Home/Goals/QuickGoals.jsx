import React, { useEffect, useState } from "react";
import AddBalanceForm from "./AddBalanceForm";
import "../../../styles/goal.css";

const QuickGoals = () => {
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [showAddBalanceForm, setShowAddBalanceForm] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/goals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Помилка при завантаженні цілей");
        }

        const data = await res.json();

        const sorted = [...data].sort((a, b) => {
          const priorityOrder = {
            Високий: 1,
            Середній: 2,
            Низький: 3,
          };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        const grouped = {
          Високий: [],
          Середній: [],
          Низький: [],
        };

        sorted.forEach((goal) => {
          if (grouped[goal.priority]) {
            grouped[goal.priority].push(goal);
          }
        });

        const selected = [
          ...grouped["Високий"],
          ...grouped["Середній"],
          ...grouped["Низький"],
        ].slice(0, 3);

        setGoals(selected);
      } catch (error) {
        console.error("Ошибка загрузки целей:", error);
      }
    };

    fetchGoals();
  }, []);

  const fetchBalances = async () => {
    try {
      const response = await fetch("/api/balances", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Помилка під час оновлення балансу гаманця");
      }

      await response.json();
    } catch (error) {
      console.error(" Помилка оновлення гаманця:", error);
    }
  };

  const openAddBalanceForm = (goal) => {
    setCurrentGoal(goal);
    setShowAddBalanceForm(true);
  };

  return (
    <div className="quick-goals-container mt-4">
      <h4
        className="text-light mb-4"
        style={{ fontSize: "1.6rem", fontWeight: "bold" }}
      >
        Швидкий доступ до цілей
      </h4>
      <div className="row">
        {goals.length === 0 ? (
          <p className="text-light">Цілі не знайдено.</p>
        ) : (
          goals
            .filter((goal) => goal.priority)
            .sort((a, b) => {
              const priorityOrder = { Високий: 1, Середній: 2, Низький: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .slice(0, 3)
            .map((goal) => {
              const balance = parseFloat(goal.balance) || 0;
              const amount = parseFloat(goal.amount) || 0;
              const progress =
                amount > 0 ? ((balance / amount) * 100).toFixed(2) : 0;

              return (
                <div className="col-md-4 mb-4" key={goal.id}>
                  <div className="card goal-card h-100 shadow-lg border-0">
                    <div
                      className="card-header d-flex justify-content-between align-items-center"
                      style={{
                        background: "transparent",
                        borderBottom: "1px solid #444",
                      }}
                    >
                      <h5 className="goal-title mb-0">{goal.name}</h5>
                      <span
                        className={`badge bg-${
                          goal.priority === "Високий"
                            ? "danger"
                            : goal.priority === "Середній"
                            ? "warning"
                            : "success"
                        }`}
                      >
                        {goal.priority}
                      </span>
                    </div>
                    <div
                      className="card-body"
                      style={{ backgroundColor: "#1e1e1e" }}
                    >
                      <p className="card-text" style={{ color: "#ccc" }}>
                        {goal.description?.length > 60
                          ? `${goal.description.slice(0, 60)}...`
                          : goal.description}
                      </p>
                      <p className="goal-amount mb-2">
                        <strong style={{ color: "#ffd700" }}>Баланс:</strong>{" "}
                        {balance.toFixed(2)} {goal.currency}
                      </p>
                      <div className="fin-progress-wrapper mb-2">
                        <div className="fin-progress-bar">
                          <div
                            className="fin-progress-fill"
                            style={{
                              width: `${progress}%`,
                              backgroundColor:
                                progress >= 100
                                  ? "#28a745"
                                  : progress >= 50
                                  ? "#ffc107"
                                  : "#dc3545",
                            }}
                          ></div>
                        </div>
                        <span className="fin-progress-text">{progress}%</span>
                      </div>
                    </div>
                    <div
                      className="card-footer text-end"
                      style={{
                        backgroundColor: "#1e1e1e",
                        borderTop: "1px solid #333",
                      }}
                    >
                      <button
                        className="btn btn-outline-warning btn-sm"
                        style={{
                          fontWeight: "bold",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.9rem",
                        }}
                        onClick={() => openAddBalanceForm(goal)}
                      >
                        <i className="bi bi-plus-circle me-1"></i> Поповнити
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {showAddBalanceForm && (
        <AddBalanceForm
          goalId={currentGoal.id}
          currentCurrency={currentGoal.currency}
          refreshWallet={fetchBalances}
          onClose={() => setShowAddBalanceForm(false)}
          onSave={(updatedBalance) => {
            setGoals((prevGoals) =>
              prevGoals.map((g) =>
                g.id === currentGoal.id ? { ...g, balance: updatedBalance } : g
              )
            );
            setShowAddBalanceForm(false);
          }}
        />
      )}
    </div>
  );
};

export default QuickGoals;
