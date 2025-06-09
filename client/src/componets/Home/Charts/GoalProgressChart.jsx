import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../../styles/bootstrap/css/bootstrap.min.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GoalProgressChart = ({ goal, transactions, exchangeRates = {} }) => {
  if (!goal || !goal.currency || !transactions || transactions.length === 0) {
    return (
      <p className="text-light text-center">Немає даних для відображення</p>
    );
  }

  const sortedTransactions = transactions.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const cumulativeAmounts = sortedTransactions.reduce((acc, t, index) => {
    const currencyKey = t.from_currency
      ? `${t.from_currency.toLowerCase()}To${goal.currency}`
      : null;
    const rate =
      currencyKey && exchangeRates[currencyKey]
        ? exchangeRates[currencyKey]
        : 1;
    acc.push((acc[index - 1] || 0) + t.amount * rate);
    return acc;
  }, []);

  const lineData = {
    labels: sortedTransactions.map((t) =>
      new Date(t.date).toLocaleDateString("ru-RU")
    ),
    datasets: [
      {
        label: `Прогрес накопичень (${goal.currency})`,
        data: cumulativeAmounts,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
      },
      {
        label: `Цільова сума (${goal.currency})`,
        data: Array(sortedTransactions.length).fill(goal.amount),
        borderColor: "#FF9800",
        borderDash: [5, 5],
      },
    ],
  };

  return (
    <div className="container text-light">
      <div className="row mb-4">
        <div className="col-md-12">
          <h3 className="chart-title text-center">Динаміка накопичень</h3>
          <div className="card p-3 bg-dark">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Дата",
                      color: "#fff",
                      font: { size: 16, weight: "bold" },
                    },
                    ticks: {
                      color: "#fff",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: `Сума у валюті ${goal.currency}`,
                      color: "#fff",
                      font: { size: 16, weight: "bold" },
                    },
                    ticks: {
                      color: "#fff",
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: "#fff",
                      font: { size: 14 },
                    },
                  },
                  tooltip: {
                    backgroundColor: "#333",
                    titleFont: { size: 14, weight: "bold" },
                    bodyFont: { size: 12 },
                    padding: 10,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalProgressChart;
