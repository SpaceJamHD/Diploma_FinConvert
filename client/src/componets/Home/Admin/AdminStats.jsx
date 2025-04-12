import React, { useEffect, useState } from "react";
import "../../../styles/goal.css";

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [bannedList, setBannedList] = useState([]);
  const [showBanned, setShowBanned] = useState(false);
  const [loading, setLoading] = useState(true);

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
        console.error("Помилка при отриманні статистики:", err);
      } finally {
        setLoading(false);
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
        console.error(
          "Помилка при завантаженні заблокованих користувачів:",
          err
        );
      }
    }
  };

  if (loading) return <p className="text-light">Завантаження статистики...</p>;
  if (!stats) return <p className="text-danger">Немає даних статистики</p>;

  const statItems = [
    { title: "Усього користувачів", value: stats.totalUsers ?? "—" },
    { title: "Активні користувачі", value: stats.activeUsers ?? "—" },
    {
      title: "Заблоковані користувачі",
      value: stats.bannedUsers ?? "—",
      clickable: true,
      onClick: toggleBannedList,
    },
    { title: "Усього транзакцій", value: stats.totalTransactions ?? "—" },
    {
      title: "Середнє транзакцій на користувача",
      value: stats.avgPerUser ?? "—",
    },
    {
      title: "Підозрілі дії за сьогодні",
      value: stats.suspiciousToday ?? "—",
    },
  ];

  return (
    <div id="admin-stats" className="fin-card shadow-lg mt-4">
      <div className="fin-card-header pb-3">
        <h6 className="text-light mb-0">Загальна статистика системи</h6>
        <p className="text-sm text-secondary mb-0">
          <span className="fw-bold"> Адмін-панель</span> — оновлено щойно
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
            <h6 className="text-warning">Список заблокованих користувачів:</h6>
            <ul
              className="list-unstyled text-light"
              style={{ paddingLeft: "1rem" }}
            >
              {bannedList.length === 0 ? (
                <li>Немає заблокованих користувачів</li>
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
