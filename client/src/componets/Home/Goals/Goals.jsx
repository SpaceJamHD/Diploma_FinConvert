import React, { useState, useEffect } from "react";
import AddBalanceForm from "./AddBalanceForm";
import WithdrawForm from "./WithdrawForm";
import AutoPlanModal from "./AutoPlanModal";
import axiosInstance from "../../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

import { withdrawFullGoalBalance, fetchGoalsHistory } from "../../../utils/api";

import "../../../styles/HomePage.css";
import "../../../styles/goal.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const Goals = ({ goals = [], setGoals }) => {
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
    amount: "",
    deadline: "",
    priority: "",
    currency: "UAH",
  });
  const navigate = useNavigate();

  const [showAutoPlan, setShowAutoPlan] = useState(false);
  const [selectedAutoGoal, setSelectedAutoGoal] = useState(null);

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  const openWithdrawForm = (goal) => {
    setCurrentGoal(goal);
    setShowWithdrawForm(true);
  };

  const [showAddBalanceForm, setShowAddBalanceForm] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);

  const openAddBalanceForm = (goal) => {
    setCurrentGoal(goal);
    setShowAddBalanceForm(true);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, [goals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const confirmDeleteGoal = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const fetchBalances = async () => {
    try {
      const { data } = await axiosInstance.get("/api/balances");

      console.log(" Баланс кошелька обновлен:", data);
    } catch (error) {
      console.error(" Ошибка обновления кошелька:", error);
    }
  };

  const handleSaveGoal = async () => {
    const { name, description, amount, currency, deadline, priority } = newGoal;

    if (!name || !description || !amount || !deadline || !priority) {
      alert("Заповніть усі поля.");
      return;
    }

    try {
      const method = newGoal.id ? "PUT" : "POST";
      const url = newGoal.id ? `/api/goals/${newGoal.id}` : "/api/goals";

      const response = await axiosInstance({
        method,
        url,
        data: {
          ...newGoal,
          balance: 0,
        },
      });

      if (!response.ok) {
        throw new Error(
          newGoal.id
            ? "Ошибка при обновлении цели"
            : "Ошибка при добавлении цели"
        );
      }

      const updatedGoal = await response.json();

      if (newGoal.id) {
        setGoals((prevGoals) =>
          prevGoals.map((goal) =>
            goal.id === updatedGoal.id ? updatedGoal : goal
          )
        );
      } else {
        setGoals((prevGoals) => [...prevGoals, updatedGoal]);
      }

      setShowForm(false);
      setNewGoal({
        name: "",
        description: "",
        amount: "",
        balance: 0,
        deadline: "",
        priority: "",
        currency: "UAH",
      });
    } catch (error) {
      console.error("Помилка:", error);
    }
  };

  const handleDeleteGoal = async () => {
    try {
      const response = await axiosInstance.delete(`/api/goals/${deleteId}`);

      if (!response.ok) {
        throw new Error("Помилка при видаленні цілі");
      }

      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== deleteId));
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Ошибка при удалении цели:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
  };

  const handleEditGoal = (id) => {
    const goalToEdit = goals.find((goal) => goal.id === id);
    if (goalToEdit) {
      setNewGoal(goalToEdit);
      setShowForm(true);
    }
  };

  const handleWithdrawFullGoal = async (goalId) => {
    try {
      const response = await withdrawFullGoalBalance(goalId);
      console.log(
        "Кошти переведені, мета видалена та збережена в історії:",
        response
      );

      if (response.deletedGoalId) {
        setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
      } else {
        console.warn("Сервер не повернув ID віддаленої мети!");
      }
    } catch (error) {
      console.error("Ошибка при знятті всіх коштів:", error);
    }
  };

  return (
    <main className="container mb-5">
      <h2 className="text-light mb-2 text-start fin-goal-text">
        Фінансові цілі
      </h2>

      <div id="goal" className="fin-card shadow-lg mt-4">
        <div className="fin-card-header pb-3">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-7">
              <h6 className="text-light">Ваші фінансові цілі</h6>
              <p className="text-sm text-secondary mb-0">
                <i className="bi bi-check-circle text-success"></i>
                <span className="font-weight-bold">
                  {" "}
                  {goals.length} досягнуті{" "}
                </span>
                цього місяця
              </p>
            </div>
            <div className="col-lg-6 col-md-5 text-end">
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <button
                  onClick={() => setShowAutoPlan(true)}
                  className="btn btn-outline-warning"
                  style={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    boxShadow: "0 2px 6px rgba(255, 215, 0, 0.2)",
                  }}
                >
                  <i className="bi bi-lightning-charge-fill"></i> Автопоповнення
                </button>

                <button
                  onClick={() => {
                    setNewGoal({
                      name: "",
                      description: "",
                      amount: "",
                      deadline: "",
                      priority: "",
                    });
                    setShowForm(true);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <i
                    className="bi bi-plus-circle"
                    style={{
                      color: "#007bff",
                      fontSize: "2rem",
                      transition: "transform 0.2s ease",
                    }}
                  ></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="fin-card-body px-4 pb-4">
          <div className="table-responsive">
            <table className="fin-table table mb-0">
              <thead>
                <tr>
                  <th>Ціль</th>
                  <th>Опис</th>
                  <th>Баланс</th>
                  <th>Прогрес</th>
                  <th>Залишок</th>
                  <th>Крайній термін</th>
                  <th>Пріоритет</th>
                  <th>Дії</th>
                </tr>
              </thead>

              <tbody>
                {goals.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-light">
                      Цілі відсутні.
                    </td>
                  </tr>
                ) : (
                  goals.map((goal, index) => {
                    const balance = parseFloat(goal.balance) || 0;
                    const amount = parseFloat(goal.amount) || 0;
                    const progress =
                      amount > 0 ? ((balance / amount) * 100).toFixed(2) : 0;
                    const goalCompleted = progress >= 100;

                    return (
                      <tr
                        key={index}
                        className={`fin-td ${
                          goalCompleted ? "goal-completed" : ""
                        }`}
                        style={
                          goalCompleted
                            ? {
                                background:
                                  "linear-gradient(90deg, #0f0, #ff0, #f00)",
                                color: "#fff",
                                fontWeight: "bold",
                                textAlign: "center",
                              }
                            : {}
                        }
                      >
                        <td className="fin-td text-start">{goal.name}</td>
                        <td
                          className="fin-td text-start"
                          title={goal.description}
                        >
                          {goal.description.length > 20
                            ? `${goal.description.slice(0, 20)}...`
                            : goal.description}
                        </td>

                        <td className="fin-td text-center align-middle">
                          {goal.currency === "USD"
                            ? "$"
                            : goal.currency === "EUR"
                            ? "€"
                            : "₴"}
                          {balance.toFixed(2)}
                        </td>

                        <td className="fin-td align-middle">
                          <div className="fin-progress-wrapper">
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
                            <span className="fin-progress-text">
                              {progress}%
                            </span>
                          </div>
                        </td>

                        <td className="fin-td text-center align-middle">
                          {goal.currency === "USD"
                            ? "$"
                            : goal.currency === "EUR"
                            ? "€"
                            : "₴"}
                          {Math.max(amount - balance, 0).toFixed(2)}
                        </td>

                        <td className="fin-td text-center align-middle">
                          {goal.deadline
                            ? new Date(goal.deadline).toLocaleDateString(
                                "uk-UA"
                              )
                            : "—"}
                        </td>

                        <td className="fin-td text-center align-middle">
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
                        </td>

                        <td className="fin-td text-center align-middle">
                          {goalCompleted ? (
                            <button
                              onClick={() => handleWithdrawFullGoal(goal.id)}
                              style={{
                                width: "100%",
                                padding: "10px",
                                border: "none",
                                cursor: "pointer",
                                background:
                                  "linear-gradient(90deg,rgb(54, 54, 54),rgb(54, 52, 52),rgb(59, 56, 56))",
                                color: "#fff",
                                fontWeight: "bold",
                                borderRadius: "8px",
                              }}
                            >
                              Досягнуто мету
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => navigate(`/goals/${goal.id}`)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                }}
                              >
                                <i
                                  className="bi bi-eye"
                                  style={{
                                    color: "#007bff",
                                    fontSize: "1.2rem",
                                  }}
                                ></i>
                              </button>

                              <button
                                onClick={() => openAddBalanceForm(goal)}
                                style={{
                                  marginLeft: "10px",
                                  background: "transparent",
                                  border: "none",
                                }}
                              >
                                <i
                                  className="bi bi-plus-circle"
                                  style={{ color: "#28a745" }}
                                ></i>
                              </button>

                              <button
                                onClick={() => openWithdrawForm(goal)}
                                style={{
                                  marginLeft: "10px",
                                  background: "transparent",
                                  border: "none",
                                }}
                              >
                                <i
                                  className="bi bi-dash-circle"
                                  style={{ color: "#dc3545" }}
                                ></i>
                              </button>

                              <button
                                onClick={() => handleEditGoal(goal.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                }}
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
                                onClick={() => confirmDeleteGoal(goal.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
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
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAutoPlan && (
        <AutoPlanModal
          goals={goals}
          selectedGoal={selectedAutoGoal}
          onClose={() => setShowAutoPlan(false)}
          onSelectGoal={setSelectedAutoGoal}
        />
      )}

      {showWithdrawForm && (
        <WithdrawForm
          goal={currentGoal}
          onClose={() => setShowWithdrawForm(false)}
          onWithdraw={(newBalance) => {
            setGoals((prevGoals) =>
              prevGoals.map((goal) =>
                goal.id === currentGoal.id
                  ? { ...goal, balance: newBalance }
                  : goal
              )
            );
            setShowWithdrawForm(false);
          }}
        />
      )}

      {showAddBalanceForm && (
        <AddBalanceForm
          goalId={currentGoal?.id}
          currentCurrency={currentGoal?.currency}
          refreshWallet={fetchBalances}
          onClose={() => setShowAddBalanceForm(false)}
          onSave={(updatedBalance) => {
            setGoals((prevGoals) =>
              prevGoals.map((goal) =>
                goal.id === currentGoal.id
                  ? { ...goal, balance: updatedBalance }
                  : goal
              )
            );
            setShowAddBalanceForm(false);
          }}
        />
      )}

      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#1e1e1e",
              color: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              width: "300px",
            }}
          >
            <p style={{ marginBottom: "20px" }}>
              Ви впевнені, що хочете видалити ціль?
            </p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <button
                onClick={handleDeleteGoal}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Видалити
              </button>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Скасування
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveGoal();
            }}
            style={{
              backgroundColor: "#1e1e1e",
              color: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "400px",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.8)",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <h3 style={{ margin: 0 }}>
                {newGoal.id ? "Редагувати ціль" : "Додати нову ціль"}
              </h3>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Назва
              </label>
              <input
                type="text"
                name="name"
                value={newGoal.name}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Опис
              </label>
              <textarea
                name="description"
                value={newGoal.description}
                onChange={handleInputChange}
                required
                rows="3"
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Сума
              </label>
              <input
                type="number"
                name="amount"
                value={newGoal.amount}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Валюта
              </label>
              <select
                name="currency"
                value={newGoal.currency}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              >
                <option value="">Оберіть валюту</option>
                <option value="UAH">Гривня (UAH)</option>
                <option value="USD">Долар (USD)</option>
                <option value="EUR">Євро (EUR)</option>
              </select>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Крайній термін
              </label>
              <input
                type="date"
                name="deadline"
                value={newGoal.deadline}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Пріоритет
              </label>
              <select
                name="priority"
                value={newGoal.priority}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              >
                <option value="">Виберіть</option>
                <option value="Низький">Низький</option>
                <option value="Середній">Середній</option>
                <option value="Високий">Високий</option>
              </select>
            </div>
            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 15px",
                  marginRight: "10px",
                  backgroundColor: "#444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#555")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#444")}
              >
                Закрити
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
              >
                Зберегти
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default Goals;
