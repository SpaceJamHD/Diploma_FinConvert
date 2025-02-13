import React, { useState } from "react";
import TransactionsBlock from "./TransactionsBlock";
import BalanceSection from "../Balance/BalanceSection";
import { createTransaction } from "../../../utils/api";
import "../../../styles/bootstrap/css/bootstrap.min.css";
import "../../../styles/transactions.css";

const TransactionsPage = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("UAH");
  const [toCurrency, setToCurrency] = useState("USD");

  const handleTransaction = async () => {
    try {
      await createTransaction(
        parseFloat(amount),
        fromCurrency,
        toCurrency,
        "перевод"
      );
      setAmount("");
    } catch (error) {
      alert("❌ Ошибка при создании транзакции!");
    }
  };

  const clearTransactionHistory = async () => {
    try {
      const response = await fetch("/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Ошибка при очистке истории");
      }
      window.location.reload();
    } catch (error) {
      alert("❌ Ошибка при очистке истории транзакций!");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-light text-center">Binance-Style Convert</h2>
      <BalanceSection hideViewAll={true} />

      <div className="transaction-box mx-auto">
        <div className="transaction-header">
          <h4 className="text-light"> Конвертация</h4>
        </div>
        <div className="transaction-body">
          <div className="transaction-row">
            <span className="transaction-label">Из</span>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="transaction-select"
            >
              <option value="UAH">UAH</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="BTC">BTC</option>
            </select>
          </div>
          <div className="transaction-row">
            <span className="transaction-label">Сумма</span>
            <input
              type="number"
              placeholder="Введите сумму"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="transaction-input"
            />
          </div>
          <div className="transaction-switch">↕</div>
          <div className="transaction-row">
            <span className="transaction-label">В</span>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="transaction-select"
            >
              <option value="UAH">UAH</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="BTC">BTC</option>
            </select>
          </div>
          <button className="transaction-button" onClick={handleTransaction}>
            Конвертировать
          </button>
        </div>
      </div>

      <div className="text-end mt-3">
        <button className="btn btn-danger" onClick={clearTransactionHistory}>
          🗑 Очистить историю
        </button>
      </div>

      <div className="transactions-container">
        <TransactionsBlock />
      </div>
    </div>
  );
};

export default TransactionsPage;
