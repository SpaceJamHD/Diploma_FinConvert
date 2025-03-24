import React, { useEffect, useRef, useState } from "react";
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
import "../../../styles/chart.css";

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

const SpreadLossChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [currency, setCurrency] = useState("USD");
  const [range, setRange] = useState("week");
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/analytics/spread-loss?currency=${currency}&range=${range}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Помилка завантаження аналітики:", error);
      }
    };

    fetchData();
  }, [currency, range]);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    let labels = data.map((d) =>
      new Date(d.period).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    );

    if (range === "today") {
      labels = data.map((d) =>
        new Date(d.period).toLocaleTimeString("uk-UA", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
    const values = data.map((d) => parseFloat(d.total_loss));

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `Втрати (${currency})`,
            data: values,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: "#FFD700",
            pointBorderColor: "transparent",
            borderColor: "#FFD700",
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            fill: true,
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
              label: function (context) {
                const value = parseFloat(context.raw);
                const formatted =
                  currency === "BTC" ? value.toFixed(8) : value.toFixed(2);
                return `Втрати: ${formatted} ${currency}`;
              },
            },
          },
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
              callback: function (value) {
                if (currency === "BTC") {
                  return parseFloat(value).toFixed(8);
                } else {
                  return parseFloat(value).toFixed(2);
                }
              },
            },

            title: {
              display: true,
              text: `Втрати (${currency})`,
              color: "#B3B3B3",
              font: {
                size: 14,
              },
            },
          },
          x: {
            title: {
              display: true,
              text: "Дата",
              color: "#B3B3B3",
            },
            ticks: {
              color: "#B3B3B3",
              padding: 10,
              font: {
                size: 14,
                lineHeight: 1.5,
              },
            },
            grid: {
              drawBorder: false,
              display: false,
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
  }, [data, currency]);

  return (
    <section id="spread-loss-chart" className="mb-5">
      <div className="row">
        <div className="col-lg-12 col-md-6 mt-4 mb-4">
          <div className="card bg-dark text-light shadow-lg">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-light mb-0">Втрати через спред</h4>
                <div className="d-flex gap-3">
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="form-select bg-dark text-warning border-warning"
                  >
                    <option value="today">Сьогодні</option>
                    <option value="week">Тиждень</option>
                    <option value="month">Місяць</option>
                  </select>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="form-select bg-dark text-warning border-warning"
                  >
                    <option value="UAH">UAH</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>
              </div>

              <div style={{ width: "100%", height: "300px" }}>
                <canvas ref={chartRef}></canvas>
              </div>

              <hr className="horizontal dark mt-4" />
              <div className="d-flex justify-content-start align-items-center">
                <i className="bi bi-clock text-secondary me-2"></i>
                <p className="mb-0 text-sm text-muted">Оновлено щойно</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpreadLossChart;
