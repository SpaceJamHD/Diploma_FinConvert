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
      <h2 className="text-light">Історія транзакцій</h2>
      {loading ? (
        <p className="text-light">Загрузка...</p>
      ) : transactions.length === 0 ? (
        <p className="text-light">Нет транзакций</p>
      ) : (
        <table className="table table-dark table-striped mt-3">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Сума</th>
              <th>Звідки</th>
              <th>Куди</th>
              <th>Тип</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{new Date(txn.date).toLocaleString()}</td>
                <td>
                  {txn.from_currency === "BTC" && txn.to_currency !== "BTC"
                    ? parseFloat(txn.amount).toFixed(2)
                    : txn.from_currency !== "BTC" && txn.to_currency === "BTC"
                    ? parseFloat(txn.amount).toFixed(6)
                    : parseFloat(txn.amount).toFixed(2)}
                </td>
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
