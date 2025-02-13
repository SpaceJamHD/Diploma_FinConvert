import React, { useEffect, useState } from "react";
import "../../../styles/HomePage.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import Goals from "../Goals/Goals.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import useUserRole from "../../../hooks/useUserRole";
import BalanceSection from "../Balance/BalanceSection";
import ExpenseChart from "../../Charts/ExpenseChart.js";

const HomePage = () => {
  const [showPastTransactions, setShowPastTransactions] = useState(false);
  const role = useUserRole();

  useEffect(() => {
    class TxtRotate {
      constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = "";
        this.isDeleting = false;
        this.tick();
      }

      tick() {
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];

        this.txt = this.isDeleting
          ? fullTxt.substring(0, this.txt.length - 1)
          : fullTxt.substring(0, this.txt.length + 1);

        this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;

        let delta = 300 - Math.random() * 100;
        if (this.isDeleting) delta /= 2;
        if (!this.isDeleting && this.txt === fullTxt) {
          delta = this.period;
          this.isDeleting = true;
        } else if (this.isDeleting && this.txt === "") {
          this.isDeleting = false;
          this.loopNum++;
          delta = 500;
        }

        setTimeout(() => this.tick(), delta);
      }
    }

    const elements = document.getElementsByClassName("txt-rotate");
    for (let i = 0; i < elements.length; i++) {
      const toRotate = elements[i].getAttribute("data-rotate");
      const period = elements[i].getAttribute("data-period");
      if (toRotate) {
        new TxtRotate(elements[i], JSON.parse(toRotate), period);
      }
    }

    const css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #666 }";
    document.body.appendChild(css);
  }, []);

  return (
    <main>
      <header className="container mt-5">
        <div className="row align-items-center">
          <div className="col-lg-6 text-light">
            <h1>
              <span
                className="txt-rotate"
                data-period="3000"
                data-rotate='["Запрошуємо до FinConvert", "Зручність використання", "Швидкість операцій", "Надійність нашого сервісу" ]'
              ></span>
            </h1>
            {role === "business" ? (
              <div>
                <h2>Вітаємо, користувач малого бізнесу!</h2>
                <p>Тут показаны функции, доступные для бизнеса.</p>
              </div>
            ) : (
              <div>
                <h2>Вітаємо, користувач!</h2>
                <p>Тут ваші фінанси під контролем.</p>
              </div>
            )}
            <button className="btn btn-success btn-lg">Подробнее</button>
          </div>

          <div className="col-lg-5">
            <div className="conversion-card shadow-lg p-4 ms-lg-5">
              <h5 className="text-light mb-3">Ваші транзакції</h5>
              <div className="transaction-item d-flex justify-content-between align-items-center p-4 mb-3">
                <div className="profile-icon d-flex align-items-center gap-2">
                  <i
                    className="bi bi-person-circle text-light"
                    style={{ fontSize: "2rem" }}
                  ></i>
                  <span className="text-light fw-bold">Ви:</span>
                </div>
                <div className="exchange-section d-flex align-items-center justify-content-center gap-4">
                  <div className="currency-box d-flex flex-column align-items-center">
                    <span className="currency-code text-warning">UAH</span>
                    <small className="text-muted">Гривня</small>
                  </div>
                  <div className="exchange-icon">
                    <i
                      className="bi bi-arrow-left-right text-warning"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </div>
                  <div className="currency-box d-flex flex-column align-items-center">
                    <span className="currency-code text-primary">USD</span>
                    <small className="text-muted">Долар США</small>
                  </div>
                </div>
                <div className="transaction-amount text-end">
                  <span className="text-success fw-bold">$1000.00</span>
                  <small className="d-block text-muted">Завершено</small>
                </div>
              </div>

              <div className="text-center mt-2">
                <button
                  className="btn btn-outline-warning"
                  onClick={() => setShowPastTransactions(!showPastTransactions)}
                >
                  <i
                    className={`bi ${
                      showPastTransactions ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                </button>
              </div>

              {showPastTransactions && (
                <div className="mt-3">
                  <div className="transaction-item d-flex justify-content-between align-items-center p-3 mb-2">
                    <span className="text-light">UAH → USD</span>
                    <span className="text-success fw-bold">$500.00</span>
                  </div>
                  <div className="transaction-item d-flex justify-content-between align-items-center p-3 mb-2">
                    <span className="text-light">UAH → BTC</span>
                    <span className="text-success fw-bold">0.001 BTC</span>
                  </div>
                  <div className="transaction-item d-flex justify-content-between align-items-center p-3">
                    <span className="text-light">USD → EUR</span>
                    <span className="text-success fw-bold">€800.00</span>
                  </div>
                </div>
              )}

              <h5 className="text-light mb-3 exchange-curs">Обмін валют</h5>

              <div className="exchange-card p-3 rounded shadow-lg mt-4">
                <div className="row g-0">
                  <div className="col-6 border-end border-bottom d-flex flex-column align-items-center p-2">
                    <div className="currency-box d-flex flex-column align-items-center gap-1">
                      <span className="currency-code text-warning">UAH</span>
                      <small className="text-muted">Гривня</small>
                    </div>
                  </div>
                  <div className="col-6 border-bottom d-flex flex-column align-items-center p-2">
                    <div className="currency-box d-flex flex-column align-items-center gap-1">
                      <span className="currency-code text-primary">USD</span>
                      <small className="text-muted">Долар США</small>
                    </div>
                  </div>
                  <div className="col-6 border-end d-flex flex-column align-items-center justify-content-center p-2">
                    <p className="exchange-value mb-0 text-success fw-bold">
                      41,500
                    </p>
                    <small className="text-muted">UAH</small>
                  </div>
                  <div className="col-6 d-flex flex-column align-items-center justify-content-center p-2">
                    <p className="exchange-value mb-0 text-success fw-bold">
                      1,000
                    </p>
                    <small className="text-muted">USD</small>
                  </div>
                </div>
              </div>

              <button className="btn btn-success w-100 mt-4 py-2 fw-bold">
                Обміняти
              </button>
            </div>
            <div className="row">
              <div className="col-lg-3"></div>
              <div className="col-lg-2 d-flex">
                <div className="currency-container d-flex justify-content-center align-items-center p-3">
                  <div className="d-flex justify-content-center gap-3">
                    <span className="currency-icon d-flex align-items-center justify-content-center">
                      $
                    </span>
                    <span className="currency-icon d-flex align-items-center justify-content-center">
                      €
                    </span>
                    <span className="currency-icon d-flex align-items-center justify-content-center">
                      ₿
                    </span>
                    <span className="currency-icon d-flex align-items-center justify-content-center">
                      Ξ
                    </span>
                    <span className="currency-icon d-flex align-items-center justify-content-center">
                      ₴
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section className="container">
        <Goals />
      </section>

      <section className="container">
        <BalanceSection />
      </section>

      <section className="container">
        <ExpenseChart />
      </section>
    </main>
  );
};

export default HomePage;
