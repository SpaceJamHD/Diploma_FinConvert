import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../../styles/navbar.css";
import "../../../styles/HomePage.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/bootstrap/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const sections = [
  {
    id: "spread",
    title: "Що таке спред?",
    content: (
      <>
        <p className="guide-text">
          <strong>Спред</strong> — це різниця між курсом купівлі та продажу
          валюти. При обміні ви втрачаєте частину грошей.
        </p>
        <p className="guide-highlight">
          Уникайте частих обмінів без потреби — це зменшує загальний баланс.
        </p>
      </>
    ),
  },
  {
    id: "auto",
    title: "Автопоповнення",
    content: (
      <>
        <p className="guide-text">
          <strong>Автопоповнення</strong> дозволяє регулярно переказувати кошти
          на ціль щотижня, щомісяця або у певні дні.
        </p>
        <p className="guide-highlight">
          Стабільні перекази допомагають досягати цілі без ручних дій.
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Аналітика витрат",
    content: (
      <>
        <p className="guide-text">
          Розділ <strong>Аналітика</strong> показує ваші витрати, доходи, втрати
          через спред.
        </p>
        <p className="guide-highlight">
          Використовуйте графіки, щоб виявити слабкі місця у бюджеті.
        </p>
      </>
    ),
  },
];

const GuideModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("spread");
  const current = sections.find((s) => s.id === activeTab);

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 1050 }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "0 1rem",
          }}
        >
          <div
            className="modal-content shadow-lg"
            style={{
              background: "#1a1a1a",
              color: "#f1f1f1",
              borderRadius: "16px",
              border: "1px solid #333",
              boxShadow: "0 0 30px rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title text-warning fw-bold fs-4">
                Довідник FinConvert
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>

            <div className="modal-body justify-content-center guide-modal-body">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="guide-card"
                >
                  <div className="d-flex justify-content-center mb-3 guide-tab-group flex-wrap gap-2">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveTab(s.id)}
                        className={`btn btn-sm ${
                          activeTab === s.id
                            ? "btn-warning text-dark fw-bold"
                            : "btn-outline-light"
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>

                  <div className="guide-card-content">{current?.content}</div>
                </motion.div>
              </AnimatePresence>
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
