import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
  Filler, // Оставляем Filler только здесь
} from "chart.js";

// Регистрируем все компоненты, включая Filler
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
  Filler
);

const ExpenseChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null); // Для хранения ссылки на созданный график

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Если график уже существует, уничтожаем его перед созданием нового
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: [
          "Січ",
          "Лют",
          "Бер",
          "Квіт",
          "Трав",
          "Черв",
          "Лип",
          "Серп",
          "Вер",
          "Жовт",
          "Лист",
          "Груд",
        ],
        datasets: [
          {
            label: "Продажі",
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: "#FFD700",
            pointBorderColor: "transparent",
            borderColor: "#FFD700",
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            fill: true,
            data: [120, 230, 130, 440, 250, 360, 270, 180, 90, 300, 310, 220],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: function (context) {
                const fullMonths = [
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
                return fullMonths[context[0].dataIndex];
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              color: "rgba(115, 115, 115, 0.2)",
              borderDash: [4, 4],
            },
            ticks: {
              color: "#B3B3B3",
              padding: 10,
              font: {
                size: 14,
                lineHeight: 1.5,
              },
            },
          },
          x: {
            grid: {
              drawBorder: false,
              display: false,
            },
            ticks: {
              color: "#B3B3B3",
              padding: 10,
              font: {
                size: 14,
                lineHeight: 1.5,
              },
            },
          },
        },
      },
    });

    // Уничтожаем график при размонтировании компонента
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <section id="account-balance" className="mb-5">
      <div className="row">
        <div className="col-lg-12 col-md-6 mt-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-light mb-0">Анализ рахунків</h2>
            <a
              href="#"
              className="text-warning text-decoration-none d-flex align-items-center"
            >
              Переглянути всі{" "}
              <i className="bi bi-arrow-right-circle ms-2 fs-4"></i>
            </a>
          </div>

          <div className="card bg-dark text-light shadow-lg">
            <div className="card-body">
              <h6 className="mb-0 text-warning">Аналіз щоденних доходів</h6>
              <p className="text-sm text-secondary">
                (<span className="font-weight-bolder text-success">+15%</span>)
                Зростання доходів за сьогодні.
              </p>
              <div className="pe-2">
                <div
                  style={{
                    width: "100%",
                    height: "300px",
                  }}
                >
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
              <hr className="horizontal dark mt-4" />
              <div className="d-flex justify-content-start align-items-center">
                <i className="bi bi-clock text-secondary me-2"></i>
                <p className="mb-0 text-sm text-muted">
                  Оновлено 4 хвилини тому
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpenseChart;
