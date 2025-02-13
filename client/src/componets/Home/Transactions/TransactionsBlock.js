// 📌 Файл: client/src/components/Home/Transactions/TransactionsBlock.js

import React, { useState, useEffect } from "react";
import { fetchTransactions } from "../../../utils/api";
import "../../../styles/HomePage.css";
import "../../../styles/goal.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const TransactionsBlock = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Ошибка загрузки транзакций", error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  return (
    <div className="transactions-block mt-4">
      <h2 className="text-light">📜 История транзакций</h2>
      {loading ? (
        <p className="text-light">Загрузка...</p>
      ) : transactions.length === 0 ? (
        <p className="text-light">Нет транзакций</p>
      ) : (
        <table className="table table-dark table-striped mt-3">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Откуда</th>
              <th>Куда</th>
              <th>Тип</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{new Date(txn.date).toLocaleString()}</td>
                <td>{txn.amount}</td>
                <td>{txn.from_currency}</td>
                <td>{txn.to_currency}</td>
                <td>{txn.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionsBlock;
