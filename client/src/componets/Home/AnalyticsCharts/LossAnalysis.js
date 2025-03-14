import React, { useEffect, useState } from "react";
import { fetchLossAnalysisData } from "../../../utils/api"; // Импортируем функцию

import { Line } from "react-chartjs-2"; // Компонент графика
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

// Регистрируем необходимые элементы для работы с графиком
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LossAnalysis = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем данные для анализа убытков
    const loadData = async () => {
      try {
        const data = await fetchLossAnalysisData(); // Получаем данные
        setAnalyticsData(data); // Сохраняем данные в state
      } catch (error) {
        console.error("Ошибка при получении данных для аналитики:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Загрузка...</div>;

  // Подготовка данных для графика
  const chartData = {
    labels: analyticsData.map((item) =>
      new Date(item.date).toLocaleDateString("ru-RU")
    ),
    datasets: [
      {
        label: "Убыток (в валюте)",
        data: analyticsData.map((item) => item.loss),
        fill: true,
        borderColor: "#FF5733",
        backgroundColor: "rgba(255, 87, 51, 0.2)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#FF5733",
        pointBorderColor: "transparent",
        borderWidth: 3,
      },
    ],
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <h3 className="text-center">Анализ убытков</h3>
          <div className="card p-3 bg-dark">
            <Line
              data={chartData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LossAnalysis;
