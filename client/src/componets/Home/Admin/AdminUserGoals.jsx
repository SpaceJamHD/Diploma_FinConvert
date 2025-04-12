import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const AdminUserGoals = () => {
  const { id: userId } = useParams();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGoals = async () => {
      try {
        const response = await axios.get(`/api/goals/admin/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setGoals(response.data);
      } catch (error) {
        console.error("Помилка при завантаженні цілей користувача:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGoals();
  }, [userId]);

  return (
    <div id="goal" className="fin-card shadow-lg mt-4">
      <div className="fin-card-header pb-3">
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-7">
            <h6 className="text-light">Цілі користувача</h6>
            <p className="text-sm text-secondary mb-0">
              <i className="bi bi-check-circle text-success"></i>
              <span className="font-weight-bold">
                {" "}
                {goals.length} цілей{" "}
              </span>{" "}
              знайдено
            </p>
          </div>
        </div>
      </div>

      <div className="fin-card-body px-4 pb-4">
        <div className="table-responsive">
          <table className="fin-table table mb-0">
            <thead>
              <tr>
                <th>Ціль</th>
                <th>Опис</th>
                <th>Баланс</th>
                <th>Прогрес</th>
                <th>Залишок</th>
                <th>Крайній термін</th>
                <th>Пріоритет</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center text-light">
                    Завантаження...
                  </td>
                </tr>
              ) : goals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-light">
                    Цілі відсутні.
                  </td>
                </tr>
              ) : (
                goals.map((goal, index) => {
                  const balance = parseFloat(goal.balance) || 0;
                  const amount = parseFloat(goal.amount) || 0;
                  const progress =
                    amount > 0 ? ((balance / amount) * 100).toFixed(2) : 0;
                  const goalCompleted = progress >= 100;

                  return (
                    <tr
                      key={index}
                      className={`fin-td ${
                        goalCompleted ? "goal-completed" : ""
                      }`}
                      style={
                        goalCompleted
                          ? {
                              background:
                                "linear-gradient(90deg, #0f0, #ff0, #f00)",
                              color: "#fff",
                              fontWeight: "bold",
                              textAlign: "center",
                            }
                          : {}
                      }
                    >
                      <td className="fin-td text-start">{goal.name}</td>
                      <td
                        className="fin-td text-start"
                        title={goal.description}
                      >
                        {goal.description.length > 30
                          ? `${goal.description.slice(0, 30)}...`
                          : goal.description}
                      </td>
                      <td className="fin-td text-center align-middle">
                        {goal.currency === "USD"
                          ? "$"
                          : goal.currency === "EUR"
                          ? "€"
                          : "₴"}
                        {balance.toFixed(2)}
                      </td>
                      <td className="fin-td align-middle">
                        <div className="fin-progress-wrapper">
                          <div className="fin-progress-bar">
                            <div
                              className="fin-progress-fill"
                              style={{
                                width: `${progress}%`,
                                backgroundColor:
                                  progress >= 100
                                    ? "#28a745"
                                    : progress >= 50
                                    ? "#ffc107"
                                    : "#dc3545",
                              }}
                            ></div>
                          </div>
                          <span className="fin-progress-text">{progress}%</span>
                        </div>
                      </td>
                      <td className="fin-td text-center align-middle">
                        {goal.currency === "USD"
                          ? "$"
                          : goal.currency === "EUR"
                          ? "€"
                          : "₴"}
                        {Math.max(amount - balance, 0).toFixed(2)}
                      </td>
                      <td className="fin-td text-center align-middle">
                        {goal.deadline
                          ? new Date(goal.deadline).toLocaleDateString("uk-UA")
                          : "—"}
                      </td>
                      <td className="fin-td text-center align-middle">
                        <span
                          className={`badge bg-${
                            goal.priority === "Високий"
                              ? "danger"
                              : goal.priority === "Середній"
                              ? "warning"
                              : "success"
                          }`}
                        >
                          {goal.priority}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserGoals;
