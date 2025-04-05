import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { fetchConversionDirections } from "../../../utils/api";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const ExchangeDirectionsChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [range, setRange] = useState("week");
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchConversionDirections(range);
      setData(result);
    };

    loadData();
  }, [range]);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = data.map((item) => item.direction);
    const values = data.map((item) => parseInt(item.count));

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Кількість конвертацій",
            data: values,
            backgroundColor: "rgba(255, 215, 0, 0.6)",
            borderColor: "#FFD700",
            borderWidth: 1,
            borderRadius: 6,
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
              label: (ctx) => `${ctx.raw} конвертацій`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#B3B3B3",
              font: {
                size: 13,
              },
            },
            grid: {
              display: false,
            },
          },
          y: {
            ticks: {
              color: "#B3B3B3",
              stepSize: 1,
            },
            grid: {
              color: "rgba(115, 115, 115, 0.2)",
              borderDash: [4, 4],
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
    <section id="exchange-directions-chart">
      <div className="row">
        <div className="col-lg-12 col-md-6 mt-4 mb-4">
          <div className="card bg-dark text-light shadow-lg">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-light mb-0">
                  Найпопулярніші напрямки конвертацій
                </h4>
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
                </div>
              </div>

              <div style={{ width: "100%", height: "300px" }}>
                <canvas ref={chartRef}></canvas>
              </div>

              <hr className="horizontal dark mt-4" />
              <div className="d-flex justify-content-start align-items-center">
                <i className="bi bi-bar-chart-line text-secondary me-2"></i>
                <p className="mb-0 text-sm text-muted">Аналіз оновлено</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExchangeDirectionsChart;
