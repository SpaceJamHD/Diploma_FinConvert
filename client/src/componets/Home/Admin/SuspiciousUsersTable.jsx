import React, { useEffect, useState } from "react";
import { fetchSuspiciousUsers } from "../../../utils/api";
import "../../../styles/goal.css";

const SuspiciousUsersTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchSuspiciousUsers();
      setUsers(data.filter((u) => parseFloat(u.total_spread_loss) > 10));
    };
    load();
  }, []);

  const getRiskColor = (score) => {
    if (score >= 5) return "bg-danger";
    if (score >= 3) return "bg-warning text-dark";
    return "bg-success";
  };

  const getRiskTooltip = (u) => {
    const reasons = [];
    if (parseFloat(u.total_spread_loss) > 10)
      reasons.push("Високі втрати на спреді");
    if ((u.recent_transactions || 0) > 5)
      reasons.push("Багато транзакцій за 24 год");
    if ((parseFloat(u.avg_amount) || 0) > 1000)
      reasons.push("Велика середня сума");
    if (u.btc_transactions > 3) reasons.push("Занадто багато BTC");
    const hour = new Date(u.last_transaction).getHours();
    if (hour < 6 || hour > 23) reasons.push("Активність у нічний час");

    return reasons.join(", ");
  };

  const processedUsers = users
    .map((u) => {
      let score = 0;
      if (parseFloat(u.total_spread_loss) > 10) score += 3;
      if ((u.recent_transactions || 0) > 5) score += 2;
      if ((parseFloat(u.avg_amount) || 0) > 1000) score += 2;
      if (u.btc_transactions > 3) score += 2;
      const hour = new Date(u.last_transaction).getHours();
      if (hour < 6 || hour > 23) score += 1;

      return { ...u, suspicionScore: score };
    })
    .sort((a, b) => b.suspicionScore - a.suspicionScore);

  return (
    <div className="fin-card shadow-lg mt-4">
      <div className="fin-card-header pb-3">
        <h5 className="text-light mb-1">Підозріла активність</h5>
        <p className="text-sm text-secondary mb-0">
          <i className="bi bi-shield-exclamation text-danger"></i>
          <span className="font-weight-bold"> Антифрод-моніторинг </span>
          користувачів системи
        </p>
      </div>

      <div className="fin-card-body px-4 pb-4">
        {processedUsers.length === 0 ? (
          <p className="text-center text-light mb-0">
            Немає підозрілих користувачів.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="fin-table table mb-0">
              <thead>
                <tr>
                  <th>Ім’я</th>
                  <th>Транзакцій</th>
                  <th>Сума</th>
                  <th>Втрати (спред)</th>
                  <th>BTC</th>
                  <th>Остання транзакція</th>
                  <th>Ризик</th>
                </tr>
              </thead>
              <tbody>
                {processedUsers.map((u) => (
                  <tr
                    key={u.user_id}
                    style={{
                      backgroundColor:
                        u.suspicionScore >= 5
                          ? "rgba(255, 0, 0, 0.05)"
                          : u.suspicionScore >= 3
                          ? "rgba(255, 165, 0, 0.05)"
                          : "transparent",
                      borderLeft:
                        u.suspicionScore >= 5
                          ? "5px solid #dc3545"
                          : u.suspicionScore >= 3
                          ? "5px solid #ffc107"
                          : undefined,
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    <td className="fin-td text-start">
                      {u.name}{" "}
                      {u.suspicionScore >= 5 && (
                        <span
                          title={getRiskTooltip(u)}
                          style={{ cursor: "help" }}
                        >
                          ⚠
                        </span>
                      )}
                    </td>
                    <td className="fin-td text-center">
                      {u.transaction_count}
                    </td>
                    <td className="fin-td text-right">
                      {parseFloat(u.total_amount).toFixed(2)}
                    </td>
                    <td className="fin-td text-right text-danger">
                      {parseFloat(u.total_spread_loss).toFixed(2)}
                    </td>
                    <td className="fin-td text-center">{u.btc_transactions}</td>
                    <td className="fin-td text-center">
                      {new Date(u.last_transaction).toLocaleString()}
                    </td>
                    <td className="fin-td text-center font-weight-bold">
                      <span
                        className={`badge ${getRiskColor(u.suspicionScore)}`}
                      >
                        ⚠ {u.suspicionScore} балів
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspiciousUsersTable;
