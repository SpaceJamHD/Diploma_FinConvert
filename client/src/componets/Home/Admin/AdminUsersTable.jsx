import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { fetchAllUsers, deleteUserById, banUserById } from "../../../utils/api";
import "../../../styles/adminBan.css";
import axiosInstance from "../../../utils/axiosInstance";

const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [banUserId, setBanUserId] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState(60);
  const [isUnbanMode, setIsUnbanMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Помилка завантаження користувачів:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteUserById(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Помилка видалення користувача:", err);
    }
  };

  const handleBanUser = async () => {
    try {
      if (isUnbanMode) {
        await axiosInstance.post(`/api/admin/users/${banUserId}/unban`);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === banUserId ? { ...u, banned_until: null } : u
          )
        );
      } else {
        await banUserById(banUserId, banDuration, banReason);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === banUserId
              ? {
                  ...u,
                  banned_until: new Date(Date.now() + banDuration * 60 * 1000),
                }
              : u
          )
        );
      }

      setBanUserId(null);
      setBanReason("");
      setBanDuration(60);
      setIsUnbanMode(false);
    } catch (err) {
      console.error("Помилка блокування/розблокування користувача:", err);
    }
  };

  const navigate = useNavigate();

  return (
    <main className="container mb-5">
      <h2 className="text-light mb-2 text-start">Користувачі системи</h2>

      <div className="fin-card shadow-lg mt-4">
        <div className="fin-card-header pb-3">
          <h6 className="text-light">Список усіх користувачів</h6>
        </div>

        <div className="fin-card-body px-4 pb-4">
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <input
              type="text"
              className="form-control"
              placeholder="Пошук за ім’ям, email або ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: "#2a2a2a",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "6px",
                padding: "10px",
                maxWidth: "400px",
                flex: "1",
              }}
            />

            <select
              className="form-select w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: "#2a2a2a",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "6px",
                padding: "8px 12px",
                minWidth: "160px",
              }}
            >
              <option value="all">Усі</option>
              <option value="active">Активні</option>
              <option value="banned">Заблоковані</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="fin-table table mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ім'я</th>
                  <th>Email</th>
                  <th>Місто</th>
                  <th>Дата реєстрації</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center text-light">
                      Завантаження...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-light">
                      Користувачів не знайдено.
                    </td>
                  </tr>
                ) : (
                  users
                    .filter((user) => {
                      const term = searchTerm.toLowerCase();
                      const matchesSearch =
                        user.name.toLowerCase().includes(term) ||
                        user.email.toLowerCase().includes(term) ||
                        user.id.toString().includes(term);

                      const isBanned =
                        user.banned_until &&
                        new Date(user.banned_until) > new Date();

                      if (statusFilter === "banned" && !isBanned) return false;
                      if (statusFilter === "active" && isBanned) return false;

                      return matchesSearch;
                    })
                    .filter((user) => user.role !== "admin")
                    .map((user) => (
                      <tr key={user.id} className="fin-td">
                        <td className="fin-td text-center">{user.id}</td>
                        <td className="fin-td text-start">{user.name}</td>
                        <td className="fin-td text-start">{user.email}</td>
                        <td className="fin-td text-start">
                          {user.city || "-"}
                        </td>
                        <td className="fin-td text-center">
                          {new Date(user.created_at).toLocaleDateString(
                            "uk-UA"
                          )}
                        </td>
                        <td className="fin-td text-center">{user.role}</td>
                        <td className="fin-td text-center">
                          {user.banned_until &&
                          new Date(user.banned_until) > new Date()
                            ? `Заблокований до ${new Date(
                                user.banned_until
                              ).toLocaleString("uk-UA")}`
                            : "Активний"}
                        </td>

                        <td className="fin-td text-center">
                          <button
                            onClick={() => setConfirmDeleteId(user.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <i
                              className="bi bi-trash"
                              style={{ color: "#dc3545", fontSize: "1.2rem" }}
                            ></i>
                          </button>

                          <button
                            onClick={() => setBanUserId(user.id)}
                            style={{
                              marginLeft: "10px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <i
                              className="bi bi-shield-exclamation"
                              style={{ color: "#ffc107", fontSize: "1.2rem" }}
                            ></i>
                          </button>

                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            style={{
                              marginLeft: "10px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <i
                              className="bi bi-person-lines-fill"
                              style={{ color: "#0dcaf0", fontSize: "1.2rem" }}
                            ></i>
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {banUserId && (
        <div className="ban-modal-overlay">
          <div className="ban-modal-dialog">
            <button
              onClick={() => setIsUnbanMode(!isUnbanMode)}
              className="btn btn-sm btn-outline-warning ban-toggle-btn"
            >
              Перемкнути на {isUnbanMode ? "блокування" : "розблокування"}
            </button>

            <h5 className="ban-title">
              {isUnbanMode
                ? "Розблокувати користувача"
                : "Заблокувати користувача"}
            </h5>

            {!isUnbanMode && (
              <>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Причина блокування"
                  className="ban-input form-control"
                />
                <input
                  type="number"
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  placeholder="Тривалість (хв)"
                  className="ban-input form-control"
                />
              </>
            )}

            <div className="ban-btn-group">
              <button onClick={handleBanUser} className="ban-btn-confirm">
                Підтвердити
              </button>
              <button
                onClick={() => setBanUserId(null)}
                className="ban-btn-cancel"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#1e1e1e",
              color: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <p style={{ marginBottom: "20px" }}>
              Ви впевнені, що хочете видалити користувача?
            </p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Видалити
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Відміна
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminUsersTable;
