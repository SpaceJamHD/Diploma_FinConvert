import React from "react";

const GuideModal = ({ onClose }) => {
  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1050,
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content"
            style={{
              backgroundColor: "#1e1e1e",
              color: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title text-warning">Довідник користувача</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div
              className="modal-body"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <section>
                <h6 className="text-light">Основні терміни</h6>
                <ul>
                  <li>
                    <strong>Ціль</strong> — фінансова мета, на яку ви хочете
                    накопичити кошти.
                  </li>
                  <li>
                    <strong>Баланс</strong> — сума коштів у вашому гаманці в
                    кожній валюті.
                  </li>
                  <li>
                    <strong>Поповнення</strong> — переказ коштів із гаманця на
                    ціль.
                  </li>
                  <li>
                    <strong>Автопоповнення</strong> — автоматичне регулярне
                    поповнення цілі.
                  </li>
                  <li>
                    <strong>Конвертація</strong> — обмін між валютами з
                    урахуванням спреду.
                  </li>
                  <li>
                    <strong>Спред</strong> — різниця між курсом купівлі та
                    продажу (витрати при обміні).
                  </li>
                  <li>
                    <strong>Повторити ціль</strong> — створити копію завершеної
                    мети з новою датою.
                  </li>
                </ul>
              </section>

              <hr className="text-secondary" />

              <section>
                <h6 className="text-light">Як користуватись сайтом</h6>
                <ol>
                  <li>
                    Створіть одну або кілька фінансових цілей (вкладка "Цілі").
                  </li>
                  <li>Поповніть ціль або увімкніть автопоповнення.</li>
                  <li>
                    Переглядайте історію транзакцій і виконаних цілей у
                    "Історія".
                  </li>
                  <li>Обмінюйте валюту у вкладці "Конвертація".</li>
                  <li>
                    Аналізуйте витрати, доходи, спредові втрати у вкладці
                    "Аналітика".
                  </li>
                  <li>
                    Повторюйте завершені цілі при потребі (кнопка "Повторити").
                  </li>
                </ol>
              </section>

              <hr className="text-secondary" />

              <section>
                <h6 className="text-light">Поради</h6>
                <ul>
                  <li>
                    Використовуйте автопоповнення для стабільного накопичення.
                  </li>
                  <li>
                    Уникайте частої конвертації, щоб не втрачати кошти на
                    спреді.
                  </li>
                  <li>
                    Завжди вказуйте опис і пріоритет цілі — це допоможе
                    планувати бюджет.
                  </li>
                  <li>
                    Переглядайте аналітику, щоб знайти слабкі місця у витратах.
                  </li>
                </ul>
              </section>
            </div>

            <div className="modal-footer border-0">
              <button className="btn btn-secondary" onClick={onClose}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />
    </>
  );
};

export default GuideModal;
