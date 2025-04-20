import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Pie } from "react-chartjs-2";
import "../../../styles/analytics.css";
import generateGoalsDistributionAdvice from "./generateGoalsDistributionAdvice";
import axiosInstance from "../../../utils/axiosInstance";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const generateColors = (count) => {
  const palette = [
    "#f39c12",
    "#e74c3c",
    "#8e44ad",
    "#2ecc71",
    "#3498db",
    "#1abc9c",
    "#d35400",
    "#7f8c8d",
  ];
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
};

const GoalsDistributionChart = () => {
  const [goalsData, setGoalsData] = useState([]);
  const [range, setRange] = useState("month");
  const [advice, setAdvice] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/analytics/goals-distribution?range=${range}`
        );
        const result = response.data;
        if (Array.isArray(result)) {
          const total = result.reduce(
            (sum, item) => sum + parseFloat(item.total),
            0
          );
          setGoalsData(result);
          setAdvice(generateGoalsDistributionAdvice(result, total));
        } else {
          setGoalsData([]);
          setAdvice(["Помилка: неможливо обробити дані."]);
        }
      } catch (error) {
        console.error("Помилка завантаження графіка:", error);
      }
    };
    setExpanded(false);
    fetchData();
  }, [range]);

  const colors = generateColors(goalsData.length);

  const data = {
    labels: goalsData.map((g) => g.name),
    datasets: [
      {
        label: "Поповнення по цілях",
        data: goalsData.map((g) => parseFloat(g.total_uah)),
        backgroundColor: colors,
        borderColor: "#2c2c2c",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "left",
        labels: {
          color: "#ffffff",
          padding: 15,
          font: { size: 13 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const goal = goalsData[index];

            const lines = goal.contributions.map((c) => {
              const value =
                c.original >= 1
                  ? parseFloat(c.original).toFixed(2)
                  : parseFloat(c.original).toFixed(8);
              return `${c.from_currency}: ${value}`;
            });

            return [`${goal.name}:`, ...lines];
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
    maintainAspectRatio: false,
  };

  return (
    <section id="goals-distribution-chart" className="mb-5">
      <div
        className="card bg-dark text-light shadow p-4 border border-secondary rounded-4"
        style={{
          height: "540px",
          background: "linear-gradient(to right, #1f1f1f, #2c2c2c)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Аналіз поповнень по цілях</h5>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="form-select bg-dark text-warning border-warning w-auto rounded-3"
          >
            <option value="today">Сьогодні</option>
            <option value="week">Тиждень</option>
            <option value="month">Місяць</option>
          </select>
        </div>

        <div
          className="d-flex flex-column align-items-center"
          style={{ height: "100%" }}
        >
          <div className="w-100" style={{ height: "250px" }}>
            <Pie data={data} options={options} />
          </div>

          {advice.length > 0 && (
            <>
              {!expanded && (
                <>
                  <hr className="w-100 border-top border-black mt-4 mb-3" />
                  <div className="mt-1 w-100">
                    <h6 className="text-warning mb-3">Поради:</h6>
                    <div className="custom-advice-box">
                      <span className="custom-advice-icon">--</span>
                      <span className="custom-advice-text">{advice[0]}</span>
                    </div>
                    {advice.length > 1 && (
                      <button
                        className="btn btn-sm btn-outline-warning mt-3"
                        onClick={() => setExpanded(true)}
                      >
                        Показати більше
                      </button>
                    )}
                  </div>
                </>
              )}

              {expanded && (
                <div className="advice-overlay">
                  <div className="advice-overlay-content p-4 rounded-4 border border-warning">
                    <h5 className="text-warning mb-3">Усі поради</h5>
                    <div className="d-flex flex-column gap-3">
                      {advice.slice(0, 3).map((tip, i) => (
                        <div key={i} className="custom-advice-box bg-dark">
                          <span className="custom-advice-icon">--</span>
                          <span className="custom-advice-text">{tip}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-outline-light mt-4"
                      onClick={() => setExpanded(false)}
                    >
                      Повернутись
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GoalsDistributionChart;
