import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChartTabs from "../Charts/ChartTabs";
import GoalAdviceBlock from "../Advice/GoalAdviceBlock";
import "../../../styles/goalDetails.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import axiosInstance from "../../../utils/axiosInstance";

const GoalDetails = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoPlans, setAutoPlans] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const goalResponse = await axiosInstance.get(`/api/goals/${goalId}`);

        if (!goalResponse.ok) throw new Error("Ціль не знайдена.");
        const goalData = await goalResponse.json();

        const transactionsResponse = await axiosInstance.get(
          `/api/transactions/${goalId}`
        );

        const transactionsData = transactionsResponse.ok
          ? await transactionsResponse.json()
          : [];

        const balancesResponse = await axiosInstance.get(`/api/balances`);

        if (!balancesResponse.ok) throw new Error("Помилка завантаження.");
        const balancesData = await balancesResponse.json();

        const autoPlansResponse = await axiosInstance.get("/api/auto-plan");

        if (!autoPlansResponse.ok) throw new Error("Автоплани не знайдено");
        const autoPlansData = await autoPlansResponse.json();

        setGoal(goalData);
        setTransactions(
          transactionsData.map((t) => ({
            ...t,
            amount: parseFloat(t.amount),
          }))
        );
        setBalances(balancesData);
        setAutoPlans(autoPlansData);
      } catch (err) {
        console.error("Помилка загрузки даних:", err);
        setError("Не вдалося завантажити цілі.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!goalId) {
      console.error("Помилка: `goalId` порожній при завантаженні!");
      return;
    }

    fetchDetails();
  }, [goalId]);

  if (isLoading) {
    return <div style={{ color: "#fff" }}>Завантаження даних...</div>;
  }

  if (error) {
    return <div style={{ color: "#fff" }}>{error}</div>;
  }

  if (!goal) {
    return <div style={{ color: "#fff" }}>Ціль не знайдена.</div>;
  }

  return (
    <main className="container mb-5">
      <section className="goal-details-grid">
        <div className="goal-field">
          Ціль: {goal.amount} {goal.currency}
        </div>
        <h1 className="goal-title">{goal.name}</h1>
        <div className="goal-field">
          Баланс: {goal.balance} {goal.currency}
        </div>
        <p className="goal-description">{goal.description}</p>
      </section>

      <section className="chart-section mt-4">
        <ChartTabs
          transactions={transactions}
          goal={goal}
          balances={balances}
        />
      </section>

      <section className="chart-section mt-4">
        <GoalAdviceBlock
          goal={goal}
          transactions={transactions}
          balances={balances}
          autoPlans={autoPlans}
        />
      </section>

      <section className="transaction-history mt-4">
        <h3>Історія транзакцій</h3>
        <div className="transaction-table-wrapper">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Опис</th>
                <th>Тип</th>
                <th>Сума</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-light">
                    Транзакції відсутні.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t.id}
                    className={
                      t.type === "income" ? "table-success" : "table-danger"
                    }
                  >
                    <td>{new Date(t.date).toLocaleDateString("ru-RU")}</td>
                    <td className="text-truncate">
                      {t.description === "Поповнення цілі"
                        ? "Поповнення цілі"
                        : t.description || "Без опису"}
                    </td>

                    <td>{t.type === "income" ? "Дохід" : "Витрата"}</td>
                    <td>
                      {t.amount.toFixed(2)} {goal.currency}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default GoalDetails;
