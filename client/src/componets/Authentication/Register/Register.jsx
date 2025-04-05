import React, { useState, useEffect } from "react";
import "../../../styles/authorization.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("auth-page");

    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name,
          email,
          password,
          role,
        }
      );
      console.log("Регистрация успешна:", response.data);
      navigate("/login");
    } catch (error) {
      console.error(
        "Ошибка регистрации:",
        error.response?.data?.message || error.message
      );
      alert(error.response?.data?.message || "Ошибка регистрации");
    }
  };

  const evaluatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(evaluatePasswordStrength(newPassword));
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="row rounded-5 p-3 box-area">
        <div className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box">
          <div className="featured-image mb-3">
            <img
              src="/img/authorization-removebg-preview.png"
              className="img-fluid"
              alt="Authorization"
            />
          </div>
          <p
            className="text-white fs-2"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: 600,
            }}
          >
            Приєднуйтесь:)
          </p>
          <small
            className="text-white text-wrap text-center"
            style={{
              width: "17rem",
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            Створіть свій акаунт, щоб почати.
          </small>
        </div>

        <div className="col-md-6 right-box">
          <div className="row align-items-center">
            <div className="header-text mb-4">
              <h2>Створити акаунт</h2>
              <p>Заповніть дані нижче, щоб зареєструватися.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <select
                  className="form-select form-control-lg"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Виберіть вашу роль
                  </option>
                  <option value="user">Звичайний користувач</option>
                  <option value="business">Малий бізнес</option>
                </select>
              </div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Повне ім'я"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Електронна адреса"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group mb-1">
                <input
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Пароль"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="mb-3">
                <div
                  className="progress"
                  style={{ height: "5px", backgroundColor: "#e9ecef" }}
                >
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor:
                        passwordStrength < 2
                          ? "red"
                          : passwordStrength < 4
                          ? "orange"
                          : "green",
                    }}
                  ></div>
                </div>
                <small className="text-muted">
                  Складність паролю:{" "}
                  {passwordStrength < 2
                    ? "Слабкий"
                    : passwordStrength < 4
                    ? "Середній"
                    : "Сильний"}
                </small>
              </div>
              <div className="input-group mb-1">
                <input
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Підтвердьте пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group mb-3">
                <button
                  type="submit"
                  className="btn btn-lg btn-primary w-100 fs-6"
                >
                  Зареєструватися
                </button>
              </div>
            </form>

            <div className="row">
              <small>
                Вже маєте акаунт? <a href="/login">Увійдіть тут</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
