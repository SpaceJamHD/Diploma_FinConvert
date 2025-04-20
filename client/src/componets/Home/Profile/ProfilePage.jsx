import React, { useState, useEffect } from "react";
import "../../../styles/profile.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import axiosInstance from "../../../utils/axiosInstance";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/api/users/profile");
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response?.data?.message || "Помилка завантаження профілю."
      );
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put("/api/users/profile", profile);
      setSuccess(true);
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || "Помилка збереження профілю.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <>
      <main className="container mt-5">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2>Мій профіль</h2>
            <button
              className={`btn btn-${isEditing ? "danger" : "dark"}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Завершити" : "Налаштування"}
            </button>
          </div>
          <div className="card-body">
            {success && (
              <p className="text-success">Профіль успішно оновлено!</p>
            )}
            <div className="row">
              <div className="col-md-6">
                <label>Ім'я</label>
                <input
                  className="form-control"
                  name="first_name"
                  value={profile.first_name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{ color: "#ffcc00" }}
                />
              </div>
              <div className="col-md-6">
                <label>Прізвище</label>
                <input
                  className="form-control"
                  name="last_name"
                  value={profile.last_name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{ color: "#ffcc00" }}
                />
              </div>
              <div className="col-md-6">
                <label>Номер телефону</label>
                <input
                  className="form-control"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{ color: "#ffcc00" }}
                />
              </div>
              <div className="col-md-6">
                <label>Електронна пошта</label>
                <input
                  className="form-control"
                  name="email"
                  value={profile.email || ""}
                  disabled
                  style={{ color: "#ffcc00" }}
                />
              </div>
              <div className="col-md-6">
                <label>Адреса</label>
                <input
                  className="form-control"
                  name="address"
                  value={profile.address || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{ color: "#ffcc00" }}
                />
              </div>
              <div className="col-md-6">
                <label>Місто</label>
                <input
                  className="form-control"
                  name="city"
                  value={profile.city || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{ color: "#ffcc00" }}
                />
              </div>
              <div className="col-md-6">
                <label>Країна</label>
                <input
                  className="form-control"
                  name="country"
                  value={profile.country || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{ color: "#ffcc00" }}
                />
              </div>
              <div className="col-md-6">
                <label>Поштовий індекс</label>
                <input
                  className="form-control"
                  name="postal_code"
                  value={profile.postal_code || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{ color: "#ffcc00" }}
                />
              </div>
            </div>
            {isEditing && (
              <div className="mt-3">
                <button className="btn btn-primary" onClick={handleSave}>
                  Зберегти
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
