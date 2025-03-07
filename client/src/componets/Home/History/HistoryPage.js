import React, { useState, useEffect } from "react";
import "../../../styles/HomePage.css";
import "../../../styles/goal.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import {
  fetchGoalsHistory,
  fetchTransactionsHistory,
  repeatGoal,
} from "../../../utils/api";
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const [view, setView] = useState("transactions");
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  useEffect(() => {
    if (view === "transactions") {
      fetchTransactions();
    } else {
      fetchGoals();
    }
  }, [view, startDate, endDate, sortField, sortOrder]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactionsHistory(startDate, endDate);
      setTransactions(data);
    } catch (error) {
      console.error("Ошибка загрузки истории транзакций", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await fetchGoalsHistory(startDate, endDate);
      setGoals(data);
    } catch (error) {
      console.error("Ошибка загрузки истории целей", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatGoal = async (goal) => {
    try {
      await repeatGoal(goal);
      fetchGoals();
    } catch (error) {
      console.error("Ошибка при повторении цели", error);
    }
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <div className="container mt-4">
      <div className="fin-card shadow-lg p-4">
        <div className="fin-card-header pb-3 d-flex justify-content-between">
          <h4 className="text-light">Історія фінансів</h4>
          <div>
            <button
              className={`btn ${
                view === "transactions" ? "btn-primary" : "btn-outline-light"
              } mx-2`}
              onClick={() => setView("transactions")}
            >
              Історія транзакцій
            </button>
            <button
              className={`btn ${
                view === "goals" ? "btn-warning" : "btn-outline-light"
              } mx-2`}
              onClick={() => setView("goals")}
            >
              Досягнуті цілі
            </button>
          </div>
        </div>

        <div className="fin-card-body px-4 pb-4">
          <div className="filter-controls d-flex justify-content-between mb-3">
            <input
              type="date"
              className="form-control w-25"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="form-control w-25"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <input
              type="text"
              className="form-control w-25"
              placeholder="Пошук за описом..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="loading-text text-center text-light">
              Завантаження...
            </p>
          ) : view === "goals" ? (
            <div className="table-responsive">
              <table className="fin-table table text-center">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("date")}
                      style={{ cursor: "pointer" }}
                    >
                      Дата{" "}
                      {sortField === "date"
                        ? sortOrder === "asc"
                          ? "⬆"
                          : "⬇"
                        : ""}
                    </th>
                    <th>Ціль</th>
                    <th>Опис</th>
                    <th>Сума</th>
                    <th>Пріоритет</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-light">
                        Немає досягнутих цілей
                      </td>
                    </tr>
                  ) : (
                    goals.map((goal) => {
                      return (
                        <tr key={goal.id} className="goal-completed">
                          <td>
                            {goal.achieved_at
                              ? new Date(
                                  goal.achieved_at.replace(" ", "T")
                                ).toLocaleDateString("uk-UA")
                              : "—"}
                          </td>

                          <td>{goal.name}</td>
                          <td>
                            {goal.description.length > 30
                              ? `${goal.description.slice(0, 30)}...`
                              : goal.description}
                          </td>
                          <td>
                            {goal.amount} {goal.currency}
                          </td>
                          <td>
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
                          <td>
                            <button
                              className="btn btn-outline-info mx-1"
                              onClick={() => {
                                console.log(
                                  "goal_id для перехода:",
                                  goal.goal_id
                                );
                                const targetGoalId = goal.goal_id || goal.id;
                                if (targetGoalId) {
                                  window.location.href = `/goals/${targetGoalId}`;
                                } else {
                                  console.error(
                                    "Ошибка: goal_id отсутствует!",
                                    goal
                                  );
                                }
                              }}
                            >
                              <i className="bi bi-eye"></i> Переглянути
                            </button>

                            <button
                              className="btn btn-outline-success mx-1"
                              onClick={() => handleRepeatGoal(goal)}
                            >
                              <i className="bi bi-arrow-repeat"></i> Повторити
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="fin-table table text-center">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Сума</th>
                    <th>Валюта</th>
                    <th>Тип</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-light">
                        Немає транзакцій
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id}>
                        <td>{new Date(t.date).toLocaleDateString()}</td>
                        <td
                          className={
                            t.type === "income" ? "text-success" : "text-danger"
                          }
                        >
                          {t.amount}
                        </td>
                        <td>
                          {t.from_currency} → {t.to_currency}
                        </td>
                        <td>{t.type}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
