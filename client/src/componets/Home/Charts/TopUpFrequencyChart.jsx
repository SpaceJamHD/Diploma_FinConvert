import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

const TopUpFrequencyChart = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-light text-center">Немає даних</p>;
  }

  // Создаем объект для хранения количества пополнений по месяцам
  const monthlyCounts = {};
  const monthNames = [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень",
  ];

  transactions.forEach((txn) => {
    if (txn.type === "income") {
      const date = new Date(txn.date);
      const month = date.getMonth(); // Получаем номер месяца (0 - январь, 11 - декабрь)

      if (!monthlyCounts[month]) {
        monthlyCounts[month] = 0;
      }

      monthlyCounts[month] += 1; // Увеличиваем счетчик пополнений за месяц
    }
  });

  // Подготовка данных для графика
  const labels = monthNames; // Названия месяцев
  const dataValues = labels.map((_, index) => monthlyCounts[index] || 0); // Количество пополнений по месяцам

  const chartData = {
    labels,
    datasets: [
      {
        label: "Кількість поповнень",
        data: dataValues,
        backgroundColor: "rgba(54, 162, 235, 0.8)", // Синий цвет
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#fff", font: { size: 14 } },
      },
      y: {
        ticks: { color: "#fff", font: { size: 14 } },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#fff", font: { size: 14 } },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
      },
    },
  };

  return (
    <div className="container text-light">
      <h3 className="text-center fw-bold"> Частота поповнень цілі</h3>
      <p className="text-center text-muted">
        Кількість поповнень за кожен місяць
      </p>

      <div
        className="card p-3"
        style={{
          background: "linear-gradient(135deg, #1f1f1f, #292929)",
          borderRadius: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TopUpFrequencyChart;
