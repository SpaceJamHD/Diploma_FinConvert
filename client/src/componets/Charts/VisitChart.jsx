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
  Filler,
} from "chart.js";

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

const VisitChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = data.map((visit) =>
      new Date(visit.visit_date).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
      })
    );
    const counts = data.map((visit) => parseInt(visit.count));
    if (!chartRef.current) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Відвідування",
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: "#FFD700",
            pointBorderColor: "transparent",
            borderColor: "#FFD700",
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            fill: true,
            data: counts,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (context) => context[0].label,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "Кількість відвідувань",
              color: "#B3B3B3",
              font: { size: 16, weight: "bold" },
            },
            grid: {
              drawBorder: false,
              color: "rgba(115, 115, 115, 0.2)",
              borderDash: [4, 4],
            },
            ticks: {
              color: "#B3B3B3",
              padding: 10,
              stepSize: 1,
              precision: 0,
              font: { size: 14, lineHeight: 1.5 },
            },
          },
          x: {
            title: {
              display: true,
              text: "Дата",
              color: "#B3B3B3",
              font: { size: 16, weight: "bold" },
            },
            grid: { drawBorder: false, display: false },
            ticks: {
              color: "#B3B3B3",
              padding: 10,
              font: { size: 14, lineHeight: 1.5 },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <section className="mb-5">
      <div className="row">
        <div className="col-lg-12 col-md-6 mt-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-light mb-0">Відвідування сторінки</h2>
          </div>
          <div className="card bg-dark text-light shadow-lg">
            <div className="card-body">
              <h6 className="mb-0 text-warning">Активність користувача</h6>
              <p className="text-sm text-secondary">
                Загальна кількість відвідувань сторінки за останній період.
              </p>
              <div className="pe-2">
                <div style={{ width: "100%", height: "300px" }}>
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
              <hr className="horizontal dark mt-4" />
              <div className="d-flex justify-content-start align-items-center">
                <i className="bi bi-clock text-secondary me-2"></i>
                <p className="mb-0 text-sm text-muted">
                  Оновлено {new Date().toLocaleTimeString("uk-UA")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitChart;
