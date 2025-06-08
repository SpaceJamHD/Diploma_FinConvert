import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../../../styles/bootstrap/css/bootstrap.min.css";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const MostUsedCurrenciesChart = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-light text-center">Немає даних</p>;
  }

  const [hiddenCurrencies, setHiddenCurrencies] = useState([]);

  const currencyMap = {};
  transactions.forEach((txn) => {
    if (txn.type === "income") {
      let currency = txn.from_currency || txn.currency;
      let amount =
        txn.original_amount !== null && txn.original_amount !== undefined
          ? Number(parseFloat(txn.original_amount))
          : Number(parseFloat(txn.amount).toFixed(2));

      if (!currency) return;

      if (!currencyMap[currency]) currencyMap[currency] = 0;
      currencyMap[currency] += amount;
    }
  });

  if (Object.keys(currencyMap).length === 0) {
    return (
      <p className="text-light text-center">Немає витрат для відображення</p>
    );
  }

  const labels = Object.keys(currencyMap);
  const allLabels = Object.keys(currencyMap);
  const visibleLabels = allLabels.filter(
    (cur) => !hiddenCurrencies.includes(cur)
  );

  const dataValues = visibleLabels.map((currency) =>
    currency === "BTC"
      ? Number(currencyMap[currency].toFixed(8))
      : Number(currencyMap[currency].toFixed(2))
  );

  const currencyIcons = {
    UAH: { icon: "bi bi-currency-exchange", color: "#FFD700" },
    USD: { icon: "bi bi-cash-coin", color: "#007bff" },
    EUR: { icon: "bi bi-currency-euro", color: "#17a2b8" },
    BTC: { icon: "bi bi-currency-bitcoin", color: "#f7931a" },
  };

  const backgroundColors = visibleLabels.map(
    (cur) => currencyIcons[cur]?.color || "#ccc"
  );

  const chartData = {
    labels: visibleLabels,
    datasets: [
      {
        label: "Витрати за валютами",
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: "#222",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#333",
        callbacks: {
          label: function (tooltipItem) {
            let value = tooltipItem.raw;
            let currency = tooltipItem.label;
            value = currency === "BTC" ? value.toFixed(8) : value.toFixed(2);
            return ` ${currency}: ${value}`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (acc, val) => acc + val,
            0
          );
          const percent = (value / total) * 100;
          return percent >= 3 ? `${percent.toFixed(1)}%` : "";
        },
      },
    },
  };

  const toggleCurrency = (currency) => {
    setHiddenCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((cur) => cur !== currency)
        : [...prev, currency]
    );
  };

  return (
    <div className="container text-light">
      <h3 className="text-center fw-bold">Найбільш використовувані валюти</h3>

      <div
        className="d-flex justify-content-between align-items-center"
        style={{
          background: "linear-gradient(135deg, #1f1f1f, #292929)",
          borderRadius: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          padding: "20px",
          height: "400px",
          maxWidth: "500px",
          margin: "auto",
        }}
      >
        <div style={{ width: "300px", height: "300px" }}>
          <Pie data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>

        <div className="d-flex flex-column gap-2">
          {allLabels.map((cur) => (
            <button
              key={cur}
              className="d-flex align-items-center"
              onClick={() => toggleCurrency(cur)}
              style={{
                background: hiddenCurrencies.includes(cur) ? "#444" : "#2c2c2c",
                padding: "8px 14px",
                borderRadius: "12px",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                transition: "0.3s",
                opacity: hiddenCurrencies.includes(cur) ? 0.5 : 1,
                width: "100px",
              }}
            >
              <i
                className={`${
                  currencyIcons[cur]?.icon || "bi bi-question-circle"
                }`}
                style={{
                  color: currencyIcons[cur]?.color || "#ccc",
                  fontSize: "1.4rem",
                  marginRight: "8px",
                }}
              ></i>

              <span className="fw-semibold">{cur}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MostUsedCurrenciesChart;
