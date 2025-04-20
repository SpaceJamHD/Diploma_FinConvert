import React, { useEffect, useState } from "react";
import "../../../styles/goal.css";
import axiosInstance from "../../../utils/axiosInstance";

const TopSpenders = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchTopSpenders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/admin/top-spenders-today");
        const data = await res.data;
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
          console.error("Ожидался массив, но получено:", data);
        }
      } catch (err) {
        console.error("Ошибка загрузки топа витрат:", err);
      }
    };

    fetchTopSpenders();
  }, []);

  return (
    <div className="fin-card shadow-lg mt-4">
      <div className="fin-card-header pb-3">
        <h6 className="text-light mb-0">
          Користувачі з найбільшими витратами сьогодні
        </h6>
        <p className="text-sm text-secondary mb-0">Топ 5 витратників</p>
      </div>
      <div className="fin-card-body px-4 pb-4">
        <div className="table-responsive">
          <table className="fin-table table mb-0">
            <thead>
              <tr>
                <th>Ім'я</th>
                <th>Email</th>
                <th>Сума витрат</th>
                <th>Транзакцій</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-light">
                    Немає даних за сьогодні.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={index}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td className="text-danger fw-bold">
                      {parseFloat(user.total_spent).toFixed(2)} ₴
                    </td>
                    <td>{user.transactions_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopSpenders;
