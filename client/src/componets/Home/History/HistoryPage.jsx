import React, { useState, useEffect, useMemo } from "react";
import "../../../styles/HomePage.css";
import "../../../styles/goal.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import {
  fetchGoalsHistory,
  fetchTransactionsHistory,
  repeatGoal,
} from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import RepeatGoalModal from "../Goals/RepeatGoalModal";

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
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const navigate = useNavigate();

  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [goalToRepeat, setGoalToRepeat] = useState(null);

  useEffect(() => {
    if (view === "transactions") {
      fetchTransactions();
    } else {
      fetchGoals();
    }
  }, [view, startDate, endDate]);

  const handleCurrencyFilter = (currency) => {
    setSelectedCurrency(currency === selectedCurrency ? "" : currency);
  };

  const handleRepeatGoal = (goal) => {
    setGoalToRepeat(goal);
    setShowRepeatModal(true);
  };

  const handleConfirmRepeat = async (goal, deadline) => {
    console.log("Кнопка 'Подтвердить' нажата!"); // <-- Новый лог
    console.log("Данные для повторения цели:", { goal, deadline }); // <-- Новый лог
    if (!deadline) {
      alert("Оберіть нову дату завершення цілі");
      return;
    }
    try {
      const idToRepeat = goal.goal_id || goal.id;
      console.log("ID цели для повторения:", idToRepeat); // <-- Новый лог

      const repeatedGoal = await repeatGoal({
        id: idToRepeat,
        deadline,
      });
      console.log("Цель повторена с новой датой:", repeatedGoal);
      setShowRepeatModal(false);
      // alert("Цель успешно повторена!");
      navigate("/goals");
    } catch (error) {
      console.error("Помилка при повторенні цілі на клиенте:", error); // <-- Обновил лог
      alert(`Ошибка: ${error.message || "Произошла неизвестная ошибка."}`);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactionsHistory(startDate, endDate);
      console.log("Загруженные транзакции:", data);
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

  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  const filteredTransactions = useMemo(() => {
    console.log(
      "Фильтр | Дата:",
      { startDate, endDate },
      "Валюта:",
      selectedCurrency
    );

    return transactions
      .filter((t) => {
        const isCurrencyMatch =
          !selectedCurrency ||
          t.from_currency === selectedCurrency ||
          t.to_currency === selectedCurrency;
        const isDateMatch =
          (!startDate || new Date(t.date) >= new Date(startDate)) &&
          (!endDate || new Date(t.date) <= new Date(endDate));

        return isCurrencyMatch && isDateMatch;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          return sortOrder === "asc"
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        } else if (sortField === "to_currency") {
          return sortOrder === "asc"
            ? a.to_currency.localeCompare(b.to_currency)
            : b.to_currency.localeCompare(a.to_currency);
        }
        return 0;
      })
      .map((txn) => ({
        ...txn,
        amount:
          txn.from_currency === "BTC" || txn.to_currency === "BTC"
            ? parseFloat(txn.amount).toFixed(8)
            : parseFloat(txn.amount).toFixed(2),
      }));
  }, [
    transactions,
    selectedCurrency,
    startDate,
    endDate,
    sortField,
    sortOrder,
  ]);

  console.log("Транзакции после фильтра:", filteredTransactions);

  const filteredGoals = useMemo(() => {
    return goals
      .filter((goal) =>
        (goal.description || goal.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .sort((a, b) =>
        sortOrder === "asc"
          ? new Date(a.achieved_at) - new Date(b.achieved_at)
          : new Date(b.achieved_at) - new Date(a.achieved_at)
      );
  }, [goals, searchQuery, sortField, sortOrder]);

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
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
            {view === "transactions" && (
              <div className="d-flex align-items-center me-3">
                <span className="text-light me-2">Фільтр за валютою:</span>
                <div className="btn-group">
                  <button
                    className={`btn ${
                      selectedCurrency === ""
                        ? "btn-primary"
                        : "btn-outline-light"
                    }`}
                    onClick={() => {
                      setSelectedCurrency("");
                      setSortField("date");
                      setSortOrder("desc");
                    }}
                  >
                    Всі
                  </button>

                  {["UAH", "USD", "EUR", "BTC"].map((currency) => (
                    <button
                      key={currency}
                      className={`btn ${
                        selectedCurrency === currency
                          ? "btn-primary"
                          : "btn-outline-light"
                      }`}
                      onClick={() => {
                        setSelectedCurrency(currency);
                        setSortField("date");
                        setSortOrder("desc");
                      }}
                    >
                      {currency}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex align-items-center">
              <span className="text-light me-2">Період:</span>
              <div className="btn-group">
                <button
                  className={`btn ${
                    !startDate && !endDate ? "btn-primary" : "btn-outline-light"
                  }`}
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSortField("date");
                    setSortOrder("desc");
                  }}
                >
                  Всі
                </button>

                {[
                  { label: "7 днів", days: 7 },
                  { label: "30 днів", days: 30 },
                  { label: "3 місяці", days: 90 },
                  { label: "1 рік", days: 365 },
                ].map((period) => (
                  <button
                    key={period.days}
                    className="btn btn-outline-light"
                    onClick={() => {
                      const today = new Date();
                      const pastDate = new Date();
                      pastDate.setDate(today.getDate() - period.days);
                      setStartDate(new Date(pastDate).toISOString());
                      setEndDate(new Date(today).toISOString());
                      setSortField("date");
                      setSortOrder("desc");
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {view === "goals" && (
              <input
                type="text"
                className="form-control w-auto ms-3"
                placeholder="Пошук за описом..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>

          {loading ? (
            <p className="loading-text text-center text-light">
              Завантаження...
            </p>
          ) : (
            <div className="history-table-container table-responsive">
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
                    {view === "goals" ? (
                      <>
                        <th>Ціль</th>
                        <th>Опис</th>
                        <th>Сума</th>
                        <th>Пріоритет</th>
                        <th>Дії</th>
                      </>
                    ) : (
                      <>
                        <th>Списано</th>
                        <th>Зараховано</th>
                        <th
                          onClick={() => handleSort("to_currency")}
                          style={{ cursor: "pointer" }}
                        >
                          Конвертація{" "}
                          {sortField === "to_currency"
                            ? sortOrder === "asc"
                              ? "⬆"
                              : "⬇"
                            : ""}
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(view === "goals" ? filteredGoals : filteredTransactions)
                    .length === 0 ? (
                    <tr>
                      <td
                        colSpan={view === "goals" ? 6 : 4}
                        className="text-center text-light"
                      >
                        {view === "goals"
                          ? "Немає досягнутих цілей"
                          : "Немає транзакцій"}
                      </td>
                    </tr>
                  ) : (
                    (view === "goals"
                      ? filteredGoals
                      : filteredTransactions
                    ).map((item) => (
                      <tr key={item.id}>
                        <td>
                          {new Date(
                            item.date || item.achieved_at
                          ).toLocaleDateString("uk-UA")}
                        </td>
                        {view === "goals" ? (
                          <>
                            <td>{item.name}</td>
                            <td>
                              {item.description.length > 30
                                ? `${item.description.slice(0, 30)}...`
                                : item.description}
                            </td>
                            <td>
                              {item.amount} {item.currency}
                            </td>
                            <td>
                              <span
                                className={`badge bg-${
                                  item.priority === "Високий"
                                    ? "danger"
                                    : item.priority === "Середній"
                                    ? "warning"
                                    : "success"
                                }`}
                              >
                                {item.priority}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-info mx-1"
                                onClick={() => {
                                  const targetGoalId = item.goal_id || item.id;
                                  if (targetGoalId) {
                                    navigate(`/goals/${targetGoalId}`);
                                  } else {
                                    console.error(
                                      "Ошибка: goal_id отсутствует!",
                                      item
                                    );
                                  }
                                }}
                              >
                                <i className="bi bi-eye"></i> Переглянути
                              </button>
                              <button
                                className="btn btn-outline-success mx-1"
                                onClick={() => handleRepeatGoal(item)}
                              >
                                <i className="bi bi-arrow-repeat"></i> Повторити
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="text-danger">
                              {item.original_amount !== undefined &&
                              item.original_amount !== null
                                ? item.from_currency === "BTC"
                                  ? parseFloat(item.original_amount).toFixed(8)
                                  : parseFloat(item.original_amount).toFixed(2)
                                : "—"}
                            </td>

                            <td
                              className={
                                item.type === "income"
                                  ? "text-success"
                                  : "text-success"
                              }
                            >
                              {item.from_currency === "BTC" &&
                              item.to_currency !== "BTC"
                                ? parseFloat(item.amount).toFixed(2)
                                : item.from_currency !== "BTC" &&
                                  item.to_currency === "BTC"
                                ? parseFloat(item.amount).toFixed(8)
                                : parseFloat(item.amount).toFixed(2)}{" "}
                            </td>

                            <td>
                              {item.from_currency} → {item.to_currency}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {showRepeatModal && goalToRepeat && (
                <RepeatGoalModal
                  goal={goalToRepeat}
                  onClose={() => setShowRepeatModal(false)}
                  onConfirm={handleConfirmRepeat}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
