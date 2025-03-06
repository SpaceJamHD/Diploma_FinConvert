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

  console.log("🔍 Проверка перед передачей в ChartTabs:");
  console.log("🎯 Цель:", goal);
  console.log("📜 Транзакции:", transactions);
  console.log("💰 Баланс:", balances);

  useEffect(() => {
    console.log("🔍 Загружаем цель с ID:", goalId);

    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const [goalResponse, transactionsResponse, balancesResponse] =
          await Promise.all([
            fetch(`/api/goals/${goalId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`/api/transactions/${goalId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`/api/balances`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (
          !goalResponse.ok ||
          !transactionsResponse.ok ||
          !balancesResponse.ok
        ) {
          throw new Error("Ошибка загрузки данных");
        }

        const goalData = await goalResponse.json();
        const transactionsData = await transactionsResponse.json();
        const balancesData = await balancesResponse.json();

        setGoal(goalData);
        setTransactions(
          transactionsData.map((t) => ({
            ...t,
            amount: parseFloat(t.amount),
          }))
        );
        setBalances(balancesData); // Загружаем баланс пользователя
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные цели.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!goalId) {
      console.error("❌ Ошибка: `goalId` пустой при загрузке!");
      return;
    }
    console.log("🔎 Проверяем `goalId` перед запросом:", goalId);

    fetchDetails();
  }, [goalId]);

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
