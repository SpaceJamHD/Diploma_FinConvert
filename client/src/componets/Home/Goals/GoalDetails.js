import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChartTabs from "../Charts/ChartTabs";
import "../../../styles/goalDetails.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const GoalDetails = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(
    () => {
      const fetchDetails = async () => {
        try {
          const token = localStorage.getItem("token");

          const goalResponse = await fetch(`/api/goals/${goalId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!goalResponse.ok) {
            throw new Error("Цель не найдена.");
          }

          const goalData = await goalResponse.json();

          const transactionsResponse = await fetch(
            `/api/transactions/${goalId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const transactionsData = transactionsResponse.ok
            ? await transactionsResponse.json()
            : [];

          const balancesResponse = await fetch(`/api/balances`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!balancesResponse.ok) {
            throw new Error("Ошибка загрузки данных баланса.");
          }

          const balancesData = await balancesResponse.json();

          setGoal(goalData);
          setTransactions(
            transactionsData.map((t) => ({
              ...t,
              amount: parseFloat(t.amount),
            }))
          );
          setBalances(balancesData);
        } catch (err) {
          console.error(" Ошибка загрузки данных:", err);
          setError("Не удалось загрузить данные цели.");
        } finally {
          setIsLoading(false);
        }
      };

      if (!goalId) {
        console.error(" Ошибка: `goalId` пустой при загрузке!");
        return;
      }
      console.log("Загруженные транзакции:", transactions);
      fetchDetails();
    },
    [goalId],
    [transactions]
  );

  if (isLoading) {
    return <div style={{ color: "#fff" }}>Загрузка данных...</div>;
  }

  if (error) {
    return <div style={{ color: "#fff" }}>{error}</div>;
  }

  if (!goal) {
    return <div style={{ color: "#fff" }}>Цель не найдена.</div>;
  }

  return (
    <main className="container mb-5">
      <section className="goal-details-grid">
        <div className="goal-field">
          Цель: {goal.amount} {goal.currency}
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

      <section className="transaction-history mt-4">
        <h3>История транзакций</h3>
        <div className="transaction-table-wrapper">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Описание</th>
                <th>Тип</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-light">
                    Транзакции отсутствуют.
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
                      {t.description || "Без описания"}
                    </td>
                    <td>{t.type === "income" ? "Доход" : "Расход"}</td>
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
