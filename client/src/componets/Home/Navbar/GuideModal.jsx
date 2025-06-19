// Улучшенный GuideModal.jsx с шириной, цветами FinConvert, анимацией и четкой навигацией
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  {
    id: "spread",
    title: "Що таке спред?",
    content: (
      <>
        <p>
          <strong>Спред</strong> — це різниця між курсом купівлі та продажу
          валюти. При обміні ви завжди втрачаєте частину грошей через спред.
        </p>
        <p>
          Наприклад: курс купівлі = 38.00, курс продажу = 38.50. Спред ={" "}
          <strong>0.50 грн</strong> на кожному доларі.
        </p>
        <p className="text-info">
          Уникайте частих обмінів між валютами без потреби — це зменшує
          загальний баланс.
        </p>
      </>
    ),
  },
  {
    id: "auto",
    title: "Автопоповнення цілей",
    content: (
      <>
        <p>
          <strong>Автопоповнення</strong> дозволяє автоматично переказувати
          кошти на ціль у вибрані дні.
        </p>
        <p>
          Наприклад: щотижня, щомісяця або у певну дату. Це допомагає
          накопичувати без зусиль.
        </p>
        <p className="text-info">
          Встановіть реалістичну суму поповнення. Система сама нагадає або
          виконає переказ.
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Аналітика витрат",
    content: (
      <>
        <p>
          Розділ <strong>Аналітика</strong> допомагає побачити ваші витрати,
          доходи та втрати через спред.
        </p>
        <p>
          Використовуйте графіки, щоб виявити непотрібні витрати або динаміку
          накопичень.
        </p>
        <p className="text-info">
          Якщо ви бачите постійні втрати — змініть валюту накопичення або
          скоротіть обміни.
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
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div
            className="modal-content shadow-lg"
            style={{
              background: "#121212",
              color: "#f1f1f1",
              borderRadius: "16px",
              border: "1px solid #444",
            }}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title text-warning">
                🎓 Довідник FinConvert
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>

            <div className="modal-body d-flex" style={{ gap: "2rem" }}>
              <div
                className="flex-column p-2 border-end"
                style={{ minWidth: "200px" }}
              >
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveTab(s.id)}
                    className={`btn btn-sm w-100 text-start mb-2 ${
                      activeTab === s.id ? "btn-warning" : "btn-outline-light"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              <div className="flex-grow-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {current?.content}
                  </motion.div>
                </AnimatePresence>
              </div>
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
