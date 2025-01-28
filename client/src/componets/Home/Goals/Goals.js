import React, { useState, useEffect } from "react";
import AddBalanceForm from "./AddBalanceForm";
import WithdrawForm from "./WithdrawForm";

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
      const response = await fetch("/api/balances", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при загрузке баланса кошелька");
      }

      const data = await response.json();
      console.log("🔄 Баланс кошелька обновлен:", data);
    } catch (error) {
      console.error("❌ Ошибка обновления кошелька:", error);
    }
  };

  const handleSaveGoal = async () => {
    const { name, description, amount, currency, deadline, priority } = newGoal;

    if (
      !name ||
      !description ||
      !amount ||
      !currency ||
      !deadline ||
      !priority
    ) {
      alert("Заполните все поля.");
      return;
    }

    try {
      const method = newGoal.id ? "PUT" : "POST";
      const url = newGoal.id ? `/api/goals/${newGoal.id}` : "/api/goals";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...newGoal,
          balance: 0, // Баланс всегда 0 при создании новой цели
        }),
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

      setShowForm(false); // Закрываем форму
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
      console.error("Ошибка:", error);
    }
  };

  const handleDeleteGoal = async () => {
    try {
      const response = await fetch(`/api/goals/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при удалении цели");
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
      setShowForm(true); // Открываем форму для редактирования
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
              {/* <button
                className="btn btn-warning btn-sm"
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-circle"></i> Додати нову ціль
              </button> */}

              <button
                onClick={() => {
                  setNewGoal({
                    name: "",
                    description: "",
                    amount: "",
                    deadline: "",
                    priority: "",
                  }); // Очищаем форму
                  setShowForm(true); // Показываем форму
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <i
                  className="bi bi-plus-circle"
                  style={{ color: "#007bff", fontSize: "2rem" }}
                ></i>
              </button>
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
                    <td colSpan="7" className="text-center text-light">
                      Цілі відсутні.
                    </td>
                  </tr>
                ) : (
                  goals.map((goal, index) => {
                    const balance = parseFloat(goal.balance) || 0; // Баланс (всегда 0 для новых целей)
                    const amount = parseFloat(goal.amount) || 0; // Сумма цели
                    const remaining = amount; // Остаток равен сумме цели
                    const progress =
                      amount > 0 ? ((balance / amount) * 100).toFixed(2) : 0; // Прогресс всегда 0%

                    return (
                      <tr key={index}>
                        <td className="fin-td text-start">{goal.name}</td>
                        <td
                          className="fin-td text-start"
                          style={{ position: "relative" }}
                          title={goal.description}
                        >
                          {goal.description.length > 30
                            ? `${goal.description.slice(0, 30)}...`
                            : goal.description}
                          <div className="tooltip">{goal.description}</div>
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
                          {remaining.toFixed(2)}
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
                          <button
                            onClick={() =>
                              (window.location.href = `/goals/${goal.id}`)
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <i
                              className="bi bi-eye"
                              style={{ color: "#007bff", fontSize: "1.2rem" }}
                              title="Посмотреть цель"
                            ></i>
                          </button>
                          <button
                            onClick={() => {
                              setCurrentGoal(goal);
                              setShowAddBalanceForm(true);
                            }}
                            style={{
                              marginLeft: "10px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
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
                              cursor: "pointer",
                            }}
                          >
                            <i
                              className="bi bi-dash-circle"
                              style={{ color: "#dc3545" }}
                            ></i>
                          </button>

                          {/* Иконка редактирования */}
                          <button
                            onClick={() => handleEditGoal(goal.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <i
                              className="bi bi-pencil"
                              style={{ color: "#ffc107", fontSize: "1.2rem" }}
                            ></i>
                          </button>

                          {/* Иконка удаления */}
                          <button
                            onClick={() => confirmDeleteGoal(goal.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <i
                              className="bi bi-trash"
                              style={{ color: "#dc3545", fontSize: "1.2rem" }}
                            ></i>
                          </button>
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
          refreshWallet={fetchBalances} // ✅ Передаем функцию для обновления кошелька
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
              Вы уверены, что хотите удалить цель?
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
                Удалить
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
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Форма добавления */}
      {/* Форма добавления */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)", // Увеличен прозрачный фон
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Предотвращаем перезагрузку страницы
              handleSaveGoal();
            }}
            style={{
              backgroundColor: "#1e1e1e", // Темный фон
              color: "#fff", // Белый текст
              padding: "20px",
              borderRadius: "12px",
              width: "400px",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.8)", // Усилен эффект тени
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
                value={newGoal.currency || "UAH"}
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
                <option value="UAH">Гривна (UAH)</option>
                <option value="USD">Доллар (USD)</option>
                <option value="EUR">Евро (EUR)</option>
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
