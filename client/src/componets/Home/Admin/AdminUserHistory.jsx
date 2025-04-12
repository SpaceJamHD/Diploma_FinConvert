import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../../styles/HomePage.css";
import "../../../styles/goal.css";

import "../../../styles/bootstrap/css/bootstrap.min.css";

const AdminUserHistory = () => {
  const { id } = useParams();
  const [view, setView] = useState("transactions");
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCurrency, setSelectedCurrency] = useState("");

  useEffect(() => {
    if (view === "transactions") fetchTransactions();
    else fetchGoals();
  }, [view, startDate, endDate, selectedCurrency]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/transactions/admin/history/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Помилка при завантаженні транзакцій:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/goals/admin/history/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGoals(res.data);
    } catch (err) {
      console.error("Помилка при завантаженні цілей:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriod = (days) => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    setStartDate(past.toISOString());
    setEndDate(today.toISOString());
  };

  const translateType = (type) => {
    switch (type.toLowerCase()) {
      case "income":
        return { text: "Дохід" };
      case "withdraw":
        return { text: "Витрата" };
      case "goal-conversion":
        return { text: "Конверсія цілі" };
      default:
        return { text: "Конвертація" };
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchCurrency =
          !selectedCurrency ||
          t.from_currency === selectedCurrency ||
          t.to_currency === selectedCurrency;
        const matchDate =
          (!startDate || new Date(t.date) >= new Date(startDate)) &&
          (!endDate || new Date(t.date) <= new Date(endDate));
        return matchCurrency && matchDate;
      })
      .sort((a, b) => {
        return sortOrder === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      });
  }, [transactions, startDate, endDate, selectedCurrency, sortOrder]);

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.achieved_at) - new Date(b.achieved_at)
        : new Date(b.achieved_at) - new Date(a.achieved_at)
    );
  }, [goals, sortOrder]);

  return (
    <div className="container mt-4">
      <div className="fin-card shadow-lg p-4">
        <div className="fin-card-header d-flex justify-content-between">
          <h4 className="text-light">Історія користувача</h4>
          <div>
            <button
              className={`btn ${
                view === "transactions" ? "btn-primary" : "btn-outline-light"
              } mx-2`}
              onClick={() => setView("transactions")}
            >
              Транзакції
            </button>
            <button
              className={`btn ${
                view === "goals" ? "btn-warning" : "btn-outline-light"
              } mx-2`}
              onClick={() => setView("goals")}
            >
              Завершені цілі
            </button>
          </div>
        </div>

        <div className="fin-card-body px-4 pb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <div className="btn-group mb-2">
              {[0, 7, 30].map((days) => (
                <button
                  key={days}
                  className="btn btn-outline-light"
                  onClick={() => handlePeriod(days)}
                >
                  {days === 0 ? "Сьогодні" : `${days} днів`}
                </button>
              ))}
            </div>

            {view === "transactions" && (
              <div className="btn-group mb-2">
                {["UAH", "USD", "EUR", "BTC"].map((c) => (
                  <button
                    key={c}
                    className={`btn ${
                      selectedCurrency === c
                        ? "btn-info text-white"
                        : "btn-outline-light"
                    }`}
                    onClick={() =>
                      setSelectedCurrency(selectedCurrency === c ? "" : c)
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-center text-light">Завантаження...</p>
          ) : view === "transactions" ? (
            <div style={{ maxHeight: "480px", overflowY: "auto" }}>
              <table className="fin-table table table-dark table-hover text-center">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Сума</th>
                    <th>Валюти</th>
                    <th>Тип</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-light">
                        Немає транзакцій
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => {
                      const translated = translateType(t.type);
                      return (
                        <tr key={t.id}>
                          <td>
                            {new Date(t.date).toLocaleDateString("uk-UA")}
                          </td>
                          <td>
                            {t.from_currency === "BTC" ||
                            t.to_currency === "BTC"
                              ? parseFloat(t.amount).toFixed(8)
                              : parseFloat(t.amount).toFixed(2)}
                          </td>
                          <td>
                            {t.from_currency} → {t.to_currency}
                          </td>
                          <td>
                            <span
                              className={`badge bg-${translated.color} text-white text-uppercase fw-bold px-2 py-1`}
                            >
                              {translated.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ maxHeight: "480px", overflowY: "auto" }}>
              <table className="fin-table table table-dark table-hover text-center">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Ціль</th>
                    <th>Сума</th>
                    <th>Пріоритет</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGoals.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-light">
                        Немає завершених цілей
                      </td>
                    </tr>
                  ) : (
                    sortedGoals.map((g) => (
                      <tr key={g.id}>
                        <td>
                          {new Date(g.achieved_at).toLocaleDateString("uk-UA")}
                        </td>
                        <td>{g.name}</td>
                        <td>
                          {g.amount} {g.currency}
                        </td>
                        <td>
                          <span
                            className={`badge bg-$
                            {g.priority === "Високий"
                              ? "danger"
                              : g.priority === "Середній"
                              ? "warning"
                              : "success"
                          } fw-bold`}
                          >
                            {g.priority}
                          </span>
                        </td>
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

export default AdminUserHistory;
