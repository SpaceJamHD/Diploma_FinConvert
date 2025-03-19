import React, { useState, useEffect } from "react";
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
import { ButtonGroup, Button } from "react-bootstrap";
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

const GoalSpeedChart = ({ goal, transactions }) => {
  if (!goal) return <p className="text-light text-center">Дані відсутні</p>;

  const { amount, balance = 0, deadline, currency } = goal || {};

  const [zoomLevel, setZoomLevel] = useState("months");

  useEffect(() => {
    console.log("GoalSpeedChart -> goal.balance:", balance);
    console.log("GoalSpeedChart -> transactions:", transactions);
  }, [goal, transactions]);

  const generateTimeline = (scale) => {
    const now = new Date();
    const end = new Date(deadline);
    let timeline = [];
    let totalPoints;

    switch (scale) {
      case "days":
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);

        for (let i = 0; i < 30; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          timeline.push(date.toLocaleDateString("uk-UA"));
        }
        break;

      case "weeks":
        totalPoints = Math.max(
          Math.ceil((end - now) / (1000 * 60 * 60 * 24 * 7)),
          1
        );
        for (let i = 0; i <= totalPoints; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() + i * 7);
          timeline.push(`Тиждень ${i + 1}`);
        }
        break;
      case "months":
      default:
        totalPoints = Math.max(
          (end.getFullYear() - now.getFullYear()) * 12 +
            (end.getMonth() - now.getMonth()),
          1
        );
        for (let i = 0; i <= totalPoints; i++) {
          const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
          timeline.push(
            date.toLocaleString("uk-UA", { month: "long", year: "numeric" })
          );
        }
        break;
    }
    return timeline;
  };

  const timeline = generateTimeline(zoomLevel);

  const calculateProjection = (tempoFactor) => {
    let projection = [];
    let accumulated = 0;
    let stepAmount = (amount / timeline.length) * tempoFactor;

    for (let i = 0; i < timeline.length; i++) {
      accumulated = Math.min(accumulated + stepAmount, amount);
      projection.push(accumulated);
    }
    return projection;
  };

  const fastTrack = calculateProjection(1.8);
  const mediumTrack = calculateProjection(1.4);
  const slowTrack = calculateProjection(1.0);

  const actualTrack = [];
  let accumulatedBalance = goal?.balance ? parseFloat(goal.balance) : 0;

  timeline.forEach((label) => {
    let totalPaid = 0;

    transactions.forEach((txn) => {
      const txnDate = new Date(txn.date);
      const txnLabel = txnDate.toLocaleDateString("uk-UA");

      if (txnLabel === label) {
        totalPaid += txn.amount;
      }
    });

    accumulatedBalance += totalPaid;
    actualTrack.push(accumulatedBalance);
  });

  const chartData = {
    labels: timeline,
    datasets: [
      {
        label: "Швидке накопичення",
        data: fastTrack,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
      },
      {
        label: "Середнє накопичення",
        data: mediumTrack,
        borderColor: "#FFEB3B",
        backgroundColor: "rgba(255, 235, 59, 0.2)",
        fill: true,
      },
      {
        label: "Повільне накопичення",
        data: slowTrack,
        borderColor: "#F44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        fill: true,
      },
      {
        label: "Фактичний прогрес (поповнення)",
        data: actualTrack,
        borderColor: "#E91E63",
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  return (
    <div className="container text-light">
      <div className="row mb-4">
        <div className="col-md-12">
          <h3 className="chart-title text-center">Динаміка накопичень</h3>
          <p className="text-center text-muted">
            Оберіть масштаб графіка та темп накопичення
          </p>

          <ButtonGroup className="mb-3 d-flex justify-content-center">
            <Button
              variant={zoomLevel === "days" ? "primary" : "dark"}
              onClick={() => setZoomLevel("days")}
            >
              Дні
            </Button>
            <Button
              variant={zoomLevel === "weeks" ? "primary" : "dark"}
              onClick={() => setZoomLevel("weeks")}
            >
              Тижні
            </Button>
            <Button
              variant={zoomLevel === "months" ? "primary" : "dark"}
              onClick={() => setZoomLevel("months")}
            >
              Місяці
            </Button>
          </ButtonGroup>

          <div className="card p-3 bg-dark">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Дата",
                      color: "#fff",
                      font: {
                        size: 14,
                      },
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: `Сума накоплень (${currency})`,
                      color: "#fff",
                      font: {
                        size: 14,
                      },
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        if (typeof context.raw === "number") {
                          return `${
                            context.dataset.label
                          }: ${context.raw.toFixed(2)} ${currency}`;
                        }
                        return `${context.dataset.label}: Немає даних`;
                      },
                    },
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

export default GoalSpeedChart;
