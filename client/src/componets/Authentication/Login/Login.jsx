import "../../../styles/authorization.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../../utils/axiosInstance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("auth-page");

    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Форма отправлена с данными:", { email, password });

    try {
      const response = await axiosInstance.post(
        "/api/users/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.banned) {
        const { bannedUntil, reason } = response.data;

        localStorage.setItem("bannedUntil", bannedUntil);
        localStorage.setItem("banReason", reason);

        navigate("/banned");
        return;
      }

      console.log("Ответ от сервера:", response.data);

      const { token } = response.data;

      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      const userRole = decoded.role;

      try {
        await axiosInstance.post("/api/analytics/visit", {
          user_id: decoded.id,
          page_name: "home",
        });
        localStorage.setItem("visit_logged", "true");
        console.log(" Візит успішно зафіксовано");
      } catch (visitErr) {
        console.error(" Не вдалося зафіксувати візит:", visitErr);
      }

      console.log("Роль пользователя:", userRole);

      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      const errData = error.response?.data;

      if (error.response?.status === 403 && errData?.banned) {
        navigate("/banned", {
          state: {
            bannedUntil: errData.bannedUntil,
            reason: errData.reason,
          },
        });
      } else {
        console.error("Ошибка авторизации:", errData?.message || error.message);
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="row rounded-5 p-3 box-area">
        <div className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box">
          <div className="featured-image mb-3">
            <img
              src="/img/authorization-removebg-preview.png"
              className="img-fluid"
              alt="Authorization Image"
            />
          </div>
          <p
            className="text-white fs-2"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: 600,
            }}
          >
            Стань перевіреним
          </p>
          <small
            className="text-white text-wrap text-center"
            style={{
              width: "17rem",
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            Приєднуйтесь до нас, щоб почати розумітися у фінансах
          </small>
        </div>

        <div className="col-md-6 right-box ">
          <div className="row align-items-center auth-page ">
            <div className="header-text mb-4">
              <h2>Привіт, знову</h2>
              <p>Ми раді вас знову бачити.</p>
            </div>
            {/* Форма авторизации */}
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Електронна адреса"
                  id="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group mb-1">
                <input
                  type="password"
                  className="form-control  form-control-lg bg-light fs-6"
                  placeholder="Пароль"
                  id="password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group mb-5 d-flex justify-content-between">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="formCheck"
                  />
                  <label
                    htmlFor="formCheck"
                    className="form-check-label text-secondary"
                  >
                    <small>Запам'ятати мене</small>
                  </label>
                </div>
                <div className="forgot">
                  <small>
                    <Link to="#">Забули пароль?</Link>
                  </small>
                </div>
              </div>
              <div className="input-group mb-3">
                <button
                  type="submit"
                  className="btn btn-lg btn-primary w-100 fs-6"
                >
                  Увійти
                </button>
              </div>

              <div className="input-group mb-3">
                <button className="btn btn-lg btn-light w-100 fs-6">
                  <img
                    src="/img/google.png"
                    style={{ width: "20px" }}
                    className="me-2"
                    alt="Google Icon"
                  />
                  <small>Увійти через Google</small>
                </button>
              </div>
              <div className="row">
                <small>
                  Немає акаунту? <Link to="/register">Зареєструватися</Link>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
