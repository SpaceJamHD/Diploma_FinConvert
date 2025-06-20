import React from "react";
import "../../../styles/footer.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const Footer = () => {
  return (
    <footer id="site-footer" className="bg-dark text-light py-5">
      <div className="container bg-dark">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <h4 className="text-warning mb-3">FinConvert</h4>
            <p className="text-muted">
              Найкращий асистент для управління фінансами, що допомагає
              планувати, аналізувати та досягати фінансових цілей.
            </p>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="text-light mb-3">Меню</h5>
            <ul className="list-unstyled">
              <li>
                <a
                  href="#account-balance"
                  className="text-muted text-decoration-none"
                >
                  Історія
                </a>
              </li>
              <li>
                <a
                  href="#financial-overview"
                  className="text-muted text-decoration-none"
                >
                  Конвертація
                </a>
              </li>
              <li>
                <a
                  href="#currency-forecast"
                  className="text-muted text-decoration-none"
                >
                  Аналітика
                </a>
              </li>
              <li>
                <a href="#goals" className="text-muted text-decoration-none">
                  Цілі
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="text-light mb-3">Контакти</h5>
            <ul className="list-unstyled">
              <li>
                <i className="bi bi-envelope me-2"></i>
                <a
                  href="mailto:support@finconvert.com"
                  className="text-muted text-decoration-none"
                >
                  support@finconvert.com
                </a>
              </li>
              <li>
                <i className="bi bi-telephone me-2"></i>
                <a
                  href="tel:+380123456789"
                  className="text-muted text-decoration-none"
                >
                  +38 (012) 345-6789
                </a>
              </li>
              <li>
                <i className="bi bi-geo-alt me-2"></i>
                <span className="text-muted">Україна, Київ</span>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="text-light mb-3">Підписка на новини</h5>
            <p className="text-muted">
              Будьте в курсі оновлень та нових функцій.
            </p>
            <form className="d-flex">
              <input
                type="email"
                className="form-control me-2"
                placeholder="Введіть ваш email"
                aria-label="Email"
              />
              <button className="btn btn-warning" type="submit">
                Підписатися
              </button>
            </form>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col text-center">
            <a href="#" className="text-muted me-3">
              <i className="bi bi-facebook fs-4"></i>
            </a>
            <a href="#" className="text-muted me-3">
              <i className="bi bi-twitter fs-4"></i>
            </a>
            <a href="#" className="text-muted me-3">
              <i className="bi bi-linkedin fs-4"></i>
            </a>
            <a href="#" className="text-muted">
              <i className="bi bi-instagram fs-4"></i>
            </a>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col text-center">
            <p className="text-muted mb-0">
              © 2024 FinConvert. Всі права захищені.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
