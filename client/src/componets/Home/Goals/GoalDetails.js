import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Line, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import "../../../styles/goal.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const GoalDetails = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const goalResponse = await fetch(`/api/goals/${goalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!goalResponse.ok) {
          throw new Error("Failed to load goal data");
        }

        const goalData = await goalResponse.json();
        setGoal(goalData);

        const transactionsResponse = await fetch(
          `/api/transactions/${goalId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!transactionsResponse.ok) {
          throw new Error("Failed to load transactions");
        }

        const transactionsData = await transactionsResponse.json();
        const formattedTransactions = transactionsData.map((t) => ({
          ...t,
          amount: parseFloat(t.amount),
        }));
        setTransactions(formattedTransactions);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные цели.");
      } finally {
        setIsLoading(false);
      }
    };

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

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const analysisData = {
    labels: ["Доходы", "Расходы"],
    datasets: [
      {
        data: [income, expense],
        backgroundColor: ["#28a745", "#dc3545"],
      },
    ],
  };

  const chartData = {
    labels: transactions.map((t) =>
      new Date(t.date).toLocaleDateString("ru-RU")
    ),
    datasets: [
      {
        label: "Сумма транзакций",
        data: transactions.map((t) => t.amount),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <main className="container mb-5">
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1>{goal.name}</h1>
        <p>{goal.description}</p>
        <p>
          Цель: {goal.amount} {goal.currency}
        </p>
        <p>
          Баланс: {goal.balance} {goal.currency}
        </p>

        <h2>Анализ транзакций</h2>
        <div
          style={{ maxWidth: "400px", margin: "0 auto", paddingBottom: "20px" }}
        >
          <Doughnut data={analysisData} />
        </div>

        <h3>История транзакций</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="fin-table table mb-0">
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
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString("ru-RU")}</td>
                    <td>{t.description || "Без описания"}</td>
                    <td
                      style={{
                        color: t.type === "income" ? "#28a745" : "#dc3545",
                      }}
                    >
                      {t.type === "income" ? "Доход" : "Расход"}
                    </td>
                    <td
                      style={{
                        color: t.type === "income" ? "#28a745" : "#dc3545",
                      }}
                    >
                      {t.amount.toFixed(2)} {goal.currency}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default GoalDetails;
