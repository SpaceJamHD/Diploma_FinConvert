import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Title,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import "../../../styles/bootstrap/css/bootstrap.min.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseCategoryChart = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-light">Немає даних для відображення</p>;
  }

  const groupedData = {};
  const currencySet = new Set();

  transactions.forEach(({ amount, description, currency, date }) => {
    const category =
      description === "Пополнение цели"
        ? "Поповнення цілі"
        : description || "Без категорії";

    const formattedDate = new Date(date).toLocaleDateString("ru-RU");

    if (!groupedData[formattedDate]) {
      groupedData[formattedDate] = {};
    }
    if (!groupedData[formattedDate][category]) {
      groupedData[formattedDate][category] = {};
    }
    if (!groupedData[formattedDate][category][currency]) {
      groupedData[formattedDate][category][currency] = 0;
    }

    groupedData[formattedDate][category][currency] += parseFloat(amount);
    currencySet.add(currency);
  });

  const dates = Object.keys(groupedData).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const categoryList = [
    ...new Set(
      transactions.map((t) =>
        t.description === "Пополнение цели"
          ? "Поповнення цілі"
          : t.description || "Без категорії"
      )
    ),
  ];

  const currencyList = [...currencySet];

  const datasets = categoryList.flatMap((category, catIndex) =>
    currencyList.map((currency, index) => ({
      label: `${category} (${currency})`,
      data: dates.map((date) => groupedData[date]?.[category]?.[currency] || 0),
      backgroundColor: `hsl(${(index * 70 + catIndex * 30) % 360}, 70%, 50%)`,
      borderColor: `hsl(${(index * 70 + catIndex * 30) % 360}, 100%, 30%)`,
      borderWidth: 2,
      barThickness: 20,
    }))
  );

  const data = {
    labels: dates,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#fff",
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += `${context.raw.toFixed(2)} ${
              currencyList[context.datasetIndex % currencyList.length]
            }`;
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#fff",
          font: { size: 12 },
        },
      },
      y: {
        ticks: {
          color: "#fff",
          font: { size: 12 },
          callback: function (value) {
            return value.toFixed(2);
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">
        Динаміка витрат за категоріями та валютами
      </h3>
      <div style={{ height: "450px", overflowX: "auto" }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ExpenseCategoryChart;
