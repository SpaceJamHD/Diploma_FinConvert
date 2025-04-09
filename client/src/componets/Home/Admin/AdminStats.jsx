import React, { useEffect, useState } from "react";
import "../../../styles/goal.css";

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [bannedList, setBannedList] = useState([]);
  const [showBanned, setShowBanned] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Ошибка получения статистики администратора:", err);
      }
    };

    fetchStats();
  }, []);

  const toggleBannedList = async () => {
    setShowBanned(!showBanned);
    if (!showBanned && bannedList.length === 0) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/banned", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setBannedList(data);
      } catch (err) {
        console.error("Ошибка загрузки заблокированных:", err);
      }
    }
  };

  if (!stats) return <p className="text-light">Загрузка статистики...</p>;

  const statItems = [
    { title: "Всего пользователей", value: stats.totalUsers },
    { title: "Активные пользователи", value: stats.activeUsers },
    {
      title: "Заблокированные",
      value: stats.bannedUsers,
      clickable: true,
      onClick: toggleBannedList,
    },
    { title: "Транзакций всего", value: stats.totalTransactions },
    { title: "Среднее транзакцій/пользователь", value: stats.avgPerUser },
    { title: "Аномалий сегодня", value: stats.suspiciousToday },
  ];

  return (
    <div id="admin-stats" className="fin-card shadow-lg mt-4">
      <div className="fin-card-header pb-3">
        <h6 className="text-light mb-0">Загальна статистика системи</h6>
        <p className="text-sm text-secondary mb-0">
          <i className="bi bi-activity text-warning"></i>
          <span className="font-weight-bold"> Адмін-панель</span> — оновлено
          щойно
        </p>
      </div>

      <div className="fin-card-body px-4 pb-4">
        <div className="table-responsive">
          <table className="fin-table table mb-0">
            <thead>
              <tr>
                <th>Показник</th>
                <th>Значення</th>
              </tr>
            </thead>
            <tbody>
              {statItems.map((item, index) => (
                <tr
                  key={index}
                  className={`text-center ${
                    item.clickable ? "cursor-pointer hover:bg-dark" : ""
                  }`}
                  onClick={item.onClick}
                  style={{ transition: "background 0.2s ease" }}
                >
                  <td className="text-light">{item.title}</td>
                  <td className="fw-bold text-warning">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showBanned && (
          <div className="mt-3">
            <h6 className="text-warning">Список заблокированных:</h6>
            <ul
              className="list-unstyled text-light"
              style={{ paddingLeft: "1rem" }}
            >
              {bannedList.length === 0 ? (
                <li>Нет заблокированных пользователей</li>
              ) : (
                bannedList.map((user, idx) => (
                  <li key={idx} className="py-1 border-bottom border-secondary">
                    👤 {user.name} —{" "}
                    <span className="text-danger">{user.block_reason}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStats;
